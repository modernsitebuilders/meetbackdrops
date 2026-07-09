-- 003_reviews.sql
-- Analytics → Neon, table 3 — user reviews.
--
-- Mirrors the `Reviews` sheet tab (A:F, header in row 1), written by
-- pages/api/submit-review.js and read by lib/reviews.js:
--   [0]date(ET string) [1]rating [2]name [3]comment [4]email [5]status
-- Idempotent re-sync keys on row_hash (sha256 of the verbatim joined cells).

CREATE TABLE IF NOT EXISTS reviews (
  id           bigserial     PRIMARY KEY,
  row_hash     text          NOT NULL UNIQUE,

  review_at    timestamptz,               -- best-effort parse of the ET date
  rating       integer,
  name         text,
  comment      text,
  email        text,
  status       text,                      -- e.g. 'pending' | 'approved'

  source_data  jsonb         NOT NULL DEFAULT '[]'::jsonb,
  created_at   timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reviews_status_idx    ON reviews (status);
CREATE INDEX IF NOT EXISTS reviews_review_at_idx ON reviews (review_at);
