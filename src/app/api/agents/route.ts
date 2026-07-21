import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { getCurrentAgent } from "@/lib/current-agent";
import { createServiceClient } from "@/lib/supabase";

const SCHEMA_REPAIR_MIGRATION = "supabase/migrations/0007_schema_repair.sql";

const createAgentSchema = z.object({
  email: z.string().trim().email().optional(),
  emails: z.array(z.string().trim().email()).min(1).optional(),
});

const updateAgentSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(["admin", "agent"]).optional(),
  uplineId: z.string().uuid().nullable().optional(),
  compPercentage: z.coerce.number().min(0).max(200).optional(),
});

export async function GET() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("agents")
    .select("id, name")
    .order("name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json((data ?? []).filter((row) => row.name.trim().length > 0));
}

export async function POST(req: Request) {
  const session = await auth();
  const agent = await getCurrentAgent(session);

  if (!agent || agent.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const parsed = createAgentSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "A valid email or email list is required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const normalizedEmails = Array.from(
    new Set(
      (parsed.data.emails ?? (parsed.data.email ? [parsed.data.email] : []))
        .map((email) => email.toLowerCase())
    )
  );

  if (normalizedEmails.length === 0) {
    return NextResponse.json({ error: "A valid email or email list is required" }, { status: 400 });
  }

  const { data: existing, error: existingError } = await supabase
    .from("agents")
    .select("id, email, name")
    .in("email", normalizedEmails);

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  const existingRows = existing ?? [];
  const existingByEmail = new Map(existingRows.map((row) => [row.email.toLowerCase(), row]));
  const emailsToInsert = normalizedEmails.filter((email) => !existingByEmail.has(email));

  if (emailsToInsert.length > 0) {
    const { error } = await supabase
      .from("agents")
      .insert(
        emailsToInsert.map((email) => ({
          email,
          name: "",
          role: "agent",
        }))
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  const alreadyApproved = existingRows.filter((row) => !row.name).map((row) => row.email);
  const alreadyActive = existingRows.filter((row) => !!row.name).map((row) => row.email);

  return NextResponse.json({
    ok: true,
    created: emailsToInsert,
    alreadyApproved,
    alreadyActive,
    totalRequested: normalizedEmails.length,
  });
}

export async function PATCH(req: Request) {
  const session = await auth();
  const agent = await getCurrentAgent(session);

  if (!agent || agent.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const parsed = updateAgentSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "A valid agent update is required" }, { status: 400 });
  }

  const update: { role?: "admin" | "agent"; upline_id?: string | null; comp_percentage?: number } = {};
  if (parsed.data.role !== undefined) update.role = parsed.data.role;
  if (parsed.data.uplineId !== undefined) update.upline_id = parsed.data.uplineId;
  if (parsed.data.compPercentage !== undefined) update.comp_percentage = parsed.data.compPercentage;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No changes provided" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("agents").update(update).eq("id", parsed.data.id);

  if (error) {
    if (error.message.includes("comp_percentage")) {
      return NextResponse.json({
        error: `Your database is missing the agents comp column. Run ${SCHEMA_REPAIR_MIGRATION} against Supabase, then retry.`,
      }, { status: 500 });
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
