import { auth } from "@/auth";
import { ParadigmShell } from "@/components/paradigm";
import { getCurrentAgent } from "@/lib/current-agent";
import { getTeamAccessData } from "@/lib/data";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const agent = await getCurrentAgent(session);
  if (!agent) {
    redirect("/auth/error?error=AccessDenied");
  }

  const user = {
    name: agent.name || session.user.name,
    email: agent.email,
    image: agent.profileImageUrl ?? session.user.image ?? null,
  };
  const isAdmin = agent.role === "admin";
  const teamAccess = await getTeamAccessData(agent.id);

  return <ParadigmShell user={user} teamUnlocked={teamAccess.teamUnlocked} isAdmin={isAdmin}>{children}</ParadigmShell>;
}
