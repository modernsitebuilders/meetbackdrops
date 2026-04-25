#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { parseManifest } = require('./lib/parser');
const { generateAll } = require('./lib/generator');
const { assignBoards } = require('./lib/board-mapper');
const { loadExecutionTape, executeQuotaTable } = require('./lib/scheduler');
const { publishQueue } = require('./lib/publisher');
const { alertFailure } = require('./lib/alert');

const ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'image-pipeline', 'final_manifest.json');
const QUOTA_TABLE_PATH = path.join(__dirname, 'quota-table.json');
const LOGS_DIR = path.join(__dirname, 'logs');
const RETRY_DELAY_MS = 60_000;

const REQUIRED_PIN_FIELDS = ['slug', 'category', 'board', 'seoTitle', 'description', 'imageUrl', 'link'];
const REQUIRED_PUBLISH_FIELDS = ['board_id', 'title', 'description', 'image_url'];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function indexPinsBySlug(pins) {
  const map = {};
  for (const pin of pins) {
    if (map[pin.slug]) {
      throw new Error(`ERROR: DUPLICATE_SLUG_IN_PIPELINE | slug=${pin.slug}`);
    }
    map[pin.slug] = pin;
  }
  return map;
}

function envKeyForCategory(category) {
  const normalized = String(category)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return `PINTEREST_BOARD_${normalized}`;
}

function getBoardId(category) {
  if (!category || typeof category !== 'string') {
    throw new Error('ERROR: MISSING_CATEGORY | reason=pin has no category assignment');
  }
  const key = envKeyForCategory(category);
  const id = process.env[key] || process.env.PINTEREST_DEFAULT_BOARD_ID;
  if (!id) {
    throw new Error(`ERROR: MISSING_BOARD_ID | category=${category} | env=${key}`);
  }
  return id;
}

function validatePipelinePins(pins) {
  const errors = [];
  for (let i = 0; i < pins.length; i++) {
    const p = pins[i];
    for (const f of REQUIRED_PIN_FIELDS) {
      if (!p[f] || typeof p[f] !== 'string') {
        errors.push(`pin[${i}] (slug=${p && p.slug}) missing/invalid field: ${f}`);
      }
    }
  }
  if (errors.length) {
    const preview = errors.slice(0, 10).join('\n  ');
    throw new Error(`ERROR: PIN_SCHEMA_INVALID | count=${errors.length}\n  ${preview}`);
  }
}

function validateScheduledPins(scheduled, sourceMap) {
  if (!Array.isArray(scheduled)) {
    throw new Error('ERROR: SCHEDULER_OUTPUT_NOT_ARRAY');
  }
  if (scheduled.length === 0) {
    throw new Error('ERROR: SCHEDULER_OUTPUT_EMPTY');
  }
  const seen = new Set();
  for (let i = 0; i < scheduled.length; i++) {
    const p = scheduled[i];
    if (!p || typeof p !== 'object') {
      throw new Error(`ERROR: SCHEDULER_ITEM_INVALID | index=${i}`);
    }
    if (!p.slug || !sourceMap[p.slug]) {
      throw new Error(`ERROR: SCHEDULER_UNKNOWN_PIN | index=${i} | slug=${p && p.slug}`);
    }
    if (seen.has(p.slug)) {
      throw new Error(`ERROR: SCHEDULER_DUPLICATE_PIN | slug=${p.slug}`);
    }
    seen.add(p.slug);
  }
}

function toPublisherShape(pin) {
  return {
    board_id: getBoardId(pin.category),
    title: pin.seoTitle,
    description: pin.description,
    link: pin.link,
    image_url: pin.imageUrl,
  };
}

function validatePublishPayload(queue, scheduled) {
  const errors = [];
  for (let i = 0; i < queue.length; i++) {
    const item = queue[i];
    const slug = scheduled[i] && scheduled[i].slug;
    for (const f of REQUIRED_PUBLISH_FIELDS) {
      if (!item[f] || typeof item[f] !== 'string') {
        errors.push(`queue[${i}] (slug=${slug}) missing/invalid: ${f}`);
      }
    }
  }
  if (errors.length) {
    const preview = errors.slice(0, 10).join('\n  ');
    throw new Error(`ERROR: PUBLISH_PAYLOAD_INVALID | count=${errors.length}\n  ${preview}`);
  }
}

function summarizeByCategory(scheduled, results) {
  const byCat = {};
  for (let i = 0; i < scheduled.length; i++) {
    const cat = scheduled[i].category || 'unknown';
    if (!byCat[cat]) byCat[cat] = { total: 0, succeeded: 0, failed: 0 };
    byCat[cat].total += 1;
    const r = results[i];
    if (r && r.result && r.result.success) byCat[cat].succeeded += 1;
    else byCat[cat].failed += 1;
  }
  return byCat;
}

function collectFailures(scheduled, results) {
  const failures = [];
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r && r.result && !r.result.success) {
      const s = scheduled[i] || {};
      failures.push({
        slug: s.slug,
        category: s.category,
        board: s.board,
        error: r.result.error,
      });
    }
  }
  return failures;
}

function findFailedIndices(results) {
  const idx = [];
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (!r || !r.result || !r.result.success) idx.push(i);
  }
  return idx;
}

