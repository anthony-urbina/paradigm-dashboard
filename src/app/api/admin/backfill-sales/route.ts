import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { createServiceClient } from "@/lib/supabase";

const DEV_DISCORD_USER_ID = "302261992477949952";

export async function POST() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only the dev can run this
  const supabase = createServiceClient();
  const { data: callerAgent } = await supabase
    .from("agents")
    .select("discord_user_id")
    .eq("id", session.user.id)
    .maybeSingle();

  if (callerAgent?.discord_user_id !== DEV_DISCORD_USER_ID) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 1. Fetch all unassigned sales that have a discord_user_id
  const { data: unassigned, error: fetchError } = await supabase
    .from("sales")
    .select("id, discord_user_id")
    .is("agent_id", null)
    .not("discord_user_id", "is", null);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!unassigned || unassigned.length === 0) {
    return NextResponse.json({ matched: 0, unmatched: 0, updated: 0 });
  }

  // 2. Get unique discord_user_ids and look up matching agents
  const discordIds = [...new Set(unassigned.map((s: { discord_user_id: string }) => s.discord_user_id))];

  const { data: agents, error: agentsError } = await supabase
    .from("agents")
    .select("id, discord_user_id")
    .in("discord_user_id", discordIds);

  if (agentsError) {
    return NextResponse.json({ error: agentsError.message }, { status: 500 });
  }

  const agentByDiscordId = new Map(
    (agents ?? []).map((a: { id: string; discord_user_id: string }) => [a.discord_user_id, a.id])
  );

  // 3. Group sales by agent_id match
  const toUpdate: { saleId: string; agentId: string }[] = [];
  let unmatched = 0;

  for (const sale of unassigned as { id: string; discord_user_id: string }[]) {
    const agentId = agentByDiscordId.get(sale.discord_user_id);
    if (agentId) {
      toUpdate.push({ saleId: sale.id, agentId });
    } else {
      unmatched++;
    }
  }

  // 4. Update in batches of 100
  let updated = 0;
  const errors: string[] = [];
  const BATCH = 100;

  for (let i = 0; i < toUpdate.length; i += BATCH) {
    const batch = toUpdate.slice(i, i + BATCH);
    const results = await Promise.all(
      batch.map(({ saleId, agentId }) =>
        supabase.from("sales").update({ agent_id: agentId }).eq("id", saleId)
      )
    );
    for (const { error } of results) {
      if (error) errors.push(error.message);
      else updated++;
    }
  }

  console.log("[backfill-sales] complete", { total: unassigned.length, updated, unmatched, errors: errors.length });

  return NextResponse.json({
    total_unassigned: unassigned.length,
    matched: toUpdate.length,
    updated,
    unmatched,
    errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
  });
}
