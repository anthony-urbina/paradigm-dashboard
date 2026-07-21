#!/usr/bin/env node
import postgres from "postgres";
import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, "../supabase/migrations");

const url = process.env.POSTGRES_URL_NON_POOLING;
if (!url) {
  console.error("POSTGRES_URL_NON_POOLING not set");
  process.exit(1);
}

const sql = postgres(url, { ssl: "require", max: 1 });

const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

for (const file of files) {
  const content = readFileSync(join(migrationsDir, file), "utf8");
  console.log(`Running ${file}...`);
  try {
    await sql.unsafe(content);
    console.log(`  ✓ ${file}`);
  } catch (err) {
    console.error(`  ✗ ${file}: ${err.message}`);
    // Continue — most statements use IF NOT EXISTS
  }
}

await sql.end();
console.log("\nMigrations complete.");
