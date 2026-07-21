alter table agents
  add column if not exists discord_user_id text,
  add column if not exists discord_username text,
  add column if not exists discord_global_name text,
  add column if not exists discord_avatar_url text,
  add column if not exists discord_connected_at timestamptz;

create unique index if not exists agents_discord_user_id_unique
  on agents (discord_user_id)
  where discord_user_id is not null;
