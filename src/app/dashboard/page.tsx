import { WelcomePage } from "@/components/paradigm";
import { getCurrentAgent } from "@/lib/current-agent";
import { getWelcomeData, getCompetitionsData } from "@/lib/data";
import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();
  const agent = await getCurrentAgent(session);
  const agentId = agent?.id;
  const [data, competitions] = await Promise.all([
    agentId
      ? getWelcomeData(agentId)
      : Promise.resolve({
          weeklyLeaders: [],
          monthlyLeaders: [],
          latestSale: null,
          salesGoal: null,
          teamGoal: null,
        }),
    getCompetitionsData(),
  ]);
  const featuredComp = competitions.find((c) => c.pinned) ?? null;
  const agentName = agent?.name ?? session?.user?.name ?? "Agent";
  return <WelcomePage agentName={agentName} {...data} featuredComp={featuredComp} />;
}
