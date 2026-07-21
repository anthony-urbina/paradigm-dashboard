import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { getCurrentAgent } from "@/lib/current-agent";
import { createServiceClient } from "@/lib/supabase";

const updateCompGuideSchema = z.object({
  id: z.string().uuid(),
  baseRate: z.coerce.number().min(0).max(200),
});

export async function PATCH(req: Request) {
  const session = await auth();
  const agent = await getCurrentAgent(session);

  if (!agent || agent.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const parsed = updateCompGuideSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "A valid comp guide update is required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("carrier_product_comp_rates")
    .update({ base_rate: parsed.data.baseRate })
    .eq("id", parsed.data.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
