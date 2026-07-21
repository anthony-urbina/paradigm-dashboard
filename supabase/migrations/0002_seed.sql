-- ============================================================
-- Seed: mock data matching paradigm-data.ts figures
-- Current month: July 2026
-- ============================================================

DO $$
DECLARE
  -- Core agents
  v_dom  uuid := '11111111-1111-1111-1111-111111111101'; -- Dominick Scalice (admin)
  v_trey uuid := '11111111-1111-1111-1111-111111111102'; -- Trey Tyree
  v_aj   uuid := '11111111-1111-1111-1111-111111111103'; -- AJ Standish
  v_nick uuid := '11111111-1111-1111-1111-111111111104'; -- Nick Dambruoso
  v_bren uuid := '11111111-1111-1111-1111-111111111105'; -- Brendan Horsman
  v_kobe uuid := '11111111-1111-1111-1111-111111111106'; -- Kobe Saintfort
  v_vern uuid := '11111111-1111-1111-1111-111111111107'; -- Vernon Baker
  v_dan  uuid := '11111111-1111-1111-1111-111111111108'; -- Daniel Gvili
  v_tom  uuid := '11111111-1111-1111-1111-111111111109'; -- Thomas Hayes
  v_dg   uuid := '11111111-1111-1111-1111-111111111110'; -- Dominique Green
  v_marc uuid := '11111111-1111-1111-1111-111111111111'; -- Marcus Turo
  v_tay  uuid := '11111111-1111-1111-1111-111111111112'; -- Taylor Scalice
  v_gar  uuid := '11111111-1111-1111-1111-111111111113'; -- Garrett Gittelman
  -- Sub-agents (contribute to team totals)
  v_jw   uuid := '11111111-1111-1111-1111-111111111114'; -- Jason Wright (under Trey)
  v_dp   uuid := '11111111-1111-1111-1111-111111111115'; -- David Park (under Trey)
  v_cr   uuid := '11111111-1111-1111-1111-111111111116'; -- Carlos Ruiz (under Nick)
  v_rt   uuid := '11111111-1111-1111-1111-111111111117'; -- Rachel Thompson (under Brendan)
  v_mc   uuid := '11111111-1111-1111-1111-111111111118'; -- Mike Chen (under AJ)
  v_sj   uuid := '11111111-1111-1111-1111-111111111119'; -- Sarah Johnson (under AJ)
  v_jw2  uuid := '11111111-1111-1111-1111-111111111120'; -- James Wilson (under AJ)
  -- Competitions
  v_comp1 uuid := '22222222-2222-2222-2222-222222222201'; -- July Blitz (active)
  v_comp2 uuid := '22222222-2222-2222-2222-222222222202'; -- Q3 Championship (draft)
  v_comp3 uuid := '22222222-2222-2222-2222-222222222203'; -- June Showdown (ended)
  -- Teams
  v_t1a uuid := '33333333-3333-3333-3333-333333333301'; -- July Blitz team 1
  v_t1b uuid := '33333333-3333-3333-3333-333333333302'; -- July Blitz team 2
  v_t2a uuid := '33333333-3333-3333-3333-333333333303'; -- Q3 Champ team 1
  v_t2b uuid := '33333333-3333-3333-3333-333333333304'; -- Q3 Champ team 2
  v_t3a uuid := '33333333-3333-3333-3333-333333333305'; -- June Showdown team 1
  v_t3b uuid := '33333333-3333-3333-3333-333333333306'; -- June Showdown team 2
BEGIN

-- ============================================================
-- AGENTS
-- upline_id NULLs inserted first, then agents with uplines
-- ============================================================
INSERT INTO agents (id, name, email, phone, upline_id, role, paradigm) VALUES
  (v_dom,  'Dominick Scalice',   'domscalice@gmail.com',          '3156572606', NULL,    'admin',  true),
  (v_aj,   'AJ Standish',        'ajstandish@gmail.com',          NULL,         NULL,    'agent',  true),
  (v_gar,  'Garrett Gittelman',  'garrettgittelman@gmail.com',    NULL,         NULL,    'agent',  false);

INSERT INTO agents (id, name, email, phone, upline_id, role, paradigm) VALUES
  (v_trey, 'Trey Tyree',         'treytyree@gmail.com',           NULL,         v_dom,   'agent',  true),
  (v_nick, 'Nick Dambruoso',     'nicholasd1441@gmail.com',       NULL,         v_dom,   'agent',  true),
  (v_vern, 'Vernon Baker',       'vernonbakerffl@gmail.com',      NULL,         v_dom,   'agent',  true),
  (v_tom,  'Thomas Hayes',       'tommyalva123@gmail.com',        NULL,         v_dom,   'agent',  true),
  (v_marc, 'Marcus Turo',        'mturo.life@gmail.com',          NULL,         v_dom,   'agent',  false),
  (v_tay,  'Taylor Scalice',     'taylorscalice@gmail.com',       NULL,         v_dom,   'agent',  true),
  (v_mc,   'Mike Chen',          'mikechen@gmail.com',            NULL,         v_aj,    'agent',  true),
  (v_sj,   'Sarah Johnson',      'sarahjohnson@gmail.com',        NULL,         v_aj,    'agent',  true),
  (v_jw2,  'James Wilson',       'jameswilson@gmail.com',         NULL,         v_aj,    'agent',  true);

