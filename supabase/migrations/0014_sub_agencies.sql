create table if not exists sub_agencies (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  logo_url    text,
  root_agent_id uuid not null references agents(id) on delete cascade,
  created_at  timestamptz not null default now()
);

create unique index if not exists sub_agencies_root_agent_id_idx on sub_agencies(root_agent_id);
