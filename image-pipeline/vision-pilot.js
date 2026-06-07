#!/usr/bin/env node
/**
 * Vision-based metadata pilot — 10 images across categories.
 *
 * Hits gpt-4o-mini WITH the actual image (image_url to R2, detail:low) so
 * the title/description/alt/tags are grounded in what each image actually
 * shows, not inferred from category priors.
 *
 * Output:
 *   image-pipeline/vision-pilot-output.json   — full vision response per image
 *   stdout — side-by-side OLD vs NEW comparison for human review
 *
 * If you like the output, the full-catalog version reuses this exact prompt
 * and just iterates all 1,140 entries with resumability.
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
const OUTPUT_PATH = path.join(__dirname, 'vision-pilot-output-base64.json');
const R2_BASE = 'https://assets.streambackdrops.com/webp';

const MODEL = 'gpt-4o-mini';

// Pilot mix: cover the top demand categories + summer (no existing ai_metadata)
// to test vision quality both as backfill and as replacement.
const PILOT_SLUGS = [
  'summer-background-01',   // top demand, no ai_metadata
  'summer-background-15',
  'summer-background-25',
  'library-04',             // top demand, has ai_metadata
  'library-10',
  'urban-loft-08',          // top demand
  'urban-loft-20',
  'coffee-shop-12',         // top demand
  'coffee-shop-22',
  'conference-room-15',     // B2B underperformer
];

const PROMPT = `You are writing SEO metadata for ONE specific image sold as a virtual background for executive corporate video calls on Zoom, Microsoft Teams, and Google Meet. No people are in the image.

BRAND: MeetBackdrops — a virtual set design studio. The brand serves corporate / executive professionals. It is NOT a gaming, streaming, Twitch, or livestreamer brand. NEVER use: gamer, gaming, Twitch, streamer, OBS, esports, livestream. Approved vocabulary: designed, studio-designed, 4K-upscaled, composed for camera, virtual background, virtual set, high-fidelity, corporate, executive, boardroom.

INSTRUCTIONS:
Look at the image. Identify the actual setting, objects, materials, lighting, palette, mood, and composition. Then output strict JSON with exactly these keys: title, description, alt, tags.

=== title (50–80 chars total) ===
- Lead with a concrete, image-grounded subject (what's actually in the scene).
- Weave TWO of: environment, mood/atmosphere, lighting/time-of-day.
- Must end with " | MeetBackdrops" (the brand suffix is required).
- Title Case. No trailing punctuation. No emojis.
- Forbidden: "background", "backdrop", "wallpaper", "stunning", "perfect", "ultimate", "premium".

=== description (110–160 chars, strict) ===
- Visual specifics that could only describe THIS image: real objects, materials, light quality, palette.
- Weave ONE use-case phrase mid-sentence (pick one that fits the tone): "professional video calls", "executive video calls", "remote work", "online presentations", "team standups", "virtual meetings".
- Don't start with "A", "An", "This", "The perfect". Don't restate the title. Don't tack on "perfect for Zoom" boilerplate.
- 110–160 chars is a hard constraint. Count carefully.

=== alt (60–140 chars) ===
- Factual visual description for screen readers.
- Describe what is visible: subject, layout, light, palette.
- Do NOT begin with "Image of" or "A picture of". Do NOT mention Zoom, virtual, background — alt is accessibility, not SEO.

=== tags (array of 8–12 lowercase strings) ===
- Span at least 5 of these axes (max 2 tags per axis):
  * environment / room type
  * subject / object visible in the image
  * mood / atmosphere
  * lighting
  * style / aesthetic
  * color / palette
  * composition / depth
  * use-case (at least one use-case tag required)
- Each tag: 1–3 words, lowercase, no punctuation, no hashtags.
- No near-synonym stacking. No generic filler ("image", "photo", "hd"). Don't repeat the category slug verbatim.

OUTPUT: strict JSON only. No markdown, no code fences, no commentary.`;

async function fetchAsBase64(imageUrl) {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`R2 fetch ${res.status} for ${imageUrl}`);
  const buf = Buffer.from(await res.arrayBuffer());
  return buf.toString('base64');
}

async function visionCall(imageUrl) {
  // Base64-inline the image so the model never sees the R2 URL filename
  // path (which would leak "summer-backgrounds/summer-background-15.webp"
  // and bias the description toward the catalog category).
  const b64 = await fetchAsBase64(imageUrl);
  const dataUrl = `data:image/webp;base64,${b64}`;

  const body = {
    model: MODEL,
    temperature: 0,
    seed: 42,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: PROMPT },
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
    throw new Error(`OpenAI ${res.status}: ${txt}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response');

  const parsed = JSON.parse(content);
  return {
    metadata: parsed,
    usage: data.usage,
  };
}

function buildImageUrl(entry) {
  // entry.folder is the actual R2 path (handles bookshelves-bright vs bookshelves)
  return `${R2_BASE}/${entry.folder}/${entry.image_webp}`;
}

async function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const bySlug = Object.fromEntries(manifest.map(e => [e.slug, e]));

  const results = [];
  let totalInTokens = 0;
  let totalOutTokens = 0;

  for (let i = 0; i < PILOT_SLUGS.length; i++) {
    const slug = PILOT_SLUGS[i];
    const entry = bySlug[slug];
    if (!entry) {
      console.error(`  [${i + 1}/${PILOT_SLUGS.length}] ${slug} — NOT FOUND in manifest, skipping`);
      continue;
    }

    const imageUrl = buildImageUrl(entry);
    process.stdout.write(`  [${i + 1}/${PILOT_SLUGS.length}] ${slug.padEnd(28)} `);

    try {
      const { metadata, usage } = await visionCall(imageUrl);
      totalInTokens += usage.prompt_tokens || 0;
      totalOutTokens += usage.completion_tokens || 0;
      results.push({
        slug,
        category: entry.category,
        imageUrl,
        old: {
          title: entry.title,
          description: entry.description,
          alt: entry.alt,
          tags: entry.tags,
        },
        new: metadata,
        lengths: {
          title: metadata.title?.length ?? null,
          description: metadata.description?.length ?? null,
          alt: metadata.alt?.length ?? null,
          tagCount: Array.isArray(metadata.tags) ? metadata.tags.length : null,
        },
        usage,
      });
      console.log(`✓ title=${metadata.title?.length}c desc=${metadata.description?.length}c tags=${metadata.tags?.length}`);
    } catch (e) {
      console.log(`✗ ${e.message}`);
      results.push({ slug, error: e.message });
    }
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2));

  // Cost estimate: gpt-4o-mini = $0.150 / 1M input, $0.600 / 1M output
  const cost = (totalInTokens * 0.150 + totalOutTokens * 0.600) / 1_000_000;
  console.log(`\n📊 Tokens: ${totalInTokens} in / ${totalOutTokens} out`);
  console.log(`💵 Pilot cost: $${cost.toFixed(4)}`);
  console.log(`📁 Saved: ${OUTPUT_PATH}`);

  // Project full-catalog cost
  const perImage = (totalInTokens + totalOutTokens) / Math.max(1, results.filter(r => !r.error).length);
  const fullCost = (perImage * 1140 * 0.4) / 1_000_000; // blended approx
  console.log(`📈 Projected full 1,140-image cost: ~$${fullCost.toFixed(2)}`);
}

main().catch(e => { console.error(e); process.exit(1); });