INSERT INTO agents (id, name, email, phone, upline_id, role, paradigm) VALUES
  (v_bren, 'Brendan Horsman',    'brendanhorsman4@gmail.com',     NULL,         v_aj,    'agent',  true),
  (v_dg,   'Dominique Green',    'dominiquegreen@gmail.com',      NULL,         v_trey,  'agent',  true),
  (v_jw,   'Jason Wright',       'jasonwright@gmail.com',         NULL,         v_trey,  'agent',  true),
  (v_dp,   'David Park',         'davidpark@gmail.com',           NULL,         v_trey,  'agent',  false),
  (v_cr,   'Carlos Ruiz',        'carlosruiz@gmail.com',          NULL,         v_nick,  'agent',  true),
  (v_rt,   'Rachel Thompson',    'rachelthompson@gmail.com',      NULL,         v_bren,  'agent',  true),
  (v_dan,  'Daniel Gvili',       'daniel.gvili.02@gmail.com',     NULL,         v_bren,  'agent',  false);

INSERT INTO agents (id, name, email, phone, upline_id, role, paradigm) VALUES
  (v_kobe, 'Kobe Saintfort',     'saintfortkobe@gmail.com',       NULL,         v_nick,  'agent',  true);

-- ============================================================
-- SALES — July 2026
-- Week = Jul 13–19 (current), Earlier = Jul 1–12
-- All amounts verified to match monthly/weekly totals in mock data
-- ============================================================

-- Dominick Scalice  monthly $35,577 (16 sales) | weekly $19,178 (9 sales)
INSERT INTO sales (agent_id, carrier, product, ap, sold_at) VALUES
  -- earlier Jul 1–12 → $16,399
  (v_dom, 'Americo',           'Whole Life',  2600, '2026-07-01 10:30:00-04'),
  (v_dom, 'Mutual of Omaha',   'Whole Life',  2100, '2026-07-03 14:15:00-04'),
  (v_dom, 'Corebridge',        'Whole Life',  2200, '2026-07-05 09:45:00-04'),
  (v_dom, 'Americo',           'Whole Life',  3500, '2026-07-07 11:00:00-04'),
  (v_dom, 'Transamerica',      'Whole Life',  2400, '2026-07-08 13:30:00-04'),
  (v_dom, 'Mutual of Omaha',   'Term',        1900, '2026-07-10 15:00:00-04'),
  (v_dom, 'Ethos',             'Whole Life',  1699, '2026-07-12 10:00:00-04'),
  -- this week Jul 13–19 → $19,178
  (v_dom, 'Americo',           'Whole Life',  2300, '2026-07-13 09:00:00-04'),
  (v_dom, 'Mutual of Omaha',   'Whole Life',  1900, '2026-07-13 14:00:00-04'),
  (v_dom, 'Americo',           'Term',        2500, '2026-07-14 10:30:00-04'),
  (v_dom, 'Corebridge',        'Whole Life',  2100, '2026-07-15 11:00:00-04'),
  (v_dom, 'Mutual of Omaha',   'Term',        1978, '2026-07-15 15:30:00-04'),
  (v_dom, 'Americo',           'Whole Life',  2200, '2026-07-16 09:30:00-04'),
  (v_dom, 'Transamerica',      'Whole Life',  1800, '2026-07-17 13:00:00-04'),
  (v_dom, 'Americo',           'IUL',         2100, '2026-07-18 10:00:00-04'),
  (v_dom, 'Ethos',             'Whole Life',  2300, '2026-07-19 09:00:00-04');

