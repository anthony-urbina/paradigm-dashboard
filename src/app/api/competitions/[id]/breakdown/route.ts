import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: comp } = await supabase
    .from("competitions")
    .select(`
      start_date, end_date,
      competition_teams (
        id, name, color,
        competition_members ( agent_id, agents ( id, name ) )
      )
    `)
    .eq("id", id)
    .single();

  if (!comp) return NextResponse.json({ error: "Not found" }, { status: 404 });

  type RawMember = { agent_id: string; agents: { id: string; name: string } | null };
  type RawTeam = { id: string; name: string; color: string; competition_members: RawMember[] };

  const teams = comp.competition_teams as unknown as RawTeam[];
  const allAgentIds = teams.flatMap((t) => t.competition_members.map((m) => m.agent_id));

  const { data: sales } = allAgentIds.length
    ? await supabase
        .from("sales")
        .select("agent_id, ap")
        .gte("date", comp.start_date)
        .lte("date", comp.end_date)
        .in("agent_id", allAgentIds)
    : { data: [] };

  const apByAgent = new Map<string, { ap: number; count: number }>();
  for (const s of sales ?? []) {
    const cur = apByAgent.get(s.agent_id) ?? { ap: 0, count: 0 };
    apByAgent.set(s.agent_id, { ap: cur.ap + Number(s.ap), count: cur.count + 1 });
  }

  const result = teams.map((team) => ({
    teamId: team.id,
    teamName: team.name,
    teamColor: team.color,
    agents: team.competition_members
      .map((m) => {
        const stats = apByAgent.get(m.agent_id) ?? { ap: 0, count: 0 };
        return {
          agentId: m.agent_id,
          agentName: m.agents?.name ?? "Unknown",
          totalAP: stats.ap,
          salesCount: stats.count,
        };
      })
      .sort((a, b) => b.totalAP - a.totalAP),
  }));

  return NextResponse.json(result);
}
