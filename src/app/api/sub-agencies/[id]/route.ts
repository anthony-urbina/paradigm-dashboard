import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getCurrentAgent } from "@/lib/current-agent";
import { createServiceClient } from "@/lib/supabase";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const agent = await getCurrentAgent(session);
  if (!agent || agent.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await req.json()) as { name?: string; root_agent_id?: string; logo_url?: string | null };

  const update: Record<string, unknown> = {};
  if (body.name !== undefined) update.name = body.name.trim();
  if (body.root_agent_id !== undefined) update.root_agent_id = body.root_agent_id;
  if (body.logo_url !== undefined) update.logo_url = body.logo_url;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("sub_agencies")
    .update(update)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const agent = await getCurrentAgent(session);
  if (!agent || agent.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createServiceClient();
  const { error } = await supabase.from("sub_agencies").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
