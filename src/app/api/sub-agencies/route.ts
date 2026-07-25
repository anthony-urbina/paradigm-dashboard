import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getCurrentAgent } from "@/lib/current-agent";
import { createServiceClient } from "@/lib/supabase";

export async function GET() {
  const session = await auth();
  const agent = await getCurrentAgent(session);
  if (!agent || agent.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("sub_agencies")
    .select("id, name, logo_url, root_agent_id")
    .order("created_at");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const session = await auth();
  const agent = await getCurrentAgent(session);
  if (!agent || agent.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { name?: string; root_agent_id?: string };
  if (!body.name?.trim() || !body.root_agent_id) {
    return NextResponse.json({ error: "name and root_agent_id are required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("sub_agencies")
    .insert({ name: body.name.trim(), root_agent_id: body.root_agent_id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
