-- ============================================================
-- Soft delete support for agents
-- ============================================================
ALTER TABLE agents ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- ============================================================
-- Recreate agent_monthly_ap view excluding soft-deleted agents
-- ============================================================
CREATE OR REPLACE VIEW agent_monthly_ap AS
SELECT
  a.id AS agent_id,
  a.name,
  a.upline_id,
  coalesce(sum(s.ap), 0) AS ap,
  count(s.id) AS sales_count,
  date_trunc('month', now())::date AS month
FROM agents a
LEFT JOIN sales s
  ON s.agent_id = a.id
  AND date_trunc('month', s.sold_at) = date_trunc('month', now())
WHERE a.deleted_at IS NULL
GROUP BY a.id, a.name, a.upline_id;

-- ============================================================
-- Update RPCs to exclude soft-deleted agents
-- ============================================================

CREATE OR REPLACE FUNCTION get_weekly_leaders(lim int DEFAULT 10)
RETURNS TABLE(id uuid, name text, ap numeric, sales_count bigint)
LANGUAGE sql STABLE AS $$
  SELECT a.id, a.name,
    coalesce(sum(s.ap), 0) AS ap,
    count(s.id)::bigint AS sales_count
  FROM agents a
  LEFT JOIN sales s ON s.agent_id = a.id
    AND s.sold_at >= date_trunc('week', now())
    AND s.sold_at <  date_trunc('week', now()) + interval '7 days'
  WHERE a.deleted_at IS NULL
  GROUP BY a.id, a.name
  HAVING coalesce(sum(s.ap), 0) > 0
  ORDER BY ap DESC
  LIMIT lim;
$$;

CREATE OR REPLACE FUNCTION get_team_metrics(root_id uuid)
RETURNS TABLE(total_team bigint, direct_agents bigint, team_ap numeric, active_writers bigint)
LANGUAGE sql STABLE AS $$
WITH RECURSIVE dl AS (
  SELECT id FROM agents WHERE upline_id = root_id AND deleted_at IS NULL
  UNION ALL
  SELECT a.id FROM agents a JOIN dl ON a.upline_id = dl.id WHERE a.deleted_at IS NULL
),
mth AS (
  SELECT s.agent_id, s.ap
  FROM sales s
  JOIN dl ON s.agent_id = dl.id
  WHERE date_trunc('month', s.sold_at) = date_trunc('month', now())
)
SELECT
  (SELECT count(*) FROM dl)::bigint,
  (SELECT count(*) FROM agents WHERE upline_id = root_id AND deleted_at IS NULL)::bigint,
  (SELECT coalesce(sum(ap), 0) FROM mth),
  (SELECT count(DISTINCT agent_id) FROM mth)::bigint;
$$;

CREATE OR REPLACE FUNCTION get_admin_agents()
RETURNS TABLE(
  id uuid, name text, email text, comp_percentage numeric, role text,
  lifetime_ap numeric, lifetime_sales bigint, upline_name text, is_new boolean
)
LANGUAGE sql STABLE AS $$
SELECT
  a.id, a.name, a.email, a.comp_percentage, a.role,
  coalesce(sum(s.ap), 0)         AS lifetime_ap,
  count(s.id)::bigint            AS lifetime_sales,
  coalesce(u.name, 'Unassigned') AS upline_name,
  a.created_at > now() - interval '7 days' AS is_new
FROM agents a
LEFT JOIN sales   s ON s.agent_id  = a.id
LEFT JOIN agents  u ON u.id        = a.upline_id AND u.deleted_at IS NULL
WHERE a.deleted_at IS NULL
GROUP BY a.id, a.name, a.email, a.comp_percentage, a.role, u.name, a.created_at
ORDER BY lifetime_ap DESC;
$$;

CREATE OR REPLACE FUNCTION get_agency_team_leaderboard(lim int DEFAULT 10)
RETURNS TABLE(
  id uuid, name text, team_ap numeric,
  writing_agents bigint, sales_count bigint
)
LANGUAGE sql STABLE AS $$
WITH RECURSIVE anc AS (
  SELECT id AS descendant_id, upline_id AS ancestor_id
  FROM agents WHERE upline_id IS NOT NULL AND deleted_at IS NULL
  UNION ALL
  SELECT anc.descendant_id, a.upline_id
  FROM anc
  JOIN agents a ON a.id = anc.ancestor_id
  WHERE a.upline_id IS NOT NULL AND a.deleted_at IS NULL
),
own_sales AS (
  SELECT agent_id, sum(ap) AS ap, count(*)::bigint AS cnt
  FROM sales
  WHERE date_trunc('month', sold_at) = date_trunc('month', now())
  GROUP BY agent_id
),
sub AS (
  SELECT anc.ancestor_id AS agent_id,
    coalesce(sum(os.ap), 0)          AS sub_ap,
    count(DISTINCT os.agent_id)      AS sub_writers,
    coalesce(sum(os.cnt), 0)::bigint AS sub_sales
  FROM anc
  LEFT JOIN own_sales os ON os.agent_id = anc.descendant_id
  GROUP BY anc.ancestor_id
)
SELECT
  a.id, a.name,
  coalesce(os.ap, 0) + coalesce(sub.sub_ap, 0)                             AS team_ap,
  coalesce(sub.sub_writers, 0) + (CASE WHEN os.ap > 0 THEN 1 ELSE 0 END)  AS writing_agents,
  coalesce(os.cnt, 0)          + coalesce(sub.sub_sales, 0)                AS sales_count
FROM agents a
LEFT JOIN own_sales os  ON os.agent_id  = a.id
LEFT JOIN sub           ON sub.agent_id = a.id
WHERE a.deleted_at IS NULL
  AND coalesce(os.ap, 0) + coalesce(sub.sub_ap, 0) > 0
ORDER BY team_ap DESC
LIMIT lim;
$$;
