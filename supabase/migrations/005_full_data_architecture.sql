-- ============================================================
-- Migration 005: Full Data Architecture
-- Adds: hoja de vida, antecedentes, bienes, financiamiento,
--        fact checks DB, structured positions, vector search
-- Does NOT re-create candidate_profiles (from migration 004)
-- ============================================================

-- Add new columns to candidate_profiles
alter table candidate_profiles
  add column if not exists election_type text default 'presidente',
  add column if not exists district text,
  add column if not exists list_position integer,
  add column if not exists image_url text,
  add column if not exists image_source text default 'jne',
  add column if not exists bio_short text,
  add column if not exists plan_gobierno_source_id integer,
  add column if not exists search_text text;

-- ============================================================
-- HOJA DE VIDA (curriculum vitae)
-- ============================================================
create table if not exists candidate_hoja_de_vida (
  id uuid primary key default gen_random_uuid(),
  candidate_slug text not null references candidate_profiles(candidate_slug),

  -- Education
  education jsonb,

  -- Work history
  work_history jsonb,

  -- Prior public offices
  public_offices jsonb,
  prior_elections jsonb,

  -- Personal
  birth_date date,
  birth_place text,
  age integer,
  profession text,

  -- Source
  source text default 'jne_api',
  fetched_at timestamptz default now()
);

-- ============================================================
-- ANTECEDENTES (judicial/legal background)
-- ============================================================
create table if not exists candidate_antecedentes (
  id uuid primary key default gen_random_uuid(),
  candidate_slug text not null references candidate_profiles(candidate_slug),

  tipo text not null,
  descripcion text not null,
  fuente text not null,
  fuente_url text,
  fecha_inicio date,
  fecha_fin date,
  estado text,
  gravedad text,
  verified boolean default true,

  created_at timestamptz default now()
);

-- ============================================================
-- BIENES DECLARADOS (declared assets)
-- ============================================================
create table if not exists candidate_bienes (
  id uuid primary key default gen_random_uuid(),
  candidate_slug text not null references candidate_profiles(candidate_slug),

  total_bienes_pen numeric,
  total_ingresos_anuales_pen numeric,
  total_deudas_pen numeric,

  bienes_inmuebles jsonb,
  bienes_muebles jsonb,

  declaration_year integer,
  source_url text,
  source text default 'JNE',
  fetched_at timestamptz default now()
);

-- ============================================================
-- CAMPAIGN FINANCE
-- ============================================================
create table if not exists candidate_financiamiento (
  id uuid primary key default gen_random_uuid(),
  candidate_slug text not null references candidate_profiles(candidate_slug),
  party_id integer,

  total_aportes_pen numeric,
  total_gastos_pen numeric,

  aportes_privados_pen numeric,
  aportes_propios_pen numeric,
  financiamiento_publico_pen numeric,

  top_aportantes jsonb,

  source text default 'ONPE',
  source_url text,
  fetched_at timestamptz default now()
);

-- ============================================================
-- FACT CHECKS (structured)
-- ============================================================
create table if not exists candidate_factchecks (
  id uuid primary key default gen_random_uuid(),
  candidate_slug text not null references candidate_profiles(candidate_slug),

  claim text not null,
  verdict text not null,
  explanation text,
  source_url text,
  checked_at date,

  created_at timestamptz default now()
);

-- ============================================================
-- ISSUE POSITIONS (structured 1-5 scale)
-- ============================================================
create table if not exists candidate_positions_db (
  id uuid primary key default gen_random_uuid(),
  candidate_slug text not null references candidate_profiles(candidate_slug),
  issue_key text not null,
  position_score numeric(3,1),
  position_label text,
  evidence text,
  source text default 'plan_gobierno',

  unique(candidate_slug, issue_key)
);

-- ============================================================
-- VECTOR SEARCH
-- ============================================================
create extension if not exists vector;

alter table candidate_profiles
  add column if not exists embedding vector(1536);

-- Full-text search index
create index if not exists candidate_profiles_fts
  on candidate_profiles using gin(to_tsvector('spanish', coalesce(search_text, '')));

-- ============================================================
-- RLS POLICIES
-- ============================================================
alter table candidate_hoja_de_vida enable row level security;
alter table candidate_antecedentes enable row level security;
alter table candidate_bienes enable row level security;
alter table candidate_financiamiento enable row level security;
alter table candidate_factchecks enable row level security;
alter table candidate_positions_db enable row level security;

create policy "Public read" on candidate_hoja_de_vida for select using (true);
create policy "Public read" on candidate_antecedentes for select using (true);
create policy "Public read" on candidate_bienes for select using (true);
create policy "Public read" on candidate_financiamiento for select using (true);
create policy "Public read" on candidate_factchecks for select using (true);
create policy "Public read" on candidate_positions_db for select using (true);

create policy "Service write" on candidate_hoja_de_vida for all using (auth.role() = 'service_role');
create policy "Service write" on candidate_antecedentes for all using (auth.role() = 'service_role');
create policy "Service write" on candidate_bienes for all using (auth.role() = 'service_role');
create policy "Service write" on candidate_financiamiento for all using (auth.role() = 'service_role');
create policy "Service write" on candidate_factchecks for all using (auth.role() = 'service_role');
create policy "Service write" on candidate_positions_db for all using (auth.role() = 'service_role');

-- Indexes for fast slug lookups
create index if not exists hdv_slug_idx on candidate_hoja_de_vida(candidate_slug);
create index if not exists antecedentes_slug_idx on candidate_antecedentes(candidate_slug);
create index if not exists bienes_slug_idx on candidate_bienes(candidate_slug);
create index if not exists financiamiento_slug_idx on candidate_financiamiento(candidate_slug);
create index if not exists factchecks_slug_idx on candidate_factchecks(candidate_slug);
create index if not exists positions_db_slug_idx on candidate_positions_db(candidate_slug);
