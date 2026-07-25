import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getCurrentAgent } from "@/lib/current-agent";
import { createServiceClient } from "@/lib/supabase";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const agent = await getCurrentAgent(session);

  if (!agent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const supabase = createServiceClient();

  // Verify the sale belongs to this agent
  const { data: existing, error: fetchError } = await supabase
    .from("sales")
    .select("id, agent_id")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Sale not found" }, { status: 404 });
  }

  if (existing.agent_id !== agent.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    clientName,
    policyNumber,
    effectiveDate,
    state,
    leadType,
  } = body as {
    clientName?: string | null;
    policyNumber?: string | null;
    effectiveDate?: string | null;
    state?: string | null;
    leadType?: string | null;
  };

  const { error: updateError } = await supabase
    .from("sales")
    .update({
      client_name: clientName ?? null,
      policy_number: policyNumber ?? null,
      effective_date: effectiveDate ?? null,
      state: state ?? null,
      lead_type: leadType ?? null,
    })
    .eq("id", id);

  if (updateError) {
    console.error("[sales-patch] update error", updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