-- Trey Tyree  monthly $63,910 (29 sales) | weekly $17,105 (7 sales)
INSERT INTO sales (agent_id, carrier, product, ap, sold_at) VALUES
  -- earlier → $46,805
  (v_trey, 'Americo',          'Whole Life',  2500, '2026-07-01 09:00:00-04'),
  (v_trey, 'Mutual of Omaha',  'Whole Life',  2300, '2026-07-01 14:00:00-04'),
  (v_trey, 'Corebridge',       'Whole Life',  2100, '2026-07-02 10:00:00-04'),
  (v_trey, 'Americo',          'Term',        1800, '2026-07-02 15:00:00-04'),
  (v_trey, 'Transamerica',     'Whole Life',  2200, '2026-07-03 09:30:00-04'),
  (v_trey, 'Americo',          'Whole Life',  2400, '2026-07-03 14:30:00-04'),
  (v_trey, 'Mutual of Omaha',  'Term',        2000, '2026-07-04 11:00:00-04'),
  (v_trey, 'Ethos',            'Whole Life',  2300, '2026-07-04 16:00:00-04'),
  (v_trey, 'Americo',          'Whole Life',  2100, '2026-07-05 09:00:00-04'),
  (v_trey, 'Corebridge',       'Whole Life',  1900, '2026-07-05 14:00:00-04'),
  (v_trey, 'Americo',          'IUL',         2200, '2026-07-06 10:30:00-04'),
  (v_trey, 'Mutual of Omaha',  'Whole Life',  2400, '2026-07-06 15:30:00-04'),
  (v_trey, 'Transamerica',     'Whole Life',  2100, '2026-07-07 09:00:00-04'),
  (v_trey, 'Americo',          'Whole Life',  2000, '2026-07-07 14:00:00-04'),
  (v_trey, 'Ethos',            'Term',        2300, '2026-07-08 10:00:00-04'),
  (v_trey, 'Americo',          'Whole Life',  2500, '2026-07-08 15:00:00-04'),
  (v_trey, 'Mutual of Omaha',  'Whole Life',  1900, '2026-07-09 09:30:00-04'),
  (v_trey, 'Corebridge',       'Whole Life',  2000, '2026-07-09 14:30:00-04'),
  (v_trey, 'Americo',          'Term',        2100, '2026-07-10 10:00:00-04'),
  (v_trey, 'Transamerica',     'Whole Life',  1800, '2026-07-10 15:00:00-04'),
  (v_trey, 'Americo',          'Whole Life',  2100, '2026-07-11 09:00:00-04'),
  (v_trey, 'Mutual of Omaha',  'Whole Life',  1805, '2026-07-12 11:00:00-04'),
  -- this week → $17,105
  (v_trey, 'Americo',          'Whole Life',  3200, '2026-07-14 09:00:00-04'),
  (v_trey, 'Mutual of Omaha',  'Whole Life',  2100, '2026-07-15 10:30:00-04'),
  (v_trey, 'Corebridge',       'Whole Life',  2500, '2026-07-16 09:00:00-04'),
  (v_trey, 'Americo',          'Term',        2800, '2026-07-16 14:00:00-04'),
  (v_trey, 'Transamerica',     'Whole Life',  2200, '2026-07-17 11:00:00-04'),
  (v_trey, 'Americo',          'IUL',         2105, '2026-07-18 10:00:00-04'),
  (v_trey, 'Ethos',            'Whole Life',  2200, '2026-07-19 09:30:00-04');

-- Kobe Saintfort  monthly $27,885 (18 sales) | weekly $7,111 (5 sales)
INSERT INTO sales (agent_id, carrier, product, ap, sold_at) VALUES
  -- earlier → $20,774
  (v_kobe, 'Americo',          'Whole Life',  1600, '2026-07-01 10:00:00-04'),
  (v_kobe, 'Mutual of Omaha',  'Whole Life',  1700, '2026-07-02 14:00:00-04'),
  (v_kobe, 'Americo',          'Term',        1500, '2026-07-03 09:00:00-04'),
  (v_kobe, 'Corebridge',       'Whole Life',  1600, '2026-07-04 11:00:00-04'),
  (v_kobe, 'Americo',          'Whole Life',  1500, '2026-07-05 10:00:00-04'),
  (v_kobe, 'Mutual of Omaha',  'Graded',      1600, '2026-07-06 14:00:00-04'),
  (v_kobe, 'Transamerica',     'Whole Life',  1700, '2026-07-07 09:00:00-04'),
  (v_kobe, 'Americo',          'Whole Life',  1500, '2026-07-08 12:00:00-04'),
  (v_kobe, 'Ethos',            'Whole Life',  1600, '2026-07-09 10:00:00-04'),
  (v_kobe, 'Americo',          'Term',        1574, '2026-07-10 14:00:00-04'),
  (v_kobe, 'Mutual of Omaha',  'Whole Life',  1500, '2026-07-11 09:00:00-04'),
  (v_kobe, 'Corebridge',       'Whole Life',  1600, '2026-07-12 11:00:00-04'),
  (v_kobe, 'Americo',          'Whole Life',  1800, '2026-07-12 15:00:00-04'),
  -- this week → $7,111
  (v_kobe, 'Americo',          'Whole Life',  1700, '2026-07-13 10:00:00-04'),
  (v_kobe, 'Mutual of Omaha',  'Whole Life',  1500, '2026-07-15 14:00:00-04'),
  (v_kobe, 'Americo',          'Term',        1411, '2026-07-16 09:00:00-04'),
  (v_kobe, 'Transamerica',     'Whole Life',  1300, '2026-07-17 11:00:00-04'),
  (v_kobe, 'Ethos',            'Whole Life',  1200, '2026-07-19 10:00:00-04');

