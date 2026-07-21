import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getCurrentAgent } from "@/lib/current-agent";
import { getTeamAgentCompensation, type TimeRange } from "@/lib/data";

function normalizeRange(value: string | null): TimeRange {
  return value === "90d" || value === "180d" || value === "365d" ? value : "30d";
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const session = await auth();
  const agent = await getCurrentAgent(session);
  if (!agent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { agentId } = await params;
  const url = new URL(req.url);
  const range = normalizeRange(url.searchParams.get("range"));
  console.log("[team-comp] request", {
    viewerId: agent.id,
    viewerRole: agent.role,
    subjectAgentId: agentId,
    range,
  });
  const detail = await getTeamAgentCompensation(agent.id, agentId, range, {
    canViewAny: agent.role === "admin",
  });

  if (!detail) {
    console.error("[team-comp] detail not found", {
      viewerId: agent.id,
      viewerRole: agent.role,
      subjectAgentId: agentId,
      range,
    });
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(detail);
}
