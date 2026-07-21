export type DiscordConfig = {
  clientId: string;
  clientSecret: string;
};

export type DiscordUserProfile = {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
};

export function getDiscordConfig(): DiscordConfig | null {
  const clientId = process.env.DISCORD_CLIENT_ID?.trim();
  const clientSecret = process.env.DISCORD_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) return null;

  return { clientId, clientSecret };
}

export function getDiscordRedirectUri(request: Request) {
  return new URL("/api/discord/callback", request.url).toString();
}

export function getDiscordAvatarUrl(user: DiscordUserProfile) {
  if (!user.avatar) return null;

  const extension = user.avatar.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${extension}?size=256`;
}
