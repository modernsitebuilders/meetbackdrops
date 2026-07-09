-- 005_licensing_inquiries.sql
-- Analytics → Neon, table 5 — Licensing sales campaign leads.
--
-- Separate campaign/product from Branded Backgrounds (004), hence a separate table.
-- Mirrors the `Licensing Inquiries` sheet tab (A:K), which shares the same 11-column
-- lead schema:
--   [0]timestamp(ET) [1]name [2]work_email [3]company [4]role [5]team_size
--   [6]timeline [7]use_case [8]notes [9]ip [10]user_agent
-- Idempotent re-sync keys on row_hash (sha256 of the verbatim joined cells).

CREATE TABLE IF NOT EXISTS licensing_inquiries (
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

CREATE INDEX IF NOT EXISTS licensing_inquiries_inquiry_at_idx  ON licensing_inquiries (inquiry_at);
CREATE INDEX IF NOT EXISTS licensing_inquiries_work_email_idx  ON licensing_inquiries (work_email);
