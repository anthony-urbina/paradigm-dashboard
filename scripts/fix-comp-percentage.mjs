#!/usr/bin/env node
import postgres from "postgres";

const url = process.env.POSTGRES_URL_NON_POOLING;
if (!url) {
  console.error("POSTGRES_URL_NON_POOLING not set");
  process.exit(1);
}

const sql = postgres(url, { ssl: "require", max: 1 });

try {
  await sql.unsafe(`
    ALTER TABLE agents
      ADD COLUMN IF NOT EXISTS comp_percentage numeric(6,2) DEFAULT 80;
  `);
  console.log("✓ Added comp_percentage column");

  await sql.unsafe(`
    UPDATE agents SET comp_percentage = 80 WHERE comp_percentage IS NULL;
  `);

  await sql.unsafe(`
    ALTER TABLE agents
      ALTER COLUMN comp_percentage SET DEFAULT 80,
      ALTER COLUMN comp_percentage SET NOT NULL;
  `);
  console.log("✓ Set NOT NULL + default");

  await sql.unsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'agents_comp_percentage_range_check'
      ) THEN
        ALTER TABLE agents
          ADD CONSTRAINT agents_comp_percentage_range_check
          CHECK (comp_percentage >= 0 AND comp_percentage <= 200);
      END IF;
    END $$;
  `);
  console.log("✓ Added constraint");

  await sql.unsafe(`DROP FUNCTION IF EXISTS get_admin_agents();`);

  await sql.unsafe(`
    CREATE FUNCTION get_admin_agents()
    RETURNS TABLE(
      id uuid,
      name text,
      email text,
      comp_percentage numeric,
      role text,
      lifetime_ap numeric,
      lifetime_sales bigint,
      upline_name text,
      is_new boolean
    )
    LANGUAGE sql STABLE AS $$
    SELECT
      a.id,
      a.name,
      a.email,
      a.comp_percentage,
      a.role,
      COALESCE(SUM(s.ap), 0) AS lifetime_ap,
      COUNT(s.id)::bigint AS lifetime_sales,
      COALESCE(u.name, 'Unassigned') AS upline_name,
      a.created_at > now() - INTERVAL '7 days' AS is_new
    FROM agents a
    LEFT JOIN sales s ON s.agent_id = a.id
    LEFT JOIN agents u ON u.id = a.upline_id
    GROUP BY a.id, a.name, a.email, a.comp_percentage, a.role, u.name, a.created_at
    ORDER BY lifetime_ap DESC;
    $$;
  `);
  console.log("✓ Recreated get_admin_agents()");

} catch (err) {
  console.error("✗", err.message);
} finally {
  await sql.end();
}
