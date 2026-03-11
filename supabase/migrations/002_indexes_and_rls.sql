-- Migration 002: Performance indexes and Row Level Security
-- Run this AFTER migration 001
-- Safe to run multiple times (IF NOT EXISTS on indexes, DROP IF EXISTS before CREATE POLICY)

-- ============================================================
-- Full-text search extension
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- Full-text search indexes (trigram GIN indexes)
-- ============================================================
CREATE INDEX IF NOT EXISTS candidates_name_trgm
  ON candidates USING GIN (full_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS candidates_career_trgm
  ON candidates USING GIN (career_summary gin_trgm_ops);

CREATE INDEX IF NOT EXISTS positions_stance_trgm
  ON positions USING GIN (stance gin_trgm_ops);

CREATE INDEX IF NOT EXISTS fact_checks_claim_trgm
  ON fact_checks USING GIN (claim gin_trgm_ops);

-- ============================================================
-- Performance indexes for common query patterns
-- ============================================================

-- Candidates: filter by role, party
CREATE INDEX IF NOT EXISTS candidates_role_idx
  ON candidates(role);

CREATE INDEX IF NOT EXISTS candidates_party_id_idx
  ON candidates(party_id);

CREATE INDEX IF NOT EXISTS candidates_polling_idx
  ON candidates(current_polling DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS candidates_has_criminal_record_idx
  ON candidates(has_criminal_record);

-- Positions: filter by candidate and issue area
CREATE INDEX IF NOT EXISTS positions_candidate_idx
  ON positions(candidate_id);

CREATE INDEX IF NOT EXISTS positions_issue_area_idx
  ON positions(issue_area);

CREATE INDEX IF NOT EXISTS positions_candidate_issue_idx
  ON positions(candidate_id, issue_area);

-- Fact checks: filter by candidate and verdict
CREATE INDEX IF NOT EXISTS fact_checks_candidate_idx
  ON fact_checks(candidate_id);

CREATE INDEX IF NOT EXISTS fact_checks_verdict_idx
  ON fact_checks(verdict);

CREATE INDEX IF NOT EXISTS fact_checks_candidate_verdict_idx
  ON fact_checks(candidate_id, verdict);

-- Parties: lookup by abbreviation
CREATE INDEX IF NOT EXISTS parties_abbreviation_idx
  ON parties(abbreviation);

-- Regions: lookup by code (already UNIQUE, but explicit index for reads)
CREATE INDEX IF NOT EXISTS regions_code_idx
  ON regions(code);

-- ============================================================
-- Congress candidates table (created here if not in migration 001)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'congress_candidates'
  ) THEN
    CREATE TABLE congress_candidates (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      party TEXT NOT NULL,
      party_abbreviation TEXT NOT NULL,
      region TEXT NOT NULL,
      list_position INTEGER NOT NULL DEFAULT 0,
      role TEXT NOT NULL DEFAULT 'congresista',
      ideology TEXT NOT NULL,
      bio TEXT,
      photo_url TEXT,
      prior_roles JSONB DEFAULT '[]'::jsonb,
      key_stances JSONB DEFAULT '[]'::jsonb,
      polling_percentage DECIMAL(5,2),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    COMMENT ON TABLE congress_candidates IS 'Congressional candidates for the 130-seat unicameral Congress';
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS congress_candidates_party_idx
  ON congress_candidates(party_abbreviation);

CREATE INDEX IF NOT EXISTS congress_candidates_region_idx
  ON congress_candidates(region);

CREATE INDEX IF NOT EXISTS congress_candidates_name_trgm
  ON congress_candidates USING GIN (full_name gin_trgm_ops);

-- ============================================================
-- Row Level Security (RLS) — read-only for anonymous users
-- ============================================================

-- Enable RLS on all public-facing tables
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fact_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE congress_candidates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Public read candidates" ON candidates;
DROP POLICY IF EXISTS "Public read positions" ON positions;
DROP POLICY IF EXISTS "Public read fact_checks" ON fact_checks;
DROP POLICY IF EXISTS "Public read regions" ON regions;
DROP POLICY IF EXISTS "Public read parties" ON parties;
DROP POLICY IF EXISTS "Public read congress_candidates" ON congress_candidates;

-- Create read-only policies for anonymous (unauthenticated) users
CREATE POLICY "Public read candidates"
  ON candidates FOR SELECT
  USING (true);

CREATE POLICY "Public read positions"
  ON positions FOR SELECT
  USING (true);

CREATE POLICY "Public read fact_checks"
  ON fact_checks FOR SELECT
  USING (true);

CREATE POLICY "Public read regions"
  ON regions FOR SELECT
  USING (true);

CREATE POLICY "Public read parties"
  ON parties FOR SELECT
  USING (true);

CREATE POLICY "Public read congress_candidates"
  ON congress_candidates FOR SELECT
  USING (true);

-- ============================================================
-- Helper function: updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to candidates
DROP TRIGGER IF EXISTS update_candidates_updated_at ON candidates;
CREATE TRIGGER update_candidates_updated_at
  BEFORE UPDATE ON candidates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_congress_candidates_updated_at ON congress_candidates;
CREATE TRIGGER update_congress_candidates_updated_at
  BEFORE UPDATE ON congress_candidates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Search function: full-text candidate search
-- ============================================================
CREATE OR REPLACE FUNCTION search_candidates(query TEXT, result_limit INTEGER DEFAULT 10)
RETURNS TABLE(
  id UUID,
  full_name TEXT,
  party_abbreviation TEXT,
  current_polling NUMERIC,
  role TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.full_name,
    p.abbreviation AS party_abbreviation,
    c.current_polling,
    c.role,
    similarity(c.full_name, query) AS rank
  FROM candidates c
  LEFT JOIN parties p ON p.id = c.party_id
  WHERE
    c.full_name % query
    OR c.career_summary ILIKE '%' || query || '%'
  ORDER BY rank DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION search_candidates IS 'Full-text candidate search using trigram similarity. Requires pg_trgm extension.';
