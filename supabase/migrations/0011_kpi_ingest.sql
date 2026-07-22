create table if not exists kpi_submissions (
  id                      uuid primary key default gen_random_uuid(),
  agent_id                uuid references agents(id),
  discord_user_id         text not null,
  submission_date         date not null,
  inbound_calls           int not null default 0,
  inbound_billable        int not null default 0,
  inbound_presentations   int not null default 0,
  inbound_sold            int not null default 0,
  inbound_ap              numeric(10,2) not null default 0,
  inbound_lead_spend      numeric(10,2) not null default 0,
  outbound_dials          int not null default 0,
  outbound_pickups        int not null default 0,
  outbound_presentations  int not null default 0,
  outbound_sold           int not null default 0,
  outbound_ap             numeric(10,2) not null default 0,
  outbound_lead_spend     numeric(10,2) not null default 0,
  outbound_appts_booked   int not null default 0,
  recruiting_interviews   int not null default 0,
  recruiting_bom_invites  int not null default 0,
  recruiting_hired        int not null default 0,
  submitted_at            timestamptz not null default now(),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  unique (discord_user_id, submission_date)
);

create index if not exists kpi_submissions_agent_id_idx
  on kpi_submissions (agent_id);

create or replace function set_kpi_submissions_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists kpi_submissions_updated_at on kpi_submissions;

create trigger kpi_submissions_updated_at
  before update on kpi_submissions
  for each row execute function set_kpi_submissions_updated_at();
