-- Make agent_id nullable so ingest sales can be stored even before discord user is matched
alter table sales
  alter column agent_id drop not null;

-- Make product nullable — will be populated once product field arrives in ingest payload
alter table sales
  alter column product drop not null;

-- New columns for ingest data
alter table sales
  add column if not exists discord_user_id text,
  add column if not exists state            text,
  add column if not exists product_type     text,
  add column if not exists client_age       integer;
