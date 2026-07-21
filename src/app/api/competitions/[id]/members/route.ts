import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

type RawMember = {
  id: string;
  team_id: string;
  agent_id: string;
  agents: { name: string }[] | { name: string } | null;
};

function agentName(agents: RawMember["agents"]): string {
  if (!agents) return "";
  if (Array.isArray(agents)) return agents[0]?.name ?? "";
  return agents.name ?? "";
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: teams } = await supabase
    .from("competition_teams")
    .select("id")
    .eq("competition_id", id);

  const teamIds = (teams ?? []).map((t: { id: string }) => t.id);
  if (!teamIds.length) return NextResponse.json([]);

  const { data, error } = await supabase
    .from("competition_members")
    .select("id, team_id, agent_id, agents(name)")
    .in("team_id", teamIds);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data as unknown as RawMember[] ?? []).map((r) => ({
    id: r.id,
    teamId: r.team_id,
    agentId: r.agent_id,
    agentName: agentName(r.agents),
  }));

  return NextResponse.json(rows);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { teamId, agentId } = await req.json() as { teamId: string; agentId: string };

  if (!teamId || !agentId) {
    return NextResponse.json({ error: "teamId and agentId required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: team } = await supabase
    .from("competition_teams")
    .select("id")
    .eq("id", teamId)
    .eq("competition_id", id)
    .single();

  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  const { error } = await supabase
    .from("competition_members")
    .insert({ team_id: teamId, agent_id: agentId });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
