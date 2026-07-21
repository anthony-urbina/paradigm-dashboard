-- ============================================================
-- Agents
-- ============================================================
create table agents (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text unique not null,
  phone        text,
  upline_id    uuid references agents(id),
  role         text not null default 'agent',   -- 'admin' | 'agent'
  paradigm     boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- Sales
-- ============================================================
create table sales (
  id         uuid primary key default gen_random_uuid(),
  agent_id   uuid not null references agents(id),
  carrier    text not null,
  product    text not null,
  ap         numeric(10,2) not null check (ap > 0),
  sold_at    timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- ============================================================
-- Activity  (one row per agent per day)
-- ============================================================
create table activity (
  id              uuid primary key default gen_random_uuid(),
  agent_id        uuid not null references agents(id),
  date            date not null,
  dials           int not null default 0,
  conversations   int not null default 0,
  appointments    int not null default 0,
  presentations   int not null default 0,
  created_at      timestamptz not null default now(),
  unique (agent_id, date)
);

-- ============================================================
-- Goals  (monthly sales goal and monthly team AP goal per agent)
-- ============================================================
create table goals (
  id           uuid primary key default gen_random_uuid(),
  agent_id     uuid not null references agents(id),
  type         text not null,          -- 'sales_ap' | 'team_ap' | 'team_growth'
  target       numeric(12,2) not null,
  period_start date not null,
  period_end   date not null,
  created_at   timestamptz not null default now(),
  unique (agent_id, type, period_start)
);

-- ============================================================
-- Competitions
-- ============================================================
create table competitions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  prize       text,
  start_date  date not null,
  end_date    date not null,
  status      text not null default 'draft',  -- 'draft' | 'active' | 'ended'
  pinned      boolean not null default false,
  created_by  uuid references agents(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Always exactly 2 teams per competition
create table competition_teams (
  id             uuid primary key default gen_random_uuid(),
  competition_id uuid not null references competitions(id) on delete cascade,
  name           text not null,
  color          text not null default '#e2bb52',
  created_at     timestamptz not null default now()
);

create table competition_members (
  id         uuid primary key default gen_random_uuid(),
  team_id    uuid not null references competition_teams(id) on delete cascade,
  agent_id   uuid not null references agents(id),
  created_at timestamptz not null default now(),
  unique (team_id, agent_id)
);

create table competition_results (
  id              uuid primary key default gen_random_uuid(),
  competition_id  uuid not null references competitions(id) on delete cascade,
  winning_team_id uuid references competition_teams(id),
  ended_at        timestamptz not null default now()
);

-- ============================================================
-- Auto-update updated_at on competitions
-- ============================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger competitions_updated_at
  before update on competitions
  for each row execute function set_updated_at();

-- ============================================================
-- Useful views
-- ============================================================

-- Agent AP totals for the current calendar month
create view agent_monthly_ap as
select
  a.id as agent_id,
  a.name,
  a.upline_id,
  coalesce(sum(s.ap), 0) as ap,
  count(s.id) as sales_count,
  date_trunc('month', now())::date as month
from agents a
left join sales s
  on s.agent_id = a.id
  and date_trunc('month', s.sold_at) = date_trunc('month', now())
group by a.id, a.name, a.upline_id;

-- Live competition AP totals (current or any active window)
create view competition_team_ap as
select
  ct.id as team_id,
  ct.competition_id,
  ct.name as team_name,
  ct.color,
  coalesce(sum(s.ap), 0) as total_ap,
  count(s.id) as sales_count
from competition_teams ct
join competitions c on c.id = ct.competition_id
left join competition_members cm on cm.team_id = ct.id
left join sales s
  on s.agent_id = cm.agent_id
  and s.sold_at between c.start_date::timestamptz and (c.end_date + 1)::timestamptz
group by ct.id, ct.competition_id, ct.name, ct.color;
