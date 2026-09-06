/*
# Create visitor counter table and increment function

1. New Tables
- `visitor_counter`
  - `id` (int, primary key, always 1 — singleton row)
  - `count` (bigint, not null, default 0)
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on `visitor_counter`.
- Allow anon + authenticated to SELECT (read the counter) — this is a public, shared counter with no owner.
- INSERT and UPDATE are NOT exposed via RLS; only the SECURITY DEFINER function `increment_visitor_count` can modify the counter, ensuring the count can only go up by 1 per call.

3. Functions
- `increment_visitor_count()` — SECURITY DEFINER, increments the singleton row's count by 1 and returns the new count. Creates the row if it doesn't exist (upsert). Safe to call from the anon-key frontend via supabase.rpc().
*/

CREATE TABLE IF NOT EXISTS visitor_counter (
  id integer PRIMARY KEY DEFAULT 1,
  count bigint NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT singleton_row CHECK (id = 1)
);

ALTER TABLE visitor_counter ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_visitor_counter" ON visitor_counter;
CREATE POLICY "anon_read_visitor_counter"
ON visitor_counter FOR SELECT
TO anon, authenticated USING (true);

-- Insert the singleton row if it doesn't exist
INSERT INTO visitor_counter (id, count)
VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

-- SECURITY DEFINER function so anon can increment without INSERT/UPDATE grants
CREATE OR REPLACE FUNCTION increment_visitor_count()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count bigint;
BEGIN
  INSERT INTO visitor_counter (id, count)
  VALUES (1, 1)
  ON CONFLICT (id)
  DO UPDATE SET count = visitor_counter.count + 1, updated_at = now()
  RETURNING count INTO new_count;

  RETURN new_count;
END;
$$;

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION increment_visitor_count() TO anon, authenticated;
