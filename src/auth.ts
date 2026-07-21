import NextAuth from "next-auth";
import type { JWT } from "next-auth/jwt";
import Discord from "next-auth/providers/discord";

import { createServiceClient } from "@/lib/supabase";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    agentId?: string;
    role?: string;
    email?: string;
    picture?: string | null;
    name?: string | null;
  }
}

type AgentRecord = {
  id: string;
  name: string;
  email: string;
  role: string;
};

async function resolveAgentByEmail(email?: string | null): Promise<AgentRecord | null> {
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail) {
    console.error("[auth] resolveAgentByEmail missing email", { originalEmail: email ?? null });
    return null;
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("agents")
    .select("id, name, email, role")
    .ilike("email", normalizedEmail)
    .limit(5);

  if (error) {
    console.error("[auth] resolveAgentByEmail failed", {
      email: normalizedEmail,
      error: error.message,
    });
    return null;
  }

  const matches = (data ?? []) as AgentRecord[];
  console.log("[auth] resolveAgentByEmail query", {
    email: normalizedEmail,
    matchCount: matches.length,
    matches: matches.map((agent) => ({
      id: agent.id,
      email: agent.email,
      role: agent.role,
      hasName: agent.name.trim().length > 0,
    })),
  });

  if (matches.length === 0) {
    return null;
  }

  const exactMatch =
    matches.find((agent) => agent.email.trim().toLowerCase() === normalizedEmail) ??
    matches[0];

  if (matches.length > 1) {
    console.warn("[auth] resolveAgentByEmail multiple matches", {
      email: normalizedEmail,
      selectedAgentId: exactMatch.id,
      selectedAgentEmail: exactMatch.email,
    });
  }

  return exactMatch;
}

async function activateInvitedAgent(
  agent: AgentRecord,
  user: { name?: string | null; image?: string | null },
  discord?: { userId: string; username?: string | null; globalName?: string | null },
) {
  const update: Record<string, unknown> = {};

  if (agent.name.trim().length === 0 && user.name?.trim()) {
    update.name = user.name.trim();
  }
  if (user.image) {
    update.profile_image_url = user.image;
  }
  if (discord) {
    update.discord_user_id = discord.userId;
    update.discord_username = discord.username ?? null;
    update.discord_global_name = discord.globalName ?? null;
    update.discord_avatar_url = user.image ?? null;
    update.discord_connected_at = new Date().toISOString();
  }

  if (Object.keys(update).length === 0) return agent;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("agents")
    .update(update)
    .eq("id", agent.id)
    .select("id, name, email, role")
    .maybeSingle();

  if (error || !data) {
    console.error("[auth] activateInvitedAgent failed", {
      agentId: agent.id,
      email: agent.email,
      error: error?.message ?? "Unknown update error",
    });
    return agent;
  }

  return data;
}

async function resolveAgentFromToken(token: JWT): Promise<AgentRecord | null> {
  const supabase = createServiceClient();

  if (token.agentId) {
    const { data, error } = await supabase
      .from("agents")
      .select("id, name, email, role")
      .eq("id", token.agentId)
      .maybeSingle();

    if (data && !error) return data;
  }

  return resolveAgentByEmail(typeof token.email === "string" ? token.email : null);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Discord({
      clientId: process.env.AUTH_DISCORD_CLIENT_ID!,
      clientSecret: process.env.AUTH_DISCORD_CLIENT_SECRET!,
      authorization: { params: { scope: "identify email guilds" } },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("[auth] signIn start", {
        email: user.email ?? null,
        name: user.name ?? null,
      });

      // Guild membership check
      if (account?.provider === "discord" && account.access_token) {
        const guildsRes = await fetch("https://discord.com/api/users/@me/guilds", {
          headers: { Authorization: `Bearer ${account.access_token}` },
        });
        if (guildsRes.ok) {
          const guilds = (await guildsRes.json()) as { id: string }[];
          const inGuild = guilds.some((g) => g.id === "1336793736671137863");
          if (!inGuild) {
            console.error("[auth] signIn denied — not in guild", { email: user.email ?? null });
            return "/login?error=not_in_server";
          }
        } else {
          console.error("[auth] signIn — could not fetch guilds", { status: guildsRes.status });
          return "/login?error=guild_check_failed";
        }
      }

      // const agent = await resolveAgentByEmail(user.email);
      // if (!agent) {
      //   console.error("[auth] signIn denied", { email: user.email ?? null });
      //   return "/login?error=not_registered";
      // }

      // console.log("[auth] signIn allowed", {
      //   email: user.email ?? null,
      //   agentId: agent.id,
      //   role: agent.role,
      // });

      // const discord =
      //   account?.provider === "discord" && account.providerAccountId
      //     ? {
      //         userId: account.providerAccountId,
      //         username: (profile as { username?: string } | undefined)?.username ?? null,
      //         globalName: (profile as { global_name?: string } | undefined)?.global_name ?? null,
      //       }
      //     : undefined;

      // await activateInvitedAgent(agent, user, discord);
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user?.email || trigger === "signIn") {
        token.email = user?.email ?? token.email;
        token.name = user?.name ?? token.name;
        token.picture = user?.image ?? token.picture;
      }

      const agent = await resolveAgentFromToken(token);
      if (agent) {
        token.agentId = agent.id;
        token.role = agent.role;
        token.email = agent.email;
        token.name = agent.name || token.name;
      } else {
        delete token.agentId;
        delete token.role;
      }

      return token;
    },
    async session({ session, token }) {
      session.user.id = (token.agentId as string | undefined) ?? "";
      session.user.name = (token.name as string | undefined) ?? session.user.name;
      session.user.email = (token.email as string | undefined) ?? session.user.email;
      session.user.image = (token.picture as string | null | undefined) ?? session.user.image;
      session.user.role = (token.role as string | undefined) ?? "agent";

      console.log("[auth] session", {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
      });

      return session;
    },
  },
});
