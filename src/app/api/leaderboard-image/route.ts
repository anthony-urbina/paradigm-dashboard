import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import type { LeaderboardPostCard } from "@/lib/data";

function getLogoDataUrl(): string {
  const logoPath = path.join(process.cwd(), "public", "paradigm-logo.png");
  const buf = fs.readFileSync(logoPath);
  return `data:image/png;base64,${buf.toString("base64")}`;
}

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
  // Use the card key so it's always "DAILY", "WEEKLY", or "MONTHLY"
  const periodType = post.key.toUpperCase();

  const top3 = post.entries.slice(0, 3);
  const podiumLines = top3.map((e) => {
    const pos    = e.rank === 1 ? "CENTER (tallest podium)" : e.rank === 2 ? "LEFT (second podium)" : "RIGHT (shortest podium)";
    const ring   = e.rank === 1 ? "thick gold ring border with a golden particle/sparkle glow halo radiating outward" : "silver ring border";
    const crownD = e.rank === 1 ? "large ornate gold crown (5 points, jeweled)" : "small simple silver crown (3 points)";
    const apCol  = e.rank === 1 ? "large gold metallic gradient text" : "large bold dark text";
    const avatarDesc = hasRefPhotos && e.imageUrl
      ? `Use the reference photo provided for this person inside the circle.`
      : `Show initials "${e.initials}" in large bold black text inside the circle.`;
    return `  #${e.rank} — ${pos}: Circle avatar with ${ring}. ${avatarDesc} ${crownD} centered above the circle. Below the podium block: "${e.shortName}" in bold italic uppercase, "TOTAL AP" in small gray letter-spaced caps, ${fmtAp(e.ap)} in ${apCol}, "${e.salesCount} ${e.salesCount === 1 ? "sale" : "sales"}" in small gray.`;
  }).join("\n");

  const restSection = post.entries.slice(3).length > 0
    ? `\n\nRANKS 4 AND BELOW — two-column list below the podium info:\n${post.entries.slice(3).map((e) => `  #${e.rank} ${e.shortName} — ${fmtAp(e.ap)}, ${e.salesCount} ${e.salesCount === 1 ? "sale" : "sales"}`).join("\n")}`
    : "";

  return `Create a professional sports-inspired leaderboard graphic for Paradigm Financial insurance agency. Portrait orientation (2:3 ratio), suitable for Instagram. Size: 1024×1536.

═══ OVERALL STYLE ═══
• Background: Off-white / warm cream (#F5F3EE). Heavy dark-charcoal grunge paint-splatter brush strokes in the upper-left and upper-right corners — dramatic, rough, paint-splat texture that bleeds off the edge. The splatters should be very dark (near-black charcoal) and cover a large portion of the upper corners, with scattered ink-drop dots along their edges. The rest of the background stays clean cream.
• Typography: bold athletic sans-serif. "LEADERBOARD" uses a rough brush-script / grunge style — jagged, hand-painted letterforms with visible texture and rough edges (like a sports team logo font). All other text is clean bold sans-serif.
• Color palette: gold (#C8921A to #F7D94C gradient, metallic), silver (#9a9a98 to #e6e6e4 gradient, metallic), near-black (#0A0A0A) for title, cream background.
• Overall feel: premium Instagram sports graphic — high contrast, bold, clean.

═══ LAYOUT (top to bottom, strictly in this order) ═══

1. LOGO — centered at very top. Use the attached Paradigm Financial logo image exactly as-is. Do not redraw it.

2. MAIN TITLE — "LEADERBOARD" in very large (dominant) rough brush-script / grunge italic font, near-black, centered. The letters should look painted/textured, not clean.

3. PERIOD LABEL — "${periodType}" in large clean bold sans-serif, gold metallic gradient (#F7D94C → #C8921A → #8A5F10 top to bottom), centered. Flanked on each side by 3–4 short diagonal gold brush-stroke slash marks (like hatching), arranged in a stacked slightly-angled group. These slash marks sit to the LEFT and RIGHT of the "${periodType}" word.

4. DATE — "${post.periodLabel.toUpperCase()}" in small bold dark centered text. Thin horizontal lines extending left and right from the date text.

5. PODIUM SECTION — classic three-tier award podium:

${podiumLines}

   CRITICAL PODIUM HEIGHT RULES (must follow exactly):
   - #1 CENTER podium block: by far the tallest — approximately 3× the height of #3. Gold/marble gradient (cream-gold to warm gold). Ghost "1" numeral inside the block.
   - #2 LEFT podium block: only slightly taller than #3 (≈20% taller). Silver/white gradient. Ghost "2" numeral inside.
   - #3 RIGHT podium block: shortest. Silver/white gradient. Ghost "3" numeral inside.
   - All three blocks share the exact same bottom edge. The gap between #1 and #2/#3 must be dramatic and obvious.
   - Rank badge: gold rounded-rectangle badge with rank number at the bottom of each avatar ring (#1 gold badge, #2 and #3 dark gray badges).${restSection}

6. FOOTER BAR — lightly shaded rounded-rectangle with a subtle border, full width:
   LEFT HALF: Gold circle outline with "$" symbol inside + "TEAM TOTAL AP" in small gray letter-spaced caps above + "${fmtAp(post.totalAp)}" in large gold metallic text below.
   VERTICAL DIVIDER LINE in center.
   RIGHT HALF: Group-of-people silhouette icon (gold/dark) + "WRITING AGENTS" in small gray letter-spaced caps above + "${post.writingAgents}" in large gold metallic text below.

7. BOTTOM TAGLINE — three sections separated by thin vertical lines:
   [target/bullseye icon]  ONE TEAM.  |  [people icon]  ONE MISSION.  |  [trophy icon]  ONE CHAMPION.
   Small bold dark uppercase text with matching icons.

═══ EXACT NUMBERS AND NAMES ═══
Render all text, names, and numbers exactly as specified above. No paraphrasing or substitution.

Professional, bold, Instagram-ready. Make it look like a premium sports championship graphic.`;
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

  // Fetch profile photos for top 3 in parallel
  const top3 = post.entries.slice(0, 3);
  const fetchedImages = await Promise.all(
    top3.map(async (entry) => {
      if (!entry.imageUrl) return { entry, dataUrl: null };
      const dataUrl = await toDataUrl(entry.imageUrl);
      return { entry, dataUrl };
    }),
  );

  const hasRefPhotos = fetchedImages.some((f) => f.dataUrl !== null);

  const content: ContentPart[] = [];

  // Logo first
  content.push({
    type: "input_text",
    text: "IMPORTANT — OFFICIAL LOGO: The image below is the exact Paradigm Financial logo. Reproduce it precisely at the top center. Do not redraw, simplify, or substitute it:",
  });
  content.push({ type: "input_image", image_url: getLogoDataUrl() });

  // Profile photos with labels
  for (const { entry, dataUrl } of fetchedImages) {
    if (!dataUrl) continue;
    content.push({
      type: "input_text",
      text: `Reference profile photo for rank #${entry.rank} — ${entry.name} (initials "${entry.initials}"). Place this person's face inside their avatar circle:`,
    });
    content.push({ type: "input_image", image_url: dataUrl });
  }

  content.push({ type: "input_text", text: buildPromptText(post, hasRefPhotos) });

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
