-- ============================================================
-- 010: RELATIONAL SCHEMA
-- Plan de gobierno belongs to the PARTY, not the candidate.
-- Each election type has its own table. All linked via party_id (srop_id).
-- ============================================================

-- ============================================================
-- PARTIES (master table — plan de gobierno belongs here)
-- ============================================================
create table if not exists parties_v2 (
  id serial primary key,
  srop_id integer unique,              -- JNE SROP party ID (e.g. 1366 = Fuerza Popular)
  name text not null,
  abbreviation text,
  logo_url text,

  -- Ideological positioning (neutral — based on academic classification)
  spectrum text,                       -- 'left' | 'center-left' | 'center' | 'center-right' | 'right'
  ideology_family text,                -- 'liberal' | 'social-democrat' | 'nationalist' | 'populist' | etc

  -- Government plan (belongs to party, shared by all their candidates)
  plan_gobierno_resumen text,
  plan_gobierno_ejes jsonb,           -- [{eje, descripcion, propuestas:[]}]
  plan_gobierno_pdf_url text,
  plan_gobierno_fetched_at timestamptz,

  -- Metadata
  color text,
  founded_year integer,
  active boolean default true,
  jne_fetched_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- PRESIDENTIAL CANDIDATES
-- ============================================================
create table if not exists candidates_president (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  full_name text not null,
  party_id integer references parties_v2(srop_id),

  image_url text,
  image_source text default 'jne',

  bio text,
  bio_short text,

  -- Individual profile (not duplicated from party)
  profession text,
  birth_year integer,
  birth_place text,
  years_in_politics integer,

  -- Social media (individual accounts)
  social_media jsonb,               -- {twitter, instagram, facebook, youtube, tiktok}

  -- Data quality
  jne_fetched_at timestamptz,
  data_quality text default 'jne_api',
  created_at timestamptz default now()
);

-- ============================================================
-- SENATE CANDIDATES
-- ============================================================
create table if not exists candidates_senate (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  full_name text not null,
  party_id integer references parties_v2(srop_id),

  -- Senate-specific
  district_type text not null,      -- 'nacional' | 'multiple'
  district text,                    -- NULL for nacional, department name for multiple
  district_ubigeo text,
  list_position integer,

  image_url text,
  bio_short text,
  social_media jsonb,

  jne_fetched_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================================
-- DIPUTADOS CANDIDATES
-- ============================================================
create table if not exists candidates_diputados (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  full_name text not null,
  party_id integer references parties_v2(srop_id),

  district text not null,           -- department name
  district_ubigeo text,
  district_seats integer,           -- seats allocated to this district
  list_position integer,

  image_url text,
  bio_short text,
  social_media jsonb,

  jne_fetched_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================================
-- PARLAMENTO ANDINO CANDIDATES
-- ============================================================
create table if not exists candidates_andino (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  full_name text not null,
  party_id integer references parties_v2(srop_id),

  list_position integer,
  image_url text,
  bio_short text,
  social_media jsonb,

  jne_fetched_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================================
-- CANDIDATE DETAIL TABLES (polymorphic via candidate_slug + type)
-- ============================================================

-- Extend existing candidate_hoja_de_vida with candidate_type if not present
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'candidate_hoja_de_vida' and column_name = 'candidate_type'
  ) then
    alter table candidate_hoja_de_vida add column candidate_type text not null default 'presidente';
  end if;
end $$;

-- Extend existing candidate_antecedentes with candidate_type if not present
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'candidate_antecedentes' and column_name = 'candidate_type'
  ) then
    alter table candidate_antecedentes add column candidate_type text not null default 'presidente';
  end if;
end $$;

-- Extend existing candidate_bienes with candidate_type if not present
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'candidate_bienes' and column_name = 'candidate_type'
  ) then
    alter table candidate_bienes add column candidate_type text not null default 'presidente';
  end if;
end $$;

-- candidate_positions: add candidate_type if not present
-- Note: candidate_positions_db already exists from migration 005
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'candidate_positions_db' and column_name = 'candidate_type'
  ) then
    alter table candidate_positions_db add column candidate_type text not null default 'presidente';
  end if;
end $$;

-- candidate_factchecks: add candidate_type if not present
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'candidate_factchecks' and column_name = 'candidate_type'
  ) then
    alter table candidate_factchecks add column candidate_type text not null default 'presidente';
  end if;
end $$;

-- community_contributions: add candidate_type if not present
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'community_contributions' and column_name = 'candidate_type'
  ) then
    alter table community_contributions add column candidate_type text not null default 'presidente';
  end if;
end $$;

-- ============================================================
-- RLS — PUBLIC READ ON NEW TABLES
-- ============================================================
do $$
declare t text;
begin
  foreach t in array array[
    'parties_v2','candidates_president','candidates_senate',
    'candidates_diputados','candidates_andino'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "Public read" on %I', t);
    execute format('create policy "Public read" on %I for select using (true)', t);
    execute format('drop policy if exists "Service write" on %I', t);
    execute format('create policy "Service write" on %I for all using (auth.role() = ''service_role'')', t);
  end loop;
end $$;

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists parties_v2_srop_idx on parties_v2(srop_id);
create index if not exists parties_v2_abbr_idx on parties_v2(abbreviation);
create index if not exists president_slug_idx on candidates_president(slug);
create index if not exists president_party_idx on candidates_president(party_id);
create index if not exists senate_party_idx on candidates_senate(party_id);
create index if not exists senate_district_idx on candidates_senate(district);
create index if not exists diputados_party_idx on candidates_diputados(party_id);
create index if not exists diputados_district_idx on candidates_diputados(district);
create index if not exists andino_party_idx on candidates_andino(party_id);
