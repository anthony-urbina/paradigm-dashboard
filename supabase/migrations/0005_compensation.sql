alter table agents
  add column if not exists comp_percentage numeric(6,2) not null default 80 check (comp_percentage >= 0 and comp_percentage <= 200);

alter table sales
  add column if not exists client_name text;

create table if not exists carrier_product_comp_rates (
  id uuid primary key default gen_random_uuid(),
  carrier text not null,
  product text not null,
  base_rate numeric(6,2) not null check (base_rate >= 0 and base_rate <= 200),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (carrier, product)
);

create trigger carrier_product_comp_rates_updated_at
  before update on carrier_product_comp_rates
  for each row execute function set_updated_at();

insert into carrier_product_comp_rates (carrier, product, base_rate)
values
  ('Aetna', 'Whole Life', 92.50),
  ('Aflac', 'Final Ex', 70.00),
  ('Americo', 'Eagle Select', 95.00),
  ('Corebridge', 'GIWL', 60.00),
  ('Corebridge', 'SIWL', 92.00),
  ('Mutual of Omaha', 'Living Promise (FEX)', 86.00),
  ('Mutual of Omaha', 'Children''s WL', 70.00),
  ('Mutual of Omaha', 'Accidental Death', 90.00),
  ('Transamerica', 'Express Sol.', 100.00),
  ('American Amicable', 'Senior/Family Choice', 85.00),
  ('American Amicable', 'Family Protector', 90.00),
  ('Instabrain', 'Final Expense WL', 105.00),
  ('Instabrain', 'Guaranteed Issue WL', 50.00),
  ('Instabrain', 'RD Senior Life Whole Life', 45.00),
  ('Instabrain', 'Accidental DB', 45.00),
  ('Instabrain', 'Accidental ROP Rider', 10.00),
  ('Ethos', 'TruStage TAWL', 82.50),
  ('Ethos', 'TruStage GAWL', 7.50),
  ('Liberty Bankers', 'FX', 85.00),
  ('Royal Neighbors', 'Royal Legacy SPWL', 11.00),
  ('Royal Neighbors', 'SI Whole Life', 85.00),
  ('Foresters', 'Planright', 80.00)
on conflict (carrier, product) do update
set base_rate = excluded.base_rate,
    updated_at = now();

create or replace function get_admin_agents()
returns table(
  id uuid,
  name text,
  email text,
  comp_percentage numeric,
  role text,
  lifetime_ap numeric,
  lifetime_sales bigint,
  upline_name text,
  is_new boolean
)
language sql stable as $$
select
  a.id,
  a.name,
  a.email,
  a.comp_percentage,
  a.role,
  coalesce(sum(s.ap), 0) as lifetime_ap,
  count(s.id)::bigint as lifetime_sales,
  coalesce(u.name, 'Unassigned') as upline_name,
  a.created_at > now() - interval '7 days' as is_new
from agents a
left join sales s on s.agent_id = a.id
left join agents u on u.id = a.upline_id
group by a.id, a.name, a.email, a.comp_percentage, a.role, u.name, a.created_at
order by lifetime_ap desc;
$$;
