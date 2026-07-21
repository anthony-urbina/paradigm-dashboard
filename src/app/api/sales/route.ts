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
  const { carrier, product, ap, clientName } = body as { carrier: string; product: string; ap: number; clientName?: string };

  if (!carrier || !product || !ap || Number(ap) <= 0) {
    return NextResponse.json({ error: "carrier, product, and ap > 0 are required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("sales").insert({
    agent_id: agent.id,
    carrier,
    product,
    ap: Number(ap),
    client_name: clientName?.trim() || null,
    sold_at: new Date().toISOString(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
