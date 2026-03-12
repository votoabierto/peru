-- 005_schema_alignment.sql
-- Aligns old table names with what lib/data.ts expects.
-- Creates `candidates`, `positions`, `fact_checks` tables if they don't exist,
-- migrating data from the new-architecture tables (`candidate_profiles`, etc.)
-- Old tables are NOT dropped — both schemas coexist.

-- ─── candidates table ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS candidates (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  common_name TEXT,
  party_id TEXT,
  party_abbreviation TEXT DEFAULT '',
  party_name TEXT DEFAULT '',
  role TEXT DEFAULT 'president' CHECK (role IN ('president','vice_president','senator','representative')),
  region_id TEXT,
  region_name TEXT,
  ideology TEXT,
  age INTEGER,
  photo_url TEXT,
  career_summary TEXT,
  bio TEXT,
  bio_short TEXT,
  current_polling NUMERIC,
  polling_percentage NUMERIC,
  declared_assets_pen NUMERIC,
  criminal_records JSONB DEFAULT '[]',
  years_in_politics INTEGER,
  prior_offices JSONB DEFAULT '[]',
  born_year INTEGER,
  born_city TEXT,
  website TEXT,
  twitter TEXT,
  facebook TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  has_criminal_record BOOLEAN DEFAULT FALSE,
  criminal_record_detail TEXT,
  jne_party_id INTEGER,
  "planGobiernoResumen" TEXT,
  "planGobiernoEjes" JSONB DEFAULT '[]',
  proposals JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Migrate from candidate_profiles → candidates (if candidate_profiles exists and candidates is empty)
INSERT INTO candidates (id, slug, full_name, party_name, party_abbreviation, role, bio, bio_short, photo_url, created_at, updated_at)
SELECT
  cp.candidate_slug,
  cp.candidate_slug,
  cp.full_name,
  COALESCE(cp.party_name, ''),
  COALESCE(cp.party_abbreviation, ''),
  'president',
  cp.bio,
  cp.bio_short,
  cp.image_url,
  cp.created_at,
  cp.created_at
FROM candidate_profiles cp
WHERE NOT EXISTS (SELECT 1 FROM candidates WHERE slug = cp.candidate_slug)
ON CONFLICT (slug) DO NOTHING;

-- ─── positions table ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS positions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  candidate_id TEXT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  issue_area TEXT NOT NULL,
  stance TEXT NOT NULL DEFAULT 'neutral',
  stance_description TEXT,
  quote TEXT,
  source_quote TEXT,
  source_url TEXT,
  source TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Migrate from candidate_positions_db → positions
INSERT INTO positions (id, candidate_id, issue_area, stance, stance_description, source, verified, created_at, updated_at)
SELECT
  cpd.id,
  cpd.candidate_slug,
  cpd.issue_key,
  cpd.position_label,
  cpd.evidence,
  cpd.source,
  TRUE,
  now(),
  now()
FROM candidate_positions_db cpd
WHERE EXISTS (SELECT 1 FROM candidates WHERE id = cpd.candidate_slug)
  AND NOT EXISTS (SELECT 1 FROM positions WHERE id = cpd.id)
ON CONFLICT (id) DO NOTHING;

-- ─── fact_checks table ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS fact_checks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  candidate_id TEXT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  candidate_name TEXT,
  claim TEXT NOT NULL,
  verdict TEXT NOT NULL DEFAULT 'unverifiable',
  explanation TEXT NOT NULL DEFAULT '',
  source_url TEXT,
  source TEXT,
  checked_at TIMESTAMPTZ,
  date_checked DATE,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Migrate from candidate_factchecks → fact_checks
INSERT INTO fact_checks (id, candidate_id, candidate_name, claim, verdict, explanation, source_url, checked_at, created_at, updated_at)
SELECT
  cf.id,
  cf.candidate_slug,
  cf.candidate_slug,
  cf.claim,
  cf.verdict,
  COALESCE(cf.explanation, ''),
  cf.source_url,
  cf.checked_at::timestamptz,
  now(),
  now()
FROM candidate_factchecks cf
WHERE EXISTS (SELECT 1 FROM candidates WHERE id = cf.candidate_slug)
  AND NOT EXISTS (SELECT 1 FROM fact_checks WHERE id = cf.id)
ON CONFLICT (id) DO NOTHING;

-- ─── RLS policies (public read) ────────────────────────────────────────────────

ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fact_checks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'candidates' AND policyname = 'candidates_public_read') THEN
    CREATE POLICY candidates_public_read ON candidates FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'positions' AND policyname = 'positions_public_read') THEN
    CREATE POLICY positions_public_read ON positions FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'fact_checks' AND policyname = 'fact_checks_public_read') THEN
    CREATE POLICY fact_checks_public_read ON fact_checks FOR SELECT USING (true);
  END IF;
END $$;

-- ─── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_candidates_slug ON candidates(slug);
CREATE INDEX IF NOT EXISTS idx_candidates_role ON candidates(role);
CREATE INDEX IF NOT EXISTS idx_positions_candidate_id ON positions(candidate_id);
CREATE INDEX IF NOT EXISTS idx_fact_checks_candidate_id ON fact_checks(candidate_id);
