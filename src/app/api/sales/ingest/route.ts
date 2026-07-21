import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getCurrentAgent } from "@/lib/current-agent";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req: Request) {
  const session = await auth();
  const agent = await getCurrentAgent(session);

  if (!agent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
  }

  let payload: unknown;

  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400, headers: corsHeaders });
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return NextResponse.json({ error: "Expected a JSON object" }, { status: 400, headers: corsHeaders });
  }

  console.log("[sales-ingest] received payload", {
    agentId: agent.id,
    agentEmail: agent.email,
    receivedAt: new Date().toISOString(),
    data: payload,
  });

  return NextResponse.json({
    ok: true,
    message: "Sales payload received",
  }, { headers: corsHeaders });
}
