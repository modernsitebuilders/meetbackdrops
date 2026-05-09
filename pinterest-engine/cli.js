#!/usr/bin/env node
const path = require('path');
const { parseManifest } = require('./lib/parser');
const { generateAll } = require('./lib/generator');
const { assignBoards } = require('./lib/board-mapper');
const {
  loadExecutionTape,
  executeQuotaTable,
} = require('./lib/scheduler');
const { writeCsv, pinToRow } = require('./lib/csv-writer');
const { publishPin } = require('./lib/publisher');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_MANIFEST = path.join(ROOT, 'image-pipeline', 'final_manifest.json');
const OUTPUT_DIR = path.join(__dirname, 'output');
const QUOTA_TABLE_PATH = path.join(__dirname, 'quota-table.json');
const ENV_PATH = path.join(ROOT, '.env.local');

try {
  require('dotenv').config({ path: ENV_PATH });
} catch (_err) {
  // dotenv is optional for the generate path; publishOne will throw cleanly if env vars are missing.
}

function buildPins(manifestPath) {
  const items = parseManifest(manifestPath);
  const pins = generateAll(items);
  return assignBoards(pins);
}

function indexPinsBySlug(pins) {
  const map = {};
  for (const pin of pins) map[pin.slug] = pin;
  return map;
}

function genMaster(pins) {
  const rows = pins.map((p) => pinToRow(p, 'seoTitle'));
  const result = writeCsv(path.join(OUTPUT_DIR, 'master-pins.csv'), rows);
  return { ...result, preview: rows.slice(0, 3) };
}

function genAb(pins) {
  const rows = [];
  for (const pin of pins) {
    rows.push(pinToRow(pin, 'seoTitle'));
    rows.push(pinToRow(pin, 'ctrTitle'));
  }
  const result = writeCsv(path.join(OUTPUT_DIR, 'ab-pins.csv'), rows);
  return { ...result, preview: rows.slice(0, 3) };
}

function genAmplify(pins) {
  const exec = loadExecutionTape(QUOTA_TABLE_PATH);
  const pinsBySlug = indexPinsBySlug(pins);
  const ordered = executeQuotaTable(exec.tape, pinsBySlug);
  const rows = ordered.map((p) => pinToRow(p, 'seoTitle'));
  const result = writeCsv(path.join(OUTPUT_DIR, 'amplified-pins.csv'), rows);
  return {
    ...result,
    preview: rows.slice(0, 3),
    emitted: ordered.length,
    categories: exec.categoryCount,
  };
}

function formatPreview(preview) {
  return preview
    .map((r, i) => `    [${i + 1}] ${r.Title} | ${r.Board}`)
    .join('\n');
}

function printResult(label, result) {
  console.log(`\n${label}`);
  console.log(`  file:    ${result.path}`);
  console.log(`  rows:    ${result.rowCount}`);
  console.log(`  bytes:   ${result.bytes}`);
  if (result.days != null) console.log(`  days:    ${result.days}`);
  if (result.emitted != null) {
    console.log(`  SUMMARY | emitted=${result.emitted} | categories=${result.categories} | status=OK`);
  }
  console.log(`  preview:`);
  console.log(formatPreview(result.preview));
}

function envKeyForCategory(category) {
  const normalized = String(category)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return `PINTEREST_BOARD_${normalized}`;
}

function getBoardId(category) {
  const key = envKeyForCategory(category);
  const id = process.env[key] || process.env.PINTEREST_DEFAULT_BOARD_ID;
  if (!id) {
    throw new Error(
      `No board ID configured. Set ${key} or PINTEREST_DEFAULT_BOARD_ID in .env.local.`,
    );
  }
  return { id, source: process.env[key] ? key : 'PINTEREST_DEFAULT_BOARD_ID' };
}

