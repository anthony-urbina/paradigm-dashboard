import NextAuth from "next-auth";
import type { JWT } from "next-auth/jwt";
import Google from "next-auth/providers/google";

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

async function activateInvitedAgent(agent: AgentRecord, user: { name?: string | null; image?: string | null }) {
  if (agent.name.trim().length > 0 && !user.image) return agent;

  const update: { name?: string; profile_image_url?: string | null } = {};
  if (agent.name.trim().length === 0 && user.name?.trim()) {
    update.name = user.name.trim();
  }
  if (user.image) {
    update.profile_image_url = user.image;
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
  providers: [Google],
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user }) {
      console.log("[auth] signIn start", {
        email: user.email ?? null,
        name: user.name ?? null,
      });

      const agent = await resolveAgentByEmail(user.email);
      if (!agent) {
        console.error("[auth] signIn denied", { email: user.email ?? null });
        return false;
      }

      console.log("[auth] signIn allowed", {
        email: user.email ?? null,
        agentId: agent.id,
        role: agent.role,
      });

      await activateInvitedAgent(agent, user);
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
