import { CompetitionPage } from "@/components/paradigm";
import { getCurrentAgent } from "@/lib/current-agent";
import { getCompetitionsData } from "@/lib/data";
import { auth } from "@/auth";

export default async function DashboardCompetitionPage() {
  const [competitions, session] = await Promise.all([getCompetitionsData(), auth()]);
  const agent = await getCurrentAgent(session);
  const isAdmin = agent?.role === "admin";
  return <CompetitionPage competitions={competitions} isAdmin={isAdmin} />;
}
