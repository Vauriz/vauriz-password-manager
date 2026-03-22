-- =============================================
-- VAURIZ PASSWORD MANAGER — SUPABASE SCHEMA
-- Run this in the Supabase SQL Editor
-- =============================================

-- Create the passwords table
CREATE TABLE IF NOT EXISTS passwords (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  site_name       TEXT NOT NULL,
  site_url        TEXT,
  username        TEXT NOT NULL,
  encrypted_password TEXT NOT NULL,
  iv              TEXT NOT NULL,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE passwords ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can only access their own rows
CREATE POLICY "Users can view own passwords"
  ON passwords FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own passwords"
  ON passwords FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own passwords"
  ON passwords FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own passwords"
  ON passwords FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER passwords_updated_at
  BEFORE UPDATE ON passwords
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- LEGACY SHARES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS legacy_shares (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_email TEXT NOT NULL,
  encrypted_payload TEXT NOT NULL,
  iv              TEXT NOT NULL,
  timer_interval  TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending',
  last_active_at  TIMESTAMPTZ DEFAULT now(),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE legacy_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own legacy shares"
  ON legacy_shares FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own legacy shares"
  ON legacy_shares FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own legacy shares"
  ON legacy_shares FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own legacy shares"
  ON legacy_shares FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER legacy_shares_updated_at
  BEFORE UPDATE ON legacy_shares
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RPC for cron job to find expired shares
CREATE OR REPLACE FUNCTION get_expired_legacy_shares()
RETURNS SETOF legacy_shares AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM legacy_shares
  WHERE status = 'pending'
    AND last_active_at + timer_interval::interval <= now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
