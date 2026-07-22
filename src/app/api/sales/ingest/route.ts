import { NextResponse } from "next/server";
import { z } from "zod";

import { createServiceClient } from "@/lib/supabase";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

const SALES_INGEST_API_KEY = process.env.SALES_INGEST_API_KEY;

const ingestSchema = z.object({
  discord_user_id: z.string(),
  sale: z.object({
    carrier: z.string(),
    ap: z.number().positive(),
    client_age: z.number().int().min(0).max(120).optional(),
    state: z.string().optional(),
    product_type: z.string().optional(),
    product: z.string().optional(),
  }),
});

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req: Request) {
  const apiKey = req.headers.get("x-api-key");

  if (!SALES_INGEST_API_KEY) {
    return NextResponse.json({ error: "Sales ingest API key is not configured" }, { status: 500, headers: corsHeaders });
  }

  if (apiKey !== SALES_INGEST_API_KEY) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401, headers: corsHeaders });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400, headers: corsHeaders });
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return NextResponse.json({ error: "Expected a JSON object body" }, { status: 400, headers: corsHeaders });
  }

  const body = payload as { data?: unknown };
  const parsed = ingestSchema.safeParse(body.data);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400, headers: corsHeaders }
    );
  }

  const { discord_user_id, sale } = parsed.data;

  console.log("[sales-ingest] received payload", {
    receivedAt: new Date().toISOString(),
    data: body.data,
  });

  const supabase = createServiceClient();

  // Look up agent by discord_user_id (best-effort — sale is stored even without a match)
  const { data: agentRow } = await supabase
    .from("agents")
    .select("id")
    .eq("discord_user_id", discord_user_id)
    .maybeSingle();

  const { error: insertError } = await supabase.from("sales").insert({
    agent_id:       agentRow?.id ?? null,
    discord_user_id,
    carrier:        sale.carrier,
    ap:             sale.ap,
    client_age:     sale.client_age ?? null,
    state:          sale.state ?? null,
    product_type:   sale.product_type ?? null,
    product:        sale.product ?? null,
  });

  if (insertError) {
    console.error("[sales-ingest] insert error", insertError);
    return NextResponse.json({ error: insertError.message }, { status: 500, headers: corsHeaders });
  }

  return NextResponse.json({
    ok: true,
    agent_matched: !!agentRow,
  }, { headers: corsHeaders });
}
