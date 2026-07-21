import { TeamPage } from "@/components/paradigm";
import { getCurrentAgent } from "@/lib/current-agent";
import { getTeamAccessData, getTeamData, type TimeRange } from "@/lib/data";
import { auth } from "@/auth";

function normalizeRange(value: string | string[] | undefined): TimeRange {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate === "90d" || candidate === "180d" || candidate === "365d" ? candidate : "30d";
}

export default async function DashboardTeamPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  const agentId = (await getCurrentAgent(session))?.id;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const range = normalizeRange(resolvedSearchParams?.range);

  const [data, teamAccess] = agentId
    ? await Promise.all([getTeamData(agentId, range), getTeamAccessData(agentId)])
    : await Promise.all([
        Promise.resolve({
          metrics: { totalTeam: 0, directAgents: 0, teamAP: 0, activeWriters: 0, totalOverrides: 0 },
          growthBars: [],
          goalBarHeight: null,
          teamGoalTarget: null,
          teamAgents: [],
          rangeLabel: "Last 30 days",
        }),
        Promise.resolve({ teamUnlocked: false, directAgents: 0 }),
      ]);

  return <TeamPage {...data} teamUnlocked={teamAccess.teamUnlocked} selectedRange={range} />;
}
