import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getCurrentAgent } from "@/lib/current-agent";
import { createServiceClient } from "@/lib/supabase";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const agent = await getCurrentAgent(session);
  if (!agent || agent.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createServiceClient();

  // Fetch the product first so we can delete its ffl_rate_schedules rows
  const { data: product, error: fetchError } = await supabase
    .from("carrier_product_comp_rates")
    .select("carrier, product")
    .eq("id", id)
    .single();

  if (fetchError || !product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Delete FFL schedule rows first
  const { error: scheduleError } = await supabase
    .from("ffl_rate_schedules")
    .delete()
    .eq("carrier", product.carrier)
    .eq("product", product.product);

  if (scheduleError) {
    return NextResponse.json({ error: scheduleError.message }, { status: 500 });
  }

  // Delete the product
  const { error: deleteError } = await supabase
    .from("carrier_product_comp_rates")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