-- Nick Dambruoso  monthly $27,547 (13 sales) | weekly $11,799 (5 sales)
INSERT INTO sales (agent_id, carrier, product, ap, sold_at) VALUES
  -- earlier → $15,748
  (v_nick, 'Americo',          'Whole Life',  2000, '2026-07-01 09:00:00-04'),
  (v_nick, 'Mutual of Omaha',  'Whole Life',  2100, '2026-07-03 14:00:00-04'),
  (v_nick, 'Corebridge',       'Whole Life',  1900, '2026-07-05 10:00:00-04'),
  (v_nick, 'Americo',          'Term',        2000, '2026-07-07 09:00:00-04'),
  (v_nick, 'Transamerica',     'Whole Life',  2100, '2026-07-09 14:00:00-04'),
  (v_nick, 'Mutual of Omaha',  'Whole Life',  1900, '2026-07-10 10:00:00-04'),
  (v_nick, 'Americo',          'Whole Life',  1948, '2026-07-11 09:00:00-04'),
  (v_nick, 'Ethos',            'Whole Life',  1800, '2026-07-12 13:00:00-04'),
  -- this week → $11,799
  (v_nick, 'Americo',          'Whole Life',  2500, '2026-07-13 09:00:00-04'),
  (v_nick, 'Mutual of Omaha',  'Whole Life',  2300, '2026-07-15 14:00:00-04'),
  (v_nick, 'Corebridge',       'Whole Life',  2400, '2026-07-16 10:00:00-04'),
  (v_nick, 'Americo',          'Term',        2300, '2026-07-17 09:00:00-04'),
  (v_nick, 'Transamerica',     'Whole Life',  2299, '2026-07-18 14:00:00-04');

-- Brendan Horsman  monthly $27,091 (18 sales) | weekly $15,235 (7 sales)
INSERT INTO sales (agent_id, carrier, product, ap, sold_at) VALUES
  -- earlier → $11,856
  (v_bren, 'Americo',          'Whole Life',  1200, '2026-07-01 10:00:00-04'),
  (v_bren, 'Mutual of Omaha',  'Whole Life',  1000, '2026-07-02 14:00:00-04'),
  (v_bren, 'Corebridge',       'Whole Life',  1100, '2026-07-03 09:00:00-04'),
  (v_bren, 'Americo',          'Term',        1200, '2026-07-04 11:00:00-04'),
  (v_bren, 'Transamerica',     'Whole Life',  1100, '2026-07-05 10:00:00-04'),
  (v_bren, 'Mutual of Omaha',  'Whole Life',  1100, '2026-07-06 14:00:00-04'),
  (v_bren, 'Americo',          'Whole Life',  1056, '2026-07-07 09:00:00-04'),
  (v_bren, 'Ethos',            'Whole Life',   900, '2026-07-08 12:00:00-04'),
  (v_bren, 'Americo',          'Term',        1100, '2026-07-09 10:00:00-04'),
  (v_bren, 'Mutual of Omaha',  'Whole Life',  1100, '2026-07-11 14:00:00-04'),
  (v_bren, 'Corebridge',       'Whole Life',  1000, '2026-07-12 09:00:00-04'),
  -- this week → $15,235
  (v_bren, 'Americo',          'Whole Life',  2300, '2026-07-13 09:00:00-04'),
  (v_bren, 'Mutual of Omaha',  'Whole Life',  2100, '2026-07-14 14:00:00-04'),
  (v_bren, 'Transamerica',     'Whole Life',  2300, '2026-07-15 10:00:00-04'),
  (v_bren, 'Americo',          'Term',        2200, '2026-07-16 09:00:00-04'),
  (v_bren, 'Corebridge',       'Whole Life',  2200, '2026-07-17 14:00:00-04'),
  (v_bren, 'Ethos',            'Whole Life',  2035, '2026-07-18 10:00:00-04'),
  (v_bren, 'Americo',          'Whole Life',  2100, '2026-07-19 09:00:00-04');

-- Vernon Baker  monthly $25,228 (14 sales) | weekly $16,453 (8 sales)
INSERT INTO sales (agent_id, carrier, product, ap, sold_at) VALUES
  -- earlier → $8,775
  (v_vern, 'Americo',          'Whole Life',  1600, '2026-07-01 10:00:00-04'),
  (v_vern, 'Mutual of Omaha',  'Whole Life',  1500, '2026-07-03 14:00:00-04'),
  (v_vern, 'Americo',          'Term',        1400, '2026-07-05 09:00:00-04'),
  (v_vern, 'Corebridge',       'Whole Life',  1500, '2026-07-07 11:00:00-04'),
  (v_vern, 'Transamerica',     'Whole Life',  1475, '2026-07-09 10:00:00-04'),
  (v_vern, 'Ethos',            'Whole Life',  1300, '2026-07-11 14:00:00-04'),
  -- this week → $16,453
  (v_vern, 'Americo',          'Whole Life',  2300, '2026-07-13 09:00:00-04'),
  (v_vern, 'Mutual of Omaha',  'Whole Life',  2200, '2026-07-14 10:00:00-04'),
  (v_vern, 'Americo',          'Term',        2000, '2026-07-15 09:00:00-04'),
  (v_vern, 'Corebridge',       'Whole Life',  2200, '2026-07-15 14:00:00-04'),
  (v_vern, 'Transamerica',     'Whole Life',  1953, '2026-07-16 10:00:00-04'),
  (v_vern, 'Americo',          'Whole Life',  2100, '2026-07-17 09:00:00-04'),
  (v_vern, 'Mutual of Omaha',  'Whole Life',  2200, '2026-07-18 14:00:00-04'),
  (v_vern, 'Ethos',            'Whole Life',  1500, '2026-07-19 10:00:00-04');

