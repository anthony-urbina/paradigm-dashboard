-- ============================================================
-- Helper functions for dashboard data queries
-- ============================================================

-- Weekly AP leaders (Mon–Sun current week)
CREATE OR REPLACE FUNCTION get_weekly_leaders(lim int DEFAULT 10)
RETURNS TABLE(id uuid, name text, ap numeric, sales_count bigint)
LANGUAGE sql STABLE AS $$
  SELECT a.id, a.name,
    coalesce(sum(s.ap), 0) as ap,
    count(s.id)::bigint as sales_count
  FROM agents a
  LEFT JOIN sales s ON s.agent_id = a.id
    AND s.sold_at >= date_trunc('week', now())
    AND s.sold_at <  date_trunc('week', now()) + interval '7 days'
  GROUP BY a.id, a.name
  HAVING coalesce(sum(s.ap), 0) > 0
  ORDER BY ap DESC
  LIMIT lim;
$$;

-- Team metrics for a given root agent (total team, direct count, team AP, active writers)
CREATE OR REPLACE FUNCTION get_team_metrics(root_id uuid)
RETURNS TABLE(total_team bigint, direct_agents bigint, team_ap numeric, active_writers bigint)
LANGUAGE sql STABLE AS $$
WITH RECURSIVE dl AS (
  SELECT id FROM agents WHERE upline_id = root_id
  UNION ALL
  SELECT a.id FROM agents a JOIN dl ON a.upline_id = dl.id
),
mth AS (
  SELECT s.agent_id, s.ap
  FROM sales s
  JOIN dl ON s.agent_id = dl.id
  WHERE date_trunc('month', s.sold_at) = date_trunc('month', now())
)
SELECT
  (SELECT count(*) FROM dl)::bigint,
  (SELECT count(*) FROM agents WHERE upline_id = root_id)::bigint,
  (SELECT coalesce(sum(ap), 0) FROM mth),
  (SELECT count(DISTINCT agent_id) FROM mth)::bigint;
$$;

-- Detailed team breakdown rows for the My Team table
CREATE OR REPLACE FUNCTION get_team_rows(root_id uuid)
RETURNS TABLE(
  agent_id uuid, agent_name text, upline_name text,
  direct_count bigint, team_ap numeric, own_ap numeric,
  sales_count bigint, dials bigint, conversations bigint,
  appointments bigint, presentations bigint
)
LANGUAGE sql STABLE AS $$
WITH RECURSIVE
dl AS (
  SELECT id, upline_id FROM agents WHERE upline_id = root_id
  UNION ALL
  SELECT a.id, a.upline_id FROM agents a JOIN dl ON a.upline_id = dl.id
),
-- All ancestor→descendant pairs within the downline
anc AS (
  SELECT id AS descendant_id, upline_id AS ancestor_id
  FROM agents
  WHERE id IN (SELECT id FROM dl)
    AND upline_id IN (SELECT id FROM dl)
  UNION ALL
  SELECT anc.descendant_id, a.upline_id
  FROM anc
  JOIN agents a ON a.id = anc.ancestor_id
  WHERE a.upline_id IN (SELECT id FROM dl)
),
own_sales AS (
  SELECT s.agent_id, sum(s.ap) AS ap, count(*)::bigint AS cnt
  FROM sales s
  JOIN dl ON s.agent_id = dl.id
  WHERE date_trunc('month', s.sold_at) = date_trunc('month', now())
  GROUP BY s.agent_id
),
sub_ap AS (
  SELECT anc.ancestor_id AS agent_id, coalesce(sum(os.ap), 0) AS sub_ap
  FROM anc
  LEFT JOIN own_sales os ON os.agent_id = anc.descendant_id
  GROUP BY anc.ancestor_id
),
act AS (
  SELECT a.agent_id,
    sum(a.dials)::bigint AS dials, sum(a.conversations)::bigint AS conversations,
    sum(a.appointments)::bigint AS appointments, sum(a.presentations)::bigint AS presentations
  FROM activity a
  JOIN dl ON a.agent_id = dl.id
  WHERE a.date >= date_trunc('month', current_date)::date
    AND a.date <  (date_trunc('month', current_date) + interval '1 month')::date
  GROUP BY a.agent_id
)
SELECT
  ag.id,
  ag.name,
  CASE WHEN ag.upline_id = root_id THEN 'You'
       ELSE coalesce((SELECT name FROM agents WHERE id = ag.upline_id), '—')
  END,
  (SELECT count(*) FROM agents WHERE upline_id = ag.id)::bigint,
  coalesce(os.ap, 0) + coalesce(sa.sub_ap, 0),
  coalesce(os.ap, 0),
  coalesce(os.cnt, 0),
  coalesce(act.dials, 0),
  coalesce(act.conversations, 0),
  coalesce(act.appointments, 0),
  coalesce(act.presentations, 0)
