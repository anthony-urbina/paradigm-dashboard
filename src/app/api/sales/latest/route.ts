import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("sales")
    .select("id, ap, carrier, sold_at, agents(name, profile_image_url, discord_avatar_url)")
    .not("agent_id", "is", null)
    .order("sold_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return NextResponse.json(null);

  const row = data as unknown as {
    id: string;
    ap: number;
    carrier: string;
    sold_at: string;
    agents: { name: string; profile_image_url: string | null; discord_avatar_url: string | null } | null;
  };

  const agentName = row.agents?.name ?? "Someone";
  const initials = agentName.split(" ").map((p: string) => p[0]).join("").slice(0, 2).toUpperCase();
  const imageUrl = row.agents?.profile_image_url ?? row.agents?.discord_avatar_url ?? null;

  return NextResponse.json(
    { id: row.id, agentName, initials, carrier: row.carrier, ap: Number(row.ap), imageUrl },
    { headers: { "Cache-Control": "no-store" } }
  );
}