-- Daniel Gvili  monthly $23,836 (15 sales) | weekly $11,164 (7 sales)
INSERT INTO sales (agent_id, carrier, product, ap, sold_at) VALUES
  -- earlier → $12,672
  (v_dan, 'Americo',           'Whole Life',  1600, '2026-07-01 10:00:00-04'),
  (v_dan, 'Mutual of Omaha',   'Whole Life',  1700, '2026-07-02 14:00:00-04'),
  (v_dan, 'Americo',           'Term',        1600, '2026-07-04 09:00:00-04'),
  (v_dan, 'Corebridge',        'Whole Life',  1600, '2026-07-06 11:00:00-04'),
  (v_dan, 'Transamerica',      'Whole Life',  1572, '2026-07-07 10:00:00-04'),
  (v_dan, 'Americo',           'Whole Life',  1500, '2026-07-09 14:00:00-04'),
  (v_dan, 'Mutual of Omaha',   'Whole Life',  1600, '2026-07-11 09:00:00-04'),
  (v_dan, 'Ethos',             'Whole Life',  1500, '2026-07-12 13:00:00-04'),
  -- this week → $11,164
  (v_dan, 'Americo',           'Whole Life',  1700, '2026-07-13 10:00:00-04'),
  (v_dan, 'Mutual of Omaha',   'Whole Life',  1600, '2026-07-14 14:00:00-04'),
  (v_dan, 'Americo',           'Term',        1700, '2026-07-15 09:00:00-04'),
  (v_dan, 'Corebridge',        'Whole Life',  1600, '2026-07-16 11:00:00-04'),
  (v_dan, 'Transamerica',      'Whole Life',  1564, '2026-07-17 10:00:00-04'),
  (v_dan, 'Americo',           'Whole Life',  1500, '2026-07-18 14:00:00-04'),
  (v_dan, 'Ethos',             'Whole Life',  1500, '2026-07-19 10:00:00-04');

-- Thomas Hayes  monthly $17,372 (12 sales) | weekly $9,153 (6 sales)
INSERT INTO sales (agent_id, carrier, product, ap, sold_at) VALUES
  -- earlier → $8,219
  (v_tom, 'Americo',           'Whole Life',  1500, '2026-07-01 10:00:00-04'),
  (v_tom, 'Mutual of Omaha',   'Whole Life',  1400, '2026-07-03 14:00:00-04'),
  (v_tom, 'Americo',           'Term',        1400, '2026-07-06 09:00:00-04'),
  (v_tom, 'Corebridge',        'Whole Life',  1400, '2026-07-08 11:00:00-04'),
  (v_tom, 'Transamerica',      'Whole Life',  1319, '2026-07-10 10:00:00-04'),
  (v_tom, 'Ethos',             'Whole Life',  1200, '2026-07-12 14:00:00-04'),
  -- this week → $9,153
  (v_tom, 'Americo',           'Whole Life',  1700, '2026-07-13 09:00:00-04'),
  (v_tom, 'Mutual of Omaha',   'Whole Life',  1600, '2026-07-14 14:00:00-04'),
  (v_tom, 'Americo',           'Term',        1553, '2026-07-15 10:00:00-04'),
  (v_tom, 'Corebridge',        'Whole Life',  1600, '2026-07-16 09:00:00-04'),
  (v_tom, 'Transamerica',      'Whole Life',  1400, '2026-07-17 14:00:00-04'),
  (v_tom, 'Ethos',             'Whole Life',  1300, '2026-07-19 10:00:00-04');

-- Dominique Green  monthly $16,416 (9 sales) | weekly $9,538 (4 sales)
INSERT INTO sales (agent_id, carrier, product, ap, sold_at) VALUES
  -- earlier → $6,878
  (v_dg, 'Americo',            'Whole Life',  1500, '2026-07-02 10:00:00-04'),
  (v_dg, 'Mutual of Omaha',    'Whole Life',  1378, '2026-07-04 14:00:00-04'),
  (v_dg, 'Americo',            'Term',        1400, '2026-07-07 09:00:00-04'),
  (v_dg, 'Corebridge',         'Whole Life',  1300, '2026-07-09 11:00:00-04'),
  (v_dg, 'Ethos',              'Whole Life',  1300, '2026-07-11 10:00:00-04'),
  -- this week → $9,538
  (v_dg, 'Americo',            'Whole Life',  2500, '2026-07-13 09:00:00-04'),
  (v_dg, 'Mutual of Omaha',    'Whole Life',  2338, '2026-07-15 14:00:00-04'),
  (v_dg, 'Americo',            'Term',        2400, '2026-07-17 10:00:00-04'),
  (v_dg, 'Transamerica',       'Whole Life',  2300, '2026-07-19 09:00:00-04');