async function publishOne(slug, manifestPath) {
  if (!slug) {
    throw new Error('publish-one requires a slug. usage: node cli.js publish-one <slug>');
  }
  if (!process.env.PINTEREST_ACCESS_TOKEN) {
    throw new Error(
      'PINTEREST_ACCESS_TOKEN is missing. Run `node pinterest-engine/oauth-server.js` first.',
    );
  }

  console.log(`[publish-one] manifest: ${manifestPath}`);
  const pins = buildPins(manifestPath);
  const pin = pins.find((p) => p.slug === slug);
  if (!pin) {
    throw new Error(`Slug not found in manifest: ${slug}`);
  }

  const { id: boardId, source: boardSource } = getBoardId(pin.category);
  const payload = {
    board_id: boardId,
    title: pin.seoTitle,
    description: pin.description,
    link: pin.link,
    image_url: pin.imageUrl,
  };

  const apiBase = process.env.PINTEREST_API_BASE || 'https://api-sandbox.pinterest.com';
  const isSandbox = apiBase.includes('sandbox');

  console.log('[publish-one] === REQUEST ===');
  console.log(`  endpoint:    POST ${apiBase}/v5/pins`);
  console.log(`  environment: ${isSandbox ? 'SANDBOX (Trial app)' : 'PRODUCTION'}`);
  console.log(`  slug:        ${pin.slug}`);
  console.log(`  category:    ${pin.category}`);
  console.log(`  board_id:    ${boardId}  (from ${boardSource})`);
  console.log(`  title:       ${payload.title}`);
  console.log(`  description: ${payload.description.slice(0, 80)}…`);
  console.log(`  image_url:   ${payload.image_url}`);
  console.log(`  link:        ${payload.link}`);
  console.log('');

  const result = await publishPin(payload);

  console.log('[publish-one] === RESPONSE ===');
  if (result.success) {
    console.log(`  status:  OK`);
    console.log(`  pin_id:  ${result.pin_id}`);
    if (isSandbox) {
      console.log(`  note:    Sandbox pins are visible only via the Pinterest API,`);
      console.log(`           not on pinterest.com. Production access requires Pinterest approval.`);
    } else {
      console.log(`  view at: https://www.pinterest.com/pin/${result.pin_id}/`);
    }
    return 0;
  }
  console.log(`  status:  FAILED`);
  console.log(`  error:   ${result.error}`);
  return 1;
}

async function main(prodMode) {
  const argv = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const [cmd = 'all', sub = 'all', manifestArg] = argv;
  const manifestPath = manifestArg || DEFAULT_MANIFEST;

  if (cmd === 'publish-one') {
    const slug = sub === 'all' ? undefined : sub;
    const code = await publishOne(slug, manifestPath);
    process.exit(code);
  }

  if (cmd !== 'generate') {
    console.error(
      'usage:\n  node cli.js generate <master|ab|amplify|all> [manifest] [--prod]\n  node cli.js publish-one <slug> [manifest]',
    );
    process.exit(1);
  }
  const target = sub.toLowerCase();
  if (!prodMode) console.log(`manifest: ${manifestPath}`);
  const pins = buildPins(manifestPath);
  if (!prodMode) console.log(`pins generated: ${pins.length}`);

  if (target === 'master' || target === 'all') {
    const r = genMaster(pins);
    if (!prodMode) printResult('master-pins.csv', r);
  }
  if (target === 'ab' || target === 'all') {
    const r = genAb(pins);
    if (!prodMode) printResult('ab-pins.csv', r);
  }
  if (target === 'amplify') {
    const r = genAmplify(pins);
    if (!prodMode) printResult('amplified-pins.csv', r);
  }
}

if (require.main === module) {
  const prodMode = process.argv.includes('--prod');
  Promise.resolve()
    .then(() => main(prodMode))
    .catch((err) => {
      const msg = err && err.message ? err.message : String(err);
      const line = msg.indexOf('ERROR:') === 0 ? msg : `ERROR: FATAL | message=${msg}`;
      console.error(line);
      if (!prodMode && err && err.stack) console.error(err.stack);
      process.exit(1);
    });
}

module.exports = { buildPins, genMaster, genAb, genAmplify, publishOne };
