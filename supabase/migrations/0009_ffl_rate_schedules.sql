-- Full FFL rate schedule table: exact commission rate per carrier/product/FFL-level
-- Usage: commission = AP × rate/100  (where rate is looked up by agent's FFL contract level)
-- FFL levels: 65,70,75,80,85,90,95,100,105,110,115,120,125,130,135,140,145 (steps of 5)

create table if not exists ffl_rate_schedules (
  carrier   text            not null,
  product   text            not null,
  ffl_level integer         not null check (ffl_level between 65 and 145),
  rate      numeric(6,2)    not null,
  primary key (carrier, product, ffl_level)
);

-- ─── WHOLE LIFE ──────────────────────────────────────────────────────────────

insert into ffl_rate_schedules (carrier, product, ffl_level, rate) values
-- Aetna / Whole Life (no 145 level)
('Aetna','Whole Life',140,144),('Aetna','Whole Life',135,137),('Aetna','Whole Life',130,130),
('Aetna','Whole Life',125,125),('Aetna','Whole Life',120,120),('Aetna','Whole Life',115,115),
('Aetna','Whole Life',110,107.50),('Aetna','Whole Life',105,100),('Aetna','Whole Life',100,92.50),
('Aetna','Whole Life',95,85),('Aetna','Whole Life',90,77.50),('Aetna','Whole Life',85,70),
('Aetna','Whole Life',80,70),('Aetna','Whole Life',75,70),('Aetna','Whole Life',70,70),('Aetna','Whole Life',65,70),

-- Aflac / Final Ex (no 145 level)
('Aflac','Final Ex',140,123),('Aflac','Final Ex',135,118),('Aflac','Final Ex',130,113),
('Aflac','Final Ex',125,108),('Aflac','Final Ex',120,100),('Aflac','Final Ex',115,93),
('Aflac','Final Ex',110,85),('Aflac','Final Ex',105,78),('Aflac','Final Ex',100,70),
('Aflac','Final Ex',95,70),('Aflac','Final Ex',90,70),('Aflac','Final Ex',85,63),
('Aflac','Final Ex',80,63),('Aflac','Final Ex',75,63),('Aflac','Final Ex',70,63),('Aflac','Final Ex',65,63),

-- Americo / Eagle Select
('Americo','Eagle Select',145,135),('Americo','Eagle Select',140,135),('Americo','Eagle Select',135,130),
('Americo','Eagle Select',130,125),('Americo','Eagle Select',125,120),('Americo','Eagle Select',120,115),
('Americo','Eagle Select',115,110),('Americo','Eagle Select',110,105),('Americo','Eagle Select',105,100),
('Americo','Eagle Select',100,95),('Americo','Eagle Select',95,90),('Americo','Eagle Select',90,85),
('Americo','Eagle Select',85,80),('Americo','Eagle Select',80,75),('Americo','Eagle Select',75,70),
('Americo','Eagle Select',70,65),('Americo','Eagle Select',65,60),

-- Corebridge / GIWL (no 145)
('Corebridge','GIWL',140,80),('Corebridge','GIWL',135,77.50),('Corebridge','GIWL',130,75),
('Corebridge','GIWL',125,72.50),('Corebridge','GIWL',120,70),('Corebridge','GIWL',115,67.50),
('Corebridge','GIWL',110,65),('Corebridge','GIWL',105,62.50),('Corebridge','GIWL',100,60),
('Corebridge','GIWL',95,57.50),('Corebridge','GIWL',90,57.50),('Corebridge','GIWL',85,55),
('Corebridge','GIWL',80,55),('Corebridge','GIWL',75,55),('Corebridge','GIWL',70,55),('Corebridge','GIWL',65,55),

-- Corebridge / SIWL (no 145)
('Corebridge','SIWL',140,132),('Corebridge','SIWL',135,127),('Corebridge','SIWL',130,122),
('Corebridge','SIWL',125,117),('Corebridge','SIWL',120,112),('Corebridge','SIWL',115,107),
('Corebridge','SIWL',110,102),('Corebridge','SIWL',105,97),('Corebridge','SIWL',100,92),
('Corebridge','SIWL',95,87),('Corebridge','SIWL',90,82),('Corebridge','SIWL',85,77),
('Corebridge','SIWL',80,72),('Corebridge','SIWL',75,67),('Corebridge','SIWL',70,62),('Corebridge','SIWL',65,57),

-- Mutual of Omaha / Living Promise (FEX)
('Mutual of Omaha','Living Promise (FEX)',145,125),('Mutual of Omaha','Living Promise (FEX)',140,125),
('Mutual of Omaha','Living Promise (FEX)',135,120),('Mutual of Omaha','Living Promise (FEX)',130,115),
('Mutual of Omaha','Living Promise (FEX)',125,110),('Mutual of Omaha','Living Promise (FEX)',120,105),
('Mutual of Omaha','Living Promise (FEX)',115,100),('Mutual of Omaha','Living Promise (FEX)',110,95),
('Mutual of Omaha','Living Promise (FEX)',105,90),('Mutual of Omaha','Living Promise (FEX)',100,86),
('Mutual of Omaha','Living Promise (FEX)',95,82),('Mutual of Omaha','Living Promise (FEX)',90,78),
('Mutual of Omaha','Living Promise (FEX)',85,74),('Mutual of Omaha','Living Promise (FEX)',80,70),
('Mutual of Omaha','Living Promise (FEX)',75,65),('Mutual of Omaha','Living Promise (FEX)',70,61),
('Mutual of Omaha','Living Promise (FEX)',65,57),

-- Mutual of Omaha / Children's WL
('Mutual of Omaha','Children''s WL',145,100),('Mutual of Omaha','Children''s WL',140,100),
('Mutual of Omaha','Children''s WL',135,97),('Mutual of Omaha','Children''s WL',130,95),
('Mutual of Omaha','Children''s WL',125,92),('Mutual of Omaha','Children''s WL',120,90),
('Mutual of Omaha','Children''s WL',115,85),('Mutual of Omaha','Children''s WL',110,80),
('Mutual of Omaha','Children''s WL',105,75),('Mutual of Omaha','Children''s WL',100,70),
('Mutual of Omaha','Children''s WL',95,65),('Mutual of Omaha','Children''s WL',90,60),
('Mutual of Omaha','Children''s WL',85,55),('Mutual of Omaha','Children''s WL',80,50),
('Mutual of Omaha','Children''s WL',75,45),('Mutual of Omaha','Children''s WL',70,40),
('Mutual of Omaha','Children''s WL',65,35),

-- Mutual of Omaha / Accidental Death
('Mutual of Omaha','Accidental Death',145,130),('Mutual of Omaha','Accidental Death',140,130),
('Mutual of Omaha','Accidental Death',135,125),('Mutual of Omaha','Accidental Death',130,120),
('Mutual of Omaha','Accidental Death',125,115),('Mutual of Omaha','Accidental Death',120,110),
('Mutual of Omaha','Accidental Death',115,105),('Mutual of Omaha','Accidental Death',110,100),
('Mutual of Omaha','Accidental Death',105,95),('Mutual of Omaha','Accidental Death',100,90),
('Mutual of Omaha','Accidental Death',95,85),('Mutual of Omaha','Accidental Death',90,80),
('Mutual of Omaha','Accidental Death',85,75),('Mutual of Omaha','Accidental Death',80,70),
('Mutual of Omaha','Accidental Death',75,65),('Mutual of Omaha','Accidental Death',70,60),
('Mutual of Omaha','Accidental Death',65,55),

-- Transamerica / Express Sol.
('Transamerica','Express Sol.',145,140),('Transamerica','Express Sol.',140,140),
('Transamerica','Express Sol.',135,135),('Transamerica','Express Sol.',130,130),
('Transamerica','Express Sol.',125,125),('Transamerica','Express Sol.',120,120),
('Transamerica','Express Sol.',115,115),('Transamerica','Express Sol.',110,110),
('Transamerica','Express Sol.',105,105),('Transamerica','Express Sol.',100,100),
('Transamerica','Express Sol.',95,95),('Transamerica','Express Sol.',90,90),
('Transamerica','Express Sol.',85,85),('Transamerica','Express Sol.',80,80),
('Transamerica','Express Sol.',75,75),('Transamerica','Express Sol.',70,70),
('Transamerica','Express Sol.',65,70),

-- American Amicable / Senior/Family Choice
('American Amicable','Senior/Family Choice',145,125),('American Amicable','Senior/Family Choice',140,125),
('American Amicable','Senior/Family Choice',135,120),('American Amicable','Senior/Family Choice',130,115),
('American Amicable','Senior/Family Choice',125,110),('American Amicable','Senior/Family Choice',120,105),
('American Amicable','Senior/Family Choice',115,100),('American Amicable','Senior/Family Choice',110,95),
('American Amicable','Senior/Family Choice',105,90),('American Amicable','Senior/Family Choice',100,85),
('American Amicable','Senior/Family Choice',95,80),('American Amicable','Senior/Family Choice',90,75),
('American Amicable','Senior/Family Choice',85,70),('American Amicable','Senior/Family Choice',80,65),
('American Amicable','Senior/Family Choice',75,60),('American Amicable','Senior/Family Choice',70,55),
('American Amicable','Senior/Family Choice',65,50),

-- American Amicable / Family Protector
('American Amicable','Family Protector',145,130),('American Amicable','Family Protector',140,130),
('American Amicable','Family Protector',135,125),('American Amicable','Family Protector',130,120),
('American Amicable','Family Protector',125,115),('American Amicable','Family Protector',120,110),
('American Amicable','Family Protector',115,105),('American Amicable','Family Protector',110,100),
('American Amicable','Family Protector',105,95),('American Amicable','Family Protector',100,90),
('American Amicable','Family Protector',95,85),('American Amicable','Family Protector',90,80),
('American Amicable','Family Protector',85,75),('American Amicable','Family Protector',80,70),
('American Amicable','Family Protector',75,65),('American Amicable','Family Protector',70,60),
('American Amicable','Family Protector',65,55),

-- Instabrain / Final Expense WL  (defaults to 50-69 band; also stored as aged variants below)
('Instabrain','Final Expense WL',145,127.50),('Instabrain','Final Expense WL',140,125),
('Instabrain','Final Expense WL',135,122.50),('Instabrain','Final Expense WL',130,120),
('Instabrain','Final Expense WL',125,117.50),('Instabrain','Final Expense WL',120,115),
('Instabrain','Final Expense WL',115,112.50),('Instabrain','Final Expense WL',110,110),
('Instabrain','Final Expense WL',105,107.50),('Instabrain','Final Expense WL',100,105),
('Instabrain','Final Expense WL',95,102.50),('Instabrain','Final Expense WL',90,100),
('Instabrain','Final Expense WL',85,97.50),('Instabrain','Final Expense WL',80,95),
('Instabrain','Final Expense WL',75,92.50),('Instabrain','Final Expense WL',70,90),
('Instabrain','Final Expense WL',65,90),

-- Instabrain / Final Expense WL (50-69)
('Instabrain','Final Expense WL (50-69)',145,127.50),('Instabrain','Final Expense WL (50-69)',140,125),
('Instabrain','Final Expense WL (50-69)',135,122.50),('Instabrain','Final Expense WL (50-69)',130,120),
('Instabrain','Final Expense WL (50-69)',125,117.50),('Instabrain','Final Expense WL (50-69)',120,115),
('Instabrain','Final Expense WL (50-69)',115,112.50),('Instabrain','Final Expense WL (50-69)',110,110),
('Instabrain','Final Expense WL (50-69)',105,107.50),('Instabrain','Final Expense WL (50-69)',100,105),
('Instabrain','Final Expense WL (50-69)',95,102.50),('Instabrain','Final Expense WL (50-69)',90,100),
('Instabrain','Final Expense WL (50-69)',85,97.50),('Instabrain','Final Expense WL (50-69)',80,95),
('Instabrain','Final Expense WL (50-69)',75,92.50),('Instabrain','Final Expense WL (50-69)',70,90),
('Instabrain','Final Expense WL (50-69)',65,90),

-- Instabrain / Final Expense WL (70-79)
('Instabrain','Final Expense WL (70-79)',145,102.50),('Instabrain','Final Expense WL (70-79)',140,100),
('Instabrain','Final Expense WL (70-79)',135,97.50),('Instabrain','Final Expense WL (70-79)',130,95),
('Instabrain','Final Expense WL (70-79)',125,92.50),('Instabrain','Final Expense WL (70-79)',120,90),
('Instabrain','Final Expense WL (70-79)',115,87.50),('Instabrain','Final Expense WL (70-79)',110,85),
('Instabrain','Final Expense WL (70-79)',105,82.50),('Instabrain','Final Expense WL (70-79)',100,80),
('Instabrain','Final Expense WL (70-79)',95,77.50),('Instabrain','Final Expense WL (70-79)',90,75),
('Instabrain','Final Expense WL (70-79)',85,72.50),('Instabrain','Final Expense WL (70-79)',80,70),
('Instabrain','Final Expense WL (70-79)',75,67.50),('Instabrain','Final Expense WL (70-79)',70,65),
('Instabrain','Final Expense WL (70-79)',65,65),

-- Instabrain / Final Expense WL (80+)
('Instabrain','Final Expense WL (80+)',145,87.50),('Instabrain','Final Expense WL (80+)',140,85),
('Instabrain','Final Expense WL (80+)',135,82.50),('Instabrain','Final Expense WL (80+)',130,80),
('Instabrain','Final Expense WL (80+)',125,77.50),('Instabrain','Final Expense WL (80+)',120,75),
('Instabrain','Final Expense WL (80+)',115,72.50),('Instabrain','Final Expense WL (80+)',110,70),
('Instabrain','Final Expense WL (80+)',105,67.50),('Instabrain','Final Expense WL (80+)',100,65),
('Instabrain','Final Expense WL (80+)',95,62.50),('Instabrain','Final Expense WL (80+)',90,60),
('Instabrain','Final Expense WL (80+)',85,57.50),('Instabrain','Final Expense WL (80+)',80,55),
('Instabrain','Final Expense WL (80+)',75,52.50),('Instabrain','Final Expense WL (80+)',70,50),
('Instabrain','Final Expense WL (80+)',65,50),

-- Instabrain / Guaranteed Issue WL (defaults to 50-69)
('Instabrain','Guaranteed Issue WL',145,73),('Instabrain','Guaranteed Issue WL',140,70),
('Instabrain','Guaranteed Issue WL',135,68),('Instabrain','Guaranteed Issue WL',130,65),
('Instabrain','Guaranteed Issue WL',125,63),('Instabrain','Guaranteed Issue WL',120,60),
('Instabrain','Guaranteed Issue WL',115,58),('Instabrain','Guaranteed Issue WL',110,55),
('Instabrain','Guaranteed Issue WL',105,53),('Instabrain','Guaranteed Issue WL',100,50),
('Instabrain','Guaranteed Issue WL',95,48),('Instabrain','Guaranteed Issue WL',90,45),
('Instabrain','Guaranteed Issue WL',85,43),('Instabrain','Guaranteed Issue WL',80,40),
('Instabrain','Guaranteed Issue WL',75,38),('Instabrain','Guaranteed Issue WL',70,35),
('Instabrain','Guaranteed Issue WL',65,35),

-- Instabrain / Guaranteed Issue WL (50-69)
('Instabrain','Guaranteed Issue WL (50-69)',145,73),('Instabrain','Guaranteed Issue WL (50-69)',140,70),
('Instabrain','Guaranteed Issue WL (50-69)',135,68),('Instabrain','Guaranteed Issue WL (50-69)',130,65),
('Instabrain','Guaranteed Issue WL (50-69)',125,63),('Instabrain','Guaranteed Issue WL (50-69)',120,60),
('Instabrain','Guaranteed Issue WL (50-69)',115,58),('Instabrain','Guaranteed Issue WL (50-69)',110,55),
('Instabrain','Guaranteed Issue WL (50-69)',105,53),('Instabrain','Guaranteed Issue WL (50-69)',100,50),
('Instabrain','Guaranteed Issue WL (50-69)',95,48),('Instabrain','Guaranteed Issue WL (50-69)',90,45),
('Instabrain','Guaranteed Issue WL (50-69)',85,43),('Instabrain','Guaranteed Issue WL (50-69)',80,40),
('Instabrain','Guaranteed Issue WL (50-69)',75,38),('Instabrain','Guaranteed Issue WL (50-69)',70,35),
('Instabrain','Guaranteed Issue WL (50-69)',65,35),

-- Instabrain / Guaranteed Issue WL (70-79)
('Instabrain','Guaranteed Issue WL (70-79)',145,52.50),('Instabrain','Guaranteed Issue WL (70-79)',140,50),
('Instabrain','Guaranteed Issue WL (70-79)',135,47.50),('Instabrain','Guaranteed Issue WL (70-79)',130,45),
('Instabrain','Guaranteed Issue WL (70-79)',125,42.50),('Instabrain','Guaranteed Issue WL (70-79)',120,40),
('Instabrain','Guaranteed Issue WL (70-79)',115,37.50),('Instabrain','Guaranteed Issue WL (70-79)',110,35),
('Instabrain','Guaranteed Issue WL (70-79)',105,32.50),('Instabrain','Guaranteed Issue WL (70-79)',100,30),
('Instabrain','Guaranteed Issue WL (70-79)',95,27.50),('Instabrain','Guaranteed Issue WL (70-79)',90,25),
('Instabrain','Guaranteed Issue WL (70-79)',85,22.50),('Instabrain','Guaranteed Issue WL (70-79)',80,20),
('Instabrain','Guaranteed Issue WL (70-79)',75,17.50),('Instabrain','Guaranteed Issue WL (70-79)',70,15),
('Instabrain','Guaranteed Issue WL (70-79)',65,15),

-- Instabrain / Guaranteed Issue WL (80+)
('Instabrain','Guaranteed Issue WL (80+)',145,42.50),('Instabrain','Guaranteed Issue WL (80+)',140,40),
('Instabrain','Guaranteed Issue WL (80+)',135,37.50),('Instabrain','Guaranteed Issue WL (80+)',130,35),
('Instabrain','Guaranteed Issue WL (80+)',125,32.50),('Instabrain','Guaranteed Issue WL (80+)',120,30),
('Instabrain','Guaranteed Issue WL (80+)',115,27.50),('Instabrain','Guaranteed Issue WL (80+)',110,25),
('Instabrain','Guaranteed Issue WL (80+)',105,22.50),('Instabrain','Guaranteed Issue WL (80+)',100,20),
('Instabrain','Guaranteed Issue WL (80+)',95,17.50),('Instabrain','Guaranteed Issue WL (80+)',90,15),
('Instabrain','Guaranteed Issue WL (80+)',85,12.50),('Instabrain','Guaranteed Issue WL (80+)',80,10),
('Instabrain','Guaranteed Issue WL (80+)',75,7.50),('Instabrain','Guaranteed Issue WL (80+)',70,5),
('Instabrain','Guaranteed Issue WL (80+)',65,5),

-- Instabrain / RD Senior Life Whole Life (defaults to 50-69)
('Instabrain','RD Senior Life Whole Life',145,90),('Instabrain','RD Senior Life Whole Life',140,85),
('Instabrain','RD Senior Life Whole Life',135,80),('Instabrain','RD Senior Life Whole Life',130,75),
('Instabrain','RD Senior Life Whole Life',125,70),('Instabrain','RD Senior Life Whole Life',120,65),
('Instabrain','RD Senior Life Whole Life',115,60),('Instabrain','RD Senior Life Whole Life',110,55),
('Instabrain','RD Senior Life Whole Life',105,50),('Instabrain','RD Senior Life Whole Life',100,45),
('Instabrain','RD Senior Life Whole Life',95,40),('Instabrain','RD Senior Life Whole Life',90,35),
('Instabrain','RD Senior Life Whole Life',85,30),('Instabrain','RD Senior Life Whole Life',80,25),
('Instabrain','RD Senior Life Whole Life',75,20),('Instabrain','RD Senior Life Whole Life',70,15),
('Instabrain','RD Senior Life Whole Life',65,15),

-- Instabrain / RD Senior Life Whole Life (50-69)
('Instabrain','RD Senior Life Whole Life (50-69)',145,90),('Instabrain','RD Senior Life Whole Life (50-69)',140,85),
('Instabrain','RD Senior Life Whole Life (50-69)',135,80),('Instabrain','RD Senior Life Whole Life (50-69)',130,75),
('Instabrain','RD Senior Life Whole Life (50-69)',125,70),('Instabrain','RD Senior Life Whole Life (50-69)',120,65),
('Instabrain','RD Senior Life Whole Life (50-69)',115,60),('Instabrain','RD Senior Life Whole Life (50-69)',110,55),
('Instabrain','RD Senior Life Whole Life (50-69)',105,50),('Instabrain','RD Senior Life Whole Life (50-69)',100,45),
('Instabrain','RD Senior Life Whole Life (50-69)',95,40),('Instabrain','RD Senior Life Whole Life (50-69)',90,35),
('Instabrain','RD Senior Life Whole Life (50-69)',85,30),('Instabrain','RD Senior Life Whole Life (50-69)',80,25),
('Instabrain','RD Senior Life Whole Life (50-69)',75,20),('Instabrain','RD Senior Life Whole Life (50-69)',70,15),
('Instabrain','RD Senior Life Whole Life (50-69)',65,15),

-- Instabrain / RD Senior Life Whole Life (70-79)
('Instabrain','RD Senior Life Whole Life (70-79)',145,65),('Instabrain','RD Senior Life Whole Life (70-79)',140,60),
('Instabrain','RD Senior Life Whole Life (70-79)',135,55),('Instabrain','RD Senior Life Whole Life (70-79)',130,50),
('Instabrain','RD Senior Life Whole Life (70-79)',125,45),('Instabrain','RD Senior Life Whole Life (70-79)',120,40),
('Instabrain','RD Senior Life Whole Life (70-79)',115,35),('Instabrain','RD Senior Life Whole Life (70-79)',110,30),
('Instabrain','RD Senior Life Whole Life (70-79)',105,25),('Instabrain','RD Senior Life Whole Life (70-79)',100,20),
('Instabrain','RD Senior Life Whole Life (70-79)',95,15),('Instabrain','RD Senior Life Whole Life (70-79)',90,10),
('Instabrain','RD Senior Life Whole Life (70-79)',85,5),('Instabrain','RD Senior Life Whole Life (70-79)',80,5),
('Instabrain','RD Senior Life Whole Life (70-79)',75,5),('Instabrain','RD Senior Life Whole Life (70-79)',70,5),
('Instabrain','RD Senior Life Whole Life (70-79)',65,5),

-- Instabrain / RD Senior Life Whole Life (80+)
('Instabrain','RD Senior Life Whole Life (80+)',145,40),('Instabrain','RD Senior Life Whole Life (80+)',140,35),
('Instabrain','RD Senior Life Whole Life (80+)',135,30),('Instabrain','RD Senior Life Whole Life (80+)',130,25),
('Instabrain','RD Senior Life Whole Life (80+)',125,20),('Instabrain','RD Senior Life Whole Life (80+)',120,15),
('Instabrain','RD Senior Life Whole Life (80+)',115,10),('Instabrain','RD Senior Life Whole Life (80+)',110,5),
('Instabrain','RD Senior Life Whole Life (80+)',105,5),('Instabrain','RD Senior Life Whole Life (80+)',100,5),
('Instabrain','RD Senior Life Whole Life (80+)',95,5),('Instabrain','RD Senior Life Whole Life (80+)',90,5),
('Instabrain','RD Senior Life Whole Life (80+)',85,5),('Instabrain','RD Senior Life Whole Life (80+)',80,5),
('Instabrain','RD Senior Life Whole Life (80+)',75,5),('Instabrain','RD Senior Life Whole Life (80+)',70,5),
('Instabrain','RD Senior Life Whole Life (80+)',65,5),

-- Instabrain / Accidental DB
('Instabrain','Accidental DB',145,90),('Instabrain','Accidental DB',140,85),
('Instabrain','Accidental DB',135,80),('Instabrain','Accidental DB',130,75),
('Instabrain','Accidental DB',125,70),('Instabrain','Accidental DB',120,65),
('Instabrain','Accidental DB',115,60),('Instabrain','Accidental DB',110,55),
('Instabrain','Accidental DB',105,50),('Instabrain','Accidental DB',100,45),
('Instabrain','Accidental DB',95,40),('Instabrain','Accidental DB',90,35),
('Instabrain','Accidental DB',85,30),('Instabrain','Accidental DB',80,25),
('Instabrain','Accidental DB',75,20),('Instabrain','Accidental DB',70,15),
('Instabrain','Accidental DB',65,15),

-- Instabrain / Accidental ROP Rider
('Instabrain','Accidental ROP Rider',145,55),('Instabrain','Accidental ROP Rider',140,50),
('Instabrain','Accidental ROP Rider',135,45),('Instabrain','Accidental ROP Rider',130,40),
('Instabrain','Accidental ROP Rider',125,35),('Instabrain','Accidental ROP Rider',120,30),
('Instabrain','Accidental ROP Rider',115,25),('Instabrain','Accidental ROP Rider',110,20),
('Instabrain','Accidental ROP Rider',105,15),('Instabrain','Accidental ROP Rider',100,10),
('Instabrain','Accidental ROP Rider',95,5),('Instabrain','Accidental ROP Rider',90,5),
('Instabrain','Accidental ROP Rider',85,5),('Instabrain','Accidental ROP Rider',80,5),
('Instabrain','Accidental ROP Rider',75,5),('Instabrain','Accidental ROP Rider',70,5),
('Instabrain','Accidental ROP Rider',65,5),

-- Ethos / TruStage TAWL
('Ethos','TruStage TAWL',145,120),('Ethos','TruStage TAWL',140,120),
('Ethos','TruStage TAWL',135,115),('Ethos','TruStage TAWL',130,110),
('Ethos','TruStage TAWL',125,105),('Ethos','TruStage TAWL',120,100),
('Ethos','TruStage TAWL',115,95),('Ethos','TruStage TAWL',110,90),
('Ethos','TruStage TAWL',105,85),('Ethos','TruStage TAWL',100,82.50),
('Ethos','TruStage TAWL',95,80),('Ethos','TruStage TAWL',90,77.50),
('Ethos','TruStage TAWL',85,75),('Ethos','TruStage TAWL',80,72.50),
('Ethos','TruStage TAWL',75,65),('Ethos','TruStage TAWL',70,60),
('Ethos','TruStage TAWL',65,55),

-- Ethos / TruStage GAWL
('Ethos','TruStage GAWL',145,30),('Ethos','TruStage GAWL',140,27.50),
('Ethos','TruStage GAWL',135,25),('Ethos','TruStage GAWL',130,22.50),
('Ethos','TruStage GAWL',125,20),('Ethos','TruStage GAWL',120,17.50),
('Ethos','TruStage GAWL',115,15),('Ethos','TruStage GAWL',110,12.50),
('Ethos','TruStage GAWL',105,10),('Ethos','TruStage GAWL',100,7.50),
('Ethos','TruStage GAWL',95,5),('Ethos','TruStage GAWL',90,2.50),
('Ethos','TruStage GAWL',85,2.50),('Ethos','TruStage GAWL',80,2.50),
('Ethos','TruStage GAWL',75,2.50),('Ethos','TruStage GAWL',70,2.50),
('Ethos','TruStage GAWL',65,2.50),

-- Liberty Bankers / FX (no 145)
('Liberty Bankers','FX',140,125),('Liberty Bankers','FX',135,120),('Liberty Bankers','FX',130,115),
('Liberty Bankers','FX',125,110),('Liberty Bankers','FX',120,105),('Liberty Bankers','FX',115,100),
('Liberty Bankers','FX',110,95),('Liberty Bankers','FX',105,90),('Liberty Bankers','FX',100,85),
('Liberty Bankers','FX',95,80),('Liberty Bankers','FX',90,75),('Liberty Bankers','FX',85,70),
('Liberty Bankers','FX',80,65),('Liberty Bankers','FX',75,60),('Liberty Bankers','FX',70,55),
('Liberty Bankers','FX',65,50),

-- Royal Neighbors / Royal Legacy SPWL (no 145)
('Royal Neighbors','Royal Legacy SPWL',140,16),('Royal Neighbors','Royal Legacy SPWL',135,15),
('Royal Neighbors','Royal Legacy SPWL',130,14),('Royal Neighbors','Royal Legacy SPWL',125,13),
('Royal Neighbors','Royal Legacy SPWL',120,13),('Royal Neighbors','Royal Legacy SPWL',115,13),
('Royal Neighbors','Royal Legacy SPWL',110,13),('Royal Neighbors','Royal Legacy SPWL',105,12),
('Royal Neighbors','Royal Legacy SPWL',100,11),('Royal Neighbors','Royal Legacy SPWL',95,10),
('Royal Neighbors','Royal Legacy SPWL',90,9),('Royal Neighbors','Royal Legacy SPWL',85,7),
('Royal Neighbors','Royal Legacy SPWL',80,7),('Royal Neighbors','Royal Legacy SPWL',75,7),
('Royal Neighbors','Royal Legacy SPWL',70,7),('Royal Neighbors','Royal Legacy SPWL',65,7),

-- Royal Neighbors / SI Whole Life (no 145)
('Royal Neighbors','SI Whole Life',140,125),('Royal Neighbors','SI Whole Life',135,120),
('Royal Neighbors','SI Whole Life',130,110),('Royal Neighbors','SI Whole Life',125,100),
('Royal Neighbors','SI Whole Life',120,100),('Royal Neighbors','SI Whole Life',115,100),
('Royal Neighbors','SI Whole Life',110,95),('Royal Neighbors','SI Whole Life',105,90),
('Royal Neighbors','SI Whole Life',100,85),('Royal Neighbors','SI Whole Life',95,80),
('Royal Neighbors','SI Whole Life',90,75),('Royal Neighbors','SI Whole Life',85,45),
('Royal Neighbors','SI Whole Life',80,45),('Royal Neighbors','SI Whole Life',75,45),
('Royal Neighbors','SI Whole Life',70,45),('Royal Neighbors','SI Whole Life',65,45),

-- Foresters / Planright (no 145)
('Foresters','Planright',140,120),('Foresters','Planright',135,115),('Foresters','Planright',130,110),
('Foresters','Planright',125,105),('Foresters','Planright',120,100),('Foresters','Planright',115,95),
('Foresters','Planright',110,90),('Foresters','Planright',105,85),('Foresters','Planright',100,80),
('Foresters','Planright',95,75),('Foresters','Planright',90,70),('Foresters','Planright',85,65),
('Foresters','Planright',80,60),('Foresters','Planright',75,60),('Foresters','Planright',70,60),
('Foresters','Planright',65,60)

on conflict (carrier, product, ffl_level) do update set rate = excluded.rate;

-- ─── TERM LIFE ───────────────────────────────────────────────────────────────

insert into ffl_rate_schedules (carrier, product, ffl_level, rate) values
-- Americo / HMS 125
('Americo','HMS 125',145,145),('Americo','HMS 125',140,140),('Americo','HMS 125',135,135),
('Americo','HMS 125',130,130),('Americo','HMS 125',125,125),('Americo','HMS 125',120,120),
('Americo','HMS 125',115,115),('Americo','HMS 125',110,110),('Americo','HMS 125',105,105),
('Americo','HMS 125',100,100),('Americo','HMS 125',95,95),('Americo','HMS 125',90,90),
('Americo','HMS 125',85,85),('Americo','HMS 125',80,80),('Americo','HMS 125',75,75),
('Americo','HMS 125',70,70),('Americo','HMS 125',65,65),

-- Mutual of Omaha / TLE (Express)
('Mutual of Omaha','TLE (Express)',145,145),('Mutual of Omaha','TLE (Express)',140,140),
('Mutual of Omaha','TLE (Express)',135,135),('Mutual of Omaha','TLE (Express)',130,130),
('Mutual of Omaha','TLE (Express)',125,125),('Mutual of Omaha','TLE (Express)',120,120),
('Mutual of Omaha','TLE (Express)',115,115),('Mutual of Omaha','TLE (Express)',110,110),
('Mutual of Omaha','TLE (Express)',105,105),('Mutual of Omaha','TLE (Express)',100,100),
('Mutual of Omaha','TLE (Express)',95,95),('Mutual of Omaha','TLE (Express)',90,90),
('Mutual of Omaha','TLE (Express)',85,85),('Mutual of Omaha','TLE (Express)',80,80),
('Mutual of Omaha','TLE (Express)',75,75),('Mutual of Omaha','TLE (Express)',70,70),
('Mutual of Omaha','TLE (Express)',65,65),

-- Mutual of Omaha / TLA (Answers)
('Mutual of Omaha','TLA (Answers)',145,110),('Mutual of Omaha','TLA (Answers)',140,110),
('Mutual of Omaha','TLA (Answers)',135,105),('Mutual of Omaha','TLA (Answers)',130,100),
('Mutual of Omaha','TLA (Answers)',125,95),('Mutual of Omaha','TLA (Answers)',120,90),
('Mutual of Omaha','TLA (Answers)',115,85),('Mutual of Omaha','TLA (Answers)',110,80),
('Mutual of Omaha','TLA (Answers)',105,75),('Mutual of Omaha','TLA (Answers)',100,70),
('Mutual of Omaha','TLA (Answers)',95,65),('Mutual of Omaha','TLA (Answers)',90,60),
('Mutual of Omaha','TLA (Answers)',85,55),('Mutual of Omaha','TLA (Answers)',80,50),
('Mutual of Omaha','TLA (Answers)',75,45),('Mutual of Omaha','TLA (Answers)',70,40),
('Mutual of Omaha','TLA (Answers)',65,35),

-- American Amicable / EZ Term
('American Amicable','EZ Term',145,100),('American Amicable','EZ Term',140,100),
('American Amicable','EZ Term',135,95),('American Amicable','EZ Term',130,90),
('American Amicable','EZ Term',125,85),('American Amicable','EZ Term',120,80),
('American Amicable','EZ Term',115,75),('American Amicable','EZ Term',110,70),
('American Amicable','EZ Term',105,65),('American Amicable','EZ Term',100,60),
('American Amicable','EZ Term',95,55),('American Amicable','EZ Term',90,50),
('American Amicable','EZ Term',85,45),('American Amicable','EZ Term',80,40),
('American Amicable','EZ Term',75,35),('American Amicable','EZ Term',70,30),
('American Amicable','EZ Term',65,25),

-- American Amicable / Home Protector
('American Amicable','Home Protector',145,145),('American Amicable','Home Protector',140,140),
('American Amicable','Home Protector',135,135),('American Amicable','Home Protector',130,130),
('American Amicable','Home Protector',125,125),('American Amicable','Home Protector',120,120),
('American Amicable','Home Protector',115,115),('American Amicable','Home Protector',110,110),
('American Amicable','Home Protector',105,105),('American Amicable','Home Protector',100,100),
('American Amicable','Home Protector',95,95),('American Amicable','Home Protector',90,90),
('American Amicable','Home Protector',85,85),('American Amicable','Home Protector',80,80),
('American Amicable','Home Protector',75,75),('American Amicable','Home Protector',70,70),
('American Amicable','Home Protector',65,65),

-- American Amicable / OBA (Group Level Term)
('American Amicable','OBA (Group Level Term)',145,100),('American Amicable','OBA (Group Level Term)',140,100),
('American Amicable','OBA (Group Level Term)',135,95),('American Amicable','OBA (Group Level Term)',130,90),
('American Amicable','OBA (Group Level Term)',125,85),('American Amicable','OBA (Group Level Term)',120,80),
('American Amicable','OBA (Group Level Term)',115,75),('American Amicable','OBA (Group Level Term)',110,70),
('American Amicable','OBA (Group Level Term)',105,65),('American Amicable','OBA (Group Level Term)',100,60),
('American Amicable','OBA (Group Level Term)',95,55),('American Amicable','OBA (Group Level Term)',90,50),
('American Amicable','OBA (Group Level Term)',85,45),('American Amicable','OBA (Group Level Term)',80,40),
('American Amicable','OBA (Group Level Term)',75,35),('American Amicable','OBA (Group Level Term)',70,30),
('American Amicable','OBA (Group Level Term)',65,30),

-- American Amicable / Term Made Simple
('American Amicable','Term Made Simple',145,130),('American Amicable','Term Made Simple',140,130),
('American Amicable','Term Made Simple',135,125),('American Amicable','Term Made Simple',130,120),
('American Amicable','Term Made Simple',125,115),('American Amicable','Term Made Simple',120,110),
('American Amicable','Term Made Simple',115,105),('American Amicable','Term Made Simple',110,100),
('American Amicable','Term Made Simple',105,95),('American Amicable','Term Made Simple',100,90),
('American Amicable','Term Made Simple',95,85),('American Amicable','Term Made Simple',90,80),
('American Amicable','Term Made Simple',85,75),('American Amicable','Term Made Simple',80,70),
('American Amicable','Term Made Simple',75,65),('American Amicable','Term Made Simple',70,60),
('American Amicable','Term Made Simple',65,55),

-- Instabrain / Term w/ LB (10yr)
('Instabrain','Term w/ LB (10yr)',145,120),('Instabrain','Term w/ LB (10yr)',140,115),
('Instabrain','Term w/ LB (10yr)',135,110),('Instabrain','Term w/ LB (10yr)',130,105),
('Instabrain','Term w/ LB (10yr)',125,100),('Instabrain','Term w/ LB (10yr)',120,95),
('Instabrain','Term w/ LB (10yr)',115,90),('Instabrain','Term w/ LB (10yr)',110,85),
('Instabrain','Term w/ LB (10yr)',105,80),('Instabrain','Term w/ LB (10yr)',100,75),
('Instabrain','Term w/ LB (10yr)',95,70),('Instabrain','Term w/ LB (10yr)',90,65),
('Instabrain','Term w/ LB (10yr)',85,60),('Instabrain','Term w/ LB (10yr)',80,55),
('Instabrain','Term w/ LB (10yr)',75,50),('Instabrain','Term w/ LB (10yr)',70,45),
('Instabrain','Term w/ LB (10yr)',65,45),

-- Instabrain / Term w/ LB (15yr)
('Instabrain','Term w/ LB (15yr)',145,125),('Instabrain','Term w/ LB (15yr)',140,120),
('Instabrain','Term w/ LB (15yr)',135,115),('Instabrain','Term w/ LB (15yr)',130,110),
('Instabrain','Term w/ LB (15yr)',125,105),('Instabrain','Term w/ LB (15yr)',120,100),
('Instabrain','Term w/ LB (15yr)',115,95),('Instabrain','Term w/ LB (15yr)',110,90),
('Instabrain','Term w/ LB (15yr)',105,85),('Instabrain','Term w/ LB (15yr)',100,80),
('Instabrain','Term w/ LB (15yr)',95,75),('Instabrain','Term w/ LB (15yr)',90,70),
('Instabrain','Term w/ LB (15yr)',85,65),('Instabrain','Term w/ LB (15yr)',80,60),
('Instabrain','Term w/ LB (15yr)',75,55),('Instabrain','Term w/ LB (15yr)',70,50),
('Instabrain','Term w/ LB (15yr)',65,50),

-- Instabrain / Term w/ LB (20yr)
('Instabrain','Term w/ LB (20yr)',145,130),('Instabrain','Term w/ LB (20yr)',140,125),
('Instabrain','Term w/ LB (20yr)',135,120),('Instabrain','Term w/ LB (20yr)',130,115),
('Instabrain','Term w/ LB (20yr)',125,110),('Instabrain','Term w/ LB (20yr)',120,105),
('Instabrain','Term w/ LB (20yr)',115,100),('Instabrain','Term w/ LB (20yr)',110,95),
('Instabrain','Term w/ LB (20yr)',105,90),('Instabrain','Term w/ LB (20yr)',100,85),
('Instabrain','Term w/ LB (20yr)',95,80),('Instabrain','Term w/ LB (20yr)',90,75),
('Instabrain','Term w/ LB (20yr)',85,70),('Instabrain','Term w/ LB (20yr)',80,65),
('Instabrain','Term w/ LB (20yr)',75,60),('Instabrain','Term w/ LB (20yr)',70,55),
('Instabrain','Term w/ LB (20yr)',65,55),

-- Instabrain / Term w/ LB (30yr)
('Instabrain','Term w/ LB (30yr)',145,130),('Instabrain','Term w/ LB (30yr)',140,125),
('Instabrain','Term w/ LB (30yr)',135,120),('Instabrain','Term w/ LB (30yr)',130,115),
('Instabrain','Term w/ LB (30yr)',125,110),('Instabrain','Term w/ LB (30yr)',120,105),
('Instabrain','Term w/ LB (30yr)',115,100),('Instabrain','Term w/ LB (30yr)',110,95),
('Instabrain','Term w/ LB (30yr)',105,90),('Instabrain','Term w/ LB (30yr)',100,85),
('Instabrain','Term w/ LB (30yr)',95,80),('Instabrain','Term w/ LB (30yr)',90,75),
('Instabrain','Term w/ LB (30yr)',85,70),('Instabrain','Term w/ LB (30yr)',80,65),
('Instabrain','Term w/ LB (30yr)',75,60),('Instabrain','Term w/ LB (30yr)',70,55),
('Instabrain','Term w/ LB (30yr)',65,55),

-- Instabrain / Pure Term (10yr)
('Instabrain','Pure Term (10yr)',145,120),('Instabrain','Pure Term (10yr)',140,115),
('Instabrain','Pure Term (10yr)',135,110),('Instabrain','Pure Term (10yr)',130,105),
('Instabrain','Pure Term (10yr)',125,100),('Instabrain','Pure Term (10yr)',120,95),
('Instabrain','Pure Term (10yr)',115,90),('Instabrain','Pure Term (10yr)',110,85),
('Instabrain','Pure Term (10yr)',105,80),('Instabrain','Pure Term (10yr)',100,75),
('Instabrain','Pure Term (10yr)',95,70),('Instabrain','Pure Term (10yr)',90,65),
('Instabrain','Pure Term (10yr)',85,60),('Instabrain','Pure Term (10yr)',80,55),
('Instabrain','Pure Term (10yr)',75,50),('Instabrain','Pure Term (10yr)',70,45),
('Instabrain','Pure Term (10yr)',65,45),

-- Instabrain / Pure Term (15yr)
('Instabrain','Pure Term (15yr)',145,125),('Instabrain','Pure Term (15yr)',140,120),
('Instabrain','Pure Term (15yr)',135,115),('Instabrain','Pure Term (15yr)',130,110),
('Instabrain','Pure Term (15yr)',125,105),('Instabrain','Pure Term (15yr)',120,100),
('Instabrain','Pure Term (15yr)',115,95),('Instabrain','Pure Term (15yr)',110,90),
('Instabrain','Pure Term (15yr)',105,85),('Instabrain','Pure Term (15yr)',100,80),
('Instabrain','Pure Term (15yr)',95,75),('Instabrain','Pure Term (15yr)',90,70),
('Instabrain','Pure Term (15yr)',85,65),('Instabrain','Pure Term (15yr)',80,60),
('Instabrain','Pure Term (15yr)',75,55),('Instabrain','Pure Term (15yr)',70,50),
('Instabrain','Pure Term (15yr)',65,50),

-- Instabrain / Pure Term (20yr)
('Instabrain','Pure Term (20yr)',145,130),('Instabrain','Pure Term (20yr)',140,125),
('Instabrain','Pure Term (20yr)',135,120),('Instabrain','Pure Term (20yr)',130,115),
('Instabrain','Pure Term (20yr)',125,110),('Instabrain','Pure Term (20yr)',120,105),
('Instabrain','Pure Term (20yr)',115,100),('Instabrain','Pure Term (20yr)',110,95),
('Instabrain','Pure Term (20yr)',105,90),('Instabrain','Pure Term (20yr)',100,85),
('Instabrain','Pure Term (20yr)',95,80),('Instabrain','Pure Term (20yr)',90,75),
('Instabrain','Pure Term (20yr)',85,70),('Instabrain','Pure Term (20yr)',80,65),
('Instabrain','Pure Term (20yr)',75,60),('Instabrain','Pure Term (20yr)',70,55),
('Instabrain','Pure Term (20yr)',65,55),

-- Instabrain / Pure Term (30yr)
('Instabrain','Pure Term (30yr)',145,130),('Instabrain','Pure Term (30yr)',140,125),
('Instabrain','Pure Term (30yr)',135,120),('Instabrain','Pure Term (30yr)',130,115),
('Instabrain','Pure Term (30yr)',125,110),('Instabrain','Pure Term (30yr)',120,105),
('Instabrain','Pure Term (30yr)',115,100),('Instabrain','Pure Term (30yr)',110,95),
('Instabrain','Pure Term (30yr)',105,90),('Instabrain','Pure Term (30yr)',100,85),
('Instabrain','Pure Term (30yr)',95,80),('Instabrain','Pure Term (30yr)',90,75),
('Instabrain','Pure Term (30yr)',85,70),('Instabrain','Pure Term (30yr)',80,65),
('Instabrain','Pure Term (30yr)',75,60),('Instabrain','Pure Term (30yr)',70,55),
('Instabrain','Pure Term (30yr)',65,55),

-- Instabrain / RD Senior Life Term (defaults to 50-69)
('Instabrain','RD Senior Life Term',145,90),('Instabrain','RD Senior Life Term',140,85),
('Instabrain','RD Senior Life Term',135,80),('Instabrain','RD Senior Life Term',130,75),
('Instabrain','RD Senior Life Term',125,70),('Instabrain','RD Senior Life Term',120,65),
('Instabrain','RD Senior Life Term',115,60),('Instabrain','RD Senior Life Term',110,55),
('Instabrain','RD Senior Life Term',105,50),('Instabrain','RD Senior Life Term',100,45),
('Instabrain','RD Senior Life Term',95,40),('Instabrain','RD Senior Life Term',90,35),
('Instabrain','RD Senior Life Term',85,30),('Instabrain','RD Senior Life Term',80,25),
('Instabrain','RD Senior Life Term',75,20),('Instabrain','RD Senior Life Term',70,15),
('Instabrain','RD Senior Life Term',65,15),

-- Instabrain / RD Senior Life Term (50-69)
('Instabrain','RD Senior Life Term (50-69)',145,90),('Instabrain','RD Senior Life Term (50-69)',140,85),
('Instabrain','RD Senior Life Term (50-69)',135,80),('Instabrain','RD Senior Life Term (50-69)',130,75),
('Instabrain','RD Senior Life Term (50-69)',125,70),('Instabrain','RD Senior Life Term (50-69)',120,65),
('Instabrain','RD Senior Life Term (50-69)',115,60),('Instabrain','RD Senior Life Term (50-69)',110,55),
('Instabrain','RD Senior Life Term (50-69)',105,50),('Instabrain','RD Senior Life Term (50-69)',100,45),
('Instabrain','RD Senior Life Term (50-69)',95,40),('Instabrain','RD Senior Life Term (50-69)',90,35),
('Instabrain','RD Senior Life Term (50-69)',85,30),('Instabrain','RD Senior Life Term (50-69)',80,25),
('Instabrain','RD Senior Life Term (50-69)',75,20),('Instabrain','RD Senior Life Term (50-69)',70,15),
('Instabrain','RD Senior Life Term (50-69)',65,15),

-- Instabrain / RD Senior Life Term (70-79)
('Instabrain','RD Senior Life Term (70-79)',145,65),('Instabrain','RD Senior Life Term (70-79)',140,60),
('Instabrain','RD Senior Life Term (70-79)',135,55),('Instabrain','RD Senior Life Term (70-79)',130,50),
('Instabrain','RD Senior Life Term (70-79)',125,45),('Instabrain','RD Senior Life Term (70-79)',120,40),
('Instabrain','RD Senior Life Term (70-79)',115,35),('Instabrain','RD Senior Life Term (70-79)',110,30),
('Instabrain','RD Senior Life Term (70-79)',105,25),('Instabrain','RD Senior Life Term (70-79)',100,20),
('Instabrain','RD Senior Life Term (70-79)',95,15),('Instabrain','RD Senior Life Term (70-79)',90,10),
('Instabrain','RD Senior Life Term (70-79)',85,5),('Instabrain','RD Senior Life Term (70-79)',80,5),
('Instabrain','RD Senior Life Term (70-79)',75,5),('Instabrain','RD Senior Life Term (70-79)',70,5),
('Instabrain','RD Senior Life Term (70-79)',65,5),

-- United Home Life / Term (no 145)
('United Home Life','Term',140,110),('United Home Life','Term',135,105),
('United Home Life','Term',130,100),('United Home Life','Term',125,95),
('United Home Life','Term',120,90),('United Home Life','Term',115,85),
('United Home Life','Term',110,80),('United Home Life','Term',105,75),
('United Home Life','Term',100,70),('United Home Life','Term',95,65),
('United Home Life','Term',90,60),('United Home Life','Term',85,55),
('United Home Life','Term',80,50),('United Home Life','Term',75,45),
('United Home Life','Term',70,45),('United Home Life','Term',65,45),

-- Royal Neighbors / Term (no 145)
('Royal Neighbors','Term',140,120),('Royal Neighbors','Term',135,115),
('Royal Neighbors','Term',130,110),('Royal Neighbors','Term',125,100),
('Royal Neighbors','Term',120,100),('Royal Neighbors','Term',115,100),
('Royal Neighbors','Term',110,95),('Royal Neighbors','Term',105,90),
('Royal Neighbors','Term',100,85),('Royal Neighbors','Term',95,80),
('Royal Neighbors','Term',90,75),('Royal Neighbors','Term',85,50),
('Royal Neighbors','Term',80,50),('Royal Neighbors','Term',75,50),
('Royal Neighbors','Term',70,50),('Royal Neighbors','Term',65,50),

-- Foresters / Strong Foundation (no 145)
('Foresters','Strong Foundation',140,120),('Foresters','Strong Foundation',135,115),
('Foresters','Strong Foundation',130,110),('Foresters','Strong Foundation',125,105),
('Foresters','Strong Foundation',120,100),('Foresters','Strong Foundation',115,95),
('Foresters','Strong Foundation',110,90),('Foresters','Strong Foundation',105,85),
('Foresters','Strong Foundation',100,80),('Foresters','Strong Foundation',95,75),
('Foresters','Strong Foundation',90,70),('Foresters','Strong Foundation',85,65),
('Foresters','Strong Foundation',80,60),('Foresters','Strong Foundation',75,55),
('Foresters','Strong Foundation',70,50),('Foresters','Strong Foundation',65,45),

-- Ethos / LGA Prime
('Ethos','LGA Prime',145,120),('Ethos','LGA Prime',140,117.50),('Ethos','LGA Prime',135,115),
('Ethos','LGA Prime',130,112.50),('Ethos','LGA Prime',125,110),('Ethos','LGA Prime',120,107.50),
('Ethos','LGA Prime',115,105),('Ethos','LGA Prime',110,102.50),('Ethos','LGA Prime',105,100),
('Ethos','LGA Prime',100,97.50),('Ethos','LGA Prime',95,95),('Ethos','LGA Prime',90,92.50),
('Ethos','LGA Prime',85,90),('Ethos','LGA Prime',80,87.50),('Ethos','LGA Prime',75,85),
('Ethos','LGA Prime',70,82.50),('Ethos','LGA Prime',65,80),

-- Ethos / TruStage SITL
('Ethos','TruStage SITL',145,120),('Ethos','TruStage SITL',140,115),('Ethos','TruStage SITL',135,110),
('Ethos','TruStage SITL',130,105),('Ethos','TruStage SITL',125,100),('Ethos','TruStage SITL',120,95),
('Ethos','TruStage SITL',115,90),('Ethos','TruStage SITL',110,85),('Ethos','TruStage SITL',105,80),
('Ethos','TruStage SITL',100,75),('Ethos','TruStage SITL',95,70),('Ethos','TruStage SITL',90,65),
('Ethos','TruStage SITL',85,60),('Ethos','TruStage SITL',80,55),('Ethos','TruStage SITL',75,50),
('Ethos','TruStage SITL',70,50),('Ethos','TruStage SITL',65,50),

-- Ethos / Ameritas SI Term
('Ethos','Ameritas SI Term',145,120),('Ethos','Ameritas SI Term',140,117.50),
('Ethos','Ameritas SI Term',135,115),('Ethos','Ameritas SI Term',130,112.50),
('Ethos','Ameritas SI Term',125,110),('Ethos','Ameritas SI Term',120,107.50),
('Ethos','Ameritas SI Term',115,105),('Ethos','Ameritas SI Term',110,102.50),
('Ethos','Ameritas SI Term',105,100),('Ethos','Ameritas SI Term',100,97.50),
('Ethos','Ameritas SI Term',95,95),('Ethos','Ameritas SI Term',90,92.50),
('Ethos','Ameritas SI Term',85,90),('Ethos','Ameritas SI Term',80,87.50),
('Ethos','Ameritas SI Term',75,85),('Ethos','Ameritas SI Term',70,82.50),
('Ethos','Ameritas SI Term',65,80),

-- Ethos / JH ROP
('Ethos','JH ROP',145,145),('Ethos','JH ROP',140,145),('Ethos','JH ROP',135,135),
('Ethos','JH ROP',130,130),('Ethos','JH ROP',125,125),('Ethos','JH ROP',120,115),
('Ethos','JH ROP',115,105),('Ethos','JH ROP',110,100),('Ethos','JH ROP',105,95),
('Ethos','JH ROP',100,90),('Ethos','JH ROP',95,85),('Ethos','JH ROP',90,80),
('Ethos','JH ROP',85,75),('Ethos','JH ROP',80,70),('Ethos','JH ROP',75,65),
('Ethos','JH ROP',70,60),('Ethos','JH ROP',65,55),

-- NLG / 10/15 YR Term
('NLG','10/15 YR Term',145,92),('NLG','10/15 YR Term',140,92),('NLG','10/15 YR Term',135,88),
('NLG','10/15 YR Term',130,83),('NLG','10/15 YR Term',125,80),('NLG','10/15 YR Term',120,75),
('NLG','10/15 YR Term',115,71),('NLG','10/15 YR Term',110,67),('NLG','10/15 YR Term',105,62),
('NLG','10/15 YR Term',100,58),('NLG','10/15 YR Term',95,55),('NLG','10/15 YR Term',90,50),
('NLG','10/15 YR Term',85,45),('NLG','10/15 YR Term',80,42),('NLG','10/15 YR Term',75,38),
('NLG','10/15 YR Term',70,33),('NLG','10/15 YR Term',65,33),

-- NLG / 20/30 YR Term
('NLG','20/30 YR Term',145,110),('NLG','20/30 YR Term',140,110),('NLG','20/30 YR Term',135,105),
('NLG','20/30 YR Term',130,100),('NLG','20/30 YR Term',125,95),('NLG','20/30 YR Term',120,90),
('NLG','20/30 YR Term',115,85),('NLG','20/30 YR Term',110,80),('NLG','20/30 YR Term',105,75),
('NLG','20/30 YR Term',100,70),('NLG','20/30 YR Term',95,65),('NLG','20/30 YR Term',90,60),
('NLG','20/30 YR Term',85,55),('NLG','20/30 YR Term',80,50),('NLG','20/30 YR Term',75,45),
('NLG','20/30 YR Term',70,40),('NLG','20/30 YR Term',65,40)

on conflict (carrier, product, ffl_level) do update set rate = excluded.rate;

-- ─── IUL / SRS ───────────────────────────────────────────────────────────────

insert into ffl_rate_schedules (carrier, product, ffl_level, rate) values
-- Americo / Instant Decision
('Americo','Instant Decision',145,130),('Americo','Instant Decision',140,125),
('Americo','Instant Decision',135,120),('Americo','Instant Decision',130,115),
('Americo','Instant Decision',125,110),('Americo','Instant Decision',120,105),
('Americo','Instant Decision',115,100),('Americo','Instant Decision',110,95),
('Americo','Instant Decision',105,90),('Americo','Instant Decision',100,85),
('Americo','Instant Decision',95,80),('Americo','Instant Decision',90,75),
('Americo','Instant Decision',85,70),('Americo','Instant Decision',80,65),
('Americo','Instant Decision',75,60),('Americo','Instant Decision',70,55),
('Americo','Instant Decision',65,50),

-- NLG / Flex Life IUL
('NLG','Flex Life IUL',145,110),('NLG','Flex Life IUL',140,110),('NLG','Flex Life IUL',135,105),
('NLG','Flex Life IUL',130,100),('NLG','Flex Life IUL',125,95),('NLG','Flex Life IUL',120,90),
('NLG','Flex Life IUL',115,85),('NLG','Flex Life IUL',110,80),('NLG','Flex Life IUL',105,75),
('NLG','Flex Life IUL',100,70),('NLG','Flex Life IUL',95,65),('NLG','Flex Life IUL',90,60),
('NLG','Flex Life IUL',85,55),('NLG','Flex Life IUL',80,50),('NLG','Flex Life IUL',75,45),
('NLG','Flex Life IUL',70,40),('NLG','Flex Life IUL',65,40),

-- NLG / Summit Life IUL
('NLG','Summit Life IUL',145,110),('NLG','Summit Life IUL',140,110),('NLG','Summit Life IUL',135,105),
('NLG','Summit Life IUL',130,100),('NLG','Summit Life IUL',125,95),('NLG','Summit Life IUL',120,90),
('NLG','Summit Life IUL',115,85),('NLG','Summit Life IUL',110,80),('NLG','Summit Life IUL',105,75),
('NLG','Summit Life IUL',100,70),('NLG','Summit Life IUL',95,65),('NLG','Summit Life IUL',90,60),
('NLG','Summit Life IUL',85,55),('NLG','Summit Life IUL',80,50),('NLG','Summit Life IUL',75,45),
('NLG','Summit Life IUL',70,40),('NLG','Summit Life IUL',65,40),

-- F&G / Pathsetter (Juvenile)
('F&G','Pathsetter (Juvenile)',145,95),('F&G','Pathsetter (Juvenile)',140,95),
('F&G','Pathsetter (Juvenile)',135,90),('F&G','Pathsetter (Juvenile)',130,87.50),
('F&G','Pathsetter (Juvenile)',125,85),('F&G','Pathsetter (Juvenile)',120,82.50),
('F&G','Pathsetter (Juvenile)',115,80),('F&G','Pathsetter (Juvenile)',110,77.50),
('F&G','Pathsetter (Juvenile)',105,75),('F&G','Pathsetter (Juvenile)',100,72.50),
('F&G','Pathsetter (Juvenile)',95,70),('F&G','Pathsetter (Juvenile)',90,67.50),
('F&G','Pathsetter (Juvenile)',85,65),('F&G','Pathsetter (Juvenile)',80,62.50),
('F&G','Pathsetter (Juvenile)',75,60),('F&G','Pathsetter (Juvenile)',70,55),
('F&G','Pathsetter (Juvenile)',65,50),

-- F&G / Pathsetter
('F&G','Pathsetter',145,130),('F&G','Pathsetter',140,130),('F&G','Pathsetter',135,125),
('F&G','Pathsetter',130,120),('F&G','Pathsetter',125,115),('F&G','Pathsetter',120,110),
('F&G','Pathsetter',115,105),('F&G','Pathsetter',110,100),('F&G','Pathsetter',105,95),
('F&G','Pathsetter',100,90),('F&G','Pathsetter',95,85),('F&G','Pathsetter',90,80),
('F&G','Pathsetter',85,75),('F&G','Pathsetter',80,70),('F&G','Pathsetter',75,65),
('F&G','Pathsetter',70,60),('F&G','Pathsetter',65,55),

-- F&G / Everlast (Juvenile)
('F&G','Everlast (Juvenile)',145,95),('F&G','Everlast (Juvenile)',140,95),
('F&G','Everlast (Juvenile)',135,90),('F&G','Everlast (Juvenile)',130,87.50),
('F&G','Everlast (Juvenile)',125,85),('F&G','Everlast (Juvenile)',120,82.50),
('F&G','Everlast (Juvenile)',115,80),('F&G','Everlast (Juvenile)',110,77.50),
('F&G','Everlast (Juvenile)',105,75),('F&G','Everlast (Juvenile)',100,72.50),
('F&G','Everlast (Juvenile)',95,70),('F&G','Everlast (Juvenile)',90,67.50),
('F&G','Everlast (Juvenile)',85,65),('F&G','Everlast (Juvenile)',80,62.50),
('F&G','Everlast (Juvenile)',75,60),('F&G','Everlast (Juvenile)',70,55),
('F&G','Everlast (Juvenile)',65,50),

-- F&G / Everlast
('F&G','Everlast',145,125),('F&G','Everlast',140,125),('F&G','Everlast',135,120),
('F&G','Everlast',130,115),('F&G','Everlast',125,110),('F&G','Everlast',120,105),
('F&G','Everlast',115,100),('F&G','Everlast',110,95),('F&G','Everlast',105,90),
('F&G','Everlast',100,85),('F&G','Everlast',95,80),('F&G','Everlast',90,75),
('F&G','Everlast',85,70),('F&G','Everlast',80,65),('F&G','Everlast',75,60),
('F&G','Everlast',70,55),('F&G','Everlast',65,50),

-- Mutual of Omaha / UL
('Mutual of Omaha','UL',145,125),('Mutual of Omaha','UL',140,125),('Mutual of Omaha','UL',135,120),
('Mutual of Omaha','UL',130,115),('Mutual of Omaha','UL',125,110),('Mutual of Omaha','UL',120,105),
('Mutual of Omaha','UL',115,100),('Mutual of Omaha','UL',110,95),('Mutual of Omaha','UL',105,90),
('Mutual of Omaha','UL',100,85),('Mutual of Omaha','UL',95,80),('Mutual of Omaha','UL',90,75),
('Mutual of Omaha','UL',85,70),('Mutual of Omaha','UL',80,65),('Mutual of Omaha','UL',75,60),
('Mutual of Omaha','UL',70,55),('Mutual of Omaha','UL',65,50),

-- Mutual of Omaha / IULE
('Mutual of Omaha','IULE',145,130),('Mutual of Omaha','IULE',140,130),('Mutual of Omaha','IULE',135,125),
('Mutual of Omaha','IULE',130,120),('Mutual of Omaha','IULE',125,115),('Mutual of Omaha','IULE',120,110),
('Mutual of Omaha','IULE',115,105),('Mutual of Omaha','IULE',110,100),('Mutual of Omaha','IULE',105,95),
('Mutual of Omaha','IULE',100,90),('Mutual of Omaha','IULE',95,85),('Mutual of Omaha','IULE',90,80),
('Mutual of Omaha','IULE',85,75),('Mutual of Omaha','IULE',80,70),('Mutual of Omaha','IULE',75,65),
('Mutual of Omaha','IULE',70,60),('Mutual of Omaha','IULE',65,55),

-- Transamerica / IUL
('Transamerica','IUL',145,120),('Transamerica','IUL',140,120),('Transamerica','IUL',135,115),
('Transamerica','IUL',130,110),('Transamerica','IUL',125,105),('Transamerica','IUL',120,100),
('Transamerica','IUL',115,95),('Transamerica','IUL',110,90),('Transamerica','IUL',105,80),
('Transamerica','IUL',100,75),('Transamerica','IUL',95,70),('Transamerica','IUL',90,60),
('Transamerica','IUL',85,55),('Transamerica','IUL',80,50),('Transamerica','IUL',75,45),
('Transamerica','IUL',70,40),('Transamerica','IUL',65,40),

-- American Amicable / Secure Life
('American Amicable','Secure Life',145,140),('American Amicable','Secure Life',140,140),
('American Amicable','Secure Life',135,135),('American Amicable','Secure Life',130,130),
('American Amicable','Secure Life',125,125),('American Amicable','Secure Life',120,120),
('American Amicable','Secure Life',115,115),('American Amicable','Secure Life',110,110),
('American Amicable','Secure Life',105,105),('American Amicable','Secure Life',100,100),
('American Amicable','Secure Life',95,95),('American Amicable','Secure Life',90,90),
('American Amicable','Secure Life',85,85),('American Amicable','Secure Life',80,80),
('American Amicable','Secure Life',75,75),('American Amicable','Secure Life',70,70),
('American Amicable','Secure Life',65,65),

-- American Amicable / XUL
('American Amicable','XUL',145,105),('American Amicable','XUL',140,105),
('American Amicable','XUL',135,100),('American Amicable','XUL',130,95),
('American Amicable','XUL',125,90),('American Amicable','XUL',120,85),
('American Amicable','XUL',115,80),('American Amicable','XUL',110,75),
('American Amicable','XUL',105,70),('American Amicable','XUL',100,65),
('American Amicable','XUL',95,60),('American Amicable','XUL',90,55),
('American Amicable','XUL',85,50),('American Amicable','XUL',80,45),
('American Amicable','XUL',75,45),('American Amicable','XUL',70,45),
('American Amicable','XUL',65,45),

-- Ethos / Ameritas IUL
('Ethos','Ameritas IUL',145,125),('Ethos','Ameritas IUL',140,120),('Ethos','Ameritas IUL',135,115),
('Ethos','Ameritas IUL',130,110),('Ethos','Ameritas IUL',125,105),('Ethos','Ameritas IUL',120,100),
('Ethos','Ameritas IUL',115,95),('Ethos','Ameritas IUL',110,90),('Ethos','Ameritas IUL',105,85),
('Ethos','Ameritas IUL',100,80),('Ethos','Ameritas IUL',95,75),('Ethos','Ameritas IUL',90,70),
('Ethos','Ameritas IUL',85,65),('Ethos','Ameritas IUL',80,60),('Ethos','Ameritas IUL',75,55),
('Ethos','Ameritas IUL',70,50),('Ethos','Ameritas IUL',65,45),

-- United Home Life / FX (no 145)
('United Home Life','FX',140,110),('United Home Life','FX',135,105),
('United Home Life','FX',130,100),('United Home Life','FX',125,95),
('United Home Life','FX',120,90),('United Home Life','FX',115,85),
('United Home Life','FX',110,80),('United Home Life','FX',105,75),
('United Home Life','FX',100,70),('United Home Life','FX',95,65),
('United Home Life','FX',90,60),('United Home Life','FX',85,55),
('United Home Life','FX',80,50),('United Home Life','FX',75,45),
('United Home Life','FX',70,45),('United Home Life','FX',65,45),

-- United Home Life / GIWL (no 145)
('United Home Life','GIWL',140,70),('United Home Life','GIWL',135,65),
('United Home Life','GIWL',130,60),('United Home Life','GIWL',125,55),
('United Home Life','GIWL',120,50),('United Home Life','GIWL',115,45),
('United Home Life','GIWL',110,40),('United Home Life','GIWL',105,35),
('United Home Life','GIWL',100,30),('United Home Life','GIWL',95,25),
('United Home Life','GIWL',90,25),('United Home Life','GIWL',85,25),
('United Home Life','GIWL',80,25),('United Home Life','GIWL',75,25),
('United Home Life','GIWL',70,25),('United Home Life','GIWL',65,25),

-- United Home Life / WL (no 145)
('United Home Life','WL',140,120),('United Home Life','WL',135,115),
('United Home Life','WL',130,110),('United Home Life','WL',125,105),
('United Home Life','WL',120,100),('United Home Life','WL',115,95),
('United Home Life','WL',110,90),('United Home Life','WL',105,85),
('United Home Life','WL',100,80),('United Home Life','WL',95,75),
('United Home Life','WL',90,70),('United Home Life','WL',85,65),
('United Home Life','WL',80,60),('United Home Life','WL',75,55),
('United Home Life','WL',70,55),('United Home Life','WL',65,55),

-- United Home Life / Accidental (no 145)
('United Home Life','Accidental',140,100),('United Home Life','Accidental',135,95),
('United Home Life','Accidental',130,90),('United Home Life','Accidental',125,85),
('United Home Life','Accidental',120,80),('United Home Life','Accidental',115,75),
('United Home Life','Accidental',110,70),('United Home Life','Accidental',105,65),
('United Home Life','Accidental',100,60),('United Home Life','Accidental',95,55),
('United Home Life','Accidental',90,50),('United Home Life','Accidental',85,50),
('United Home Life','Accidental',80,50),('United Home Life','Accidental',75,45),
('United Home Life','Accidental',70,45),('United Home Life','Accidental',65,45),

-- Royal Neighbors / Secure Life IUL (no 145)
('Royal Neighbors','Secure Life IUL',140,125),('Royal Neighbors','Secure Life IUL',135,120),
('Royal Neighbors','Secure Life IUL',130,112),('Royal Neighbors','Secure Life IUL',125,105),
('Royal Neighbors','Secure Life IUL',120,105),('Royal Neighbors','Secure Life IUL',115,105),
('Royal Neighbors','Secure Life IUL',110,100),('Royal Neighbors','Secure Life IUL',105,95),
('Royal Neighbors','Secure Life IUL',100,90),('Royal Neighbors','Secure Life IUL',95,85),
('Royal Neighbors','Secure Life IUL',90,80),('Royal Neighbors','Secure Life IUL',85,50),
('Royal Neighbors','Secure Life IUL',80,50),('Royal Neighbors','Secure Life IUL',75,50),
('Royal Neighbors','Secure Life IUL',70,50),('Royal Neighbors','Secure Life IUL',65,50),

-- Global Atlantic / IUL (no 145)
('Global Atlantic','IUL',140,110),('Global Atlantic','IUL',135,105),
('Global Atlantic','IUL',130,100),('Global Atlantic','IUL',125,95),
('Global Atlantic','IUL',120,90),('Global Atlantic','IUL',115,85),
('Global Atlantic','IUL',110,80),('Global Atlantic','IUL',105,75),
('Global Atlantic','IUL',100,70),('Global Atlantic','IUL',95,65),
('Global Atlantic','IUL',90,60),('Global Atlantic','IUL',85,55),
('Global Atlantic','IUL',80,50),('Global Atlantic','IUL',75,45),
('Global Atlantic','IUL',70,40),('Global Atlantic','IUL',65,35)

on conflict (carrier, product, ffl_level) do update set rate = excluded.rate;

-- ─── Add new products to admin comp guide (base_rate = rate at 100% FFL) ────

insert into carrier_product_comp_rates (carrier, product, base_rate) values
-- Term products
('Americo', 'HMS 125', 100.00),
('Mutual of Omaha', 'TLE (Express)', 100.00),
('Mutual of Omaha', 'TLA (Answers)', 70.00),
('American Amicable', 'EZ Term', 60.00),
('American Amicable', 'Home Protector', 100.00),
('American Amicable', 'OBA (Group Level Term)', 60.00),
('American Amicable', 'Term Made Simple', 90.00),
('Instabrain', 'Term w/ LB (10yr)', 75.00),
('Instabrain', 'Term w/ LB (15yr)', 80.00),
('Instabrain', 'Term w/ LB (20yr)', 85.00),
('Instabrain', 'Term w/ LB (30yr)', 85.00),
('Instabrain', 'Pure Term (10yr)', 75.00),
('Instabrain', 'Pure Term (15yr)', 80.00),
('Instabrain', 'Pure Term (20yr)', 85.00),
('Instabrain', 'Pure Term (30yr)', 85.00),
('Instabrain', 'RD Senior Life Term', 45.00),
('United Home Life', 'Term', 70.00),
('Royal Neighbors', 'Term', 85.00),
('Foresters', 'Strong Foundation', 80.00),
('Ethos', 'LGA Prime', 97.50),
('Ethos', 'TruStage SITL', 75.00),
('Ethos', 'Ameritas SI Term', 97.50),
('Ethos', 'JH ROP', 90.00),
('NLG', '10/15 YR Term', 58.00),
('NLG', '20/30 YR Term', 70.00),
-- IUL products
('Americo', 'Instant Decision', 85.00),
('NLG', 'Flex Life IUL', 70.00),
('NLG', 'Summit Life IUL', 70.00),
('F&G', 'Pathsetter (Juvenile)', 72.50),
('F&G', 'Pathsetter', 90.00),
('F&G', 'Everlast (Juvenile)', 72.50),
('F&G', 'Everlast', 85.00),
('Mutual of Omaha', 'UL', 85.00),
('Mutual of Omaha', 'IULE', 90.00),
('Transamerica', 'IUL', 75.00),
('American Amicable', 'Secure Life', 100.00),
('American Amicable', 'XUL', 65.00),
('Ethos', 'Ameritas IUL', 80.00),
('United Home Life', 'FX', 70.00),
('United Home Life', 'GIWL', 30.00),
('United Home Life', 'WL', 80.00),
('United Home Life', 'Accidental', 60.00),
('Royal Neighbors', 'Secure Life IUL', 90.00),
('Global Atlantic', 'IUL', 70.00),
-- Instabrain age-banded WL variants
('Instabrain', 'Final Expense WL (50-69)', 105.00),
('Instabrain', 'Final Expense WL (70-79)', 80.00),
('Instabrain', 'Final Expense WL (80+)', 65.00),
('Instabrain', 'Guaranteed Issue WL (50-69)', 50.00),
('Instabrain', 'Guaranteed Issue WL (70-79)', 30.00),
('Instabrain', 'Guaranteed Issue WL (80+)', 20.00),
('Instabrain', 'RD Senior Life Whole Life (50-69)', 45.00),
('Instabrain', 'RD Senior Life Whole Life (70-79)', 20.00),
('Instabrain', 'RD Senior Life Whole Life (80+)', 5.00),
-- Instabrain Term age variants
('Instabrain', 'RD Senior Life Term (50-69)', 45.00),
('Instabrain', 'RD Senior Life Term (70-79)', 20.00)
on conflict (carrier, product) do update
set base_rate = excluded.base_rate,
    updated_at = now();
