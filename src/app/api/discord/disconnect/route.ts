import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getCurrentAgent } from "@/lib/current-agent";
import { createServiceClient } from "@/lib/supabase";

export async function POST() {
  const session = await auth();
  const agent = await getCurrentAgent(session);

  if (!agent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("agents")
    .update({
      discord_user_id: null,
      discord_username: null,
      discord_global_name: null,
      discord_avatar_url: null,
      discord_connected_at: null,
    })
    .eq("id", agent.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
