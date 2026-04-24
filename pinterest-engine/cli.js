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

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_MANIFEST = path.join(ROOT, 'image-pipeline', 'final_manifest.json');
const OUTPUT_DIR = path.join(__dirname, 'output');
const QUOTA_TABLE_PATH = path.join(__dirname, 'quota-table.json');

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

function main(prodMode) {
  const argv = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const [cmd = 'all', sub = 'all', manifestArg] = argv;
  const manifestPath = manifestArg || DEFAULT_MANIFEST;
  if (cmd !== 'generate') {
    console.error('usage: node cli.js generate <master|ab|amplify|all> [manifest] [--prod]');
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
  try {
    main(prodMode);
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    const line = msg.indexOf('ERROR:') === 0 ? msg : `ERROR: FATAL | message=${msg}`;
    console.error(line);
    if (!prodMode && err && err.stack) console.error(err.stack);
    process.exit(1);
  }
}

module.exports = { buildPins, genMaster, genAb, genAmplify };