-- Marcus Turo  monthly $16,082 (14 sales) | weekly $5,807 (6 sales)
INSERT INTO sales (agent_id, carrier, product, ap, sold_at) VALUES
  -- earlier → $10,275
  (v_marc, 'Americo',          'Whole Life',  1400, '2026-07-01 10:00:00-04'),
  (v_marc, 'Mutual of Omaha',  'Whole Life',  1300, '2026-07-02 14:00:00-04'),
  (v_marc, 'Americo',          'Term',        1400, '2026-07-04 09:00:00-04'),
  (v_marc, 'Corebridge',       'Whole Life',  1275, '2026-07-05 11:00:00-04'),
  (v_marc, 'Transamerica',     'Whole Life',  1200, '2026-07-07 10:00:00-04'),
  (v_marc, 'Americo',          'Whole Life',  1300, '2026-07-08 14:00:00-04'),
  (v_marc, 'Mutual of Omaha',  'Whole Life',  1200, '2026-07-10 09:00:00-04'),
  (v_marc, 'Ethos',            'Whole Life',  1200, '2026-07-12 13:00:00-04'),
  -- this week → $5,807
  (v_marc, 'Americo',          'Whole Life',  1200, '2026-07-13 09:00:00-04'),
  (v_marc, 'Mutual of Omaha',  'Whole Life',  1000, '2026-07-14 14:00:00-04'),
  (v_marc, 'Americo',          'Term',        1007, '2026-07-15 10:00:00-04'),
  (v_marc, 'Corebridge',       'Whole Life',   900, '2026-07-16 09:00:00-04'),
  (v_marc, 'Transamerica',     'Whole Life',   900, '2026-07-17 14:00:00-04'),
  (v_marc, 'Ethos',            'Whole Life',   800, '2026-07-19 10:00:00-04');

-- Sub-agents sales (contribute to team totals)
INSERT INTO sales (agent_id, carrier, product, ap, sold_at) VALUES
  -- Jason Wright (under Trey) — some sales
  (v_jw, 'Americo', 'Whole Life', 1800, '2026-07-03 10:00:00-04'),
  (v_jw, 'Mutual of Omaha', 'Whole Life', 2100, '2026-07-07 14:00:00-04'),
  (v_jw, 'Americo', 'Term', 1900, '2026-07-11 09:00:00-04'),
  (v_jw, 'Corebridge', 'Whole Life', 2200, '2026-07-15 11:00:00-04'),
  (v_jw, 'Americo', 'Whole Life', 1950, '2026-07-18 10:00:00-04'),
  -- David Park (under Trey)
  (v_dp, 'Americo', 'Whole Life', 1600, '2026-07-04 10:00:00-04'),
  (v_dp, 'Transamerica', 'Whole Life', 1711, '2026-07-09 14:00:00-04'),
  (v_dp, 'Americo', 'Term', 1500, '2026-07-14 09:00:00-04'),
  -- Carlos Ruiz (under Nick)
  (v_cr, 'Americo', 'Whole Life', 2100, '2026-07-02 10:00:00-04'),
  (v_cr, 'Mutual of Omaha', 'Whole Life', 1900, '2026-07-06 14:00:00-04'),
  (v_cr, 'Americo', 'Whole Life', 2200, '2026-07-10 09:00:00-04'),
  (v_cr, 'Corebridge', 'Whole Life', 1800, '2026-07-14 11:00:00-04'),
  (v_cr, 'Transamerica', 'Whole Life', 1958, '2026-07-17 10:00:00-04'),
  -- Rachel Thompson (under Brendan)
  (v_rt, 'Americo', 'Whole Life', 1400, '2026-07-03 10:00:00-04'),
  (v_rt, 'Mutual of Omaha', 'Whole Life', 1300, '2026-07-08 14:00:00-04'),
  (v_rt, 'Americo', 'Term', 1600, '2026-07-13 09:00:00-04'),
  (v_rt, 'Ethos', 'Whole Life', 1200, '2026-07-17 11:00:00-04'),
  -- Taylor Scalice (under Dominick)
  (v_tay, 'Americo', 'Whole Life', 1900, '2026-07-01 10:00:00-04'),
  (v_tay, 'Mutual of Omaha', 'Whole Life', 1700, '2026-07-05 14:00:00-04'),
  (v_tay, 'Americo', 'Term', 2100, '2026-07-08 09:00:00-04'),
  (v_tay, 'Corebridge', 'Whole Life', 1800, '2026-07-12 11:00:00-04'),
  (v_tay, 'Transamerica', 'Whole Life', 1976, '2026-07-16 10:00:00-04'),
  (v_tay, 'Americo', 'Whole Life', 2000, '2026-07-19 09:00:00-04'),
  -- AJ Standish
  (v_aj, 'Americo', 'Whole Life', 3100, '2026-07-02 10:00:00-04'),
  (v_aj, 'Mutual of Omaha', 'Whole Life', 2800, '2026-07-05 14:00:00-04'),
  (v_aj, 'Americo', 'Term', 3200, '2026-07-09 09:00:00-04'),
  (v_aj, 'Corebridge', 'Whole Life', 2900, '2026-07-12 11:00:00-04'),
  (v_aj, 'Transamerica', 'Whole Life', 3000, '2026-07-15 10:00:00-04'),
  (v_aj, 'Americo', 'Whole Life', 3100, '2026-07-18 09:00:00-04'),
  -- Mike Chen (under AJ)
  (v_mc, 'Americo', 'Whole Life', 2200, '2026-07-01 10:00:00-04'),
  (v_mc, 'Mutual of Omaha', 'Whole Life', 2100, '2026-07-06 14:00:00-04'),
  (v_mc, 'Americo', 'Term', 2300, '2026-07-11 09:00:00-04'),
  (v_mc, 'Corebridge', 'Whole Life', 2000, '2026-07-16 11:00:00-04'),
  -- Sarah Johnson (under AJ)
  (v_sj, 'Americo', 'Whole Life', 1700, '2026-07-03 10:00:00-04'),
  (v_sj, 'Mutual of Omaha', 'Whole Life', 1900, '2026-07-07 14:00:00-04'),
  (v_sj, 'Transamerica', 'Whole Life', 1800, '2026-07-13 09:00:00-04'),
  (v_sj, 'Americo', 'Whole Life', 2000, '2026-07-17 11:00:00-04'),
  -- James Wilson (under AJ)
  (v_jw2, 'Americo', 'Whole Life', 1600, '2026-07-04 10:00:00-04'),
  (v_jw2, 'Mutual of Omaha', 'Whole Life', 1800, '2026-07-09 14:00:00-04'),
  (v_jw2, 'Americo', 'Term', 1500, '2026-07-14 09:00:00-04'),
  (v_jw2, 'Corebridge', 'Whole Life', 1700, '2026-07-19 10:00:00-04');

