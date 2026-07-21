import { auth } from "@/auth";
import { GoalsPage } from "@/components/paradigm";
import { getCurrentAgent } from "@/lib/current-agent";
import { getGoalsData, getTeamAccessData } from "@/lib/data";

export default async function DashboardGoalsPage() {
  const session = await auth();
  const agentId = (await getCurrentAgent(session))?.id;
  const [data, teamAccess] = agentId
    ? await Promise.all([getGoalsData(agentId), getTeamAccessData(agentId)])
    : await Promise.all([
        Promise.resolve({ salesGoal: null, teamGoal: null, teamGrowth: null }),
        Promise.resolve({ teamUnlocked: false, directAgents: 0 }),
      ]);
  return <GoalsPage {...data} teamUnlocked={teamAccess.teamUnlocked} />;
}
