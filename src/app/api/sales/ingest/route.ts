import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

const SALES_INGEST_API_KEY = process.env.SALES_INGEST_API_KEY;

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req: Request) {
  const apiKey = req.headers.get("x-api-key");

  if (!SALES_INGEST_API_KEY) {
    return NextResponse.json({ error: "Sales ingest API key is not configured" }, { status: 500, headers: corsHeaders });
  }

  if (apiKey !== SALES_INGEST_API_KEY) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401, headers: corsHeaders });
  }

  let payload: unknown;

  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400, headers: corsHeaders });
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return NextResponse.json({ error: "Expected a JSON object body" }, { status: 400, headers: corsHeaders });
  }

  const body = payload as { data?: unknown };

  if (!body.data || typeof body.data !== "object" || Array.isArray(body.data)) {
    return NextResponse.json({ error: "Expected a `data` object in the request body" }, { status: 400, headers: corsHeaders });
  }

  console.log("[sales-ingest] received payload", {
    receivedAt: new Date().toISOString(),
    data: body.data,
  });

  return NextResponse.json({
    ok: true,
    message: "Sales payload received",
  }, { headers: corsHeaders });
}