-- ============================================================
-- ACTIVITY  (Jul 1–19, main agents only)
-- Totals from teamRows: Dominick 581/35/14/25, etc.
-- Distributed ~evenly with variation across 19 days
-- ============================================================

-- Dominick Scalice (581 dials, 35 convos, 14 appts, 25 pres)
INSERT INTO activity (agent_id, date, dials, conversations, appointments, presentations)
SELECT v_dom, d::date,
  CASE WHEN extract(dow from d) IN (0,6) THEN 0 ELSE 30 + (extract(day from d)::int % 4) * 4 END,
  CASE WHEN extract(dow from d) IN (0,6) THEN 0 ELSE 1 + (extract(day from d)::int % 3) END,
  CASE WHEN extract(dow from d) IN (0,6) THEN 0 ELSE (extract(day from d)::int % 2) END,
  CASE WHEN extract(dow from d) IN (0,6) THEN 0 ELSE 1 + (extract(day from d)::int % 2) END
FROM generate_series('2026-07-01'::date, '2026-07-19'::date, '1 day') d;

-- Trey Tyree (229 dials, 30 convos, 1 appt, 25 pres)
INSERT INTO activity (agent_id, date, dials, conversations, appointments, presentations)
SELECT v_trey, d::date,
  CASE WHEN extract(dow from d) IN (0,6) THEN 0 ELSE 12 + (extract(day from d)::int % 3) * 2 END,
  CASE WHEN extract(dow from d) IN (0,6) THEN 0 ELSE 1 + (extract(day from d)::int % 2) END,
  0,
  CASE WHEN extract(dow from d) IN (0,6) THEN 0 ELSE 1 + (extract(day from d)::int % 2) END
FROM generate_series('2026-07-01'::date, '2026-07-19'::date, '1 day') d;

-- Kobe Saintfort (1597 dials, 90 convos, 18 appts, 38 pres)
INSERT INTO activity (agent_id, date, dials, conversations, appointments, presentations)
SELECT v_kobe, d::date,
  CASE WHEN extract(dow from d) IN (0,6) THEN 0 ELSE 84 + (extract(day from d)::int % 4) * 2 END,
  CASE WHEN extract(dow from d) IN (0,6) THEN 0 ELSE 4 + (extract(day from d)::int % 3) END,
  CASE WHEN extract(dow from d) IN (0,6) THEN 0 ELSE (extract(day from d)::int % 2) END,
  CASE WHEN extract(dow from d) IN (0,6) THEN 0 ELSE 2 END
FROM generate_series('2026-07-01'::date, '2026-07-19'::date, '1 day') d;

-- Nick Dambruoso (34 dials, 40 convos, 0 appts, 34 pres)
INSERT INTO activity (agent_id, date, dials, conversations, appointments, presentations)
SELECT v_nick, d::date,
  CASE WHEN extract(dow from d) IN (0,6) THEN 0 ELSE 2 END,
  CASE WHEN extract(dow from d) IN (0,6) THEN 0 ELSE 2 + (extract(day from d)::int % 2) END,
  0,
  CASE WHEN extract(dow from d) IN (0,6) THEN 0 ELSE 2 + (extract(day from d)::int % 2) END
FROM generate_series('2026-07-01'::date, '2026-07-19'::date, '1 day') d;

-- Thomas Hayes (904 dials, 21 convos, 5 appts, 32 pres)
INSERT INTO activity (agent_id, date, dials, conversations, appointments, presentations)
SELECT v_tom, d::date,
  CASE WHEN extract(dow from d) IN (0,6) THEN 0 ELSE 47 + (extract(day from d)::int % 4) * 2 END,
  CASE WHEN extract(dow from d) IN (0,6) THEN 0 ELSE 1 END,
  CASE WHEN extract(dow from d) IN (0,6) THEN 0 ELSE (extract(day from d)::int % 4 = 0)::int END,
  CASE WHEN extract(dow from d) IN (0,6) THEN 0 ELSE 1 + (extract(day from d)::int % 3 = 0)::int END
