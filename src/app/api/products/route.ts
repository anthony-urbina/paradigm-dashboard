import { NextResponse } from "next/server";

import { createServiceClient } from "@/lib/supabase";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

const SALES_INGEST_API_KEY = process.env.SALES_INGEST_API_KEY;

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: Request) {
  const apiKey = req.headers.get("x-api-key");

  if (!SALES_INGEST_API_KEY) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500, headers: corsHeaders });
  }

  if (apiKey !== SALES_INGEST_API_KEY) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401, headers: corsHeaders });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("carrier_product_comp_rates")
    .select("carrier, product, category")
    .order("carrier")
    .order("product");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }

  // Return in the format the bot expects: { carrier, name, product_type }
  const products = (data ?? []).map((row) => ({
    carrier: row.carrier,
    name: row.product,
    product_type: row.category as string,
  }));

  return NextResponse.json({ products }, { headers: corsHeaders });
}
