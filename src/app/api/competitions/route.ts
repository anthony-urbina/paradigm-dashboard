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
  const { name, description, prize, startDate, endDate, teams } = body as {
    name: string;
    description?: string;
    prize?: string;
    startDate: string;
    endDate: string;
    teams: { name: string; color: string }[];
  };

  if (!name || !startDate || !endDate || !teams || teams.length < 2) {
    return NextResponse.json(
      { error: "name, startDate, endDate, and 2 teams are required" },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  const { data: comp, error: compErr } = await supabase
    .from("competitions")
    .insert({
      name,
      description: description ?? null,
      prize: prize ?? null,
      start_date: startDate,
      end_date: endDate,
      status: "draft",
      created_by: agent.id,
    })
    .select("id")
    .single();

  if (compErr || !comp) {
    return NextResponse.json({ error: compErr?.message ?? "Insert failed" }, { status: 500 });
  }

  const { error: teamsErr } = await supabase.from("competition_teams").insert(
    teams.map((t) => ({
      competition_id: comp.id,
      name: t.name,
      color: t.color || "#e2bb52",
    }))
  );

  if (teamsErr) return NextResponse.json({ error: teamsErr.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: comp.id });
}
