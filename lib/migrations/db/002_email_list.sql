-- 002_email_list.sql
-- Analytics → Neon, table 2 — email captures.
--
-- Mirrors the `Email List` sheet tab (A:C), written by pages/api/save-email.js:
--   [0]email [1]source [2]timestamp(ET string)
-- Idempotent re-sync keys on row_hash (sha256 of the verbatim joined cells).
-- The sheet already de-dupes by email; email is indexed but NOT unique here so a
-- re-captured email with a different source/timestamp is preserved verbatim.

CREATE TABLE IF NOT EXISTS email_list (
  id           bigserial     PRIMARY KEY,
  row_hash     text          NOT NULL UNIQUE,

  email        text,
  source       text,
  captured_at  timestamptz,               -- best-effort parse of the ET timestamp

  source_data  jsonb         NOT NULL DEFAULT '[]'::jsonb,
  created_at   timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS email_list_email_idx ON email_list (email);
