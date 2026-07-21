import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getCurrentAgent } from "@/lib/current-agent";
import { getDiscordAvatarUrl, getDiscordConfig, getDiscordRedirectUri, type DiscordUserProfile } from "@/lib/discord";
import { createServiceClient } from "@/lib/supabase";

const DISCORD_STATE_COOKIE = "discord_oauth_state";

function profileUrl(request: Request, status: string) {
  const url = new URL("/dashboard/profile", request.url);
  url.searchParams.set("discord", status);
  return url;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const oauthError = requestUrl.searchParams.get("error");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get(DISCORD_STATE_COOKIE)?.value;
  cookieStore.delete(DISCORD_STATE_COOKIE);

  if (oauthError) {
    return NextResponse.redirect(profileUrl(request, "cancelled"));
  }

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(profileUrl(request, "error_state"));
  }

  const session = await auth();
  const agent = await getCurrentAgent(session);
  if (!agent) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const config = getDiscordConfig();
  if (!config) {
    return NextResponse.redirect(profileUrl(request, "error_config"));
  }

  const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: getDiscordRedirectUri(request),
    }),
    cache: "no-store",
  });

  if (!tokenResponse.ok) {
    console.error("[discord-connect] token exchange failed", await tokenResponse.text());
    return NextResponse.redirect(profileUrl(request, "error_exchange"));
  }

  const tokenData = (await tokenResponse.json()) as { access_token?: string };
  if (!tokenData.access_token) {
    return NextResponse.redirect(profileUrl(request, "error_exchange"));
  }

  const userResponse = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
    cache: "no-store",
  });

  if (!userResponse.ok) {
    console.error("[discord-connect] user fetch failed", await userResponse.text());
    return NextResponse.redirect(profileUrl(request, "error_profile"));
  }

  const discordUser = (await userResponse.json()) as DiscordUserProfile;
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("agents")
    .update({
      discord_user_id: discordUser.id,
      discord_username: discordUser.username,
      discord_global_name: discordUser.global_name,
      discord_avatar_url: getDiscordAvatarUrl(discordUser),
      discord_connected_at: new Date().toISOString(),
    })
    .eq("id", agent.id);

  if (error) {
    console.error("[discord-connect] failed to save profile", error);
    const status = error.message.toLowerCase().includes("duplicate") ? "error_taken" : "error_save";
    return NextResponse.redirect(profileUrl(request, status));
  }

  return NextResponse.redirect(profileUrl(request, "connected"));
}
