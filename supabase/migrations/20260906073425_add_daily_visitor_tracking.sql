/*
# Add daily visitor tracking

1. New Tables
- `daily_visitors`
  - `visit_date` (date, primary key — one row per day)
  - `count` (bigint, not null, default 0)
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on `daily_visitors`.
- Allow anon + authenticated to SELECT (read daily counts) — public/shared data.
- INSERT and UPDATE are NOT exposed via RLS; only the SECURITY DEFINER function can modify.

3. Functions
- `track_visit()` — SECURITY DEFINER. Replaces `increment_visitor_count()`.
  - Increments the singleton total counter (visitor_counter row id=1) by 1.
  - Upserts today's row in `daily_visitors` (incrementing count by 1, or creating with count=1).
  - Returns a JSON object: `{ "total": bigint, "today": bigint }`.
  - Safe to call from the anon-key frontend via supabase.rpc().
- Drops the old `increment_visitor_count()` function since `track_visit` supersedes it.
*/

CREATE TABLE IF NOT EXISTS daily_visitors (
  visit_date date PRIMARY KEY DEFAULT CURRENT_DATE,
  count bigint NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE daily_visitors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_daily_visitors" ON daily_visitors;
CREATE POLICY "anon_read_daily_visitors"
ON daily_visitors FOR SELECT
TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION track_visit()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_count bigint;
  today_count bigint;
BEGIN
  -- Increment total counter
  INSERT INTO visitor_counter (id, count)
  VALUES (1, 1)
  ON CONFLICT (id)
  DO UPDATE SET count = visitor_counter.count + 1, updated_at = now()
  RETURNING count INTO total_count;

  -- Upsert today's daily count
  INSERT INTO daily_visitors (visit_date, count)
  VALUES (CURRENT_DATE, 1)
  ON CONFLICT (visit_date)
  DO UPDATE SET count = daily_visitors.count + 1, updated_at = now()
  RETURNING count INTO today_count;

  RETURN json_build_object('total', total_count, 'today', today_count);
END;
$$;

GRANT EXECUTE ON FUNCTION track_visit() TO anon, authenticated;

-- Drop old function
DROP FUNCTION IF EXISTS increment_visitor_count();
