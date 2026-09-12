// scripts/data-platform/_neon.mjs
//
// Neon access for the batch data-platform scripts, over the HTTP driver
// (@neondatabase/serverless) rather than a long-lived `pg` TCP connection.
//
// WHY HTTP HERE. The sheet sync is a long job that idles between Sheets reads, and a
// `pg.Client` held open across that idle time is exactly what kept dying: Neon (or any
// hop in between) drops the socket, `pg` emits an 'error' event on the Client, nothing
// is listening, and Node crashes the whole process — losing an hour of work to an
// unhandled 'error' event. The HTTP driver has no persistent socket to lose: each
// statement is its own request, so an idle gap costs nothing and a blip retries instead
// of terminating the run. (lib/db.js keeps the `pg` Pool for anything that genuinely
// needs session state or interactive transactions.)
//
// Everything here is safe to re-run: the sync's writes are all
// ON CONFLICT (row_hash) DO NOTHING, so a retried or partially-completed chunk is a
// no-op the second time around.

import { neon } from '@neondatabase/serverless';

export function getSql() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
  // Default (fullResults: false) mode — sql.query() resolves to a plain rows array.
  return neon(process.env.DATABASE_URL);
}

// SQLSTATE classes that will never succeed on a retry: syntax/undefined object (42),
// data exception (22), integrity violation (23), invalid catalog name (3D), invalid
// authorization (28). Everything else — socket resets, timeouts, compute still waking
// from auto-suspend, 5xx from the Neon HTTP endpoint — is worth another attempt.
const PERMANENT_SQLSTATE = /^(22|23|28|3D|42)/;

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Run `fn`, retrying transient failures with jittered exponential backoff. `label` is
// only used for the warning line so a retry storm is legible in the Action log.
export async function withRetry(label, fn, { attempts = 5, baseMs = 600 } = {}) {
  let lastErr;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (PERMANENT_SQLSTATE.test(String(e?.code ?? ''))) throw e;
      if (attempt === attempts) break;
      const wait = Math.round(baseMs * 2 ** (attempt - 1) * (0.75 + Math.random() * 0.5));
      console.warn(`  ⚠️  ${label}: ${e.message} — retrying (${attempt}/${attempts - 1}) in ${wait}ms`);
      await sleep(wait);
    }
  }
  throw lastErr;
}

// Insert `rows` with ONE multi-row INSERT per chunk instead of one statement per row.
// This is the single biggest win in the sync: the old per-row loop paid a full network
// round trip for every historical event (hundreds of thousands of them), which is what
// stretched the run to ~an hour.
//
//   `cols`       column names, row_hash FIRST.
//   `toValues`   maps a prepared row to the bound values for `cols`.
//
// Chunks are sized against Postgres's 65535 bind-parameter ceiling and capped so a
// single request body stays modest. Each chunk is its own statement, so a failure
// mid-way leaves the earlier chunks committed — and because every insert is
// ON CONFLICT (row_hash) DO NOTHING, the next run simply resumes.
//
// Rows are de-duplicated by row_hash in JS first: the watermark overlap can hand us the
// same row twice, and trimming here keeps the request smaller.
//
// `opts.onChunk(lastRowOfChunk)` is awaited after each chunk COMMITS. The sheet sync
// uses it to advance its watermark as it goes, which is what makes a long run
// resumable: if the process dies part-way, the chunks that landed stay landed and the
// next run starts after them instead of redoing the whole table.
export async function insertBatched(sql, table, cols, rows, toValues, { onChunk } = {}) {
  if (rows.length === 0) return { inserted: 0, skipped: 0, sent: 0 };

  const seen = new Set();
  const unique = rows.filter(r => !seen.has(r.row_hash) && seen.add(r.row_hash));

  const perRow = cols.length;
  const chunkSize = Math.max(
    1,
    Math.min(Number(process.env.SYNC_CHUNK_ROWS) || 500, Math.floor(60000 / perRow)),
  );
  const colList = cols.join(', ');
  let inserted = 0;

  for (let start = 0; start < unique.length; start += chunkSize) {
    const chunk = unique.slice(start, start + chunkSize);
    const params = [];
    const tuples = chunk.map((row) => {
      const bound = toValues(row);
      return `(${bound.map((v) => { params.push(v); return `$${params.length}`; }).join(', ')})`;
    });
    // RETURNING 1 makes the inserted count exact without depending on the driver's
    // rowCount shape — the resolved array holds one entry per row actually written.
    const text =
      `INSERT INTO ${table} (${colList}) VALUES ${tuples.join(', ')}\n` +
      `ON CONFLICT (row_hash) DO NOTHING RETURNING 1`;
    const label = `${table} rows ${start + 1}–${start + chunk.length}`;
    const res = await withRetry(label, () => sql.query(text, params));
    inserted += Array.isArray(res) ? res.length : (res?.rows?.length ?? 0);
    if (onChunk) await onChunk(chunk[chunk.length - 1]);
  }

  return { inserted, skipped: unique.length - inserted, sent: unique.length };
}