function mergeRetryResults(summary, retrySummary, failedIndices) {
  for (let j = 0; j < retrySummary.results.length; j++) {
    const origIdx = failedIndices[j];
    const newR = retrySummary.results[j];
    const prev = summary.results[origIdx];
    const prevOk = !!(prev && prev.result && prev.result.success);
    const nowOk = !!(newR && newR.result && newR.result.success);
    summary.results[origIdx] = { index: origIdx, pin: prev && prev.pin, result: newR.result };
    if (nowOk && !prevOk) {
      summary.succeeded += 1;
      summary.failed -= 1;
    }
  }
}

function writeRunLog(record, startedAt) {
  try {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
    const ts = String(startedAt).replace(/[:.]/g, '-');
    const file = path.join(LOGS_DIR, `run-${ts}.json`);
    fs.writeFileSync(file, JSON.stringify(record, null, 2));
    console.log(`[engine] run log written: ${file}`);
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    console.error(`[engine] run log write failed: ${msg}`);
  }
}

async function run(options = {}) {
  const dryRun = !!options.dryRun;
  const startedAt = new Date().toISOString();
  console.log(`[engine] started ${startedAt}${dryRun ? ' (dry-run)' : ''}`);

  const items = parseManifest(MANIFEST_PATH);
  console.log(`[engine] manifest loaded: ${items.length} items`);

  const generated = generateAll(items);
  const pins = assignBoards(generated);
  validatePipelinePins(pins);
  console.log(`[engine] pins generated: ${pins.length} (schema validated)`);

  const exec = loadExecutionTape(QUOTA_TABLE_PATH);
  const sourceMap = indexPinsBySlug(pins);
  const scheduledPins = executeQuotaTable(exec.tape, sourceMap);
  validateScheduledPins(scheduledPins, sourceMap);
  console.log(
    `[engine] scheduled queue: ${scheduledPins.length} pins across ${exec.categoryCount} categories`,
  );

  const queue = scheduledPins.map(toPublisherShape);
  validatePublishPayload(queue, scheduledPins);
  console.log(`[engine] publish payload validated: ${queue.length} pins`);

  let summary;
  let retryAttempted = false;
  let retryCount = 0;

  if (dryRun) {
    console.log('[engine] dry-run: skipping publishQueue');
    summary = {
      total: queue.length,
      succeeded: 0,
      failed: 0,
      results: queue.map((_, i) => ({ index: i, result: { success: true, pin_id: 'dry-run' } })),
    };
  } else {
    summary = await publishQueue(queue);

    const failedIndices = findFailedIndices(summary.results);
    if (failedIndices.length > 0) {
      retryAttempted = true;
      retryCount = failedIndices.length;
      console.log(
        `[engine] retry: ${failedIndices.length} failed pins — waiting ${RETRY_DELAY_MS / 1000}s`,
      );
      await sleep(RETRY_DELAY_MS);
      const retryQueue = failedIndices.map((i) => queue[i]);
      console.log(`[engine] retry: republishing ${retryQueue.length} pins`);
      const retrySummary = await publishQueue(retryQueue);
      mergeRetryResults(summary, retrySummary, failedIndices);
      console.log(
        `[engine] retry complete: ${retrySummary.succeeded}/${retrySummary.total} recovered`,
      );
    }
  }

  const finishedAt = new Date().toISOString();
  const byCategory = summarizeByCategory(scheduledPins, summary.results);
  const failures = dryRun ? [] : collectFailures(scheduledPins, summary.results);

  console.log('\n[engine] === SUMMARY ===');
  console.log(`  started:    ${startedAt}`);
  console.log(`  finished:   ${finishedAt}`);
  console.log(`  total:      ${summary.total}`);
  console.log(`  succeeded:  ${summary.succeeded}`);
  console.log(`  failed:     ${summary.failed}`);
  if (retryAttempted) console.log(`  retried:    ${retryCount}`);
  if (dryRun) console.log('  mode:       dry-run');

  console.log('\n[engine] === BY CATEGORY ===');
  const cats = Object.keys(byCategory).sort();
  for (const c of cats) {
    const s = byCategory[c];
    console.log(`  ${c.padEnd(28)} total=${s.total}  ok=${s.succeeded}  fail=${s.failed}`);
  }

  if (failures.length) {
    console.log('\n[engine] === FAILURES ===');
    for (const f of failures) {
      console.log(`  slug=${f.slug}  category=${f.category}  board=${f.board}`);
      console.log(`    error: ${f.error}`);
    }
  }

  const record = {
    startedAt,
    finishedAt,
    dryRun,
    total: summary.total,
    succeeded: summary.succeeded,
    failed: summary.failed,
    retryAttempted,
    retryCount,
    byCategory,
    failures,
  };

  writeRunLog(record, startedAt);

  if (!dryRun && summary.failed > 0) {
    const alertResult = await alertFailure({
      total: summary.total,
      succeeded: summary.succeeded,
      failed: summary.failed,
      timestamp: finishedAt,
    });
    if (alertResult && alertResult.sent) {
      console.log('[engine] failure alert sent to Slack');
    } else if (alertResult) {
      console.log(`[engine] failure alert not sent: ${alertResult.reason}`);
    }
  }

  return record;
}

if (require.main === module) {
  const dryRun = process.argv.includes('--dry-run');
  run({ dryRun })
    .then((record) => {
      process.exit(record.failed > 0 ? 1 : 0);
    })
    .catch((err) => {
      const msg = err && err.message ? err.message : String(err);
      console.error(`[engine] FATAL: ${msg}`);
      if (err && err.stack) console.error(err.stack);
      process.exit(1);
    });
}

module.exports = { run };
