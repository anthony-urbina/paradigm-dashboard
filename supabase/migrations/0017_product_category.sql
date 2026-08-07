-- Add category column to carrier_product_comp_rates.
-- Stores the product type used by the bot and admin UI.
-- Values: 'Whole Life', 'Term', 'IUL', 'FIA'
-- The comp guide maps 'IUL' and 'FIA' → "IUL / Annuity" tab for display.

alter table carrier_product_comp_rates
  add column if not exists category text not null default 'Whole Life'
  check (category in ('Whole Life', 'Term', 'IUL', 'FIA'));

-- FIA: already flagged by is_flat_rate
update carrier_product_comp_rates set category = 'FIA' where is_flat_rate = true;

-- Term products (mirrors TERM_KEYS in data.ts)
update carrier_product_comp_rates set category = 'Term'
where lower(carrier) || '::' || lower(product) in (
  'americo::hms 125',
  'mutual of omaha::tle (express)',
  'mutual of omaha::tla (answers)',
  'american amicable::ez term',
  'american amicable::home protector',
  'american amicable::oba (group level term)',
  'american amicable::term made simple',
  'instabrain::term w/ lb (10yr)',
  'instabrain::term w/ lb (15yr)',
  'instabrain::term w/ lb (20yr)',
  'instabrain::term w/ lb (30yr)',
  'instabrain::pure term (10yr)',
  'instabrain::pure term (15yr)',
  'instabrain::pure term (20yr)',
  'instabrain::pure term (30yr)',
  'instabrain::rd senior life term',
  'united home life::term',
  'royal neighbors::term',
  'foresters::strong foundation',
  'ethos::lga prime',
  'ethos::trustage sitl',
  'ethos::ameritas si term',
  'ethos::jh rop',
  'nlg::10/15 yr term',
  'nlg::20/30 yr term'
);

-- IUL products (mirrors IUL_KEYS in data.ts)
update carrier_product_comp_rates set category = 'IUL'
where lower(carrier) || '::' || lower(product) in (
  'americo::instant decision',
  'nlg::flex life iul',
  'nlg::summit life iul',
  'f&g::pathsetter (juvenile)',
  'f&g::pathsetter',
  'f&g::everlast (juvenile)',
  'f&g::everlast',
  'mutual of omaha::ul',
  'mutual of omaha::iule',
  'transamerica::iul',
  'american amicable::secure life',
  'american amicable::xul',
  'ethos::ameritas iul',
  'united home life::fx',
  'united home life::giwl',
  'united home life::wl',
  'united home life::accidental',
  'royal neighbors::secure life iul',
  'global atlantic::iul'
);
