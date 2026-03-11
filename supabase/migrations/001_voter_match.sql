-- Enable pgvector
create extension if not exists vector;

-- Candidate positions on key issues (structured, scoreable)
create table if not exists candidate_positions (
  id uuid primary key default gen_random_uuid(),
  candidate_id text not null,
  candidate_name text not null,
  party text not null,
  issue_key text not null,
  position_score integer not null check (position_score between 1 and 5),
  position_label text not null,
  position_detail text,
  source_url text,
  verified boolean default false,
  created_at timestamptz default now()
);

-- Party relationships
create table if not exists party_relationships (
  id uuid primary key default gen_random_uuid(),
  party_id text not null,
  related_party_id text not null,
  relationship_type text not null,
  description text
);

-- Candidate embeddings for semantic search (pgvector)
create table if not exists candidate_embeddings (
  id uuid primary key default gen_random_uuid(),
  candidate_id text not null unique,
  candidate_name text not null,
  content text not null,
  embedding vector(1536),
  created_at timestamptz default now()
);

-- Create index for vector similarity search
create index if not exists candidate_embeddings_idx
  on candidate_embeddings using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Quiz responses (anonymous)
create table if not exists quiz_responses (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  department text,
  answers jsonb not null,
  top_matches jsonb,
  created_at timestamptz default now()
);

-- RLS: quiz_responses
alter table quiz_responses enable row level security;
create policy "Anyone can insert quiz responses" on quiz_responses
  for insert with check (true);
create policy "Anyone can read quiz aggregate stats" on quiz_responses
  for select using (true);

-- Public read on candidate_positions
alter table candidate_positions enable row level security;
create policy "Public read candidate positions" on candidate_positions
  for select using (true);
