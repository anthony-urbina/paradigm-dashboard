import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCurrentAgent } from "@/lib/current-agent";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: Request) {
  const session = await auth();
  const agent = await getCurrentAgent(session);
  if (!agent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { type, target, deadlineDate } = body as {
    type: string;
    target: number;
    deadlineDate?: string;
  };

  if (!type || target === undefined) {
    return NextResponse.json({ error: "type and target are required" }, { status: 400 });
  }

  const today = new Date();
  const periodStart = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
  const periodEnd =
    deadlineDate ??
    new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10);

  const supabase = createServiceClient();
  const { error } = await supabase.from("goals").upsert(
    {
      agent_id: agent.id,
      type,
      target: Number(target),
      period_start: periodStart,
      period_end: periodEnd,
    },
    { onConflict: "agent_id,type,period_start" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
