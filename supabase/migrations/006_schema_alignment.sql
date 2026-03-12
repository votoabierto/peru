-- ============================================================
-- Migration 006: Schema Alignment
-- Bridges candidate_profiles → candidates table
-- Creates views for positions and fact_checks from new tables
-- Does NOT drop any existing tables
-- ============================================================

-- Populate candidates table from candidate_profiles where missing
INSERT INTO candidates (full_name, slug, role, career_summary, is_verified, created_at, updated_at)
SELECT
  cp.candidate_name,
  cp.candidate_slug,
  'president',
  cp.bio,
  true,
  cp.created_at,
  cp.updated_at
FROM candidate_profiles cp
WHERE NOT EXISTS (
  SELECT 1 FROM candidates c WHERE c.slug = cp.candidate_slug
)
ON CONFLICT (slug) DO NOTHING;

-- Populate positions table from candidate_positions_db where missing
INSERT INTO positions (candidate_id, issue_area, stance, source_url, verified, created_at)
SELECT
  c.id,
  CASE cpd.issue_key
    WHEN 'economia' THEN 'economy'
    WHEN 'seguridad' THEN 'security'
    WHEN 'educacion' THEN 'education'
    WHEN 'salud' THEN 'health'
    WHEN 'corrupcion' THEN 'corruption'
    WHEN 'recursos_naturales' THEN 'environment'
    WHEN 'descentralizacion' THEN 'infrastructure'
    WHEN 'reforma_judicial' THEN 'foreign_policy'
    WHEN 'politica_social' THEN 'social_programs'
    WHEN 'constitucion' THEN 'mining'
    ELSE cpd.issue_key
  END,
  cpd.position_label,
  cpd.source,
  true,
  now()
FROM candidate_positions_db cpd
JOIN candidates c ON c.slug = cpd.candidate_slug
WHERE NOT EXISTS (
  SELECT 1 FROM positions p
  WHERE p.candidate_id = c.id
    AND p.issue_area = CASE cpd.issue_key
      WHEN 'economia' THEN 'economy'
      WHEN 'seguridad' THEN 'security'
      WHEN 'educacion' THEN 'education'
      WHEN 'salud' THEN 'health'
      WHEN 'corrupcion' THEN 'corruption'
      WHEN 'recursos_naturales' THEN 'environment'
      WHEN 'descentralizacion' THEN 'infrastructure'
      WHEN 'reforma_judicial' THEN 'foreign_policy'
      WHEN 'politica_social' THEN 'social_programs'
      WHEN 'constitucion' THEN 'mining'
      ELSE cpd.issue_key
    END
);

-- Populate fact_checks table from candidate_factchecks where missing
INSERT INTO fact_checks (candidate_id, claim, verdict, explanation, source_urls, created_at)
SELECT
  c.id,
  cf.claim,
  cf.verdict,
  cf.explanation,
  CASE WHEN cf.source_url IS NOT NULL THEN ARRAY[cf.source_url] ELSE '{}' END,
  cf.created_at
FROM candidate_factchecks cf
JOIN candidates c ON c.slug = cf.candidate_slug
WHERE NOT EXISTS (
  SELECT 1 FROM fact_checks fc
  WHERE fc.candidate_id = c.id AND fc.claim = cf.claim
);

-- Add feedback columns to community_contributions for the new FeedbackWidget
ALTER TABLE community_contributions
  ADD COLUMN IF NOT EXISTS page_url text,
  ADD COLUMN IF NOT EXISTS candidate_slug text;

-- Allow the new contribution types from the feedback widget
ALTER TABLE community_contributions
  DROP CONSTRAINT IF EXISTS community_contributions_contribution_type_check;
ALTER TABLE community_contributions
  ADD CONSTRAINT community_contributions_contribution_type_check
  CHECK (contribution_type IN (
    'fact_correction', 'new_proposal', 'criminal_record', 'government_plan',
    'social_media', 'news_article', 'other',
    'dato_incorrecto', 'falta_informacion', 'link_roto'
  ));