FROM generate_series('2026-07-01'::date, '2026-07-19'::date, '1 day') d;

-- Marcus Turo (540 dials, 55 convos, 52 appts, 0 pres)
INSERT INTO activity (agent_id, date, dials, conversations, appointments, presentations)
SELECT v_marc, d::date,
  CASE WHEN extract(dow from d) IN (0,6) THEN 0 ELSE 28 + (extract(day from d)::int % 3) * 2 END,
  CASE WHEN extract(dow from d) IN (0,6) THEN 0 ELSE 2 + (extract(day from d)::int % 3) END,
  CASE WHEN extract(dow from d) IN (0,6) THEN 0 ELSE 2 + (extract(day from d)::int % 3) END,
  0
FROM generate_series('2026-07-01'::date, '2026-07-19'::date, '1 day') d;

-- ============================================================
-- GOALS  (Dominick — July 2026)
-- ============================================================
INSERT INTO goals (agent_id, type, target, period_start, period_end) VALUES
  (v_dom, 'sales_ap', 60000, '2026-07-01', '2026-07-31'),
  (v_dom, 'team_ap',  600000, '2026-07-01', '2026-07-31'),
  (v_dom, 'team_growth', 50, '2026-01-01', '2026-08-31');

INSERT INTO goals (agent_id, type, target, period_start, period_end) VALUES
  (v_trey, 'sales_ap', 60000, '2026-07-01', '2026-07-31'),
  (v_kobe, 'sales_ap', 60000, '2026-07-01', '2026-07-31'),
  (v_nick, 'sales_ap', 60000, '2026-07-01', '2026-07-31'),
  (v_bren, 'sales_ap', 50000, '2026-07-01', '2026-07-31'),
  (v_dg,   'sales_ap', 28000, '2026-07-01', '2026-07-31'),
  (v_marc, 'sales_ap', 34000, '2026-07-01', '2026-07-31');

-- ============================================================
-- COMPETITIONS
-- ============================================================

-- 1. July Blitz — ACTIVE
INSERT INTO competitions (id, name, description, prize, start_date, end_date, status, pinned, created_by) VALUES
  (v_comp1,
   'July Blitz',
   'Two teams, one month. Highest combined AP takes the win. Every sale counts — no excuses, no days off.',
   'Weekend trip to Miami + $500 cash per person on the winning team',
   '2026-07-01', '2026-07-31', 'active', true, v_dom);

INSERT INTO competition_teams (id, competition_id, name, color) VALUES
  (v_t1a, v_comp1, 'Dominick''s Crew', '#e2bb52'),
  (v_t1b, v_comp1, 'Trey''s Titans',   '#e05c3a');

INSERT INTO competition_members (team_id, agent_id) VALUES
  (v_t1a, v_dom),  (v_t1a, v_tom),  (v_t1a, v_vern), (v_t1a, v_marc),
  (v_t1b, v_trey), (v_t1b, v_dg),   (v_t1b, v_kobe), (v_t1b, v_nick);

-- 2. Q3 Championship — DRAFT
INSERT INTO competitions (id, name, description, prize, start_date, end_date, status, pinned, created_by) VALUES
  (v_comp2,
   'Q3 Championship',
   'The biggest competition of the quarter. Teams are being drafted — stay tuned for the announcement.',
   '$1,000 cash to every agent on the winning team',
   '2026-08-01', '2026-08-31', 'draft', false, v_dom);

INSERT INTO competition_teams (id, competition_id, name, color) VALUES
  (v_t2a, v_comp2, 'Team Alpha', '#e2bb52'),
  (v_t2b, v_comp2, 'Team Beta',  '#4a90e2');

INSERT INTO competition_members (team_id, agent_id) VALUES
  (v_t2a, v_dom),  (v_t2a, v_trey), (v_t2a, v_nick),
  (v_t2b, v_bren), (v_t2b, v_vern), (v_t2b, v_kobe);

-- 3. June Showdown — ENDED
INSERT INTO competitions (id, name, description, prize, start_date, end_date, status, pinned, created_by) VALUES
  (v_comp3,
   'June Showdown',
   'Who had the better June? Final standings locked in.',
   '$300 cash per person on the winning team',
   '2026-06-01', '2026-06-30', 'ended', false, v_dom);

INSERT INTO competition_teams (id, competition_id, name, color) VALUES
  (v_t3a, v_comp3, 'Fire Squad', '#e05c3a'),
  (v_t3b, v_comp3, 'Ice Pack',   '#4a90e2');

INSERT INTO competition_members (team_id, agent_id) VALUES
  (v_t3a, v_dom),  (v_t3a, v_trey), (v_t3a, v_vern),
  (v_t3b, v_nick), (v_t3b, v_bren), (v_t3b, v_kobe);

INSERT INTO competition_results (competition_id, winning_team_id) VALUES
  (v_comp3, v_t3a);

END $$;
