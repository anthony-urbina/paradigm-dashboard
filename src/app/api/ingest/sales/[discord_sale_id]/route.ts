import { NextResponse } from "next/server";

import { createServiceClient } from "@/lib/supabase";

const SALES_INGEST_API_KEY = process.env.SALES_INGEST_API_KEY;

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ discord_sale_id: string }> },
) {
  const apiKey = req.headers.get("x-api-key");

  if (!SALES_INGEST_API_KEY) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  if (apiKey !== SALES_INGEST_API_KEY) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const { discord_sale_id } = await params;

  const supabase = createServiceClient();

  const { error } = await supabase
    .from("sales")
    .delete()
    .eq("discord_sale_id", discord_sale_id.toUpperCase());

  if (error) {
    console.error("[sales-ingest-delete] error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
