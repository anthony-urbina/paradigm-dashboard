import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { getCurrentAgent } from "@/lib/current-agent";
import { createServiceClient } from "@/lib/supabase";

const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
});

export async function PATCH(req: Request) {
  const session = await auth();
  const agent = await getCurrentAgent(session);
  if (!agent) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = updateProfileSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const update: { name?: string } = {};
  if (parsed.data.name) update.name = parsed.data.name;

  if (Object.keys(update).length === 0) return NextResponse.json({ error: "No changes" }, { status: 400 });

  const supabase = createServiceClient();
  const { error } = await supabase.from("agents").update(update).eq("id", agent.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
