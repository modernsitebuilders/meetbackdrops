#!/usr/bin/env node
/*
 * One-time sandbox setup: creates a Pinterest *sandbox* board and writes its
 * numeric id into .env.local (PINTEREST_BOARD_OFFICE_SPACES + PINTEREST_DEFAULT_BOARD_ID).
 *
 * Why this exists: trial apps can only call the sandbox API, and the sandbox is an
 * isolated space — your real Pinterest boards don't exist there, so `publish-one`
 * fails with `'demo_board_office' does not match '^\d+$'` until a real sandbox board
 * id is configured. Run this once, then `publish-one` works.
 *
 *   node pinterest-engine/create-sandbox-board.js
 *
 * Re-running is safe: if a board with the same name already exists it is reused.
 */

const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const ENV_PATH = path.join(ROOT, '.env.local');
require('dotenv').config({ path: ENV_PATH });

const { upsertEnvVar } = require('./oauth-server');

const API_BASE = process.env.PINTEREST_API_BASE || 'https://api-sandbox.pinterest.com';
const TOKEN = process.env.PINTEREST_ACCESS_TOKEN;
const BOARD_NAME = 'Office Spaces';
const BOARD_DESCRIPTION =
  'Studio-designed office virtual backgrounds for Zoom, Microsoft Teams, and Google Meet.';

async function findExistingBoard() {
  const res = await fetch(`${API_BASE}/v5/boards?page_size=100`, {
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json' },
  });
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  const items = (data && data.items) || [];
  return items.find((b) => b.name === BOARD_NAME) || null;
}

async function createBoard() {
  const res = await fetch(`${API_BASE}/v5/boards`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ name: BOARD_NAME, description: BOARD_DESCRIPTION, privacy: 'PUBLIC' }),
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (_) { data = { raw: text }; }
  if (!res.ok) {
    const msg = (data && (data.message || data.error || data.raw)) || `HTTP ${res.status}`;
    throw new Error(`Board create failed (status ${res.status}): ${msg}`);
  }
  return data;
}

function persistBoardId(id) {
  let envText = '';
  try { envText = fs.readFileSync(ENV_PATH, 'utf8'); } catch (_) { envText = ''; }
  envText = upsertEnvVar(envText, 'PINTEREST_BOARD_OFFICE_SPACES', id);
  envText = upsertEnvVar(envText, 'PINTEREST_DEFAULT_BOARD_ID', id);
  fs.writeFileSync(ENV_PATH, envText);
}

(async () => {
  if (!TOKEN) {
    console.error('Missing PINTEREST_ACCESS_TOKEN in .env.local — run the OAuth server first.');
    process.exit(1);
  }
  const isSandbox = API_BASE.includes('sandbox');
  console.log(`[setup] environment: ${isSandbox ? 'SANDBOX' : 'PRODUCTION'} (${API_BASE})`);

  let board = await findExistingBoard();
  if (board) {
    console.log(`[setup] reusing existing board "${board.name}" (id=${board.id})`);
  } else {
    console.log(`[setup] creating board "${BOARD_NAME}"…`);
    board = await createBoard();
    console.log(`[setup] created board "${board.name}" (id=${board.id})`);
  }

  persistBoardId(board.id);
  console.log('[setup] wrote PINTEREST_BOARD_OFFICE_SPACES and PINTEREST_DEFAULT_BOARD_ID to .env.local');
  console.log('\n✓ Ready. Now run:');
  console.log('  node pinterest-engine/cli.js publish-one "minimalist-office-corner-plant-candles-framed-pictures-beige-5bf5e3d7"');
})().catch((err) => {
  console.error(`[setup] ${err.message}`);
  process.exit(1);
});
