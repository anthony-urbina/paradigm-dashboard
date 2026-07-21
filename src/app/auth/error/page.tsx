import Link from "next/link";
import type { Metadata } from "next";
import { AlertTriangle, ArrowLeft, LifeBuoy, ShieldAlert } from "lucide-react";

type ErrorCode = "AccessDenied" | "Configuration" | "Verification" | "Default";

const errorContent: Record<
  ErrorCode,
  {
    eyebrow: string;
    title: string;
    description: string;
    hint: string;
  }
> = {
  AccessDenied: {
    eyebrow: "Access restricted",
    title: "This Google account doesn’t have dashboard access yet.",
    description:
      "Your sign-in worked, but this email is not currently approved for Paradigm Financial.",
    hint: "Ask your admin to add your email, then try again.",
  },
  Configuration: {
    eyebrow: "Auth setup issue",
    title: "We hit a configuration problem while signing you in.",
    description:
      "Something in the authentication setup is incomplete or temporarily misconfigured.",
    hint: "Please try again shortly, or contact the team if this keeps happening.",
  },
  Verification: {
    eyebrow: "Verification issue",
    title: "We couldn’t verify your sign-in request.",
    description:
      "The verification step expired or couldn’t be completed successfully.",
    hint: "Start the sign-in flow again and complete it in one attempt.",
  },
  Default: {
    eyebrow: "Sign-in failed",
    title: "We couldn’t complete your authentication.",
    description:
      "Something interrupted the sign-in flow before we could open your dashboard.",
    hint: "Try again, and if it still fails, contact Paradigm support.",
  },
};

function getErrorDetails(error?: string) {
  const normalized = (error ?? "Default") as ErrorCode;
  return errorContent[normalized] ?? errorContent.Default;
}

export const metadata: Metadata = {
  title: "Authentication Error | Paradigm Financial",
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const details = getErrorDetails(error);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--vf-bg)] px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(227,187,82,0.14),transparent_30%),linear-gradient(180deg,#15120e_0%,#12100d_100%)]" />

      <div className="relative w-full max-w-3xl">
        <div className="mb-8 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/paradigm-logo.png"
            alt="Paradigm Financial"
            className="mx-auto h-auto w-72 object-contain"
          />
        </div>

        <section className="rounded-[36px] border border-[var(--vf-border)] bg-[linear-gradient(180deg,rgba(31,28,22,0.98)_0%,rgba(24,21,17,0.98)_100%)] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.32)] md:p-10">
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <div className="flex h-18 w-18 items-center justify-center rounded-full border border-[#7a6130] bg-[radial-gradient(circle_at_30%_30%,rgba(227,187,82,0.24),rgba(52,43,27,1)_72%)] text-[#e3bb52] shadow-[0_0_0_10px_rgba(227,187,82,0.06)]">
              {error === "AccessDenied" ? (
                <ShieldAlert className="h-8 w-8" />
              ) : (
                <AlertTriangle className="h-8 w-8" />
              )}
            </div>

            <div className="mt-6 text-sm font-medium uppercase tracking-[0.28em] text-[#d7b75f]">
              {details.eyebrow}
            </div>

            <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-tight text-[#f5efdf] md:text-5xl">
              {details.title}
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--vf-muted)]">
              {details.description}
            </p>

            <div className="mt-8 w-full rounded-[28px] border border-[rgba(227,187,82,0.18)] bg-[rgba(227,187,82,0.06)] p-5 text-left">
              <div className="flex items-start gap-3">
                <LifeBuoy className="mt-0.5 h-5 w-5 shrink-0 text-[#e3bb52]" />
                <p className="text-base leading-7 text-[#efe7d1]">{details.hint}</p>
              </div>
            </div>

            <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-2xl bg-[#e3bb52] px-6 py-3.5 text-base font-semibold text-[#1f1b14] transition hover:bg-[#edd27a]"
              >
                Try Sign-In Again
              </Link>

              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--vf-border)] bg-[rgba(43,35,24,0.7)] px-6 py-3.5 text-base font-medium text-[#f5efdf] transition hover:bg-[rgba(53,44,30,0.9)]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </div>

            {error ? (
              <div className="mt-6 text-sm text-[var(--vf-muted)]">
                Error code: <span className="font-medium text-[#f0e7cb]">{error}</span>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
