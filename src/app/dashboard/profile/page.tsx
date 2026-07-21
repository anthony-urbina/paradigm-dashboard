import { auth } from "@/auth";
import { ProfilePage } from "@/components/paradigm";
import { getCurrentAgent } from "@/lib/current-agent";
import { getProfileData } from "@/lib/data";

export default async function DashboardProfilePage() {
  const session = await auth();
  const agent = await getCurrentAgent(session);
  const profile = agent?.id ? await getProfileData(agent.id) : null;

  return (
    <ProfilePage
      profile={{
        name: profile?.name ?? agent?.name ?? session?.user?.name ?? "Unknown user",
        email: profile?.email ?? agent?.email ?? session?.user?.email ?? "",
        phone: profile?.phone ?? null,
        image: profile?.profileImageUrl ?? agent?.profileImageUrl ?? session?.user?.image ?? null,
        discord: {
          userId: profile?.discordUserId ?? null,
          username: profile?.discordUsername ?? null,
          displayName: profile?.discordGlobalName ?? null,
          avatarUrl: profile?.discordAvatarUrl ?? null,
          connectedAt: profile?.discordConnectedAt ?? null,
        },
      }}
    />
  );
}
