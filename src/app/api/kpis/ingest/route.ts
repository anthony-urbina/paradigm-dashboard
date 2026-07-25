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

type ActivityRecord = {
  dials: number;
  conversations: number;
  appointments: number;
  presentations: number;
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

function isMissingKpiSubmissionsTable(error: { code?: string; message?: string } | null) {
  return (
    error?.code === "PGRST205" &&
    typeof error.message === "string" &&
    error.message.includes("public.kpi_submissions")
  );
}

function buildActivityMetrics(source: Pick<
  KpiRecord,
  "inbound_billable" | "inbound_presentations" | "outbound_dials" | "outbound_pickups" | "outbound_appts_booked" | "outbound_presentations"
>): ActivityRecord {
  return {
    dials: source.outbound_dials,
    conversations: source.inbound_billable + source.outbound_pickups,
    appointments: source.outbound_appts_booked,
    presentations: source.inbound_presentations + source.outbound_presentations,
  };
}

function mergeActivityMetrics(
  existing: ActivityRecord,
  kpi: z.infer<typeof kpiSchema>,
): ActivityRecord {
  const next = { ...existing };

  if ("outbound_dials" in kpi) {
    next.dials = kpi.outbound_dials ?? existing.dials;
  }

  if ("inbound_billable" in kpi || "outbound_pickups" in kpi) {
    next.conversations = (kpi.inbound_billable ?? 0) + (kpi.outbound_pickups ?? 0);
  }

  if ("outbound_appts_booked" in kpi) {
    next.appointments = kpi.outbound_appts_booked ?? existing.appointments;
  }

  if ("inbound_presentations" in kpi || "outbound_presentations" in kpi) {
    next.presentations = (kpi.inbound_presentations ?? 0) + (kpi.outbound_presentations ?? 0);
  }

  return next;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req: Request) {
  const apiKey = req.headers.get("x-api-key");
  const userAgent = req.headers.get("user-agent");
  const startedAt = new Date().toISOString();

  if (!SALES_INGEST_API_KEY) {
    console.error("[kpi-ingest] missing api key config", { startedAt, userAgent });
    return NextResponse.json({ error: "Sales ingest API key is not configured" }, { status: 500, headers: corsHeaders });
  }

  if (apiKey !== SALES_INGEST_API_KEY) {
    console.warn("[kpi-ingest] invalid api key", {
      startedAt,
      userAgent,
      hasApiKey: Boolean(apiKey),
    });
    return NextResponse.json({ error: "Invalid API key" }, { status: 401, headers: corsHeaders });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch (error) {
    console.error("[kpi-ingest] invalid json body", {
      startedAt,
      userAgent,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400, headers: corsHeaders });
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    console.error("[kpi-ingest] invalid body shape", {
      startedAt,
      userAgent,
      payloadType: Array.isArray(payload) ? "array" : typeof payload,
    });
    return NextResponse.json({ error: "Expected a JSON object body" }, { status: 400, headers: corsHeaders });
  }

  const body = payload as { data?: unknown };
  const parsed = ingestSchema.safeParse(body.data);

  if (!parsed.success) {
    console.error("[kpi-ingest] invalid payload", {
      startedAt,
      userAgent,
      data: body.data,
      issues: parsed.error.issues,
      details: parsed.error.flatten(),
    });
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400, headers: corsHeaders }
    );
  }

  const submittedAt = new Date().toISOString();
  const submissionDate = parsed.data.submission_date ?? submittedAt.slice(0, 10);

  console.log("[kpi-ingest] received payload", {
    receivedAt: startedAt,
    userAgent,
    data: body.data,
  });

  const supabase = createServiceClient();

  const { data: agentRow } = await supabase
    .from("agents")
    .select("id")
    .eq("discord_user_id", parsed.data.discord_user_id)
    .maybeSingle();

  console.log("[kpi-ingest] agent lookup result", {
    discord_user_id: parsed.data.discord_user_id,
    submissionDate,
    agentMatched: Boolean(agentRow?.id),
  });

  let mergedKpi: KpiRecord = {
    ...emptyKpiRecord(),
    ...parsed.data.kpi,
    discord_user_id: parsed.data.discord_user_id,
    submission_date: submissionDate,
    submitted_at: submittedAt,
    agent_id: agentRow?.id ?? null,
  };
  let kpiSubmissionStored = false;
  let kpiSubmissionFallback = false;

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
    if (isMissingKpiSubmissionsTable(existingError)) {
      kpiSubmissionFallback = true;
      console.warn("[kpi-ingest] kpi_submissions missing, falling back to activity-only storage", {
        discord_user_id: parsed.data.discord_user_id,
        submissionDate,
        error: existingError,
      });
    } else {
      console.error("[kpi-ingest] lookup error", existingError);
      return NextResponse.json({ error: existingError.message }, { status: 500, headers: corsHeaders });
    }
  } else {
    mergedKpi = {
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
      if (isMissingKpiSubmissionsTable(upsertError)) {
        kpiSubmissionFallback = true;
        console.warn("[kpi-ingest] kpi_submissions upsert skipped because table is missing", {
          discord_user_id: parsed.data.discord_user_id,
          submissionDate,
          error: upsertError,
        });
      } else {
        console.error("[kpi-ingest] upsert error", {
          discord_user_id: parsed.data.discord_user_id,
          submissionDate,
          mergedKpi,
          error: upsertError,
        });
        return NextResponse.json({ error: upsertError.message }, { status: 500, headers: corsHeaders });
      }
    } else {
      kpiSubmissionStored = true;
    }
  }

  let activityUpdated = false;

  if (agentRow?.id) {
    let activityPayload = {
      agent_id: agentRow.id,
      date: submissionDate,
      ...buildActivityMetrics(mergedKpi),
    };

    if (kpiSubmissionFallback) {
      const { data: existingActivity, error: activityLookupError } = await supabase
        .from("activity")
        .select("dials, conversations, appointments, presentations")
        .eq("agent_id", agentRow.id)
        .eq("date", submissionDate)
        .maybeSingle<ActivityRecord>();

      if (activityLookupError) {
        console.error("[kpi-ingest] activity lookup error", {
          discord_user_id: parsed.data.discord_user_id,
          submissionDate,
          error: activityLookupError,
        });
        return NextResponse.json({ error: activityLookupError.message }, { status: 500, headers: corsHeaders });
      }

      activityPayload = {
        agent_id: agentRow.id,
        date: submissionDate,
        ...mergeActivityMetrics(
          existingActivity ?? { dials: 0, conversations: 0, appointments: 0, presentations: 0 },
          parsed.data.kpi,
        ),
      };
    }

    const { error: activityError } = await supabase.from("activity").upsert(activityPayload, {
      onConflict: "agent_id,date",
    });

    if (activityError) {
      console.error("[kpi-ingest] activity upsert error", {
        discord_user_id: parsed.data.discord_user_id,
        submissionDate,
        activityPayload,
        error: activityError,
      });
      return NextResponse.json({ error: activityError.message }, { status: 500, headers: corsHeaders });
    }

    activityUpdated = true;
  }

  console.log("[kpi-ingest] success", {
    discord_user_id: parsed.data.discord_user_id,
    submissionDate,
    agentMatched: Boolean(agentRow?.id),
    kpiSubmissionStored,
    kpiSubmissionFallback,
    activityUpdated,
  });

  return NextResponse.json(
    {
      ok: true,
      agent_matched: !!agentRow,
      kpi_submission_stored: kpiSubmissionStored,
      kpi_submission_fallback: kpiSubmissionFallback,
      activity_updated: activityUpdated,
      submission_date: submissionDate,
    },
    { headers: corsHeaders }
  );
}
