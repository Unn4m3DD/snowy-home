CREATE TABLE IF NOT EXISTS apartment_tracking (
  listing_id TEXT PRIMARY KEY NOT NULL,
  contacted INTEGER NOT NULL DEFAULT 0 CHECK (contacted IN (0, 1)),
  visit_at TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  removed INTEGER NOT NULL DEFAULT 0 CHECK (removed IN (0, 1)),
  updated_at TEXT NOT NULL
);