FROM dl
JOIN agents ag ON ag.id = dl.id
LEFT JOIN own_sales os  ON os.agent_id  = ag.id
LEFT JOIN sub_ap   sa  ON sa.agent_id   = ag.id
LEFT JOIN act          ON act.agent_id  = ag.id
ORDER BY coalesce(os.ap, 0) DESC;
$$;

-- Monthly team AP bars — last 8 months for a root agent's downline
CREATE OR REPLACE FUNCTION get_team_growth_bars(root_id uuid)
RETURNS TABLE(month_label text, amount_label text, height_pct int)
LANGUAGE sql STABLE AS $$
WITH RECURSIVE dl AS (
  SELECT id FROM agents WHERE upline_id = root_id
  UNION ALL
  SELECT a.id FROM agents a JOIN dl ON a.upline_id = dl.id
),
months AS (
  SELECT generate_series(
    date_trunc('month', now() - interval '7 months'),
    date_trunc('month', now()),
    interval '1 month'
  )::date AS month_start
),
monthly_ap AS (
  SELECT date_trunc('month', s.sold_at)::date AS month_start, sum(s.ap) AS ap
  FROM sales s
  WHERE s.agent_id IN (SELECT id FROM dl) OR s.agent_id = root_id
  GROUP BY 1
),
joined AS (
  SELECT m.month_start, coalesce(ma.ap, 0) AS ap
  FROM months m
  LEFT JOIN monthly_ap ma ON ma.month_start = m.month_start
),
mx AS (SELECT greatest(max(ap), 1) AS v FROM joined)
SELECT
  to_char(month_start, 'Mon') AS month_label,
  CASE WHEN ap = 0 THEN '$0' ELSE '$' || to_char(ap, 'FM999,999') END AS amount_label,
  ((ap / mx.v) * 85 + 5)::int AS height_pct
FROM joined, mx
ORDER BY month_start;
$$;

-- Agency-wide team leaderboard (agents who lead a team, ranked by team AP)
CREATE OR REPLACE FUNCTION get_agency_team_leaderboard(lim int DEFAULT 10)
RETURNS TABLE(
  id uuid, name text, team_ap numeric,
  writing_agents bigint, sales_count bigint
)
LANGUAGE sql STABLE AS $$
WITH RECURSIVE anc AS (
  SELECT id AS descendant_id, upline_id AS ancestor_id
  FROM agents WHERE upline_id IS NOT NULL
  UNION ALL
  SELECT anc.descendant_id, a.upline_id
  FROM anc
  JOIN agents a ON a.id = anc.ancestor_id
  WHERE a.upline_id IS NOT NULL
),
own_sales AS (
  SELECT agent_id, sum(ap) AS ap, count(*)::bigint AS cnt
  FROM sales
  WHERE date_trunc('month', sold_at) = date_trunc('month', now())
  GROUP BY agent_id
),
sub AS (
  SELECT anc.ancestor_id AS agent_id,
    coalesce(sum(os.ap), 0)         AS sub_ap,
    count(DISTINCT os.agent_id)     AS sub_writers,
    coalesce(sum(os.cnt), 0)::bigint AS sub_sales
  FROM anc
  LEFT JOIN own_sales os ON os.agent_id = anc.descendant_id
  GROUP BY anc.ancestor_id
)
SELECT
  a.id, a.name,
  coalesce(os.ap, 0) + coalesce(sub.sub_ap, 0)                              AS team_ap,
  coalesce(sub.sub_writers, 0) + (CASE WHEN os.ap > 0 THEN 1 ELSE 0 END)   AS writing_agents,
  coalesce(os.cnt, 0)         + coalesce(sub.sub_sales, 0)                  AS sales_count
FROM agents a
LEFT JOIN own_sales os  ON os.agent_id  = a.id
LEFT JOIN sub           ON sub.agent_id = a.id
WHERE coalesce(os.ap, 0) + coalesce(sub.sub_ap, 0) > 0
ORDER BY team_ap DESC
LIMIT lim;
$$;

-- All agents with lifetime stats (for admin table)
CREATE OR REPLACE FUNCTION get_admin_agents()
RETURNS TABLE(
  id uuid, name text, email text, paradigm boolean, role text,
  lifetime_ap numeric, lifetime_sales bigint, upline_name text, is_new boolean
)
LANGUAGE sql STABLE AS $$
SELECT
  a.id, a.name, a.email, a.paradigm, a.role,
  coalesce(sum(s.ap), 0)     AS lifetime_ap,
  count(s.id)::bigint        AS lifetime_sales,
  coalesce(u.name, 'Unassigned') AS upline_name,
  a.created_at > now() - interval '7 days' AS is_new
FROM agents a
LEFT JOIN sales   s ON s.agent_id  = a.id
LEFT JOIN agents  u ON u.id        = a.upline_id
GROUP BY a.id, a.name, a.email, a.paradigm, a.role, u.name, a.created_at
ORDER BY lifetime_ap DESC;
$$;
