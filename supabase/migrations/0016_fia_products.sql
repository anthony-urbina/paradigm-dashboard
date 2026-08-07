-- FIA (Fixed Index Annuity) products — flat comp rate, not FFL-level based.
-- is_flat_rate flag marks these for UI display purposes (comp guide, overrides panel).
-- The same flat rate is inserted for every FFL level so resolveRate() works with zero
-- dashboard code changes — the lookup always returns the correct flat percentage.

alter table carrier_product_comp_rates
  add column if not exists is_flat_rate boolean not null default false;

-- ── carrier_product_comp_rates (base rate / admin comp guide) ─────────────────
insert into carrier_product_comp_rates (carrier, product, base_rate, is_flat_rate) values
  ('Athene',         'Performance Elite 10',       5.75, true),
  ('F&G',            'Accumulator Plus 10',         5.50, true),
  ('Forethought',    'Choice Accum 10',             5.00, true),
  ('Legacy',         'Legacy Mark SE 10',           5.25, true),
  ('Nassau',         'Nassau Growth Annuity 10 YR', 5.00, true),
  ('NLG',            'Zenith Growth 10',            4.50, true),
  ('North American', 'Charter Plus',                5.60, true),
  ('SILAC',          'Denall 14',                   6.50, true)
on conflict (carrier, product) do update
  set base_rate    = excluded.base_rate,
      is_flat_rate = excluded.is_flat_rate,
      updated_at   = now();

-- ── ffl_rate_schedules (flat rate repeated for every FFL level 65–145) ────────
-- commission = AP × rate / 100, same formula as WL/IUL/Term.
-- Same rate at every level means resolveRate() always resolves to the flat %.
insert into ffl_rate_schedules (carrier, product, ffl_level, rate) values
-- Athene / Performance Elite 10 — 5.75%
('Athene','Performance Elite 10',145,5.75),('Athene','Performance Elite 10',140,5.75),
('Athene','Performance Elite 10',135,5.75),('Athene','Performance Elite 10',130,5.75),
('Athene','Performance Elite 10',125,5.75),('Athene','Performance Elite 10',120,5.75),
('Athene','Performance Elite 10',115,5.75),('Athene','Performance Elite 10',110,5.75),
('Athene','Performance Elite 10',105,5.75),('Athene','Performance Elite 10',100,5.75),
('Athene','Performance Elite 10',95,5.75),('Athene','Performance Elite 10',90,5.75),
('Athene','Performance Elite 10',85,5.75),('Athene','Performance Elite 10',80,5.75),
('Athene','Performance Elite 10',75,5.75),('Athene','Performance Elite 10',70,5.75),
('Athene','Performance Elite 10',65,5.75),

-- F&G / Accumulator Plus 10 — 5.50%
('F&G','Accumulator Plus 10',145,5.50),('F&G','Accumulator Plus 10',140,5.50),
('F&G','Accumulator Plus 10',135,5.50),('F&G','Accumulator Plus 10',130,5.50),
('F&G','Accumulator Plus 10',125,5.50),('F&G','Accumulator Plus 10',120,5.50),
('F&G','Accumulator Plus 10',115,5.50),('F&G','Accumulator Plus 10',110,5.50),
('F&G','Accumulator Plus 10',105,5.50),('F&G','Accumulator Plus 10',100,5.50),
('F&G','Accumulator Plus 10',95,5.50),('F&G','Accumulator Plus 10',90,5.50),
('F&G','Accumulator Plus 10',85,5.50),('F&G','Accumulator Plus 10',80,5.50),
('F&G','Accumulator Plus 10',75,5.50),('F&G','Accumulator Plus 10',70,5.50),
('F&G','Accumulator Plus 10',65,5.50),

-- Forethought / Choice Accum 10 — 5.00%
('Forethought','Choice Accum 10',145,5.00),('Forethought','Choice Accum 10',140,5.00),
('Forethought','Choice Accum 10',135,5.00),('Forethought','Choice Accum 10',130,5.00),
('Forethought','Choice Accum 10',125,5.00),('Forethought','Choice Accum 10',120,5.00),
('Forethought','Choice Accum 10',115,5.00),('Forethought','Choice Accum 10',110,5.00),
('Forethought','Choice Accum 10',105,5.00),('Forethought','Choice Accum 10',100,5.00),
('Forethought','Choice Accum 10',95,5.00),('Forethought','Choice Accum 10',90,5.00),
('Forethought','Choice Accum 10',85,5.00),('Forethought','Choice Accum 10',80,5.00),
('Forethought','Choice Accum 10',75,5.00),('Forethought','Choice Accum 10',70,5.00),
('Forethought','Choice Accum 10',65,5.00),

