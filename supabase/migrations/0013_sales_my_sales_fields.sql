alter table sales
  add column if not exists policy_number  text,
  add column if not exists effective_date date,
  add column if not exists lead_type      text;
