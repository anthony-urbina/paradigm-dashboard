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
  const email = session?.user?.email?.trim();
  if (!email) return null;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("agents")
    .select("id, name, email, role, profile_image_url")
    .ilike("email", email)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    profileImageUrl: data.profile_image_url,
  };
}
