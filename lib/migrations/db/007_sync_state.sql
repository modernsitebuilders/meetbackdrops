-- 007_sync_state.sql
-- Watermark bookkeeping for the Sheets→Neon sync (scripts/data-platform/sync-sheets.mjs).
--
-- Why: the sync used to re-read the ENTIRE `Analytics` + `Analytics_Archive` tabs on
-- every run and re-send every historical row to Postgres. That work grew with total
-- history rather than with new events, and by Sept 2026 the run was taking 51–60 min
-- and dying on a dropped connection at the one-hour mark.
--
-- The Analytics tabs are append-only, so remembering how many rows we have already
-- read lets the next run fetch only the tail. `last_row` is the absolute 1-based sheet
-- row index of the last row consumed from that tab.
--
-- This is ONLY an optimization — never a correctness dependency. Every row is still
-- keyed by row_hash with ON CONFLICT DO NOTHING, so a full re-read is always safe and
-- never double-counts. The sync therefore:
--   * re-reads the full tab when there is no state row, on --full, and on a periodic
--     reconcile (last_full_sync_at older than the script's FULL_EVERY_DAYS), and
--   * self-heals: if the tab turns out to be SHORTER than the recorded watermark
--     (rows manually moved to Analytics_Archive, say), it discards the watermark and
--     re-reads the whole tab that run.
-- It also tolerates this table being absent entirely, degrading to a full read.

CREATE TABLE IF NOT EXISTS sync_state (
  tab                text         PRIMARY KEY,   -- sheet tab name, e.g. 'Analytics'
  last_row           integer      NOT NULL DEFAULT 0,  -- absolute 1-based last sheet row consumed
  last_full_sync_at  timestamptz,                -- when this tab was last read end-to-end
  updated_at         timestamptz  NOT NULL DEFAULT now()
);
