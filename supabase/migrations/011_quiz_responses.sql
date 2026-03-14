-- ============================================================
-- 011: ANONYMOUS QUIZ RESPONSES
-- Stores anonymized quiz results for aggregate civic data.
-- PRIVACY: quiz_responses has ZERO identity fields.
-- quiz_dedup stores only one-way hashed IPs (SHA-256 + salt)
-- for duplicate prevention. The two tables are NEVER joined.
-- Raw IP addresses are NEVER stored anywhere.
-- ============================================================

-- Quiz responses — pure anonymous data
create table if not exists quiz_responses (
  id uuid primary key default gen_random_uuid(),

  -- Answer vector: question_id → score (-2 to 2)
  answers jsonb not null,

  -- Computed axis scores (0–100 scale)
  economic_score numeric(5,2),
  social_score numeric(5,2),
  institutions_score numeric(5,2),

  -- Top candidate match (optional, for aggregate stats)
  top_match_candidate_id text,
  top_match_score numeric(5,2),

  -- Time spent (anti-bot signal — stored for analysis, not enforcement)
  completed_seconds integer,

  -- Rough geographic signal (optional, user-provided)
  department text,

  created_at timestamptz default now()
);

-- Dedup table — anti-abuse only, zero link to responses
-- ip_hash = SHA-256(ip_address + SALT) — one-way, irreversible
create table if not exists quiz_dedup (
  ip_hash text primary key,
  created_at timestamptz default now()
);

-- Auto-expire dedup entries after 30 days
create index if not exists quiz_dedup_created_at_idx on quiz_dedup(created_at);

-- RLS: insert-only from anon (no reads, no updates, no deletes)
alter table quiz_responses enable row level security;
alter table quiz_dedup enable row level security;

create policy "anon_insert_quiz_responses"
  on quiz_responses for insert
  to anon
  with check (true);

create policy "anon_insert_quiz_dedup"
  on quiz_dedup for insert
  to anon
  with check (true);

-- Individual rows not readable by anon — only aggregate via API
create policy "no_anon_select_quiz_responses"
  on quiz_responses for select
  to anon
  using (false);

create policy "no_anon_select_quiz_dedup"
  on quiz_dedup for select
  to anon
  using (false);
