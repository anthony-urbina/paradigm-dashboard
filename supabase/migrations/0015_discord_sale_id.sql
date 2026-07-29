-- Track the Discord-side sale ID so removesale can delete the matching row
alter table sales
  add column if not exists discord_sale_id text;

create index if not exists sales_discord_sale_id_idx on sales (discord_sale_id);
