import type { Session } from "next-auth";

import { createServiceClient } from "@/lib/supabase";

export type CurrentAgent = {
  id: string;
  name: string;
  email: string;
  role: string;
  profileImageUrl: string | null;
};

export async function getCurrentAgent(session: Session | null): Promise<CurrentAgent | null> {
  const sessionAgentId = session?.user?.id?.trim();
  const email = session?.user?.email?.trim();
  if (!sessionAgentId && !email) return null;

  const supabase = createServiceClient();
  let query = supabase
    .from("agents")
    .select("id, name, email, role, profile_image_url");

  if (sessionAgentId) {
    query = query.eq("id", sessionAgentId);
  } else if (email) {
    query = query.ilike("email", email);
  }

  const { data, error } = await query.maybeSingle();

  if ((error || !data) && sessionAgentId && email) {
    const fallback = await supabase
      .from("agents")
      .select("id, name, email, role, profile_image_url")
      .ilike("email", email)
      .maybeSingle();

    if (!fallback.error && fallback.data) {
      return {
        id: fallback.data.id,
        name: fallback.data.name,
        email: fallback.data.email,
        role: fallback.data.role,
        profileImageUrl: fallback.data.profile_image_url ?? null,
      };
    }
  }

  if (error || !data) {
    console.error("[auth] getCurrentAgent failed", {
      sessionAgentId: sessionAgentId ?? null,
      email: email ?? null,
      error: error?.message ?? "No agent found",
    });
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    profileImageUrl: data.profile_image_url ?? null,
  };
}
