import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { getCurrentAgent } from "@/lib/current-agent";
import { createServiceClient } from "@/lib/supabase";

const FFL_LEVELS = [65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130, 135, 140, 145];

const createSchema = z.object({
  carrier: z.string().trim().min(1),
  product: z.string().trim().min(1),
  category: z.enum(["Whole Life", "Term", "IUL", "FIA"]),
  base_rate: z.number().min(0).max(200),
  is_flat_rate: z.boolean(),
  ffl_rates: z.record(z.string(), z.number().min(0).max(200)),
});

export async function GET() {
  const session = await auth();
  const agent = await getCurrentAgent(session);
  if (!agent || agent.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("carrier_product_comp_rates")
    .select("id, carrier, product, base_rate, is_flat_rate, category")
    .order("carrier")
    .order("product");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  const session = await auth();
  const agent = await getCurrentAgent(session);
  if (!agent || agent.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const { carrier, product, category, base_rate, is_flat_rate, ffl_rates } = parsed.data;

  // Validate all FFL levels are present
  const missingLevels = FFL_LEVELS.filter((lvl) => ffl_rates[String(lvl)] == null);
  if (missingLevels.length > 0) {
    return NextResponse.json(
      { error: `Missing rates for FFL levels: ${missingLevels.join(", ")}` },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  // Insert into carrier_product_comp_rates
  const { data: inserted, error: insertError } = await supabase
    .from("carrier_product_comp_rates")
    .insert({ carrier, product, base_rate, is_flat_rate, category })
    .select("id, carrier, product, base_rate, is_flat_rate, category")
    .single();

  if (insertError) {
    const isConflict = insertError.code === "23505";
    return NextResponse.json(
      { error: isConflict ? "A product with this carrier and name already exists" : insertError.message },
      { status: isConflict ? 409 : 500 }
    );
  }

  // Insert all 17 FFL level rows into ffl_rate_schedules
  const scheduleRows = FFL_LEVELS.map((lvl) => ({
    carrier,
    product,
    ffl_level: lvl,
    rate: ffl_rates[String(lvl)],
  }));

  const { error: scheduleError } = await supabase
    .from("ffl_rate_schedules")
    .upsert(scheduleRows, { onConflict: "carrier,product,ffl_level" });

  if (scheduleError) {
    // Roll back the comp rate row we just inserted
    await supabase.from("carrier_product_comp_rates").delete().eq("id", inserted.id);
    return NextResponse.json({ error: scheduleError.message }, { status: 500 });
  }

  return NextResponse.json(inserted, { status: 201 });
}