-- Legacy / Legacy Mark SE 10 — 5.25%
('Legacy','Legacy Mark SE 10',145,5.25),('Legacy','Legacy Mark SE 10',140,5.25),
('Legacy','Legacy Mark SE 10',135,5.25),('Legacy','Legacy Mark SE 10',130,5.25),
('Legacy','Legacy Mark SE 10',125,5.25),('Legacy','Legacy Mark SE 10',120,5.25),
('Legacy','Legacy Mark SE 10',115,5.25),('Legacy','Legacy Mark SE 10',110,5.25),
('Legacy','Legacy Mark SE 10',105,5.25),('Legacy','Legacy Mark SE 10',100,5.25),
('Legacy','Legacy Mark SE 10',95,5.25),('Legacy','Legacy Mark SE 10',90,5.25),
('Legacy','Legacy Mark SE 10',85,5.25),('Legacy','Legacy Mark SE 10',80,5.25),
('Legacy','Legacy Mark SE 10',75,5.25),('Legacy','Legacy Mark SE 10',70,5.25),
('Legacy','Legacy Mark SE 10',65,5.25),

-- Nassau / Nassau Growth Annuity 10 YR — 5.00%
('Nassau','Nassau Growth Annuity 10 YR',145,5.00),('Nassau','Nassau Growth Annuity 10 YR',140,5.00),
('Nassau','Nassau Growth Annuity 10 YR',135,5.00),('Nassau','Nassau Growth Annuity 10 YR',130,5.00),
('Nassau','Nassau Growth Annuity 10 YR',125,5.00),('Nassau','Nassau Growth Annuity 10 YR',120,5.00),
('Nassau','Nassau Growth Annuity 10 YR',115,5.00),('Nassau','Nassau Growth Annuity 10 YR',110,5.00),
('Nassau','Nassau Growth Annuity 10 YR',105,5.00),('Nassau','Nassau Growth Annuity 10 YR',100,5.00),
('Nassau','Nassau Growth Annuity 10 YR',95,5.00),('Nassau','Nassau Growth Annuity 10 YR',90,5.00),
('Nassau','Nassau Growth Annuity 10 YR',85,5.00),('Nassau','Nassau Growth Annuity 10 YR',80,5.00),
('Nassau','Nassau Growth Annuity 10 YR',75,5.00),('Nassau','Nassau Growth Annuity 10 YR',70,5.00),
('Nassau','Nassau Growth Annuity 10 YR',65,5.00),

-- NLG / Zenith Growth 10 — 4.50%
('NLG','Zenith Growth 10',145,4.50),('NLG','Zenith Growth 10',140,4.50),
('NLG','Zenith Growth 10',135,4.50),('NLG','Zenith Growth 10',130,4.50),
('NLG','Zenith Growth 10',125,4.50),('NLG','Zenith Growth 10',120,4.50),
('NLG','Zenith Growth 10',115,4.50),('NLG','Zenith Growth 10',110,4.50),
('NLG','Zenith Growth 10',105,4.50),('NLG','Zenith Growth 10',100,4.50),
('NLG','Zenith Growth 10',95,4.50),('NLG','Zenith Growth 10',90,4.50),
('NLG','Zenith Growth 10',85,4.50),('NLG','Zenith Growth 10',80,4.50),
('NLG','Zenith Growth 10',75,4.50),('NLG','Zenith Growth 10',70,4.50),
('NLG','Zenith Growth 10',65,4.50),

-- North American / Charter Plus — 5.60%
('North American','Charter Plus',145,5.60),('North American','Charter Plus',140,5.60),
('North American','Charter Plus',135,5.60),('North American','Charter Plus',130,5.60),
('North American','Charter Plus',125,5.60),('North American','Charter Plus',120,5.60),
('North American','Charter Plus',115,5.60),('North American','Charter Plus',110,5.60),
('North American','Charter Plus',105,5.60),('North American','Charter Plus',100,5.60),
('North American','Charter Plus',95,5.60),('North American','Charter Plus',90,5.60),
('North American','Charter Plus',85,5.60),('North American','Charter Plus',80,5.60),
('North American','Charter Plus',75,5.60),('North American','Charter Plus',70,5.60),
('North American','Charter Plus',65,5.60),

-- SILAC / Denall 14 — 6.50%
('SILAC','Denall 14',145,6.50),('SILAC','Denall 14',140,6.50),
('SILAC','Denall 14',135,6.50),('SILAC','Denall 14',130,6.50),
('SILAC','Denall 14',125,6.50),('SILAC','Denall 14',120,6.50),
('SILAC','Denall 14',115,6.50),('SILAC','Denall 14',110,6.50),
('SILAC','Denall 14',105,6.50),('SILAC','Denall 14',100,6.50),
('SILAC','Denall 14',95,6.50),('SILAC','Denall 14',90,6.50),
('SILAC','Denall 14',85,6.50),('SILAC','Denall 14',80,6.50),
('SILAC','Denall 14',75,6.50),('SILAC','Denall 14',70,6.50),
('SILAC','Denall 14',65,6.50)

on conflict (carrier, product, ffl_level) do update set rate = excluded.rate;
