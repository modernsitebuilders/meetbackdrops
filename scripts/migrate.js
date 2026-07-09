const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  await client.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      filename   text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  const dir = path.join(__dirname, '..', 'lib', 'migrations', 'db');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
  const { rows } = await client.query('SELECT filename FROM _migrations');
  const applied = new Set(rows.map(r => r.filename));

  for (const f of files) {
    if (applied.has(f)) continue;
    const sql = fs.readFileSync(path.join(dir, f), 'utf8');
    process.stdout.write(`Applying ${f}... `);
    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [f]);
      await client.query('COMMIT');
      console.log('ok');
    } catch (e) {
      await client.query('ROLLBACK');
      console.error('FAILED');
      throw e;
    }
  }
  await client.end();
})().catch(e => { console.error(e); process.exit(1); });
