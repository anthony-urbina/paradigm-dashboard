"use client";

import { useEffect } from "react";
import { toast } from "sonner";

const ERROR_MESSAGES: Record<string, string> = {
  not_in_server: "You must be a member of the Paradigm Discord server to sign in.",
  not_registered: "Your account isn't registered yet. Contact your admin for access.",
  guild_check_failed: "Couldn't verify your Discord server membership. Please try again.",
};

export default function LoginClient({ error }: { error?: string }) {
  useEffect(() => {
    if (error && ERROR_MESSAGES[error]) {
      toast.error(ERROR_MESSAGES[error]);
    }
  }, [error]);

  return null;
}
