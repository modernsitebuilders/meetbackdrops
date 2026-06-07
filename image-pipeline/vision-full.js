#!/usr/bin/env node
/**
 * Full vision-grounded metadata pass over the catalog.
 *
 * For every entry in final_manifest.json: fetch the webp from R2, base64
 * inline it (no URL filename leak), call gpt-4o-mini vision, validate the
 * response against SEO budgets + brand-voice forbidden words, retry up to
 * 2x on failure, save atomically per image.
 *
 * Output: image-pipeline/ai_metadata.vision-v1.json
 *   — a NEW file. Does not touch ai_metadata.json or final_manifest.json
 *     until you review and explicitly merge.
 *
 * Resumable: re-running skips entries already in the output file at the
 * current PROMPT_VERSION. Safe to kill and restart.
 *
 * Usage:
 *   node image-pipeline/vision-full.js              # full catalog
 *   node image-pipeline/vision-full.js --limit 5    # smoke test
 *   node image-pipeline/vision-full.js --slug X     # one slug only
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY in image-pipeline/.env');
  process.exit(1);
}

const MANIFEST_PATH = path.join(__dirname, 'final_manifest.json');
const OUTPUT_PATH = path.join(__dirname, 'ai_metadata.vision-v1.json');
const R2_BASE = 'https://assets.streambackdrops.com/webp';
const MODEL = 'gpt-4o-mini';
const PROMPT_VERSION = 'vision-v1';

// Bounds (matching scripts/check-seo-meta.js)
const DESC_MIN = 110;
const DESC_MAX = 160;
const TITLE_MIN = 30;
const TITLE_MAX = 95; // includes " | MeetBackdrops" suffix; existing catalog runs 68-93
const ALT_MIN = 50;
const ALT_MAX = 180;
const TAGS_MIN = 8;
const TAGS_MAX = 12;

// Approved use-case phrases (one is picked per slug by hash, woven into prompt)
const USE_CASE_PHRASES = [
  'professional video calls',
  'executive video calls',
  'remote work',
  'online presentations',
  'team standups',
  'virtual meetings',
];

// Forbidden tokens. Whole-word, case-insensitive. Brand-voice rules from
// CLAUDE.md (gaming/streamer family) + stock-marketing fluff. If a response
// contains any of these in title/description/alt, we retry.
const FORBIDDEN_RE = /\b(gamer|gamers|gaming|twitch|streamer|streamers|livestreamer|esports|obs|stunning|amazing|premium|ultimate|stock)\b/i;

const MAX_RETRIES = 2;

// CLI flags
const args = process.argv.slice(2);
const limitIdx = args.indexOf('--limit');
const LIMIT = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : null;
const slugIdx = args.indexOf('--slug');
const SLUG_FILTER = slugIdx >= 0 ? args[slugIdx + 1] : null;

// ── Helpers ─────────────────────────────────────────────────────────────────

function djb2(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return h >>> 0;
}

function pickUseCase(slug) {
  return USE_CASE_PHRASES[djb2(slug) % USE_CASE_PHRASES.length];
}

function buildPrompt(useCasePhrase, retryHint) {
  return `You are writing SEO metadata for ONE specific image sold as a virtual background for executive corporate video calls on Zoom, Microsoft Teams, and Google Meet. No people are in the image.

BRAND: MeetBackdrops — a virtual set design studio. The brand serves corporate / executive professionals. It is NOT a gaming, streaming, Twitch, or livestreamer brand. NEVER use these words: gamer, gaming, Twitch, streamer, OBS, esports, livestream, stunning, amazing, perfect, premium, ultimate, stock. Approved vocabulary: designed, studio-designed, 4K-upscaled, composed for camera, virtual background, virtual set, high-fidelity, corporate, executive, boardroom.

INSTRUCTIONS:
Look at the image. Identify the actual setting, objects, materials, lighting, palette, mood, and composition. Then output strict JSON with exactly these keys: title, description, alt, tags.

=== title (${TITLE_MIN}-${TITLE_MAX} chars, including " | MeetBackdrops" suffix) ===
- Lead with a concrete, image-grounded subject (what's actually in the scene).
- Weave TWO of: environment, mood/atmosphere, lighting/time-of-day.
- Must end with " | MeetBackdrops".
- Title Case. No trailing punctuation. No emojis.
- Forbidden in title: "background", "backdrop", "wallpaper", "stunning", "perfect", "ultimate", "premium", "amazing", "stock".

=== description (${DESC_MIN}-${DESC_MAX} chars — HARD CONSTRAINT, count carefully) ===
- Visual specifics that could only describe THIS image: real objects, materials, light quality, palette.
- Weave the use-case phrase "${useCasePhrase}" naturally mid-sentence (not at the end).
- Don't start with "A", "An", "This", "The perfect". Don't restate the title. No "perfect for Zoom" boilerplate.
- COUNT THE CHARACTERS. ${DESC_MIN}-${DESC_MAX} inclusive. Out-of-range = retry.

=== alt (${ALT_MIN}-${ALT_MAX} chars) ===
- Factual visual description for screen readers.
- Describe what is visible: subject, layout, light, palette.
- Do NOT begin with "Image of" or "A picture of". Do NOT mention Zoom, virtual, background, MeetBackdrops.

=== tags (array of ${TAGS_MIN}-${TAGS_MAX} lowercase strings) ===
- Span at least 5 of: environment, subject/object, mood, lighting, style, color/palette, composition, use-case.
- Include exactly ONE use-case tag (use "${useCasePhrase}").
- 1–3 words per tag. No punctuation. No "image", "photo", "hd".
- Don't repeat the category slug verbatim.

${retryHint || ''}OUTPUT: strict JSON only. No markdown, no code fences, no commentary.`;
}

async function fetchAsBase64(imageUrl) {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`R2 fetch ${res.status} for ${imageUrl}`);
  const buf = Buffer.from(await res.arrayBuffer());
  return buf.toString('base64');
}

async function visionCall(dataUrl, useCasePhrase, retryHint) {
  const body = {
    model: MODEL,
    temperature: 0,
    seed: 42,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: buildPrompt(useCasePhrase, retryHint) },
          { type: 'image_url', image_url: { url: dataUrl, detail: 'low' } },
        ],
      },
    ],
  };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`OpenAI ${res.status}: ${txt.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response');
  return { metadata: JSON.parse(content), usage: data.usage };
}

function validateMetadata(m) {
  const issues = [];
  if (!m.title || typeof m.title !== 'string') issues.push('title missing');
  else {
    if (m.title.length < TITLE_MIN) issues.push(`title ${m.title.length}c < ${TITLE_MIN}`);
    if (m.title.length > TITLE_MAX) issues.push(`title ${m.title.length}c > ${TITLE_MAX}`);
    if (!m.title.includes('| MeetBackdrops')) issues.push('title missing brand suffix');
  }
  if (!m.description || typeof m.description !== 'string') issues.push('description missing');
  else {
    if (m.description.length < DESC_MIN) issues.push(`desc ${m.description.length}c < ${DESC_MIN}`);
    if (m.description.length > DESC_MAX) issues.push(`desc ${m.description.length}c > ${DESC_MAX}`);
  }
  if (!m.alt || typeof m.alt !== 'string') issues.push('alt missing');
  else {
    if (m.alt.length < ALT_MIN) issues.push(`alt ${m.alt.length}c < ${ALT_MIN}`);
    if (m.alt.length > ALT_MAX) issues.push(`alt ${m.alt.length}c > ${ALT_MAX}`);
  }
  if (!Array.isArray(m.tags)) issues.push('tags not array');
  else {
    if (m.tags.length < TAGS_MIN) issues.push(`tags ${m.tags.length} < ${TAGS_MIN}`);
    if (m.tags.length > TAGS_MAX) issues.push(`tags ${m.tags.length} > ${TAGS_MAX}`);
  }

  // Brand-voice / fluff guard
  const checkText = [m.title, m.description, m.alt].filter(Boolean).join(' ');
  const match = checkText.match(FORBIDDEN_RE);
  if (match) issues.push(`forbidden word: ${match[0]}`);

  return issues;
}

function buildRetryHint(issues) {
  const fixes = [];
  for (const issue of issues) {
    if (issue.startsWith('desc') && issue.includes('<')) fixes.push(`The previous description was too short. Make it longer — between ${DESC_MIN} and ${DESC_MAX} characters.`);
    else if (issue.startsWith('desc') && issue.includes('>')) fixes.push(`The previous description was too long. Trim it to between ${DESC_MIN} and ${DESC_MAX} characters.`);
    else if (issue.startsWith('title') && issue.includes('<')) fixes.push(`The previous title was too short. Make it ${TITLE_MIN}-${TITLE_MAX} chars.`);
    else if (issue.startsWith('title') && issue.includes('>')) fixes.push(`The previous title was too long. Trim it to ${TITLE_MIN}-${TITLE_MAX} chars.`);
    else if (issue.startsWith('forbidden word')) fixes.push(`Your previous output contained a forbidden word: "${issue.split(': ')[1]}". Rewrite without it.`);
    else if (issue.startsWith('tags')) fixes.push(`Tags count was wrong. Output exactly ${TAGS_MIN}-${TAGS_MAX} tags.`);
  }
  return fixes.length ? `RETRY — fix these issues from your previous attempt:\n${fixes.map(f => '- ' + f).join('\n')}\n\n` : '';
}

// Atomic write: tmp + rename
function saveOutput(state) {
  const tmp = OUTPUT_PATH + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
  fs.renameSync(tmp, OUTPUT_PATH);
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

  // Load existing state for resumability
  let state = {};
  if (fs.existsSync(OUTPUT_PATH)) {
    try { state = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8')); }
    catch (e) { console.warn('Could not parse existing output, starting fresh'); state = {}; }
  }

  let entries = manifest;
  if (SLUG_FILTER) entries = entries.filter(e => e.slug === SLUG_FILTER);
  if (LIMIT) entries = entries.slice(0, LIMIT);

  // Filter to entries needing processing
  const todo = entries.filter(e => {
    const existing = state[e.slug];
    return !existing || existing._prompt_version !== PROMPT_VERSION;
  });

  console.log(`📦 Manifest: ${manifest.length} | Target: ${entries.length} | TODO: ${todo.length} | Already done: ${entries.length - todo.length}`);
  console.log(`🤖 Model: ${MODEL} | detail: low | prompt version: ${PROMPT_VERSION}`);
  console.log('');

  if (todo.length === 0) {
    console.log('✅ Nothing to do.');
    return;
  }

  let totalIn = 0, totalOut = 0, failed = 0, retries = 0;
  const startTime = Date.now();

  for (let i = 0; i < todo.length; i++) {
    const entry = todo[i];
    const imageUrl = `${R2_BASE}/${entry.folder}/${entry.image_webp}`;
    const useCasePhrase = pickUseCase(entry.slug);
    const idxStr = `[${(i + 1).toString().padStart(4)}/${todo.length}]`;

    process.stdout.write(`${idxStr} ${entry.slug.padEnd(32)} `);

    let dataUrl;
    try {
      const b64 = await fetchAsBase64(imageUrl);
      dataUrl = `data:image/webp;base64,${b64}`;
    } catch (e) {
      console.log(`✗ fetch: ${e.message}`);
      failed++;
      continue;
    }

    let metadata = null;
    let attemptLog = [];
    let retryHint = '';
    let attempt = 0;

    while (attempt <= MAX_RETRIES) {
      try {
        const { metadata: m, usage } = await visionCall(dataUrl, useCasePhrase, retryHint);
        totalIn += usage.prompt_tokens || 0;
        totalOut += usage.completion_tokens || 0;
        const issues = validateMetadata(m);
        if (issues.length === 0) { metadata = m; break; }
        attemptLog.push(`attempt ${attempt + 1}: ${issues.join('; ')}`);
        retryHint = buildRetryHint(issues);
        attempt++;
        if (attempt <= MAX_RETRIES) retries++;
        else { metadata = m; break; } // accept with warnings
      } catch (e) {
        attemptLog.push(`attempt ${attempt + 1}: ERROR ${e.message}`);
        attempt++;
        if (attempt > MAX_RETRIES) break;
        await new Promise(r => setTimeout(r, 1000 * attempt));
      }
    }

    if (!metadata) {
      console.log(`✗ all ${MAX_RETRIES + 1} attempts failed`);
      failed++;
      continue;
    }

    const finalIssues = validateMetadata(metadata);
    const warn = finalIssues.length > 0 ? ` ⚠️ ${finalIssues.join(', ')}` : '';

    state[entry.slug] = {
      _prompt_version: PROMPT_VERSION,
      _slug: entry.slug,
      _category: entry.category,
      _useCasePhrase: useCasePhrase,
      _attempts: attemptLog,
      title: metadata.title,
      description: metadata.description,
      alt: metadata.alt,
      tags: metadata.tags,
    };

    // Save every entry for crash-safety
    saveOutput(state);

    const lens = `t${metadata.title?.length} d${metadata.description?.length} a${metadata.alt?.length} #${metadata.tags?.length}`;
    console.log(`✓ ${lens}${warn}`);

    // Progress checkpoint every 50
    if ((i + 1) % 50 === 0) {
      const elapsed = (Date.now() - startTime) / 1000;
      const rate = (i + 1) / elapsed;
      const eta = Math.round((todo.length - i - 1) / rate / 60);
      const cost = (totalIn * 0.150 + totalOut * 0.600) / 1_000_000;
      console.log(`    --- ${i + 1}/${todo.length} | rate ${rate.toFixed(1)}/s | retries ${retries} | failed ${failed} | $${cost.toFixed(3)} | ETA ${eta}min ---`);
    }
  }

  const totalCost = (totalIn * 0.150 + totalOut * 0.600) / 1_000_000;
  const elapsed = Math.round((Date.now() - startTime) / 60000);

  console.log('');
  console.log(`🎉 COMPLETE in ${elapsed} min`);
  console.log(`   Processed: ${todo.length - failed}/${todo.length}  (failed: ${failed}, retries used: ${retries})`);
  console.log(`   Tokens: ${totalIn.toLocaleString()} in / ${totalOut.toLocaleString()} out`);
  console.log(`   Cost: $${totalCost.toFixed(4)}`);
  console.log(`   Output: ${OUTPUT_PATH}`);
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
