import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getCurrentAgent } from "@/lib/current-agent";
import { getDiscordConfig, getDiscordRedirectUri } from "@/lib/discord";

const DISCORD_STATE_COOKIE = "discord_oauth_state";

function profileUrl(request: Request, status?: string) {
  const url = new URL("/dashboard/profile", request.url);
  if (status) url.searchParams.set("discord", status);
  return url;
}

export async function GET(request: Request) {
  const session = await auth();
  const agent = await getCurrentAgent(session);

  if (!agent) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const config = getDiscordConfig();
  if (!config) {
    return NextResponse.redirect(profileUrl(request, "error_config"));
  }

  const state = crypto.randomUUID();
  const cookieStore = await cookies();
  cookieStore.set(DISCORD_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });

  const redirectUri = getDiscordRedirectUri(request);
  const url = new URL("https://discord.com/oauth2/authorize");
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", "identify");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "consent");

  return NextResponse.redirect(url);
}
