import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import type { LeaderboardPostCard } from "@/lib/data";

// Read the Paradigm logo once at module load (sync is fine at startup)
function getLogoDataUrl(): string {
  const logoPath = path.join(process.cwd(), "public", "paradigm-logo.png");
  const buf = fs.readFileSync(logoPath);
  return `data:image/png;base64,${buf.toString("base64")}`;
}

// Fetch a remote image and return a base64 data URL (returns null on failure)
async function toDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const mimeType = res.headers.get("content-type")?.split(";")[0] ?? "image/jpeg";
    const buf = await res.arrayBuffer();
    const b64 = Buffer.from(buf).toString("base64");
    return `data:${mimeType};base64,${b64}`;
  } catch {
    return null;
  }
}

function buildPromptText(post: LeaderboardPostCard, hasRefPhotos: boolean): string {
  const fmtAp = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
  const periodType = post.title.replace(/\s*post\s*/i, "").toUpperCase();

  const top3 = post.entries.slice(0, 3);
  const podiumLines = top3.map((e) => {
    const pos   = e.rank === 1 ? "CENTER (tallest gold/marble podium)" : e.rank === 2 ? "LEFT (medium silver/white podium)" : "RIGHT (shortest silver/white podium)";
    const ring  = e.rank === 1 ? "thick gold ring border and golden glow halo" : "silver ring border";
    const crown = e.rank === 1 ? "gold crown" : "silver crown";
    const apCol = e.rank === 1 ? "large gold text" : "bold black text";
    const avatar = hasRefPhotos && e.imageUrl
      ? `Use the reference photo provided above for this person's face inside the circle.`
      : `Show initials "${e.initials}" in bold inside the circle.`;
    return `  #${e.rank} — ${pos}: Circle avatar with ${ring}. ${avatar} ${crown} above circle. Below podium: "${e.shortName}" bold italic, "TOTAL AP" label in small gray, ${fmtAp(e.ap)} in ${apCol}, "${e.salesCount} ${e.salesCount === 1 ? "sale" : "sales"}" in gray.`;
  }).join("\n");

  const restSection = post.entries.slice(3).length > 0
    ? `\nADDITIONAL RANKINGS (two-column list below the podium):\n${post.entries.slice(3).map((e) => `  #${e.rank} ${e.shortName} — ${fmtAp(e.ap)}, ${e.salesCount} ${e.salesCount === 1 ? "sale" : "sales"}`).join("\n")}`
    : "";

  return `Create a professional sports-inspired leaderboard graphic for Paradigm Financial insurance agency. Portrait orientation (2:3 ratio), suitable for Instagram.

STYLE: Off-white/cream textured background with dark gray grunge paint brush stroke splatters in the upper-left and upper-right corners. Bold athletic typography. Gold and silver metallic accents. Clean, high-contrast, premium social media graphic.

LAYOUT (top to bottom):

1. HEADER: Use the exact Paradigm Financial logo image provided above, centered at the top. Do not redraw or substitute it.

2. MAIN TITLE: "LEADERBOARD" — very large, bold, italic, black, athletic/brush-script style.

3. SUBTITLE: "${periodType}" — large gold metallic gradient text. Gold brushstroke accent marks flanking the word on each side.

4. DATE: "${post.periodLabel.toUpperCase()}" — small bold black centered text with thin horizontal lines extending left and right.

5. PODIUM (three positions, classic award-podium layout):
${podiumLines}
   CRITICAL PODIUM HEIGHT RULES — follow exactly:
   - #1 CENTER podium is by far the tallest — roughly 3× the height of the #3 podium. It dominates the center.
   - #2 LEFT podium is only slightly taller than #3 — perhaps 20–30% taller at most. It should look nearly the same height as #3, NOT close to #1's height.
   - #3 RIGHT podium is the shortest.
   - There must be a very large, obvious height gap between #1 and both #2 and #3. The #2 and #3 podiums should look like short steps compared to the towering #1 podium.
   - All three podium blocks share the same bottom edge. Ghost rank numbers inside each block. Gold rank badge for #1, dark gray for #2 and #3.
${restSection}

6. FOOTER BAR — lightly shaded rounded rectangle:
   LEFT: Gold circle with "$" + "TEAM TOTAL AP" in small gray caps + "${fmtAp(post.totalAp)}" in large gold.
   VERTICAL DIVIDER.
   RIGHT: Person silhouette icon + "WRITING AGENTS" in small gray caps + "${post.writingAgents}" in large gold.

7. BOTTOM TAGLINE: "ONE TEAM." | "ONE MISSION." | "ONE CHAMPION." separated by vertical lines. Small bold dark uppercase.

Render all text exactly as specified. Use exact names and numbers. Professional, bold, Instagram-ready.`;
}

type ContentPart =
  | { type: "input_text"; text: string }
  | { type: "input_image"; image_url: string };

type ResponseOutput = {
  type: string;
  result?: string;
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 });
  }

  const post = (await req.json()) as LeaderboardPostCard;

  if (!post.ready || post.entries.length === 0) {
    return NextResponse.json({ error: "No data to generate from" }, { status: 400 });
  }

  // Fetch profile pictures for the top 3 entries in parallel
  const top3 = post.entries.slice(0, 3);
  const fetchedImages = await Promise.all(
    top3.map(async (entry) => {
      if (!entry.imageUrl) return { entry, dataUrl: null };
      const dataUrl = await toDataUrl(entry.imageUrl);
      return { entry, dataUrl };
    }),
  );

  const hasRefPhotos = fetchedImages.some((f) => f.dataUrl !== null);

  // Build multi-modal content array
  const content: ContentPart[] = [];

  // Always include the exact Paradigm logo first
  content.push({
    type: "input_text",
    text: "IMPORTANT — OFFICIAL LOGO: The image below is the exact Paradigm Financial logo. You MUST reproduce it precisely at the top center of the graphic. Do not redraw, simplify, or substitute it with anything else. Copy it faithfully:",
  });
  content.push({ type: "input_image", image_url: getLogoDataUrl() });

  // Prepend each profile photo with a label so the model knows who it's for
  for (const { entry, dataUrl } of fetchedImages) {
    if (!dataUrl) continue;
    content.push({
      type: "input_text",
      text: `Reference profile photo for rank #${entry.rank} — ${entry.name} (initials "${entry.initials}"). Use this person's face/likeness inside their avatar circle on the leaderboard:`,
    });
    content.push({ type: "input_image", image_url: dataUrl });
  }

  content.push({ type: "input_text", text: buildPromptText(post, hasRefPhotos) });

  // Use the Responses API which supports multi-modal input + image generation tool
  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      input: [{ role: "user", content }],
      tools: [
        {
          type: "image_generation",
          size: "1024x1536",
          quality: "high",
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("OpenAI Responses API error:", err);
    return NextResponse.json({ error: "Image generation failed" }, { status: res.status });
  }

  const data = (await res.json()) as { output: ResponseOutput[] };
  const imageOutput = data.output.find((o) => o.type === "image_generation_call");

  if (!imageOutput?.result) {
    console.error("No image_generation_call in response:", JSON.stringify(data));
    return NextResponse.json({ error: "No image in response" }, { status: 500 });
  }

  return NextResponse.json({ b64_json: imageOutput.result });
}
