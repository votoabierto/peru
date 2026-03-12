-- Rich candidate profiles from JNE API
create table if not exists candidate_profiles (
  id uuid primary key default gen_random_uuid(),
  candidate_slug text not null unique,
  candidate_name text not null,
  party_id integer,
  party_name text,

  -- Biography
  bio text,
  bio_source text default 'JNE',

  -- Government plan
  plan_gobierno_resumen text,
  plan_gobierno_ejes jsonb,
  plan_gobierno_pdf_url text,

  -- Key proposals
  propuestas_clave jsonb,

  -- Political background
  years_in_politics integer,
  previous_positions jsonb,

  -- Assets
  bienes_declarados text,

  -- Issue positions
  has_positions boolean default false,

  -- Metadata
  jne_api_fetched_at timestamptz,
  data_quality text default 'jne_api',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: public read
alter table candidate_profiles enable row level security;
create policy "Public read profiles" on candidate_profiles for select using (true);
create policy "Service role write" on candidate_profiles for all using (auth.role() = 'service_role');

-- Index for fast slug lookup
create index if not exists candidate_profiles_slug_idx on candidate_profiles(candidate_slug);
