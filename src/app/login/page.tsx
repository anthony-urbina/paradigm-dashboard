import { signIn, auth } from "@/auth";
import { getCurrentAgent } from "@/lib/current-agent";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();
  const agent = await getCurrentAgent(session);
  if (agent) redirect("/dashboard");
  if (session?.user?.email) redirect("/auth/error?error=AccessDenied");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--vf-bg)] px-4">
      <div className="w-full max-w-sm">
        {/* Logo / brand */}
        <div className="mb-8 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/paradigm-logo.png"
            alt="Paradigm Financial"
            className="mx-auto h-auto w-56 object-contain"
          />
          <p className="mt-4 text-base text-[var(--vf-muted)]">Sign in to your dashboard</p>
        </div>

        <div className="rounded-[28px] border border-[var(--vf-border)] bg-[var(--vf-panel)] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.07)]">
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[var(--vf-border)] bg-[var(--vf-surface)] px-5 py-3.5 text-base font-medium text-[var(--vf-text)] transition-colors hover:border-[var(--vf-accent)] hover:bg-[var(--vf-surface)]"
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[var(--vf-muted)]">
            Access is limited to registered agents.<br />
            Contact your admin if you need access.
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}
