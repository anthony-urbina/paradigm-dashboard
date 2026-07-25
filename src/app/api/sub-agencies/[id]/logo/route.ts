import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getCurrentAgent } from "@/lib/current-agent";
import { createServiceClient } from "@/lib/supabase";

const BUCKET_NAME = "sub-agency-logos";
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function extensionForType(type: string) {
  if (type === "image/jpeg") return "jpg";
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  return "bin";
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const agent = await getCurrentAgent(session);
  if (!agent || agent.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "A file is required" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Upload a JPG, PNG, WEBP, or GIF image" }, { status: 400 });
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "Image must be 5 MB or smaller" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((b) => b.name === BUCKET_NAME)) {
    const { error: createBucketError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: MAX_FILE_BYTES,
      allowedMimeTypes: Array.from(ALLOWED_TYPES),
    });
    if (createBucketError && !createBucketError.message.toLowerCase().includes("already exists")) {
      return NextResponse.json({ error: createBucketError.message }, { status: 500 });
    }
  }

  const extension = extensionForType(file.type);
  const path = `${id}/logo-${Date.now()}.${extension}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, bytes, { contentType: file.type, upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
  const logoUrl = publicUrlData.publicUrl;

  const { error: updateError } = await supabase
    .from("sub_agencies")
    .update({ logo_url: logoUrl })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, logoUrl });
}
