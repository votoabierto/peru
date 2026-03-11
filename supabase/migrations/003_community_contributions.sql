-- Community contributions: citizens submit info about candidates
create table if not exists community_contributions (
  id uuid primary key default gen_random_uuid(),
  candidate_id text not null,
  candidate_name text not null,
  contribution_type text not null check (contribution_type in (
    'fact_correction',
    'new_proposal',
    'criminal_record',
    'government_plan',
    'social_media',
    'news_article',
    'other'
  )),
  content text not null,
  source_url text,
  contributor_email text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewer_note text,
  created_at timestamptz default now(),
  reviewed_at timestamptz
);

-- RLS
alter table community_contributions enable row level security;
create policy "Anyone can submit contributions" on community_contributions
  for insert with check (true);
create policy "Service role reads all" on community_contributions
  for select using (auth.role() = 'service_role');
create policy "Service role updates" on community_contributions
  for update using (auth.role() = 'service_role');

-- News/social monitoring cache
create table if not exists candidate_news (
  id uuid primary key default gen_random_uuid(),
  candidate_id text not null,
  candidate_name text not null,
  headline text not null,
  summary text,
  source_name text,
  source_url text not null,
  published_at timestamptz,
  fetched_at timestamptz default now(),
  category text check (category in ('gobierno_plan', 'position_change', 'scandal', 'proposal', 'general'))
);

alter table candidate_news enable row level security;
create policy "Public read news" on candidate_news for select using (true);
create policy "Service role inserts news" on candidate_news for insert with check (auth.role() = 'service_role');
