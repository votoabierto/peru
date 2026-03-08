-- VotoClaro — Peru 2026 Elections Platform
-- Migration 001: Initial schema

-- Regions (24 + Lima Province)
CREATE TABLE regions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  population INT,
  key_issues TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Political parties
CREATE TABLE parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  abbreviation TEXT NOT NULL,
  ideology TEXT CHECK (ideology IN ('left', 'center-left', 'center', 'center-right', 'right', 'far-right', 'populist')),
  founded_year INT,
  logo_url TEXT,
  jne_registered BOOLEAN DEFAULT TRUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Candidates
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  common_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('president', 'senator', 'deputy', 'vice_president')),
  party_id UUID REFERENCES parties(id),
  region_id INT REFERENCES regions(id),
  age INT,
  education TEXT,
  career_summary TEXT,
  photo_url TEXT,
  instagram_handle TEXT,
  wikipedia_url TEXT,
  current_polling NUMERIC,
  has_criminal_record BOOLEAN DEFAULT FALSE,
  criminal_record_detail TEXT,
  declared_assets_amount NUMERIC,
  declared_assets_currency TEXT DEFAULT 'PEN',
  is_incumbent BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  slug TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Positions on issues
CREATE TABLE positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id),
  issue_area TEXT NOT NULL CHECK (issue_area IN (
    'security', 'education', 'health', 'economy', 'environment',
    'mining', 'corruption', 'infrastructure', 'social_programs', 'foreign_policy'
  )),
  stance TEXT NOT NULL,
  source_url TEXT,
  source_date DATE,
  quote TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fact checks
CREATE TABLE fact_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES candidates(id),
  claim TEXT NOT NULL,
  verdict TEXT NOT NULL CHECK (verdict IN ('true', 'false', 'misleading', 'unverifiable', 'context_needed')),
  explanation TEXT NOT NULL,
  source_urls TEXT[] DEFAULT '{}',
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Seed: 25 regions (24 administrative + Lima Province) ───────────────────

INSERT INTO regions (name, code, population, key_issues) VALUES
  ('Lima', 'LIM', 11000000, ARRAY['security', 'transport', 'housing']),
  ('Arequipa', 'AQP', 1500000, ARRAY['mining', 'water', 'environment']),
  ('La Libertad', 'LAL', 2000000, ARRAY['security', 'agriculture', 'mining']),
  ('Piura', 'PIU', 2000000, ARRAY['water', 'agriculture', 'infrastructure']),
  ('Cajamarca', 'CAJ', 1600000, ARRAY['mining', 'poverty', 'environment']),
  ('Puno', 'PUN', 1400000, ARRAY['mining', 'indigenous_rights', 'altitude_health']),
  ('Junín', 'JUN', 1400000, ARRAY['mining', 'agriculture', 'security']),
  ('Cusco', 'CUS', 1300000, ARRAY['tourism', 'mining', 'indigenous_rights']),
  ('Lambayeque', 'LAM', 1300000, ARRAY['agriculture', 'water', 'infrastructure']),
  ('Loreto', 'LOR', 1000000, ARRAY['drug_trade', 'environment', 'infrastructure']),
  ('Ancash', 'ANC', 1100000, ARRAY['mining', 'water', 'infrastructure']),
  ('Ica', 'ICA', 900000, ARRAY['agriculture', 'water', 'infrastructure']),
  ('San Martín', 'SAM', 900000, ARRAY['drug_trade', 'deforestation', 'agriculture']),
  ('Huánuco', 'HUA', 900000, ARRAY['poverty', 'drug_trade', 'infrastructure']),
  ('Ayacucho', 'AYA', 700000, ARRAY['poverty', 'mining', 'rural_development']),
  ('Ucayali', 'UCA', 600000, ARRAY['deforestation', 'drug_trade', 'indigenous_rights']),
  ('Huancavelica', 'HVA', 500000, ARRAY['poverty', 'mining', 'health']),
  ('Apurímac', 'APU', 500000, ARRAY['mining', 'poverty', 'rural_development']),
  ('Tacna', 'TAC', 400000, ARRAY['border_security', 'mining', 'infrastructure']),
  ('Pasco', 'PAS', 300000, ARRAY['mining', 'environment', 'health']),
  ('Amazonas', 'AMA', 400000, ARRAY['deforestation', 'indigenous_rights', 'infrastructure']),
  ('Moquegua', 'MOQ', 200000, ARRAY['mining', 'water', 'development']),
  ('Tumbes', 'TUM', 250000, ARRAY['border_security', 'fishing', 'infrastructure']),
  ('Madre de Dios', 'MDD', 150000, ARRAY['illegal_mining', 'deforestation', 'indigenous_rights']),
  ('Lima Provincias', 'LIP', 900000, ARRAY['agriculture', 'water', 'infrastructure']);

-- ─── Seed: top parties ───────────────────────────────────────────────────────

INSERT INTO parties (id, name, abbreviation, ideology, founded_year, description) VALUES
  ('11111111-0000-0000-0000-000000000001', 'Renovación Popular', 'RP', 'right', 2019, 'Partido conservador liderado por Rafael López Aliaga. Pro-empresa, seguridad ciudadana, valores católicos.'),
  ('11111111-0000-0000-0000-000000000002', 'Fuerza Popular', 'FP', 'far-right', 2010, 'Partido fundado por Keiko Fujimori. Base leal en zonas pobres de Lima y norte del país.'),
  ('11111111-0000-0000-0000-000000000003', 'Perú Libre', 'PL', 'left', 2008, 'Partido marxista liderado por Vladimir Cerrón desde la clandestinidad. Fuerte en Junín y sur andino.'),
  ('11111111-0000-0000-0000-000000000004', 'Alianza para el Progreso', 'APP', 'center', 2001, 'Partido empresarial de César Acuña con base en La Libertad.'),
  ('11111111-0000-0000-0000-000000000005', 'País para Todos', 'PPT', 'populist', 2020, 'Vehículo electoral del comediante Carlos Álvarez "Cachín".'),
  ('11111111-0000-0000-0000-000000000006', 'Ahora Nación', 'AN', 'center-left', 2022, 'Partido tecnocrático de centro-izquierda liderado por Alfonso López Chau.'),
  ('11111111-0000-0000-0000-000000000007', 'Avanza País', 'AVP', 'right', 2020, 'Partido de centro-derecha. Candidato presidencial José Williams.'),
  ('11111111-0000-0000-0000-000000000008', 'Partido Aprista Peruano', 'PAP', 'center-left', 1924, 'El partido más antiguo del Perú, fundado por Víctor Raúl Haya de la Torre.'),
  ('11111111-0000-0000-0000-000000000009', 'Somos Perú', 'SP', 'center', 1997, 'Partido centrista. Candidato presidencial George Forsyth.'),
  ('11111111-0000-0000-0000-000000000010', 'Acción Popular', 'AP', 'center', 1956, 'Partido histórico fundado por Belaúnde Terry.'),
  ('11111111-0000-0000-0000-000000000011', 'Partido Popular Cristiano', 'PPC', 'center-right', 1966, 'Partido demócrata-cristiano de larga trayectoria.');
