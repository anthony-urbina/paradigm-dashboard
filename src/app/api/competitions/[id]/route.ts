import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const supabase = createServiceClient();

  const update: Record<string, unknown> = {};
  if (body.name !== undefined) update.name = body.name;
  if (body.description !== undefined) update.description = body.description;
  if (body.prize !== undefined) update.prize = body.prize;
  if (body.startDate !== undefined) update.start_date = body.startDate;
  if (body.endDate !== undefined) update.end_date = body.endDate;
  if (body.status !== undefined) update.status = body.status;
  if (body.pinned !== undefined) update.pinned = body.pinned;

  const { error } = await supabase.from("competitions").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServiceClient();
  const { error } = await supabase.from("competitions").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
