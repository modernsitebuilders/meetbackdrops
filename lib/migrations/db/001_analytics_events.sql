-- 001_analytics_events.sql
-- Analytics → Neon, table 1 — the first-party event log.
--
-- Mirrors the `Analytics` (+ `Analytics_Archive`) Google Sheet tab, one row per
-- event. The sheet is an append-only log with NO natural unique key, so idempotent
-- re-sync keys on row_hash = sha256 of the verbatim joined cells (prefixed with
-- source_tab). Typed columns are the queryable PROJECTION; source_data holds the
-- VERBATIM row array so a timestamp parse miss (or any future column) loses nothing.
--
-- Written by pages/api/analytics.js + pages/api/cron/flush-analytics.js. Columns
-- (sheet A:P, 15 used):
--   [0]timestamp(ET) [1]event_type [2]original_source [3]filename [4]category
--   [5]page_views_in_session [6]downloads_in_session [7]visitor_type [8]landing_page
--   [9]session_id [10]visitor_id [11]date [12]time [13]user_agent [14]referer

CREATE TABLE IF NOT EXISTS analytics_events (
  id                       bigserial     PRIMARY KEY,
  row_hash                 text          NOT NULL UNIQUE,
  source_tab               text          NOT NULL,   -- 'Analytics' | 'Analytics_Archive'

  -- queryable projection
  event_at                 timestamptz,              -- best-effort parse of the ET timestamp
  event_type               text,
  original_source          text,
  filename                 text,
  category                 text,
  page_views_in_session    integer,
  downloads_in_session     integer,
  visitor_type             text,
  landing_page             text,
  session_id               text,
  visitor_id               text,
  event_date               text,                     -- sheet col [11] (localized date string)
  event_time               text,                     -- sheet col [12] (localized time string)
  user_agent               text,
  referer                  text,

  -- verbatim migrated source row (zero-loss)
  source_data              jsonb         NOT NULL DEFAULT '[]'::jsonb,

  created_at               timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS analytics_events_event_at_idx    ON analytics_events (event_at);
CREATE INDEX IF NOT EXISTS analytics_events_event_type_idx  ON analytics_events (event_type);
CREATE INDEX IF NOT EXISTS analytics_events_category_idx    ON analytics_events (category);
CREATE INDEX IF NOT EXISTS analytics_events_session_id_idx  ON analytics_events (session_id);
CREATE INDEX IF NOT EXISTS analytics_events_visitor_id_idx  ON analytics_events (visitor_id);
