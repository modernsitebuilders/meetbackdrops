-- 004_branded_inquiries.sql
-- Analytics → Neon, table 4 — Branded Backgrounds sales campaign leads.
--
-- Branded Backgrounds and Licensing are two SEPARATE sales campaigns / products,
-- so they get two tables: this one (branded) and licensing_inquiries (005).
--
-- Mirrors the `Branded Inquiries` sheet tab (A:K), written by
-- pages/api/branded-inquiry.js:
--   [0]timestamp(ET) [1]name [2]work_email [3]company [4]role [5]team_size
--   [6]timeline [7]use_case [8]notes [9]ip [10]user_agent
-- NOTE: as of this migration that write path targets a "Branded Inquiries" tab
-- that does not yet exist in the sheet (a live bug in branded-inquiry.js — its
-- own header comment flags it), so this table stays empty until the tab exists and
-- has rows. The sync tolerates the missing tab (0 rows) so it fills automatically
-- once the write path is fixed.
-- Idempotent re-sync keys on row_hash (sha256 of the verbatim joined cells).

CREATE TABLE IF NOT EXISTS branded_inquiries (
  id           bigserial     PRIMARY KEY,
  row_hash     text          NOT NULL UNIQUE,

  inquiry_at   timestamptz,               -- best-effort parse of the ET timestamp
  name         text,
  work_email   text,
  company      text,
  role         text,
  team_size    text,
  timeline     text,
  use_case     text,
  notes        text,
  ip           text,
  user_agent   text,

  source_data  jsonb         NOT NULL DEFAULT '[]'::jsonb,
  created_at   timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS branded_inquiries_inquiry_at_idx  ON branded_inquiries (inquiry_at);
CREATE INDEX IF NOT EXISTS branded_inquiries_work_email_idx  ON branded_inquiries (work_email);
