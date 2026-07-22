import { NextResponse } from "next/server";
import { z } from "zod";

import { createServiceClient } from "@/lib/supabase";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

const SALES_INGEST_API_KEY = process.env.SALES_INGEST_API_KEY;

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

const kpiSchema = z
  .object({
    inbound_calls: z.number().int().nonnegative().optional(),
    inbound_billable: z.number().int().nonnegative().optional(),
    inbound_presentations: z.number().int().nonnegative().optional(),
    inbound_sold: z.number().int().nonnegative().optional(),
    inbound_ap: z.number().nonnegative().optional(),
    inbound_lead_spend: z.number().nonnegative().optional(),
    outbound_dials: z.number().int().nonnegative().optional(),
    outbound_pickups: z.number().int().nonnegative().optional(),
    outbound_presentations: z.number().int().nonnegative().optional(),
    outbound_sold: z.number().int().nonnegative().optional(),
    outbound_ap: z.number().nonnegative().optional(),
    outbound_lead_spend: z.number().nonnegative().optional(),
    outbound_appts_booked: z.number().int().nonnegative().optional(),
    recruiting_interviews: z.number().int().nonnegative().optional(),
    recruiting_bom_invites: z.number().int().nonnegative().optional(),
    recruiting_hired: z.number().int().nonnegative().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one KPI field is required",
  });

const ingestSchema = z.object({
  discord_user_id: z.string().min(1),
  submission_date: dateSchema.optional(),
  submitted_at: z.string().datetime().optional(),
  kpi: kpiSchema,
});

type KpiIntField =
  | "inbound_calls"
  | "inbound_billable"
  | "inbound_presentations"
  | "inbound_sold"
  | "outbound_dials"
  | "outbound_pickups"
  | "outbound_presentations"
  | "outbound_sold"
  | "outbound_appts_booked"
  | "recruiting_interviews"
  | "recruiting_bom_invites"
  | "recruiting_hired";

type KpiFloatField =
  | "inbound_ap"
  | "inbound_lead_spend"
  | "outbound_ap"
  | "outbound_lead_spend";
type KpiField = KpiIntField | KpiFloatField;

type KpiRecord = Record<KpiField, number> & {
  discord_user_id: string;
  submission_date: string;
  submitted_at: string;
  agent_id: string | null;
};

function emptyKpiRecord() {
  return {
    inbound_calls: 0,
    inbound_billable: 0,
    inbound_presentations: 0,
    inbound_sold: 0,
    inbound_ap: 0,
    inbound_lead_spend: 0,
    outbound_dials: 0,
    outbound_pickups: 0,
    outbound_presentations: 0,
    outbound_sold: 0,
    outbound_ap: 0,
    outbound_lead_spend: 0,
    outbound_appts_booked: 0,
    recruiting_interviews: 0,
    recruiting_bom_invites: 0,
    recruiting_hired: 0,
  };
}

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

  const submittedAt = parsed.data.submitted_at ?? new Date().toISOString();
  const submissionDate = parsed.data.submission_date ?? submittedAt.slice(0, 10);

  console.log("[kpi-ingest] received payload", {
    receivedAt: new Date().toISOString(),
    data: body.data,
  });

  const supabase = createServiceClient();

  const { data: agentRow } = await supabase
    .from("agents")
    .select("id")
    .eq("discord_user_id", parsed.data.discord_user_id)
    .maybeSingle();

  const { data: existingRow, error: existingError } = await supabase
    .from("kpi_submissions")
    .select(`
      inbound_calls,
      inbound_billable,
      inbound_presentations,
      inbound_sold,
      inbound_ap,
      inbound_lead_spend,
      outbound_dials,
      outbound_pickups,
      outbound_presentations,
      outbound_sold,
      outbound_ap,
      outbound_lead_spend,
      outbound_appts_booked,
      recruiting_interviews,
      recruiting_bom_invites,
      recruiting_hired
    `)
    .eq("discord_user_id", parsed.data.discord_user_id)
    .eq("submission_date", submissionDate)
    .maybeSingle();

  if (existingError) {
    console.error("[kpi-ingest] lookup error", existingError);
    return NextResponse.json({ error: existingError.message }, { status: 500, headers: corsHeaders });
  }

  const mergedKpi: KpiRecord = {
    ...emptyKpiRecord(),
    ...(existingRow ?? {}),
    ...parsed.data.kpi,
    discord_user_id: parsed.data.discord_user_id,
    submission_date: submissionDate,
    submitted_at: submittedAt,
    agent_id: agentRow?.id ?? null,
  };

  const { error: upsertError } = await supabase.from("kpi_submissions").upsert(mergedKpi, {
    onConflict: "discord_user_id,submission_date",
  });

  if (upsertError) {
    console.error("[kpi-ingest] upsert error", upsertError);
    return NextResponse.json({ error: upsertError.message }, { status: 500, headers: corsHeaders });
  }

  let activityUpdated = false;

  if (agentRow?.id) {
    const activityPayload = {
      agent_id: agentRow.id,
      date: submissionDate,
      dials: mergedKpi.outbound_dials,
      conversations: mergedKpi.inbound_billable + mergedKpi.outbound_pickups,
      appointments: mergedKpi.outbound_appts_booked,
      presentations: mergedKpi.inbound_presentations + mergedKpi.outbound_presentations,
    };

    const { error: activityError } = await supabase.from("activity").upsert(activityPayload, {
      onConflict: "agent_id,date",
    });

    if (activityError) {
      console.error("[kpi-ingest] activity upsert error", activityError);
      return NextResponse.json({ error: activityError.message }, { status: 500, headers: corsHeaders });
    }

    activityUpdated = true;
  }

  return NextResponse.json(
    {
      ok: true,
      agent_matched: !!agentRow,
      activity_updated: activityUpdated,
      submission_date: submissionDate,
    },
    { headers: corsHeaders }
  );
}
