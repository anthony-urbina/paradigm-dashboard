"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { signOut } from "next-auth/react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ArrowUpDown,
  Building2,
  ChevronDown,
  ChevronRight,
  Copy,
  DollarSign,
  Download,
  Gauge,
  Home,
  ImageIcon,
  Link2,
  Lock,
  LogOut,
  Menu,
  Pencil,
  Plus,
  Receipt,
  Search,
  Shield,
  Sparkles,
  ShieldCheck,
  Star,
  Swords,
  Trash2,
  Trophy,
  UserCircle2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import useSWR from "swr";

import { AnimatePresence, motion } from "motion/react";

import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";
import type {
  AdminAgentRecord,
  CompGuideRecord,
  LeaderboardPostCard,
  LeaderboardPostsData,
  MySaleRow,
  MySalesMetrics,
  SubAgency,
  TeamAgentCompensationDetail,
  TeamAgentRecord,
  TimeRange,
} from "@/lib/data";

// ─── Shared types (mirrored from src/lib/data.ts for client use) ──
type LeaderboardEntry = {
  rank: number;
  name: string;
  subtitle: string;
  value: string;
  badge?: string;
  tone?: "gold" | "accent";
  progressLabel?: string;
  progressValue?: number;
  logoUrl?: string | null;
  imageUrl?: string | null;
};
type GoalProgress = { ap: number; target: number; pct: number };
type CompetitionTeam = {
  id: string;
  name: string;
  color: string;
  totalAP: number;
  salesCount: number;
  members: string[];
};
type Competition = {
  id: string;
  name: string;
  description: string | null;
  prize: string | null;
  startDate: string;
  endDate: string;
  status: string;
  pinned: boolean;
  teams: CompetitionTeam[];
  winningTeamId: string | null;
};

type CompensationLineItem = TeamAgentCompensationDetail["commissions"][number];

function fmt(n: number): string {
  return "$" + Math.round(n).toLocaleString("en-US");
}

function fmtCompactCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

function parseFormattedNumber(value: string): number {
  const normalized = value.replace(/[^0-9.-]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

const DAILY_MOTIVATION_QUOTES = [
  "If you're gonna do it next year, you might as well start now.",
  "Volume negates luck.",
  "Outwork your self-doubt.",
  "Be impatient with your actions. Be patient with your results.",
  "Every action you take is a vote for the type of person you wish to become.",
  "Most people need consistency more than they need intensity.",
  "You don't need more information. You need more repetitions.",
  "Your future is built by today's boring work.",
  "Discipline solves problems that motivation never will.",
  "Results are rented, and rent is due every day.",
  "The uncomfortable path usually pays the highest return.",
  "Excellence is built through ordinary days.",
  "Change happens when the pain of staying the same becomes greater than the pain of changing.",
  "The scoreboard doesn't care how you feel.",
  "Volume creates skill. Skill creates confidence.",
  "F*ck your mood. Follow the plan.",
  "Your team will never outperform your example.",
  "Production solves almost every problem.",
  "You don't become confident before you act. You become confident because you act.",
  "The reps you don't want to do are usually the ones that matter most.",
  "Success is just doing the unremarkable things longer than everyone else.",
  "Comfort is expensive.",
  "Execution over emotion.",
  "Done beats perfect.",
] as const;

const navItems = [
  { label: "Welcome", href: "/dashboard", icon: Home },
  { label: "Goals", href: "/dashboard/goals", icon: Gauge },
  { label: "My Sales", href: "/dashboard/sales", icon: Receipt },
  { label: "My Team", href: "/dashboard/team", icon: Users, teamLocked: true },
  { label: "Competitions", href: "/dashboard/competition", icon: Swords },
  { label: "Agency", href: "/dashboard/agency", icon: Building2 },
  { label: "Admin", href: "/dashboard/admin", icon: Shield, adminOnly: true },
  { label: "Profile", href: "/dashboard/profile", icon: UserCircle2 },
] as const;

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={cn(
        "rounded-[20px] border border-[rgba(255,255,255,0.08)] bg-[var(--vf-panel)] shadow-[0_4px_24px_rgba(0,0,0,0.6)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

function Avatar({
  name,
  imageUrl,
  small = false,
  ring = false,
}: {
  name: string;
  imageUrl?: string | null;
  small?: boolean;
  ring?: boolean;
}) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={name}
        className={cn(
          "rounded-full object-cover",
          small ? "h-8 w-8" : "h-10 w-10",
          ring && "ring-2 ring-[var(--vf-blurple)] shadow-[0_0_10px_rgba(88,101,242,0.4)]",
        )}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-[rgba(88,101,242,0.2)] font-semibold text-white",
        small ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm",
        ring && "ring-2 ring-[var(--vf-blurple)] shadow-[0_0_10px_rgba(88,101,242,0.4)]",
      )}
    >
      {initials(name)}
    </div>
  );
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox='0 0 24 24'
      aria-hidden='true'
      className={className}
      fill='currentColor'
    >
      <path d='M20.32 4.37A19.8 19.8 0 0 0 15.4 3a13.86 13.86 0 0 0-.63 1.3 18.4 18.4 0 0 0-5.54 0A13.92 13.92 0 0 0 8.6 3a19.76 19.76 0 0 0-4.93 1.37C.56 9.09-.28 13.7.14 18.25A19.92 19.92 0 0 0 6.19 21c.49-.66.93-1.36 1.3-2.09-.72-.28-1.41-.62-2.06-1.01.17-.12.34-.25.5-.38 3.97 1.82 8.27 1.82 12.19 0 .17.14.34.27.5.39-.65.39-1.34.73-2.06 1 .38.73.81 1.43 1.31 2.09a19.88 19.88 0 0 0 6.04-2.75c.5-5.28-.86-9.84-3.59-13.88ZM8.01 15.5c-1.18 0-2.15-1.1-2.15-2.45 0-1.36.95-2.46 2.15-2.46 1.21 0 2.17 1.1 2.15 2.46 0 1.35-.95 2.45-2.15 2.45Zm7.98 0c-1.18 0-2.15-1.1-2.15-2.45 0-1.36.95-2.46 2.15-2.46 1.21 0 2.17 1.1 2.15 2.46 0 1.35-.94 2.45-2.15 2.45Z' />
    </svg>
  );
}

function ProgressRing({
  value,
  label,
  sublabel,
  size = 170,
}: {
  value: number;
  label: string;
  sublabel: string;
  size?: number;
}) {
  const clamp = Math.max(0, Math.min(100, value));
  const inset = Math.max(12, Math.round(size * 0.14));
  const innerSize = size - inset * 2;
  const labelFontSize = Math.max(20, Math.min(44, size * 0.24));
  const sublabelFontSize = Math.max(7, Math.min(14, size * 0.07 - Math.max(0, sublabel.length - 9) * 0.22));

  return (
    <div
      className='relative mx-auto shrink-0'
      style={{ width: size, height: size }}
    >
      <div
        className='h-full w-full rounded-full'
        style={{
          background: `conic-gradient(#F15025 0 ${clamp}%, rgba(255,255,255,0.07) ${clamp}% 100%)`,
          filter: clamp > 0 ? "drop-shadow(0 0 10px rgba(241,80,37,0.45))" : undefined,
        }}
      />
      <div
        className='absolute flex flex-col items-center justify-center rounded-full bg-[var(--vf-surface)] text-center'
        style={{ inset }}
      >
        <div
          className='font-semibold leading-none text-[var(--vf-accent)]'
          style={{
            fontSize: labelFontSize,
            maxWidth: innerSize * 0.68,
          }}
        >
          {label}
        </div>
        <div
          className='mt-1 text-[var(--vf-muted)] leading-tight'
          style={{
            fontSize: sublabelFontSize,
            maxWidth: innerSize * 0.74,
          }}
        >
          {sublabel}
        </div>
      </div>
    </div>
  );
}

const timeRangeOptions: { value: TimeRange; label: string }[] = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
  { value: "180d", label: "180D" },
  { value: "365d", label: "1Y" },
];

function TimeRangeFilters({ selectedRange, storageKey }: { selectedRange: TimeRange; storageKey: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // On mount: if no ?range in URL, restore from localStorage
  useEffect(() => {
    if (searchParams.get("range")) return;
    const saved = localStorage.getItem(storageKey) as TimeRange | null;
    if (saved && saved !== selectedRange) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("range", saved);
      router.replace(`${pathname}?${params.toString()}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function chooseRange(range: TimeRange) {
    localStorage.setItem(storageKey, range);
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", range);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className='flex flex-wrap items-center gap-2'>
      {timeRangeOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => chooseRange(option.value)}
          className={cn(
            "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
            selectedRange === option.value
              ? "bg-[rgba(255,255,255,0.14)] text-white"
              : "text-[var(--vf-muted)] hover:bg-[rgba(255,255,255,0.07)] hover:text-[var(--vf-text)]",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function LeaderboardList({
  title,
  subtitle,
  entries,
  showProgress = false,
}: {
  title: string;
  subtitle: string;
  entries: LeaderboardEntry[];
  showProgress?: boolean;
}) {
  return (
    <Panel className='overflow-hidden p-0'>
      <div className='flex items-center gap-3 border-b border-[rgba(255,255,255,0.08)] bg-[linear-gradient(135deg,rgba(88,101,242,0.18),rgba(241,80,37,0.08),transparent)] px-4 py-3'>
        <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--vf-blurple)] text-white shadow-[0_0_16px_rgba(88,101,242,0.5)]'>
          <Trophy className='h-4 w-4' />
        </div>
        <div>
          <h2 className='text-lg font-semibold text-white'>{title}</h2>
          <p className='text-xs text-[var(--vf-muted)]'>{subtitle}</p>
        </div>
      </div>
      <div className='space-y-1.5 p-3'>
        {entries.length === 0 && (
          <div className='flex flex-col items-center justify-center py-10 text-center'>
            <Trophy className='mb-3 h-8 w-8 text-[var(--vf-muted)] opacity-30' />
            <p className='text-sm font-medium text-[var(--vf-muted)]'>No sales yet this period</p>
            <p className='mt-1 text-xs text-[var(--vf-muted)] opacity-60'>
              Submit a sale to appear on the leaderboard
            </p>
          </div>
        )}
        {entries.map((entry) => (
          <div
            key={`${title}-${entry.rank}-${entry.name}`}
            className={cn(
              "rounded-xl border p-2.5 transition-all",
              entry.tone === "gold"
                ? "border-[rgba(240,178,50,0.45)] bg-[linear-gradient(100deg,rgba(240,178,50,0.14),rgba(240,178,50,0.04)_60%,transparent)] shadow-[0_0_28px_rgba(240,178,50,0.2),inset_0_1px_0_rgba(240,178,50,0.15)]"
                : entry.tone === "accent"
                  ? "border-[rgba(241,80,37,0.3)] bg-[linear-gradient(100deg,rgba(241,80,37,0.1),transparent)] shadow-[0_0_16px_rgba(241,80,37,0.1)]"
                  : "border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)]",
            )}
          >
            <div className='flex items-center gap-2 sm:gap-3'>
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  entry.rank === 1
                    ? "bg-[rgba(240,178,50,0.15)] text-[var(--vf-gold)]"
                    : entry.rank === 2
                      ? "bg-[rgba(180,180,200,0.1)] text-[#b0b4bb]"
                      : entry.rank === 3
                        ? "bg-[rgba(160,80,48,0.15)] text-[#cd7f4f]"
                        : "bg-[rgba(255,255,255,0.05)] text-[var(--vf-muted)]",
                )}
              >
                {entry.rank <= 3 ? (
                  <Trophy
                    className={cn(
                      "h-3.5 w-3.5",
                      entry.rank === 1 && "drop-shadow-[0_0_8px_rgba(240,178,50,1)]",
                      entry.rank === 2 && "text-[#b0b4bb]",
                      entry.rank === 3 && "text-[#cd7f4f]",
                    )}
                  />
                ) : (
                  entry.rank
                )}
              </div>
              {entry.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={entry.logoUrl}
                  alt={entry.name}
                  className={cn(
                    "h-8 w-8 shrink-0 rounded-full object-cover",
                    entry.rank <= 3 &&
                      "ring-2 ring-[var(--vf-blurple)] shadow-[0_0_10px_rgba(88,101,242,0.4)]",
                  )}
                />
              ) : (
                <Avatar
                  name={entry.name}
                  imageUrl={entry.imageUrl}
                  small
                  ring={entry.rank <= 3}
                />
              )}
              <div className='min-w-0 flex-1'>
                <div className='truncate text-sm font-semibold text-white sm:text-base'>
                  {entry.name}
                  {entry.badge ? (
                    <span className='ml-1.5 text-xs font-normal text-[var(--vf-muted)]'>{entry.badge}</span>
                  ) : null}
                </div>
                <div className='mt-0.5 text-xs text-[var(--vf-muted)]'>{entry.subtitle}</div>
                {showProgress && entry.progressLabel && entry.progressValue !== undefined ? (
                  <div className='mt-2 max-w-xs sm:mt-3'>
                    <div className='h-1.5 rounded-full bg-[rgba(255,255,255,0.07)]'>
                      <div
                        className='h-full rounded-full bg-[var(--vf-accent)] shadow-[0_0_8px_rgba(241,80,37,0.6)]'
                        style={{ width: `${entry.progressValue}%` }}
                      />
                    </div>
                    <div className='mt-1 text-xs uppercase tracking-[0.14em] text-[var(--vf-muted)]'>
                      {entry.progressLabel}
                    </div>
                  </div>
                ) : null}
              </div>
              <div
                className={cn(
                  "shrink-0 rounded-lg px-3 py-2 text-right",
                  entry.rank === 1
                    ? "bg-[rgba(240,178,50,0.12)] shadow-[0_0_20px_rgba(240,178,50,0.25),inset_0_1px_0_rgba(240,178,50,0.2)]"
                    : "bg-[rgba(255,255,255,0.05)]",
                )}
              >
                <div
                  className={cn(
                    "text-base font-bold",
                    entry.rank === 1
                      ? "text-[var(--vf-gold)] drop-shadow-[0_0_12px_rgba(240,178,50,0.6)]"
                      : "text-white",
                  )}
                >
                  {entry.value}
                </div>
                <div className='mt-1 text-xs uppercase tracking-[0.18em] text-[var(--vf-muted)]'>AP</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function PageTitle({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className='mb-5 flex items-start gap-3'>
      {icon ? (
        <div className='mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--vf-surface)] text-[var(--vf-blurple)]'>
          {icon}
        </div>
      ) : null}
      <div>
        <h1 className='text-2xl font-semibold tracking-tight text-[var(--vf-text)] sm:text-4xl'>{title}</h1>
        <p className='mt-1 max-w-3xl text-sm text-[var(--vf-muted)] sm:text-base'>{description}</p>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  helper,
  delta,
  trend,
  emphasis = false,
}: {
  title: string;
  value: string;
  helper: string;
  delta?: string;
  trend?: number;
  emphasis?: boolean;
}) {
  return (
    <Panel
      className={cn(
        "p-5",
        emphasis && "border-[rgba(241,80,37,0.2)] shadow-[0_4px_40px_rgba(241,80,37,0.08)]",
      )}
    >
      <div className='text-sm uppercase tracking-[0.16em] text-[var(--vf-muted)]'>{title}</div>
      <div
        className={cn(
          "mt-7 text-3xl font-semibold sm:text-5xl",
          emphasis ? "text-[var(--vf-accent)]" : "text-[var(--vf-text)]",
        )}
      >
        {value}
      </div>
      {trend !== undefined ? (
        <div
          className={cn(
            "mt-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            trend > 0
              ? "bg-[rgba(59,196,115,0.12)] text-[var(--vf-emerald)]"
              : trend < 0
                ? "bg-[rgba(239,68,68,0.1)] text-red-400"
                : "bg-[var(--vf-surface-2)] text-[var(--vf-muted)]",
          )}
        >
          {trend > 0 ? "+" : ""}
          {trend}%
        </div>
      ) : delta ? (
        <div className='mt-3 inline-flex rounded-full bg-[var(--vf-emerald-dim)] px-3 py-1 text-sm text-[var(--vf-emerald)]'>
          {delta}
        </div>
      ) : null}
      <div className='mt-4 text-sm text-[var(--vf-muted)]'>{helper}</div>
    </Panel>
  );
}

function GoalEditor({
  title,
  label,
  value: initial,
  type,
}: {
  title: string;
  label: string;
  value: string;
  type: string;
}) {
  const router = useRouter();
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [value, setValue] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    setValue(initial);
  }, [initial]);

  useEffect(() => {
    if (!focused) return;

    function handlePointerDown(event: PointerEvent) {
      if (!fieldRef.current?.contains(event.target as Node)) {
        setFocused(false);
        inputRef.current?.blur();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, [focused]);

  async function save() {
    const target = Number(value);
    if (Number.isNaN(target) || target < 0) {
      toast.error("Enter a valid goal amount");
      return;
    }
    if (target === Number(initial)) {
      setFocused(false);
      inputRef.current?.blur();
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, target }),
      });
      if (res.ok) {
        toast.success("Goal saved");
        router.refresh();
      } else toast.error("Failed to save goal");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Panel className='p-5'>
      <div className='flex items-center gap-3'>
        <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--vf-surface)] text-[var(--vf-accent)]'>
          <Gauge className='h-4 w-4' />
        </div>
        <div className='text-3xl font-semibold text-[var(--vf-text)]'>{title}</div>
      </div>
      <p className='mt-6 text-base text-[var(--vf-muted)]'>
        Enter your AP target for the month. Set it to 0 to clear your goal.
      </p>
      <div className='mt-8 text-lg text-[var(--vf-text)]'>{label}</div>
      <form
        className='mt-4'
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <div
          ref={fieldRef}
          className={cn(
            "group relative flex w-full max-w-sm items-center rounded-2xl border bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] px-4 py-3 text-lg text-[var(--vf-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition",
            focused
              ? "border-[var(--vf-accent)] shadow-[0_0_0_4px_rgba(241,80,37,0.12)]"
              : "border-[var(--vf-surface-2)]",
          )}
        >
          <span className='mr-3 text-xl text-[var(--vf-muted)] transition group-focus-within:text-[var(--vf-accent)]'>
            $
          </span>
          <input
            ref={inputRef}
            className='w-full bg-transparent pr-14 text-xl outline-none placeholder:text-[var(--vf-muted)]'
            type='number'
            min={0}
            value={value}
            disabled={saving}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setValue(initial);
                setFocused(false);
                event.currentTarget.blur();
              }
            }}
            placeholder='Enter target'
          />
          <div
            className={cn(
              "pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center rounded-lg border px-2 py-1 transition-all duration-150",
              focused
                ? "translate-x-0 border-[var(--vf-border)] bg-[var(--vf-surface-2)] opacity-100"
                : "translate-x-1 border-transparent opacity-0",
            )}
          >
            <span className='text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--vf-muted)]'>
              {saving ? "Saving" : "Enter"}
            </span>
          </div>
        </div>
      </form>
    </Panel>
  );
}

function NavLinks({
  pathname,
  teamUnlocked,
  isAdmin,
  onNavigate,
}: {
  pathname: string;
  teamUnlocked: boolean;
  isAdmin: boolean;
  onNavigate?: () => void;
}) {
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");
    const syncViewport = () => setIsMobileViewport(mediaQuery.matches);

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);
    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, []);

  return (
    <nav className='mt-6 flex flex-col gap-0.5 px-2'>
      {navItems.map((item) => {
        const { label, href, icon: Icon } = item;
        const teamLocked = "teamLocked" in item && item.teamLocked;
        const adminOnly = "adminOnly" in item && item.adminOnly;
        if (adminOnly && !isAdmin) return null;
        const active = pathname === href;
        const locked = !!teamLocked && !teamUnlocked;
        const itemClassName = cn(
          "group flex w-full items-center gap-3 rounded-[8px] px-3 py-2.5 text-[15px] font-medium transition-all",
          "text-[#949ba4] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#dbdee1]",
          active && "bg-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.1)] hover:text-white",
          locked && "opacity-40",
        );

        const iconClass = cn(
          "h-[18px] w-[18px] shrink-0 transition-colors",
          active ? "text-[var(--vf-blurple)]" : "text-[#686d73] group-hover:text-[#dbdee1]",
        );

        const inner = (
          <>
            <Icon className={iconClass} />
            <span>{label}</span>
            {locked && <Lock className='ml-auto h-3.5 w-3.5 opacity-60' />}
          </>
        );

        if (locked) {
          if (isMobileViewport) {
            return (
              <Popover key={href}>
                <PopoverTrigger
                  render={
                    <button
                      type='button'
                      className={itemClassName}
                      aria-label='My Team is locked until you get your first downline'
                    />
                  }
                >
                  {inner}
                </PopoverTrigger>
                <PopoverContent
                  align='start'
                  sideOffset={10}
                  className='border border-[var(--vf-border)] bg-[var(--vf-panel)] text-[var(--vf-text)]'
                >
                  <PopoverHeader>
                    <PopoverTitle>My Team is locked</PopoverTitle>
                    <PopoverDescription>Unlocked once you get your first downline.</PopoverDescription>
                  </PopoverHeader>
                </PopoverContent>
              </Popover>
            );
          }

          return (
            <Tooltip key={href}>
              <TooltipTrigger
                render={
                  <button
                    type='button'
                    className={itemClassName}
                    aria-label='My Team is locked until you get your first downline'
                  />
                }
              >
                {inner}
              </TooltipTrigger>
              <TooltipContent
                align='end'
                side='top'
                sideOffset={10}
                className='border border-[var(--vf-border)] bg-[var(--vf-panel)] text-[var(--vf-text)]'
              >
                <div className='flex flex-col gap-0.5 text-sm'>
                  <div className='font-medium'>My Team is locked</div>
                  <div className='text-[var(--vf-muted)]'>Unlocked once you get your first downline.</div>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        }

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={itemClassName}
          >
            {inner}
          </Link>
        );
      })}
    </nav>
  );
}

type NavUser = { name: string; email: string; image?: string | null } | null;

function UserCard({ user, onClick }: { user: NavUser; onClick?: () => void }) {
  const name = user?.name ?? "Unknown";
  const email = user?.email ?? "";
  return (
    <Link
      href='/dashboard/profile'
      onClick={onClick}
      className='block rounded-[24px] border border-[var(--vf-border)] bg-[var(--vf-panel)] p-4'
    >
      <div className='flex items-center gap-3'>
        {user?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt={name}
            className='h-10 w-10 rounded-full object-cover'
          />
        ) : (
          <Avatar
            name={name}
            small
          />
        )}
        <div className='min-w-0'>
          <div className='truncate text-sm font-medium text-[var(--vf-text)]'>{name}</div>
          <div className='truncate text-xs text-[var(--vf-muted)]'>{email}</div>
        </div>
      </div>
      <div className='mt-3 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--vf-muted)]'>
        <UserCircle2 className='h-3.5 w-3.5' />
        Profile
      </div>
    </Link>
  );
}

function HeaderNav({
  user,
  teamUnlocked,
  isAdmin,
}: {
  user: NavUser;
  teamUnlocked: boolean;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const [logoBroken, setLogoBroken] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const adminBadgeAbsolute = isAdmin ? (
    <div className='admin-badge-animate absolute -bottom-1 -right-1 inline-flex translate-x-[calc(1/3*100%+0.5rem)] translate-y-1/3 items-center gap-0.5 rounded-full border border-[rgba(88,101,242,0.4)] bg-[#5865F2] px-1.5 py-0.5 text-[6px] font-semibold uppercase tracking-[0.16em] text-white shadow-[0_2px_8px_rgba(88,101,242,0.4)]'>
      <Shield className='h-2 w-2' />
      Admin
    </div>
  ) : null;

  const mobileHeaderAdminBadge = isAdmin ? (
    <div className='admin-badge-animate absolute -bottom-1 -right-1 inline-flex translate-x-[calc(1/3*100%+0.5rem)] translate-y-1/3 items-center gap-0.5 rounded-full border border-[rgba(88,101,242,0.4)] bg-[#5865F2] px-1.25 py-0.5 text-[5px] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_2px_8px_rgba(88,101,242,0.4)]'>
      <Shield className='h-1.5 w-1.5' />
      Admin
    </div>
  ) : null;

  const adminBadgeInline = isAdmin ? (
    <div className='admin-badge-animate inline-flex items-center gap-0.5 rounded-full border border-[rgba(88,101,242,0.4)] bg-[#5865F2] px-1.5 py-0.5 text-[6px] font-semibold uppercase tracking-[0.16em] text-white shadow-[0_2px_8px_rgba(88,101,242,0.4)]'>
      <Shield className='h-2 w-2' />
      Admin
    </div>
  ) : null;

  // Desktop: original absolute-positioned badge
  const brand = !logoBroken ? (
    <div className='relative inline-flex'>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src='/Paradigm Financial Logo-21.png'
        alt='Paradigm Financial logo'
        className='h-12 w-auto max-w-[165px] object-contain'
        onError={() => setLogoBroken(true)}
      />
      {mobileHeaderAdminBadge}
    </div>
  ) : (
    <div className='relative inline-flex'>
      <div className='text-[1.05rem] font-semibold uppercase tracking-[0.38em] text-[var(--vf-text)]'>
        Paradigm Financial
      </div>
      {mobileHeaderAdminBadge}
    </div>
  );

  const mobileHeaderBrand = !logoBroken ? (
    <div className='relative inline-flex'>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src='/Paradigm Financial Logo-21.png'
        alt='Paradigm Financial logo'
        className='h-9 w-auto max-w-[122px] object-contain'
        onError={() => setLogoBroken(true)}
      />
      {adminBadgeAbsolute}
    </div>
  ) : (
    <div className='relative inline-flex'>
      <div className='text-[1.05rem] font-semibold uppercase tracking-[0.38em] text-[var(--vf-text)]'>
        Paradigm Financial
      </div>
      {adminBadgeAbsolute}
    </div>
  );

  const mobileDrawerBrand = !logoBroken ? (
    <div className='relative inline-flex'>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src='/Paradigm Financial Logo-21.png'
        alt='Paradigm Financial logo'
        className='h-10 w-auto max-w-[135px] object-contain'
        onError={() => setLogoBroken(true)}
      />
      {adminBadgeAbsolute}
    </div>
  ) : (
    <div className='relative inline-flex'>
      <div className='text-[1.05rem] font-semibold uppercase tracking-[0.38em] text-[var(--vf-text)]'>
        Paradigm Financial
      </div>
      {adminBadgeAbsolute}
    </div>
  );

  return (
    <>
      {/* Mobile header */}
      <header className='sticky top-0 z-20 border-b border-[var(--vf-border)] bg-[rgba(43,45,49,0.96)] px-4 py-3 backdrop-blur lg:hidden'>
        <div className='flex items-center justify-between gap-3'>
          <button
            onClick={() => setMenuOpen(true)}
            className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--vf-border)] bg-[var(--vf-surface)] text-[var(--vf-text)]'
            aria-label='Open menu'
          >
            <Menu className='h-5 w-5' />
          </button>
          <Link
            href='/dashboard'
            className='flex min-w-0 items-center gap-3'
          >
            {mobileHeaderBrand}
          </Link>
          <Link
            href='/dashboard/profile'
            className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--vf-border)] bg-[var(--vf-surface)]'
          >
            {user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name}
                className='h-10 w-10 rounded-full object-cover'
              />
            ) : (
              <Avatar
                name={user?.name ?? "?"}
                small
              />
            )}
          </Link>
        </div>
      </header>

      {/* Mobile nav sheet */}
      <Sheet
        open={menuOpen}
        onOpenChange={(open) => setMenuOpen(open)}
      >
        <SheetContent
          side='left'
          className='flex w-[280px] flex-col border-[var(--vf-border)] bg-[var(--vf-surface)] px-5 py-6'
          showCloseButton={false}
        >
          <Link
            href='/dashboard'
            onClick={() => setMenuOpen(false)}
            className='flex w-full items-center justify-center'
          >
            {mobileDrawerBrand}
          </Link>
          <NavLinks
            pathname={pathname}
            teamUnlocked={teamUnlocked}
            isAdmin={isAdmin}
            onNavigate={() => setMenuOpen(false)}
          />
          <div className='mt-auto space-y-4 pt-8'>
            <UserCard
              user={user}
              onClick={() => setMenuOpen(false)}
            />
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className='flex items-center gap-2 text-sm text-[var(--vf-muted)]'
            >
              <LogOut className='h-4 w-4' />
              Sign out
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className='hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-20 lg:flex lg:w-[280px] lg:flex-col lg:border-r lg:border-[var(--vf-border)] lg:bg-[var(--vf-surface)] lg:px-5 lg:py-6'>
        <Link
          href='/dashboard'
          className='flex items-center justify-center gap-3'
        >
          {brand}
        </Link>
        <NavLinks
          pathname={pathname}
          teamUnlocked={teamUnlocked}
          isAdmin={isAdmin}
        />
        <div className='mt-auto space-y-4'>
          <UserCard user={user} />
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className='flex items-center gap-2 text-sm text-[var(--vf-muted)]'
          >
            <LogOut className='h-4 w-4' />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

export function ParadigmShell({
  children,
  user,
  teamUnlocked,
  isAdmin,
}: {
  children: React.ReactNode;
  user: NavUser;
  teamUnlocked: boolean;
  isAdmin: boolean;
}) {
  return (
    <div className='min-h-screen bg-[var(--vf-bg)] text-[var(--vf-text)]'>
      <HeaderNav
        user={user}
        teamUnlocked={teamUnlocked}
        isAdmin={isAdmin}
      />
      <main className='mx-auto max-w-[1220px] px-4 py-7 sm:px-6 lg:ml-[280px] lg:max-w-none lg:px-8'>
        {children}
      </main>
    </div>
  );
}

const CARRIERS = [
  "Americo",
  "Mutual of Omaha",
  "Aetna",
  "American Amicable",
  "Corebridge",
  "Ethos",
  "Transamerica",
  "Royal Neighbors",
  "NLG",
  "F&G",
  "Chubb",
  "Instabrain",
  "Other",
] as const;

function LogSaleModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [carrier, setCarrier] = useState(CARRIERS[0]);
  const [product, setProduct] = useState("WL");
  const [ap, setAp] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ap || Number(ap) <= 0) {
      toast.error("Enter a valid AP amount");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carrier, product, ap: Number(ap) }),
      });
      if (res.ok) {
        toast.success("Sale logged!");
        setAp("");
        setProduct("WL");
        onClose();
        router.refresh();
      } else {
        const data = (await res.json()) as { error?: string };
        toast.error(data.error ?? "Failed to log sale");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className='flex max-w-md max-h-[85vh] flex-col overflow-hidden border-[var(--vf-border)] bg-[var(--vf-panel)] text-[var(--vf-text)]'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-semibold'>Log a sale</DialogTitle>
        </DialogHeader>
        <form
          id='log-sale-form'
          onSubmit={submit}
          className='mt-2 flex-1 space-y-5 overflow-y-auto pr-1'
        >
          <div>
            <label className='text-sm uppercase tracking-[0.14em] text-[var(--vf-muted)]'>Carrier</label>
            <select
              className='mt-2 w-full rounded-2xl border border-[var(--vf-surface-2)] bg-[var(--vf-surface)] px-4 py-3 text-base text-[var(--vf-text)] outline-none'
              value={carrier}
              onChange={(e) => setCarrier(e.target.value as typeof carrier)}
            >
              {CARRIERS.map((c) => (
                <option
                  key={c}
                  value={c}
                >
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className='text-sm uppercase tracking-[0.14em] text-[var(--vf-muted)]'>Product</label>
            <input
              className='mt-2 w-full rounded-2xl border border-[var(--vf-surface-2)] bg-[var(--vf-surface)] px-4 py-3 text-base text-[var(--vf-text)] outline-none'
              placeholder='WL, Term, IUL...'
              value={product}
              onChange={(e) => setProduct(e.target.value)}
            />
          </div>
          <div>
            <label className='text-sm uppercase tracking-[0.14em] text-[var(--vf-muted)]'>
              Annual Premium (AP)
            </label>
            <div className='mt-2 flex items-center rounded-2xl border border-[var(--vf-surface-2)] bg-[var(--vf-surface)] px-4 py-3'>
              <span className='mr-3 text-[var(--vf-muted)]'>$</span>
              <input
                className='w-full bg-transparent text-base text-[var(--vf-text)] outline-none'
                type='number'
                min={1}
                step='0.01'
                placeholder='0.00'
                value={ap}
                onChange={(e) => setAp(e.target.value)}
                required
              />
            </div>
          </div>
        </form>
        <div className='mt-4 flex justify-end gap-3 border-t border-[var(--vf-border)] pt-4'>
          <button
            type='button'
            onClick={onClose}
            className='rounded-2xl border border-[var(--vf-border)] px-5 py-3 text-sm text-[var(--vf-muted)]'
          >
            Cancel
          </button>
          <button
            type='submit'
            form='log-sale-form'
            disabled={saving}
            className='rounded-2xl bg-[var(--vf-accent)] px-6 py-3 text-sm font-semibold text-[var(--vf-accent-fg)] disabled:opacity-50'
          >
            {saving ? "Saving..." : "Log sale"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── My Sales Page ───────────────────────────────────────────

type MySalesProps = {
  sales: MySaleRow[];
  compPercentage: number;
  metrics: MySalesMetrics;
  selectedRange: TimeRange;
  rangeLabel: string;
};

function SaleEditModal({
  sale,
  open,
  onClose,
}: {
  sale: MySaleRow | null;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [clientName, setClientName] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [state, setState] = useState("");
  const [leadType, setLeadType] = useState("");

  useEffect(() => {
    if (sale) {
      setClientName(sale.clientName ?? "");
      setPolicyNumber(sale.policyNumber ?? "");
      setEffectiveDate(sale.effectiveDate ?? "");
      setState(sale.state ?? "");
      setLeadType(sale.leadType ?? "");
    }
  }, [sale]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sale) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/sales/${sale.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: clientName.trim() || null,
          policyNumber: policyNumber.trim() || null,
          effectiveDate: effectiveDate || null,
          state: state.trim() || null,
          leadType: leadType.trim() || null,
        }),
      });
      if (res.ok) {
        toast.success("Sale updated");
        onClose();
        router.refresh();
      } else {
        const data = (await res.json()) as { error?: string };
        toast.error(data.error ?? "Failed to update sale");
      }
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "mt-2 w-full rounded-2xl border border-[var(--vf-surface-2)] bg-[var(--vf-surface)] px-4 py-3 text-base text-[var(--vf-text)] outline-none placeholder:text-[var(--vf-muted)]";
  const labelCls = "text-sm uppercase tracking-[0.14em] text-[var(--vf-muted)]";

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className='flex w-[90vw] max-w-3xl sm:max-w-3xl max-h-[85vh] flex-col overflow-hidden border-[var(--vf-border)] bg-[var(--vf-panel)] text-[var(--vf-text)]'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-semibold'>Edit sale</DialogTitle>
        </DialogHeader>
        <form
          id='edit-sale-form'
          onSubmit={handleSubmit}
          className='mt-2 flex-1 overflow-y-auto pr-1'
        >
          <div className='grid grid-cols-2 gap-x-5 gap-y-5'>
            <div className='col-span-2'>
              <label className={labelCls}>Client Name</label>
              <input
                className={inputCls}
                placeholder='First Last'
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
            <div className='col-span-2'>
              <label className={labelCls}>Policy Number</label>
              <input
                className={inputCls}
                placeholder='e.g. AM03496312'
                value={policyNumber}
                onChange={(e) => setPolicyNumber(e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Effective Date</label>
              <div className='mt-2'>
                <DatePicker
                  value={effectiveDate}
                  onChange={setEffectiveDate}
                  placeholder='Pick effective date'
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>State</label>
              <input
                className={inputCls}
                placeholder='e.g. MD'
                value={state}
                onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))}
              />
            </div>
            <div className='col-span-2'>
              <label className={labelCls}>Lead Provider</label>
              <input
                className={inputCls}
                placeholder='e.g. GOAT'
                value={leadType}
                onChange={(e) => setLeadType(e.target.value)}
              />
            </div>
          </div>
        </form>
        <div className='mt-4 flex justify-end gap-3 border-t border-[var(--vf-border)] pt-4'>
          <button
            type='button'
            onClick={onClose}
            className='rounded-2xl border border-[var(--vf-border)] px-5 py-3 text-sm text-[var(--vf-muted)]'
          >
            Cancel
          </button>
          <button
            type='submit'
            form='edit-sale-form'
            disabled={saving}
            className='rounded-2xl bg-[var(--vf-accent)] px-6 py-3 text-sm font-semibold text-[var(--vf-accent-fg)] disabled:opacity-50'
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const PAGE_SIZE = 25;

export function MySalesPage({ sales, compPercentage, metrics, selectedRange, rangeLabel }: MySalesProps) {
  const [editingSale, setEditingSale] = useState<MySaleRow | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  function fmtDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  }

  const q = query.trim().toLowerCase();
  const filtered = q
    ? sales.filter(
        (s) =>
          s.clientName?.toLowerCase().includes(q) ||
          s.carrier.toLowerCase().includes(q) ||
          s.state?.toLowerCase().includes(q) ||
          s.leadType?.toLowerCase().includes(q) ||
          s.policyNumber?.toLowerCase().includes(q),
      )
    : sales;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function handleSearch(value: string) {
    setQuery(value);
    setPage(1);
  }

  const thCls =
    "px-4 py-3 text-left text-xs uppercase tracking-[0.14em] text-[var(--vf-muted)] font-medium whitespace-nowrap";
  const thRightCls =
    "px-4 py-3 text-right text-xs uppercase tracking-[0.14em] text-[var(--vf-muted)] font-medium whitespace-nowrap";
  const tdCls = "px-4 py-3 text-sm whitespace-nowrap";
  const tdRightCls = "px-4 py-3 text-sm text-right whitespace-nowrap";

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <PageTitle
          title='My Sales'
          description='Your personal production history. Commission estimates are based on your FFL contract level.'
          icon={<Receipt className='h-6 w-6' />}
        />
        <TimeRangeFilters
          selectedRange={selectedRange}
          storageKey='paradigm-sales-range'
        />
      </div>

      <div className='grid grid-cols-2 gap-4 lg:grid-cols-5'>
        <MetricCard
          title='Sales'
          value={String(metrics.totalSales)}
          helper={`Policies written in ${rangeLabel.toLowerCase()}`}
          trend={metrics.trends.totalSales}
        />
        <MetricCard
          title='Submitted AP'
          value={fmt(metrics.submittedAP)}
          helper={`AP submitted in ${rangeLabel.toLowerCase()}`}
          trend={metrics.trends.submittedAP}
          emphasis
        />
        <MetricCard
          title='Avg AP'
          value={fmt(metrics.avgAP)}
          helper='Average AP per policy'
          trend={metrics.trends.avgAP}
        />
        <MetricCard
          title='12-mo Commission'
          value={fmt(metrics.twelveMonthComm)}
          helper='Projected full commission'
          trend={metrics.trends.twelveMonthComm}
        />
        <MetricCard
          title='9-mo Advance'
          value={fmt(metrics.nineMonthAdv)}
          helper='Projected advance payout'
          trend={metrics.trends.nineMonthAdv}
        />
      </div>

      <Panel>
        <div className='flex items-center justify-between gap-4 border-b border-[var(--vf-border)] px-4 py-3'>
          <div className='flex items-center gap-2'>
            <span className='text-sm font-medium text-[var(--vf-text)]'>{filtered.length}</span>
            <span className='text-sm text-[var(--vf-muted)]'>
              {filtered.length === 1 ? "sale" : "sales"}
              {q ? " found" : ""}
            </span>
          </div>
          <div className='relative w-64'>
            <Search className='pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--vf-muted)]' />
            <input
              type='text'
              placeholder='Search…'
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className='w-full rounded-lg border border-[var(--vf-border)] bg-[var(--vf-surface)] py-1.5 pl-8 pr-3 text-sm text-[var(--vf-text)] placeholder:text-[var(--vf-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--vf-accent)]'
            />
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-[var(--vf-border)]'>
                <th className={thCls}>Sold</th>
                <th className={thCls}>Client</th>
                <th className={thRightCls}>AP</th>
                <th className={thCls}>Carrier</th>
                <th className={thRightCls}>Comp</th>
                <th className={thRightCls}>9-mo</th>
                <th className={thRightCls}>12-mo</th>
                <th className={thCls}>Effective</th>
                <th className={thCls}>Lead</th>
                <th className={thCls}>State</th>
                <th className={thCls}>Policy #</th>
                <th className={thCls} />
              </tr>
            </thead>
            <tbody>
              {pageRows.map((sale) => (
                <tr
                  key={sale.id}
                  className='border-b border-[var(--vf-border)] last:border-0 hover:bg-[var(--vf-surface)]/40'
                >
                  <td className={tdCls}>{fmtDate(sale.soldAt)}</td>
                  <td className={tdCls}>
                    {sale.clientName ?? <span className='text-[var(--vf-muted)]'>—</span>}
                  </td>
                  <td className={tdRightCls}>{fmt(sale.ap)}</td>
                  <td className={tdCls}>{sale.carrier}</td>
                  <td className={cn(tdRightCls, "text-[var(--vf-muted)]")}>{sale.compRate}%</td>
                  <td className={tdRightCls}>{fmt(sale.nineMonthComm)}</td>
                  <td className={cn(tdRightCls, "text-[var(--vf-accent)] font-medium")}>
                    {fmt(sale.twelveMonthComm)}
                  </td>
                  <td className={tdCls}>
                    {sale.effectiveDate ? (
                      fmtDate(sale.effectiveDate)
                    ) : (
                      <span className='text-[var(--vf-muted)]'>—</span>
                    )}
                  </td>
                  <td className={tdCls}>
                    {sale.leadType ?? <span className='text-[var(--vf-muted)]'>—</span>}
                  </td>
                  <td className={tdCls}>{sale.state ?? <span className='text-[var(--vf-muted)]'>—</span>}</td>
                  <td className={cn(tdCls, "font-mono text-xs text-[var(--vf-muted)]")}>
                    {sale.policyNumber ?? <span>—</span>}
                  </td>
                  <td className={tdCls}>
                    <button
                      onClick={() => setEditingSale(sale)}
                      className='flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-[var(--vf-muted)] transition-colors hover:bg-[var(--vf-surface-2)] hover:text-[var(--vf-text)]'
                    >
                      <Pencil className='h-3.5 w-3.5' />
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className='py-16 text-center text-sm text-[var(--vf-muted)]'>
              {q ? "No sales match your search." : "No sales in this period. Try a wider time range."}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className='flex items-center justify-between border-t border-[var(--vf-border)] px-4 py-3'>
            <span className='text-xs text-[var(--vf-muted)]'>
              {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of{" "}
              {filtered.length}
            </span>
            <div className='flex items-center gap-1'>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className='rounded-lg px-3 py-1.5 text-xs text-[var(--vf-muted)] transition-colors hover:bg-[var(--vf-surface-2)] hover:text-[var(--vf-text)] disabled:pointer-events-none disabled:opacity-40'
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "…" ? (
                    <span
                      key={`ellipsis-${i}`}
                      className='px-1 text-xs text-[var(--vf-muted)]'
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-xs transition-colors",
                        p === safePage
                          ? "bg-[var(--vf-accent)] text-[var(--vf-accent-fg)] font-semibold"
                          : "text-[var(--vf-muted)] hover:bg-[var(--vf-surface-2)] hover:text-[var(--vf-text)]",
                      )}
                    >
                      {p}
                    </button>
                  ),
                )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className='rounded-lg px-3 py-1.5 text-xs text-[var(--vf-muted)] transition-colors hover:bg-[var(--vf-surface-2)] hover:text-[var(--vf-text)] disabled:pointer-events-none disabled:opacity-40'
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Panel>

      <SaleEditModal
        sale={editingSale}
        open={!!editingSale}
        onClose={() => setEditingSale(null)}
      />
    </div>
  );
}

// ─── Latest Sale Banner ───────────────────────────────────────

type LatestSaleData = {
  id: string;
  agentName: string;
  initials: string;
  carrier: string;
  ap: number;
  imageUrl: string | null;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function LatestSaleBanner({ initial }: { initial: LatestSaleData | null }) {
  const { data } = useSWR<LatestSaleData | null>("/api/sales/latest", fetcher, {
    refreshInterval: 15_000,
    fallbackData: initial,
    revalidateOnFocus: false,
  });

  const [displayed, setDisplayed] = useState<LatestSaleData | null>(initial);
  const [animating, setAnimating] = useState(false);

  function triggerUpdate(next: LatestSaleData) {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setDisplayed(next);
      setAnimating(false);
    }, 50);
  }

  useEffect(() => {
    if (!data) return;
    if (!displayed || data.id !== displayed.id) {
      if (!displayed) {
        setDisplayed(data);
        return;
      }
      triggerUpdate(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id]);

  if (!displayed) return null;

  return (
    /* perspective wrapper so children get true 3-D depth */
    <div style={{ perspective: "1200px" }}>
      <AnimatePresence mode='wait'>
        <motion.div
          key={displayed.id}
          className='relative overflow-hidden rounded-[22px] border bg-[#5865F2] text-white'
          style={{ transformOrigin: "center bottom" }}
          initial={{ rotateX: -70, opacity: 0, scale: 0.95 }}
          animate={{ rotateX: 0, opacity: 1, scale: 1 }}
          exit={{ rotateX: 70, opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className='flex flex-wrap items-center gap-3 px-4 py-3 sm:gap-4 sm:px-5 sm:py-4'>
            <div className='shrink-0 text-xs font-semibold uppercase tracking-[0.2em]'>Latest Sale</div>
            {displayed.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayed.imageUrl}
                alt={displayed.agentName}
                className='h-9 w-9 shrink-0 rounded-full object-cover sm:h-10 sm:w-10'
              />
            ) : (
              <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(0,0,0,0.2)] text-sm font-semibold text-white sm:h-10 sm:w-10'>
                {displayed.initials}
              </div>
            )}
            <p className='min-w-0 text-sm font-medium sm:text-xl'>
              {displayed.agentName} just wrote {fmt(displayed.ap)} with {displayed.carrier}. Keep it going!
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Welcome Page ─────────────────────────────────────────────

type WelcomeProps = {
  agentName: string;
  latestSale: {
    id: string;
    agentName: string;
    initials: string;
    carrier: string;
    ap: number;
    imageUrl: string | null;
  } | null;
  salesGoal: GoalProgress | null;
  teamGoal: GoalProgress | null;
  weeklyLeaders: LeaderboardEntry[];
  monthlyLeaders: LeaderboardEntry[];
  featuredComp?: Competition | null;
};

export function WelcomePage({
  agentName,
  latestSale,
  salesGoal,
  teamGoal,
  weeklyLeaders,
  monthlyLeaders,
  featuredComp,
}: WelcomeProps) {
  const firstName = agentName.split(" ")[0];
  const router = useRouter();
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((today.getTime() - startOfYear.getTime()) / 86_400_000);
  const initialDailyMotivationQuote =
    DAILY_MOTIVATION_QUOTES[dayOfYear % DAILY_MOTIVATION_QUOTES.length] ?? DAILY_MOTIVATION_QUOTES[0];
  const [dailyMotivationQuote, setDailyMotivationQuote] = useState(initialDailyMotivationQuote);
  const [rollingQuote, setRollingQuote] = useState(false);

  async function rollMotivationQuote() {
    if (DAILY_MOTIVATION_QUOTES.length <= 1 || rollingQuote) return;
    const availableQuotes = DAILY_MOTIVATION_QUOTES.filter((quote) => quote !== dailyMotivationQuote);
    const nextQuote =
      availableQuotes[Math.floor(Math.random() * availableQuotes.length)] ?? initialDailyMotivationQuote;

    setRollingQuote(true);
    try {
      for (let index = 0; index < 10; index += 1) {
        const shufflePool = DAILY_MOTIVATION_QUOTES.filter((quote) => quote !== dailyMotivationQuote);
        const shuffleQuote =
          shufflePool[Math.floor(Math.random() * shufflePool.length)] ?? initialDailyMotivationQuote;
        setDailyMotivationQuote(shuffleQuote);
        await new Promise((resolve) => setTimeout(resolve, 55 + index * 12));
      }
      setDailyMotivationQuote(nextQuote);
    } finally {
      setRollingQuote(false);
    }
  }

  return (
    <div className='space-y-8'>
      <LatestSaleBanner initial={latestSale} />

      <div className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-[0.22em] text-[var(--vf-muted)]'>
            Paradigm Financial
          </p>
          <h1 className='mt-1 text-4xl font-semibold tracking-tight text-[var(--vf-text)] sm:text-6xl'>
            Welcome, {firstName}
          </h1>
          <p className='mt-2 text-base text-[var(--vf-muted)] sm:text-xl'>
            Here&apos;s your team&apos;s momentum for today.
          </p>
        </div>
      </div>

      <div className='grid gap-5 xl:grid-cols-2'>
        <Panel className='relative min-h-[260px] overflow-hidden p-6'>
          <div className='absolute inset-0 bg-[linear-gradient(135deg,rgba(241,80,37,0.07),transparent_60%)] pointer-events-none' />
          <div className='text-5xl font-bold text-[var(--vf-blurple)] opacity-80'>&ldquo;</div>
          <div className='mt-8 max-w-md min-h-[7.5rem] overflow-hidden sm:min-h-[9rem]'>
            <div
              className={cn(
                "text-xl font-medium leading-snug text-[var(--vf-text)] transition duration-150 sm:text-[2rem]",
                rollingQuote && "translate-y-0.5 opacity-80",
              )}
            >
              {dailyMotivationQuote}
            </div>
          </div>
          <div className='mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--vf-muted)]'>
            Daily reminder
          </div>
          <button
            onClick={rollMotivationQuote}
            disabled={rollingQuote}
            className='mt-4 rounded-xl bg-[var(--vf-blurple)] px-4 py-2 text-sm font-semibold text-white shadow-[0_0_16px_var(--vf-blurple-dim)] transition hover:opacity-90 disabled:cursor-default disabled:opacity-85'
          >
            {rollingQuote ? "Rolling..." : "Hype me up"}
          </button>
        </Panel>

        <Panel className='overflow-hidden p-0'>
          <div className='flex items-center gap-3 border-b border-[var(--vf-border)] bg-[linear-gradient(135deg,rgba(88,101,242,0.1),transparent)] px-5 py-4'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--vf-blurple)] text-white shadow-[0_0_16px_var(--vf-blurple-dim)]'>
              <Gauge className='h-5 w-5' />
            </div>
            <div>
              <h2 className='text-[1.8rem] font-semibold text-[var(--vf-text)]'>Your goals</h2>
              <p className='text-sm text-[var(--vf-muted)]'>Tracking toward your targets</p>
            </div>
          </div>
          {salesGoal || teamGoal ? (
            <div className='grid gap-4 p-4 md:grid-cols-2'>
              {salesGoal && (
                <Panel className='rounded-[24px] bg-[var(--vf-surface)] p-4'>
                  <div className='flex items-start justify-between gap-3'>
                    <div className='text-sm uppercase tracking-[0.2em] text-[var(--vf-muted)]'>
                      Sales production
                    </div>
                    <div className='shrink-0 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--vf-muted)]'>
                      Monthly
                    </div>
                  </div>
                  <div className='mt-3 grid gap-4 md:grid-cols-[118px_minmax(0,1fr)] md:items-center'>
                    <ProgressRing
                      value={salesGoal.pct}
                      label={`${salesGoal.pct}%`}
                      sublabel={`of ${fmt(salesGoal.target)}`}
                      size={110}
                    />
                    <div className='min-w-0 overflow-hidden pr-1'>
                      <div className='min-w-0 max-w-full overflow-hidden text-[clamp(1.5rem,2.6vw,2.25rem)] font-semibold leading-none tracking-tight text-[var(--vf-text)]'>
                        {fmtCompactCurrency(salesGoal.ap)}
                      </div>
                      <div className='mt-2 text-sm text-[var(--vf-muted)]'>/ {fmt(salesGoal.target)}</div>
                      <div className='mt-2 text-base text-[var(--vf-muted)]'>
                        {fmt(salesGoal.target - salesGoal.ap)} to go
                      </div>
                    </div>
                  </div>
                </Panel>
              )}
              {teamGoal && (
                <Panel className='rounded-[24px] bg-[var(--vf-surface)] p-4'>
                  <div className='flex items-start justify-between gap-3'>
                    <div className='text-sm uppercase tracking-[0.2em] text-[var(--vf-muted)]'>
                      Team production
                    </div>
                    <div className='shrink-0 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--vf-muted)]'>
                      Monthly
                    </div>
                  </div>
                  <div className='mt-3 grid gap-4 md:grid-cols-[118px_minmax(0,1fr)] md:items-center'>
                    <ProgressRing
                      value={teamGoal.pct}
                      label={`${teamGoal.pct}%`}
                      sublabel={`of ${fmt(teamGoal.target)}`}
                      size={110}
                    />
                    <div className='min-w-0 overflow-hidden pr-1'>
                      <div className='min-w-0 max-w-full overflow-hidden text-[clamp(1.5rem,2.6vw,2.25rem)] font-semibold leading-none tracking-tight text-[var(--vf-text)]'>
                        {fmtCompactCurrency(teamGoal.ap)}
                      </div>
                      <div className='mt-2 text-sm text-[var(--vf-muted)]'>/ {fmt(teamGoal.target)}</div>
                      <div className='mt-2 text-base text-[var(--vf-muted)]'>
                        {fmt(teamGoal.target - teamGoal.ap)} to go
                      </div>
                    </div>
                  </div>
                </Panel>
              )}
            </div>
          ) : (
            <div className='flex min-h-[280px] items-center justify-center px-5 py-10 text-center'>
              <div>
                <div className='text-xl font-semibold text-[var(--vf-text)]'>Set your first goal</div>
                <p className='mt-2 text-sm text-[var(--vf-muted)]'>
                  Set your first goal to see your progress show up here.
                </p>
              </div>
            </div>
          )}
        </Panel>
      </div>

      {featuredComp && (
        <div>
          <div className='mb-3 flex items-center gap-2'>
            <Star className='h-4 w-4 fill-[var(--vf-gold)] text-[var(--vf-gold)]' />
            <span className='text-sm font-semibold uppercase tracking-[0.16em] text-[var(--vf-muted)]'>
              Featured competition
            </span>
          </div>
          <CompetitionCard
            comp={featuredComp}
            onClick={() => router.push(`/dashboard/competition?competitionId=${featuredComp.id}`)}
          />
        </div>
      )}

      <div className='grid gap-5 xl:grid-cols-2'>
        <LeaderboardList
          title='Agents of the Week'
          subtitle='Top 10 by AP this calendar week'
          entries={weeklyLeaders}
        />
        <LeaderboardList
          title='Agents of the Month'
          subtitle='Top 10 by AP this calendar month'
          entries={monthlyLeaders}
        />
      </div>
    </div>
  );
}

function TeamGrowthEditor({
  teamGrowth,
  teamCount,
}: {
  teamGrowth: { count: number; target: number; pct: number; deadline: string } | null;
  teamCount: number;
}) {
  const router = useRouter();
  const [target, setTarget] = useState(String(teamGrowth?.target ?? ""));
  const [deadline, setDeadline] = useState(teamGrowth?.deadline ?? "");
  const [saving, setSaving] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    setTarget(String(teamGrowth?.target ?? ""));
    setDeadline(teamGrowth?.deadline ?? "");
  }, [teamGrowth?.deadline, teamGrowth?.target]);

  async function save(overrideDeadline?: string) {
    const effectiveDeadline = overrideDeadline !== undefined ? overrideDeadline : deadline;
    if (!target || Number(target) < 0) {
      toast.error("Enter a valid target");
      return;
    }
    if (
      Number(target) === Number(teamGrowth?.target ?? "") &&
      (effectiveDeadline || "") === (teamGrowth?.deadline ?? "")
    ) {
      setFocused(false);
      return;
    }
    setSaving(true);
    console.log("[Goals] Saving team growth goal", {
      target: Number(target),
      hasDeadline: Boolean(effectiveDeadline),
    });
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "team_growth",
          target: Number(target),
          deadlineDate: effectiveDeadline || undefined,
        }),
      });
      if (res.ok) {
        console.log("[Goals] Team growth goal saved");
        toast.success("Team growth goal saved");
        router.refresh();
      } else {
        console.log("[Goals] Team growth goal save failed", { status: res.status });
        toast.error("Failed to save");
      }
    } catch (error) {
      console.log("[Goals] Team growth goal request failed", { error });
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Panel className='p-5'>
      <div className='flex items-center gap-3'>
        <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--vf-surface)] text-[var(--vf-accent)]'>
          <Gauge className='h-4 w-4' />
        </div>
        <div className='text-3xl font-semibold text-[var(--vf-text)]'>Set your team growth goal</div>
      </div>
      <p className='mt-5 text-base text-[var(--vf-muted)]'>
        Set the number of agents you want in your downline by a specific deadline. Progress updates
        automatically as your team grows. Set to 0 to clear.
      </p>
      <form
        className='mt-8 grid gap-5 md:grid-cols-2'
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <div>
          <div className='text-lg font-medium text-[var(--vf-text)]'>Team growth target</div>
          <div
            className={cn(
              "group relative mt-2 flex w-full items-center rounded-2xl border bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] px-4 py-3 text-lg text-[var(--vf-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition",
              focused
                ? "border-[var(--vf-accent)] shadow-[0_0_0_4px_rgba(241,80,37,0.12)]"
                : "border-[var(--vf-surface-2)]",
            )}
          >
            <input
              className='w-full bg-transparent pr-14 text-xl outline-none placeholder:text-[var(--vf-muted)]'
              type='number'
              min={0}
              value={target}
              disabled={saving}
              onChange={(event) => setTarget(event.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setTarget(String(teamGrowth?.target ?? ""));
                  setFocused(false);
                  event.currentTarget.blur();
                }
              }}
              placeholder='e.g. 25'
            />
            <div
              className={cn(
                "pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center rounded-lg border px-2 py-1 transition-all duration-150",
                focused
                  ? "translate-x-0 border-[var(--vf-border)] bg-[var(--vf-surface-2)] opacity-100"
                  : "translate-x-1 border-transparent opacity-0",
              )}
            >
              <span className='text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--vf-muted)]'>
                {saving ? "Saving" : "Enter"}
              </span>
            </div>
          </div>
        </div>
        <div>
          <div className='text-lg font-medium text-[var(--vf-text)]'>Target deadline (optional)</div>
          <DatePicker
            value={deadline}
            onChange={(val) => {
              setDeadline(val);
              void save(val);
            }}
            placeholder='Pick a deadline'
            className='mt-2 text-lg'
            disablePast
          />
        </div>
      </form>
      <div className='mt-3 text-sm text-[var(--vf-muted)]'>Total agents in your downline: {teamCount}</div>
    </Panel>
  );
}

type GoalsProps = {
  salesGoal: GoalProgress | null;
  teamGoal: GoalProgress | null;
  teamGrowth: { count: number; target: number; pct: number; deadline: string } | null;
  teamCount: number;
  teamUnlocked: boolean;
};

export function GoalsPage({ salesGoal, teamGoal, teamGrowth, teamCount, teamUnlocked }: GoalsProps) {
  return (
    <div className='space-y-6'>
      <PageTitle
        title='Goals'
        description='Set personal and team production targets, then track your progress automatically.'
        icon={<Gauge className='h-6 w-6' />}
      />

      <div className='grid gap-5 xl:grid-cols-2'>
        <div className='space-y-4'>
          <div className='rounded-[22px] border border-[var(--vf-surface-2)] bg-[var(--vf-surface)] px-5 py-4 text-[var(--vf-text)]'>
            <div className='text-lg font-semibold'>Monthly sales goal</div>
            <div className='mt-1 text-base text-[var(--vf-muted)]'>
              Powers your Agency leaderboard progress and resets at the start of each month.
            </div>
          </div>

          {salesGoal && (
            <Panel className='grid gap-4 p-5 md:grid-cols-[150px_minmax(0,1fr)]'>
              <ProgressRing
                value={salesGoal.pct}
                label={`${salesGoal.pct}%`}
                sublabel={`of ${fmt(salesGoal.target)}`}
                size={140}
              />
              <div className='flex flex-col justify-center'>
                <div className='text-sm uppercase tracking-[0.18em] text-[var(--vf-muted)]'>
                  AP this month
                </div>
                <div className='mt-2 text-3xl font-semibold text-[var(--vf-accent)] sm:text-5xl'>
                  {fmt(salesGoal.ap)}
                </div>
                <div className='mt-2 text-base text-[var(--vf-muted)] sm:text-lg'>
                  {fmt(salesGoal.target - salesGoal.ap)} to go to reach your {fmt(salesGoal.target)} goal.
                </div>
              </div>
            </Panel>
          )}

          <GoalEditor
            title='Set your monthly sales goal'
            label='Monthly AP target'
            value={salesGoal ? String(salesGoal.target) : "0"}
            type='sales_ap'
          />
        </div>

        <div className='space-y-4'>
          <div className='rounded-[22px] border border-[var(--vf-surface-2)] bg-[var(--vf-surface)] px-5 py-4 text-[var(--vf-text)]'>
            <div className='text-lg font-semibold'>Monthly team goal</div>
            <div className='mt-1 text-base text-[var(--vf-muted)]'>
              {teamUnlocked
                ? "Tracks your whole team's AP for the Agency leaderboard and resets each month."
                : "Unlocks after your first direct downline so team production goals only appear once you can actually build a team."}
            </div>
          </div>

          {teamUnlocked && teamGoal && (
            <Panel className='grid gap-4 p-5 md:grid-cols-[150px_minmax(0,1fr)]'>
              <ProgressRing
                value={teamGoal.pct}
                label={`${teamGoal.pct}%`}
                sublabel={`of ${fmt(teamGoal.target)}`}
                size={140}
              />
              <div className='flex flex-col justify-center'>
                <div className='text-sm uppercase tracking-[0.18em] text-[var(--vf-muted)]'>
                  Team AP this month
                </div>
                <div className='mt-2 text-3xl font-semibold text-[var(--vf-accent)] sm:text-5xl'>
                  {fmt(teamGoal.ap)}
                </div>
                <div className='mt-2 text-base text-[var(--vf-muted)] sm:text-lg'>
                  {fmt(teamGoal.target - teamGoal.ap)} to go to reach your {fmt(teamGoal.target)} team goal.
                </div>
              </div>
            </Panel>
          )}

          {teamUnlocked ? (
            <GoalEditor
              title='Set your monthly team goal'
              label='Monthly team AP target'
              value={teamGoal ? String(teamGoal.target) : "0"}
              type='team_ap'
            />
          ) : (
            <Panel className='border-dashed border-[var(--vf-surface-2)] bg-[var(--vf-surface)] p-6'>
              <div className='flex items-start gap-4'>
                <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--vf-panel)] text-[var(--vf-accent)]'>
                  <Lock className='h-5 w-5' />
                </div>
                <div>
                  <div className='text-xl font-semibold text-[var(--vf-text)]'>
                    Set your monthly team goal
                  </div>
                  <div className='mt-2 text-base text-[var(--vf-muted)]'>
                    Locked until you get your first downline.
                  </div>
                </div>
              </div>
            </Panel>
          )}
        </div>
      </div>

      <div className='space-y-5'>
        {teamGrowth && (
          <Panel className='p-5'>
            <div className='flex items-start justify-between'>
              <div>
                <div className='text-sm uppercase tracking-[0.14em] text-[var(--vf-muted)]'>Team growth</div>
                <div className='mt-3 text-3xl font-semibold text-[var(--vf-accent)] sm:text-5xl'>
                  {teamGrowth.count}
                </div>
                <div className='text-base text-[var(--vf-muted)]'>agents on your team</div>
              </div>
              {teamGrowth.pct >= 100 && (
                <div className='rounded-full border border-[var(--vf-surface-2)] bg-[var(--vf-surface-2)] px-3 py-1 text-sm text-[var(--vf-accent)]'>
                  Goal hit
                </div>
              )}
            </div>
            <div className='mt-6 h-3 rounded-full bg-[var(--vf-surface-2)]'>
              <div
                className='h-full rounded-full bg-[var(--vf-accent)]'
                style={{ width: `${Math.min(teamGrowth.pct, 100)}%` }}
              />
            </div>
            <div className='mt-3 flex justify-between text-sm text-[var(--vf-muted)]'>
              <span>
                {teamGrowth.pct}% of {teamGrowth.target}
              </span>
              {teamGrowth.pct >= 100 ? (
                <span>Target reached</span>
              ) : (
                <span>{teamGrowth.target - teamGrowth.count} to go</span>
              )}
            </div>
            {teamGrowth.deadline && (
              <div className='mt-2 text-sm text-[var(--vf-muted)]'>
                {teamGrowth.target} by{" "}
                {new Date(teamGrowth.deadline).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </div>
            )}
          </Panel>
        )}

        <TeamGrowthEditor
          teamGrowth={teamGrowth}
          teamCount={teamCount}
        />
      </div>
    </div>
  );
}

type TeamProps = {
  metrics: {
    totalTeam: number;
    directAgents: number;
    teamAP: number;
    activeWriters: number;
    totalOverrides: number;
    trends: { teamAP: number; activeWriters: number };
  };
  growthBars: [string, string, number][];
  goalBarHeight: number | null;
  teamGoalTarget: number | null;
  teamAgents: TeamAgentRecord[];
  teamUnlocked: boolean;
  selectedRange: TimeRange;
  rangeLabel: string;
  selfId?: string;
};

type FlatNode = {
  agent: TeamAgentRecord;
  depth: number;
  hasChildren: boolean;
};

type TeamSortKey =
  | "name"
  | "uplineName"
  | "directCount"
  | "teamAP"
  | "ownAP"
  | "salesCount"
  | "dials"
  | "conversations"
  | "appointments"
  | "presentations";

type TeamSortConfig = {
  key: TeamSortKey;
  direction: "asc" | "desc";
};

type AdminSortKey = "lifetimeAP" | "lifetimeSales" | "compPercentage";

type AdminSortConfig = {
  key: AdminSortKey;
  direction: "asc" | "desc";
};

function compareAgents(a: TeamAgentRecord, b: TeamAgentRecord, sort: TeamSortConfig | null) {
  if (!sort) return 0;

  const left = a[sort.key];
  const right = b[sort.key];

  let result = 0;
  if (typeof left === "string" && typeof right === "string") {
    result = left.localeCompare(right, undefined, { sensitivity: "base" });
  } else {
    result = Number(left) - Number(right);
  }

  return sort.direction === "asc" ? result : -result;
}

function buildFlatTree(
  rows: TeamAgentRecord[],
  collapsed: Set<string>,
  sort: TeamSortConfig | null,
): FlatNode[] {
  const childrenOf = new Map<string, TeamAgentRecord[]>();
  rows.forEach((agent) => {
    const upline = agent.uplineName;
    if (!childrenOf.has(upline)) childrenOf.set(upline, []);
    childrenOf.get(upline)!.push(agent);
  });

  const result: FlatNode[] = [];

  function traverse(parentName: string, depth: number) {
    const children = [...(childrenOf.get(parentName) ?? [])].sort((a, b) => compareAgents(a, b, sort));
    for (const agent of children) {
      const name = agent.name;
      const hasChildren = (childrenOf.get(name)?.length ?? 0) > 0;
      result.push({ agent, depth, hasChildren });
      if (hasChildren && !collapsed.has(name)) {
        traverse(name, depth + 1);
      }
    }
  }

  traverse("You", 0);
  return result;
}

function fmtPct(value: number) {
  return `${Number(value.toFixed(2)).toString()}%`;
}

function formatCompDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function CompensationTable({
  rows,
  kind,
}: {
  rows: CompensationLineItem[];
  kind: "commission" | "override";
}) {
  return (
    <div className='overflow-x-auto rounded-[22px] border border-[var(--vf-border)]'>
      <table className='w-full min-w-[980px] text-left text-sm'>
        <thead className='bg-[var(--vf-surface)] text-[var(--vf-muted)]'>
          <tr>
            <th className='px-4 py-3 font-medium'>Client</th>
            {kind === "override" && <th className='px-4 py-3 font-medium'>Writing agent</th>}
            <th className='px-4 py-3 font-medium'>Carrier / Product</th>
            <th className='px-4 py-3 font-medium'>AP</th>
            <th className='px-4 py-3 font-medium'>
              {kind === "commission" ? "Agent comp" : "Override delta"}
            </th>
            <th className='px-4 py-3 font-medium'>Carrier rate</th>
            <th className='px-4 py-3 font-medium'>
              {kind === "commission" ? "Est. commission" : "Est. override"}
            </th>
            <th className='px-4 py-3 font-medium'>9-mo advance</th>
            <th className='px-4 py-3 font-medium'>Sold</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.saleId}
              className='border-t border-[var(--vf-border)]'
            >
              <td className='px-4 py-3'>
                <div className='font-medium text-[var(--vf-text)]'>{row.clientName}</div>
              </td>
              {kind === "override" && (
                <td className='px-4 py-3 text-[var(--vf-text)]'>{row.saleAgentName}</td>
              )}
              <td className='px-4 py-3 text-[var(--vf-text)]'>
                <div>{row.carrier}</div>
                <div className='text-xs text-[var(--vf-muted)]'>{row.product}</div>
              </td>
              <td className='px-4 py-3 text-[var(--vf-text)]'>{fmt(row.ap)}</td>
              <td className='px-4 py-3 text-[var(--vf-text)]'>{fmtPct(row.compPercentage)}</td>
              <td className='px-4 py-3 text-[var(--vf-text)]'>{fmtPct(row.effectiveRate)}</td>
              <td className='px-4 py-3 font-semibold text-[var(--vf-accent)]'>{fmt(row.estimatedTotal)}</td>
              <td className='px-4 py-3 text-[var(--vf-text)]'>{fmt(row.estimatedAdvance)}</td>
              <td className='px-4 py-3 text-[var(--vf-muted)]'>{formatCompDate(row.soldAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TeamPage({
  metrics,
  growthBars,
  goalBarHeight,
  teamGoalTarget,
  teamAgents,
  teamUnlocked,
  selectedRange,
  rangeLabel,
  selfId,
}: TeamProps) {
  const [view, setView] = useState<"ranked" | "hierarchy">("ranked");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [selectedAgent, setSelectedAgent] = useState<TeamAgentRecord | null>(null);
  const [agentDetail, setAgentDetail] = useState<TeamAgentCompensationDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [sort, setSort] = useState<TeamSortConfig | null>(null);

  function toggle(name: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  async function openAgent(agent: TeamAgentRecord) {
    setSelectedAgent(agent);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/team/agents/${agent.id}/compensation?range=${selectedRange}`);
      if (!res.ok) throw new Error("Unable to load compensation");
      const data = (await res.json()) as TeamAgentCompensationDetail;
      setAgentDetail(data);
    } catch {
      setAgentDetail(null);
      toast.error("Could not load that agent's compensation details");
    } finally {
      setDetailLoading(false);
    }
  }

  const rankedAgents = [...teamAgents].sort((a, b) => compareAgents(a, b, sort));
  const flatNodes = buildFlatTree(teamAgents, collapsed, sort);

  const rankedCols = [
    { label: "Agent", key: "name" as TeamSortKey },
    { label: "Upline", key: "uplineName" as TeamSortKey },
    { label: "Direct", key: "directCount" as TeamSortKey },
    { label: "Team AP", key: "teamAP" as TeamSortKey },
    { label: "AP", key: "ownAP" as TeamSortKey },
    { label: "Sales", key: "salesCount" as TeamSortKey },
    { label: "Dials", key: "dials" as TeamSortKey },
    { label: "Convos", key: "conversations" as TeamSortKey },
    { label: "Appts", key: "appointments" as TeamSortKey },
    { label: "Pres", key: "presentations" as TeamSortKey },
  ];
  const hierCols = [
    { label: "Agent", key: "name" as TeamSortKey },
    { label: "Direct", key: "directCount" as TeamSortKey },
    { label: "Team AP", key: "teamAP" as TeamSortKey },
    { label: "Own AP", key: "ownAP" as TeamSortKey },
    { label: "Sales", key: "salesCount" as TeamSortKey },
    { label: "Dials", key: "dials" as TeamSortKey },
    { label: "Convos", key: "conversations" as TeamSortKey },
    { label: "Appts", key: "appointments" as TeamSortKey },
    { label: "Pres", key: "presentations" as TeamSortKey },
  ];

  function toggleSort(key: TeamSortKey) {
    setSort((current) => {
      if (current?.key === key) {
        return { key, direction: current.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "desc" };
    });
  }

  function SortIcon({ columnKey }: { columnKey: TeamSortKey }) {
    if (sort?.key !== columnKey) {
      return <ArrowUpDown className='h-3.5 w-3.5 text-[var(--vf-muted)]' />;
    }
    return sort.direction === "asc" ? (
      <ArrowUp className='h-3.5 w-3.5 text-[var(--vf-accent)]' />
    ) : (
      <ArrowDown className='h-3.5 w-3.5 text-[var(--vf-accent)]' />
    );
  }

  return (
    <div className='space-y-8'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <PageTitle
          title='My team'
          description='Production and hierarchy across your downline for the selected period.'
          icon={<Users className='h-6 w-6' />}
        />
        <TimeRangeFilters
          selectedRange={selectedRange}
          storageKey='paradigm-team-range'
        />
      </div>

      {!teamUnlocked && (
        <Panel className='border-dashed border-[var(--vf-surface-2)] bg-[var(--vf-surface)] p-8 text-center'>
          <div className='mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--vf-panel)] text-[var(--vf-accent)]'>
            <Lock className='h-6 w-6' />
          </div>
          <h2 className='mt-5 text-3xl font-semibold text-[var(--vf-text)]'>
            My Team unlocks with your first downline
          </h2>
          <p className='mx-auto mt-3 max-w-2xl text-base text-[var(--vf-muted)]'>
            Once your first agent is assigned under you, this tab will unlock and show your team growth,
            hierarchy, and production breakdown automatically.
          </p>
        </Panel>
      )}

      {teamUnlocked && (
        <>
          <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
            <MetricCard
              title='Total team'
              value={String(metrics.totalTeam)}
              helper='All downline levels'
            />
            <MetricCard
              title='Direct agents'
              value={String(metrics.directAgents)}
              helper='Report directly to you'
            />
            <MetricCard
              title='Team AP (month)'
              value={fmt(metrics.teamAP)}
              helper='Combined AP this month'
              trend={metrics.trends.teamAP}
              emphasis
            />
            <MetricCard
              title='Active writers'
              value={String(metrics.activeWriters)}
              helper='Submitted a policy this month'
              trend={metrics.trends.activeWriters}
            />
          </div>

          {/* Total Overrides hero card */}
          <Panel className='overflow-hidden p-0'>
            <div className='flex flex-col gap-6 bg-[linear-gradient(135deg,rgba(88,101,242,0.18),rgba(88,101,242,0.04))] px-6 py-6 sm:flex-row sm:items-center sm:justify-between'>
              <div className='flex items-center gap-5'>
                <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#5865F2] shadow-[0_12px_24px_rgba(88,101,242,0.3)]'>
                  <DollarSign className='h-7 w-7 text-white' />
                </div>
                <div>
                  <div className='text-sm uppercase tracking-[0.16em] text-[var(--vf-muted)]'>
                    Total overrides
                  </div>
                  <div className='mt-1 text-4xl font-semibold text-[#5865F2] sm:text-5xl'>
                    {fmt(metrics.totalOverrides)}
                  </div>
                  <div className='mt-1.5 text-sm text-[var(--vf-muted)]'>
                    Estimated override earnings from your entire downline this period
                  </div>
                </div>
              </div>
              <div className='flex shrink-0 flex-col gap-3 sm:items-end'>
                <div className='rounded-xl border border-[rgba(88,101,242,0.25)] bg-[rgba(88,101,242,0.1)] px-4 py-3 text-center sm:text-right'>
                  <div className='text-xs uppercase tracking-[0.14em] text-[var(--vf-muted)]'>
                    Est. advance
                  </div>
                  <div className='mt-1 text-xl font-semibold text-[var(--vf-text)]'>
                    {fmt(metrics.totalOverrides * 0.75)}
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          <Panel className='p-6'>
            <div className='flex flex-wrap items-start justify-between gap-4'>
              <div>
                <h2 className='text-2xl font-semibold text-[var(--vf-text)] sm:text-3xl'>My team growth</h2>
                <p className='mt-2 text-base text-[var(--vf-muted)]'>
                  Team AP volume across {rangeLabel.toLowerCase()}.
                </p>
              </div>
            </div>
            {goalBarHeight && (
              <div className='mt-4 flex items-center gap-4 text-xs text-[var(--vf-muted)]'>
                <div className='flex items-center gap-2'>
                  <div className='h-3 w-4 rounded-sm bg-[var(--vf-blurple)]' />
                  <span>Team AP</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='h-3 w-4 rounded-sm bg-[var(--vf-accent)] opacity-30' />
                  <span>Team AP goal</span>
                </div>
              </div>
            )}
            <div className='mt-4 grid grid-cols-4 gap-4 md:grid-cols-8'>
              {growthBars.map(([month, amount, height], index) => (
                <div
                  key={`${month}-${index}`}
                  className='group/col relative flex flex-col items-center gap-2'
                >
                  <div className='text-xs text-[var(--vf-muted)]'>{amount}</div>
                  <div className='relative flex h-44 w-10 items-end'>
                    {/* Goal shadow bar */}
                    {goalBarHeight && (
                      <div
                        className='absolute bottom-0 left-0 w-full rounded-t-xl border border-[var(--vf-accent)] bg-[var(--vf-accent)] opacity-30 transition-opacity duration-150 group-hover/col:opacity-50'
                        style={{ height: `${goalBarHeight}%` }}
                      />
                    )}
                    {/* Actual bar */}
                    <div
                      className={cn(
                        "relative w-full rounded-t-xl",
                        index === growthBars.length - 1
                          ? "bg-[var(--vf-blurple)]"
                          : "bg-[var(--vf-surface-2)]",
                      )}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <div className='text-sm text-[var(--vf-muted)]'>{month}</div>
                  {/* Tooltip — appears below month label, no collision */}
                  {goalBarHeight && (
                    <div className='pointer-events-none absolute top-full z-10 mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-[var(--vf-border)] bg-[var(--vf-panel)] px-2 py-1 text-xs font-medium text-[var(--vf-text)] opacity-0 shadow-lg transition-opacity duration-150 group-hover/col:opacity-100'>
                      Goal: {fmt(teamGoalTarget!)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Panel>

          <Panel className='p-6'>
            <div className='flex flex-wrap items-start justify-between gap-4'>
              <div>
                <h2 className='text-3xl font-semibold text-[var(--vf-text)]'>Agent breakdown</h2>
                <p className='mt-2 text-base text-[var(--vf-muted)]'>
                  Sales and KPI activity across {rangeLabel.toLowerCase()}.
                </p>
              </div>
              <div className='flex gap-2'>
                <button
                  onClick={() => setView("ranked")}
                  className={cn(
                    "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                    view === "ranked"
                      ? "border border-[var(--vf-surface-2)] bg-[var(--vf-surface)] text-[var(--vf-text)]"
                      : "border border-[var(--vf-border)] text-[var(--vf-muted)]",
                  )}
                >
                  Ranked
                </button>
                <button
                  onClick={() => setView("hierarchy")}
                  className={cn(
                    "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                    view === "hierarchy"
                      ? "border border-[var(--vf-surface-2)] bg-[var(--vf-surface)] text-[var(--vf-text)]"
                      : "border border-[var(--vf-border)] text-[var(--vf-muted)]",
                  )}
                >
                  Hierarchy
                </button>
              </div>
            </div>

            {view === "ranked" && (
              <div className='mt-5 overflow-x-auto'>
                <table className='w-full min-w-[1100px] text-left'>
                  <thead className='border-b border-[var(--vf-border)] text-sm text-[var(--vf-muted)]'>
                    <tr>
                      {rankedCols.map((col) => (
                        <th
                          key={col.key}
                          className='px-3 py-3 font-medium'
                        >
                          <button
                            onClick={() => toggleSort(col.key)}
                            className='flex cursor-pointer items-center gap-1.5 transition hover:text-[var(--vf-text)]'
                          >
                            <span>{col.label}</span>
                            <SortIcon columnKey={col.key} />
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rankedAgents.map((agent) => (
                      <tr
                        key={agent.id}
                        onClick={() => openAgent(agent)}
                        className='cursor-pointer border-b border-[var(--vf-border)] text-sm transition hover:bg-[color:rgba(226,187,82,0.10)]'
                      >
                        <td className='px-3 py-4'>
                          <div className='flex items-center gap-3'>
                            <Avatar
                              name={agent.name}
                              imageUrl={agent.imageUrl}
                              small
                            />
                            <div className='flex items-center gap-2'>
                              <span className='font-medium text-[var(--vf-text)]'>{agent.name}</span>
                              {agent.id === selfId && (
                                <span className='rounded-full bg-[var(--vf-accent)] px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-[var(--vf-accent-fg)]'>
                                  you
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className='px-3 py-4 text-[var(--vf-text)]'>{agent.uplineName}</td>
                        <td className='px-3 py-4 text-[var(--vf-text)]'>{agent.directCount}</td>
                        <td className='px-3 py-4 font-semibold text-[var(--vf-accent)]'>
                          {fmt(agent.teamAP)}
                        </td>
                        <td className='px-3 py-4 text-[var(--vf-text)]'>{fmt(agent.ownAP)}</td>
                        <td className='px-3 py-4 text-[var(--vf-text)]'>{agent.salesCount}</td>
                        <td className='px-3 py-4 text-[var(--vf-text)]'>{agent.dials.toLocaleString()}</td>
                        <td className='px-3 py-4 text-[var(--vf-text)]'>{agent.conversations}</td>
                        <td className='px-3 py-4 text-[var(--vf-text)]'>{agent.appointments}</td>
                        <td className='px-3 py-4 text-[var(--vf-text)]'>{agent.presentations}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {view === "hierarchy" && (
              <div className='mt-5 overflow-x-auto'>
                <table className='w-full min-w-[900px] text-left'>
                  <thead className='border-b border-[var(--vf-border)] text-sm text-[var(--vf-muted)]'>
                    <tr>
                      {hierCols.map((col) => (
                        <th
                          key={col.key}
                          className='px-3 py-3 font-medium'
                        >
                          <button
                            onClick={() => toggleSort(col.key)}
                            className='flex cursor-pointer items-center gap-1.5 transition hover:text-[var(--vf-text)]'
                          >
                            <span>{col.label}</span>
                            <SortIcon columnKey={col.key} />
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {flatNodes.map(({ agent, depth, hasChildren }) => {
                      const name = agent.name;
                      const isCollapsed = collapsed.has(name);
                      return (
                        <tr
                          key={agent.id}
                          onClick={() => openAgent(agent)}
                          className='cursor-pointer border-b border-[var(--vf-border)] text-sm transition hover:bg-[color:rgba(226,187,82,0.10)]'
                        >
                          <td className='px-3 py-3'>
                            <div
                              className='flex items-center'
                              style={{ paddingLeft: depth * 28 }}
                            >
                              {depth > 0 && (
                                <div className='mr-2 flex h-10 flex-col items-center'>
                                  <div className='w-px flex-1 bg-[var(--vf-border)]' />
                                  <div className='h-px w-3 bg-[var(--vf-border)]' />
                                </div>
                              )}
                              {hasChildren ? (
                                <button
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    toggle(name);
                                  }}
                                  className='mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[var(--vf-border)] bg-[var(--vf-surface)] text-[var(--vf-muted)] hover:text-[var(--vf-text)]'
                                >
                                  {isCollapsed ? (
                                    <ChevronRight className='h-3.5 w-3.5' />
                                  ) : (
                                    <ChevronDown className='h-3.5 w-3.5' />
                                  )}
                                </button>
                              ) : (
                                <div className='mr-2 h-6 w-6 shrink-0' />
                              )}
                              <Avatar
                                name={name}
                                imageUrl={agent.imageUrl}
                                small
                              />
                              <div className='ml-3 flex items-center gap-2'>
                                <span className='font-medium text-[var(--vf-text)]'>{name}</span>
                                {agent.id === selfId && (
                                  <span className='rounded-full bg-[var(--vf-accent)] px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-[var(--vf-accent-fg)]'>
                                    you
                                  </span>
                                )}
                              </div>
                              {hasChildren && isCollapsed && (
                                <span className='ml-2 rounded-full bg-[var(--vf-surface-2)] px-2 py-0.5 text-xs text-[var(--vf-muted)]'>
                                  +{agent.directCount}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className='px-3 py-3 text-[var(--vf-text)]'>{agent.directCount}</td>
                          <td className='px-3 py-3 font-semibold text-[var(--vf-accent)]'>
                            {fmt(agent.teamAP)}
                          </td>
                          <td className='px-3 py-3 text-[var(--vf-text)]'>{fmt(agent.ownAP)}</td>
                          <td className='px-3 py-3 text-[var(--vf-text)]'>{agent.salesCount}</td>
                          <td className='px-3 py-3 text-[var(--vf-text)]'>{agent.dials.toLocaleString()}</td>
                          <td className='px-3 py-3 text-[var(--vf-text)]'>{agent.conversations}</td>
                          <td className='px-3 py-3 text-[var(--vf-text)]'>{agent.appointments}</td>
                          <td className='px-3 py-3 text-[var(--vf-text)]'>{agent.presentations}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </>
      )}

      <Dialog
        open={!!selectedAgent}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedAgent(null);
            setAgentDetail(null);
          }
        }}
      >
        <DialogContent className='max-h-[85vh] overflow-y-auto border-[var(--vf-border)] bg-[var(--vf-panel)] text-[var(--vf-text)] sm:max-w-6xl'>
          <DialogHeader>
            <DialogTitle className='text-2xl font-semibold'>
              {selectedAgent?.name ?? "Agent detail"}
            </DialogTitle>
          </DialogHeader>

          {detailLoading || !selectedAgent ? (
            <div className='mt-2 space-y-5'>
              {/* Tabs header row */}
              <div className='flex items-start justify-between gap-4'>
                <Skeleton className='h-4 w-72' />
                <div className='flex gap-2'>
                  <Skeleton className='h-8 w-24 rounded-xl' />
                  <Skeleton className='h-8 w-20 rounded-xl' />
                </div>
              </div>
              {/* 4 metric cards */}
              <div className='grid gap-4 md:grid-cols-4'>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className='rounded-[20px] border border-[var(--vf-border)] bg-[var(--vf-surface)] p-4'
                  >
                    <Skeleton className='h-3 w-20' />
                    <Skeleton className='mt-3 h-7 w-24' />
                    <Skeleton className='mt-2 h-3 w-28' />
                  </div>
                ))}
              </div>
              {/* Table skeleton */}
              <div className='overflow-hidden rounded-[22px] border border-[var(--vf-border)]'>
                <div className='bg-[var(--vf-surface)] px-4 py-3'>
                  <div className='flex gap-8'>
                    {["w-20", "w-32", "w-16", "w-20", "w-20", "w-24", "w-20", "w-16"].map((w, i) => (
                      <Skeleton
                        key={i}
                        className={`h-3 ${w}`}
                      />
                    ))}
                  </div>
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className='flex gap-8 border-t border-[var(--vf-border)] px-4 py-3.5'
                  >
                    <Skeleton className='h-4 w-20' />
                    <Skeleton className='h-4 w-32' />
                    <Skeleton className='h-4 w-16' />
                    <Skeleton className='h-4 w-20' />
                    <Skeleton className='h-4 w-20' />
                    <Skeleton className='h-4 w-24' />
                    <Skeleton className='h-4 w-20' />
                    <Skeleton className='h-4 w-16' />
                  </div>
                ))}
              </div>
            </div>
          ) : !agentDetail ? (
            <div className='py-12 text-center text-sm text-[var(--vf-muted)]'>
              No compensation detail found for this agent.
            </div>
          ) : (
            <Tabs
              defaultValue='commissions'
              className='mt-2'
            >
              {(() => {
                const viewingSelf = selectedAgent?.id === selfId;
                return (
                  <div className='flex flex-wrap items-start justify-between gap-4'>
                    <div className='space-y-1.5'>
                      {!viewingSelf && (
                        <>
                          <div className='text-sm text-[var(--vf-muted)]'>
                            {agentDetail.subject.name} is at{" "}
                            <span className='font-semibold text-[var(--vf-text)]'>
                              {fmtPct(agentDetail.subject.compPercentage)}
                            </span>{" "}
                            comp. Your override on this leg is{" "}
                            <span className='font-semibold text-[var(--vf-accent)]'>
                              {fmtPct(agentDetail.summary.overrideDelta)}
                            </span>
                            .
                          </div>
                          {!agentDetail.branchAgent.isSelf && (
                            <div className='text-xs text-[var(--vf-muted)]'>
                              Override flows through{" "}
                              <span className='font-semibold text-[var(--vf-text)]'>
                                {agentDetail.branchAgent.name}
                              </span>{" "}
                              ({fmtPct(agentDetail.branchAgent.compPercentage)} comp) - your direct downline
                              on this leg.
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <TabsList
                      variant='line'
                      className='bg-transparent p-0'
                    >
                      <TabsTrigger
                        value='commissions'
                        className='rounded-xl px-4 py-2 text-sm data-active:bg-[var(--vf-surface)]'
                      >
                        Commissions
                      </TabsTrigger>
                      {!viewingSelf && (
                        <TabsTrigger
                          value='overrides'
                          className='rounded-xl px-4 py-2 text-sm data-active:bg-[var(--vf-surface)]'
                        >
                          Override
                        </TabsTrigger>
                      )}
                    </TabsList>
                  </div>
                );
              })()}

              <TabsContent
                value='commissions'
                className='space-y-5 pt-4'
              >
                <div className='grid gap-4 md:grid-cols-4'>
                  <MetricCard
                    title='Sales'
                    value={String(agentDetail.summary.ownSalesCount)}
                    helper='Submitted by this agent'
                  />
                  <MetricCard
                    title='Total AP'
                    value={fmt(agentDetail.summary.ownApTotal)}
                    helper='Own written AP'
                  />
                  <MetricCard
                    title='Est. commission'
                    value={fmt(agentDetail.summary.ownCommissionTotal)}
                    helper='Carrier rate × AP'
                    emphasis
                  />
                  <MetricCard
                    title='9-mo advance'
                    value={fmt(agentDetail.summary.ownAdvanceTotal)}
                    helper='75% of estimated commission'
                  />
                </div>
                {agentDetail.commissions.length === 0 ? (
                  <Panel className='border-dashed bg-[var(--vf-surface)] p-10 text-center text-sm text-[var(--vf-muted)]'>
                    No commissions found for this agent in {rangeLabel.toLowerCase()}.
                  </Panel>
                ) : (
                  <CompensationTable
                    rows={agentDetail.commissions}
                    kind='commission'
                  />
                )}
              </TabsContent>

              <TabsContent
                value='overrides'
                className='space-y-5 pt-4'
              >
                <div className='grid gap-4 md:grid-cols-4'>
                  <MetricCard
                    title='Override sales'
                    value={String(agentDetail.summary.overrideSalesCount)}
                    helper='Across this downline leg'
                  />
                  <MetricCard
                    title='Override AP'
                    value={fmt(agentDetail.summary.overrideApTotal)}
                    helper='AP eligible for your override'
                  />
                  <MetricCard
                    title='Est. override'
                    value={fmt(agentDetail.summary.overrideTotal)}
                    helper={`${fmtPct(agentDetail.summary.overrideDelta)} leg delta`}
                    emphasis
                  />
                  <MetricCard
                    title='9-mo advance'
                    value={fmt(agentDetail.summary.overrideAdvanceTotal)}
                    helper='75% of estimated override'
                  />
                </div>
                {agentDetail.overrides.length === 0 ? (
                  <Panel className='border-dashed bg-[var(--vf-surface)] p-10 text-center text-sm text-[var(--vf-muted)]'>
                    No override is currently available on this leg for {rangeLabel.toLowerCase()}.
                  </Panel>
                ) : (
                  <CompensationTable
                    rows={agentDetail.overrides}
                    kind='override'
                  />
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

type CompBreakdownAgent = { agentId: string; agentName: string; totalAP: number; salesCount: number };
type CompBreakdownTeam = {
  teamId: string;
  teamName: string;
  teamColor: string;
  agents: CompBreakdownAgent[];
};

function CompetitionCard({
  comp,
  onClick,
  onEdit,
  onDelete,
  onSetStatus,
  onToggleFeatured,
}: {
  comp: Competition;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSetStatus?: (id: string, status: string) => void;
  onToggleFeatured?: () => void;
}) {
  const [a, b] = comp.teams;
  const totalAP = (a?.totalAP ?? 0) + (b?.totalAP ?? 0);
  const aPct = totalAP > 0 ? Math.round(((a?.totalAP ?? 0) / totalAP) * 100) : 50;
  const isAdmin = !!(onEdit || onDelete);
  const SummaryTag = onClick ? "button" : "div";

  const statusLabel: Record<string, string> = { draft: "Draft", active: "Live", ended: "Ended" };
  const statusColor: Record<string, string> = {
    draft: "bg-[var(--vf-surface)] text-[var(--vf-muted)]",
    active: "bg-[var(--vf-emerald-dim)] text-[var(--vf-emerald)]",
    ended: "bg-[var(--vf-surface)] text-[var(--vf-muted)]",
  };

  return (
    <Panel className='overflow-hidden p-0'>
      {/* Header */}
      <div className='flex flex-wrap items-start justify-between gap-3 border-b border-[var(--vf-border)] bg-[var(--vf-surface)] px-5 py-4'>
        <SummaryTag
          className='min-w-0 text-left'
          onClick={onClick}
        >
          <div className='flex items-center gap-3'>
            <h2 className='text-2xl font-semibold text-[var(--vf-text)] sm:text-3xl'>{comp.name}</h2>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]",
                statusColor[comp.status] ?? statusColor.draft,
              )}
            >
              {statusLabel[comp.status] ?? comp.status}
            </span>
            {comp.pinned && <Star className='h-4 w-4 fill-[var(--vf-gold)] text-[var(--vf-gold)]' />}
          </div>
          {comp.description && <p className='mt-1 text-sm text-[var(--vf-muted)]'>{comp.description}</p>}
          {comp.prize && <p className='mt-1 text-sm text-[var(--vf-gold)]'>🏆 {comp.prize}</p>}
        </SummaryTag>
        <div className='flex shrink-0 flex-wrap items-center gap-3'>
          <div className='text-right text-sm text-[var(--vf-muted)]'>
            {new Date(comp.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} –{" "}
            {new Date(comp.endDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
          {/* Admin controls */}
          {isAdmin && (
            <div className='flex shrink-0 flex-wrap items-center gap-2'>
              <button
                onClick={onToggleFeatured}
                title={comp.pinned ? "Remove from welcome page" : "Feature on welcome page"}
                className={cn(
                  "flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-medium",
                  comp.pinned
                    ? "border-[var(--vf-gold)] text-[var(--vf-gold)]"
                    : "border-[var(--vf-border)] text-[var(--vf-muted)]",
                )}
              >
                <Star className={cn("h-3 w-3", comp.pinned && "fill-[var(--vf-gold)]")} />
                {comp.pinned ? "Featured" : "Feature"}
              </button>
              {comp.status === "draft" && (
                <button
                  onClick={() => onSetStatus?.(comp.id, "active")}
                  className='rounded-xl border border-[var(--vf-emerald)] px-3 py-1.5 text-xs font-medium text-[var(--vf-emerald)]'
                >
                  Activate
                </button>
              )}
              {comp.status === "active" && (
                <button
                  onClick={() => onSetStatus?.(comp.id, "ended")}
                  className='rounded-xl border border-[var(--vf-border)] px-3 py-1.5 text-xs font-medium text-[var(--vf-muted)]'
                >
                  End
                </button>
              )}
              <button
                onClick={onEdit}
                className='flex items-center gap-1 rounded-xl border border-[var(--vf-border)] px-3 py-1.5 text-xs text-[var(--vf-text)]'
              >
                <Pencil className='h-3 w-3' /> Edit
              </button>
              <button
                onClick={onDelete}
                className='flex items-center gap-1 rounded-xl border border-red-800 px-3 py-1.5 text-xs text-red-400'
              >
                <Trash2 className='h-3 w-3' /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Teams */}
      {comp.teams.length === 2 && (
        <SummaryTag
          className='w-full text-left'
          onClick={onClick}
        >
          <div className='grid grid-cols-2'>
            {comp.teams.map((team) => {
              const isWinner = comp.winningTeamId === team.id;
              return (
                <div
                  key={team.id}
                  className='p-4 sm:p-6'
                  style={{ borderTop: `3px solid ${team.color}` }}
                >
                  <div className='flex items-center gap-2'>
                    <div
                      className='h-3 w-3 rounded-full'
                      style={{ background: team.color }}
                    />
                    <div className='text-base font-semibold text-[var(--vf-text)] sm:text-xl'>
                      {team.name}
                    </div>
                    {isWinner && (
                      <span className='rounded-full bg-[var(--vf-surface-2)] px-2 py-0.5 text-xs text-[var(--vf-accent)]'>
                        Winner
                      </span>
                    )}
                  </div>
                  <div
                    className='mt-3 text-3xl font-semibold sm:text-4xl'
                    style={{ color: team.color }}
                  >
                    {fmt(team.totalAP)}
                  </div>
                  <div className='mt-1 text-sm text-[var(--vf-muted)]'>
                    {team.salesCount} {team.salesCount === 1 ? "sale" : "sales"}
                  </div>
                  {team.members.length > 0 && (
                    <div className='mt-3 text-xs text-[var(--vf-muted)]'>{team.members.join(" · ")}</div>
                  )}
                </div>
              );
            })}
          </div>
          {comp.status !== "draft" && (
            <div className='border-t border-[var(--vf-border)] px-5 pb-5 pt-4'>
              <div className='flex justify-between text-xs text-[var(--vf-muted)] mb-2'>
                <span>{comp.teams[0]?.name}</span>
                <span>{comp.teams[1]?.name}</span>
              </div>
              <div className='flex h-3 overflow-hidden rounded-full'>
                <div
                  className='h-full transition-all'
                  style={{ width: `${aPct}%`, background: comp.teams[0]?.color ?? "#e2bb52" }}
                />
                <div
                  className='h-full flex-1 transition-all'
                  style={{ background: comp.teams[1]?.color ?? "#F15025" }}
                />
              </div>
            </div>
          )}
        </SummaryTag>
      )}
    </Panel>
  );
}

function CompetitionDetail({
  comp,
  onBack,
  onEdit,
}: {
  comp: Competition;
  onBack: () => void;
  onEdit?: () => void;
}) {
  const [breakdown, setBreakdown] = useState<CompBreakdownTeam[] | null>(null);

  useEffect(() => {
    fetch(`/api/competitions/${comp.id}/breakdown`)
      .then((r) => r.json())
      .then(setBreakdown)
      .catch(() => setBreakdown([]));
  }, [comp.id]);

  return (
    <div className='space-y-6'>
      {/* Back bar */}
      <div className='flex items-center gap-4'>
        <button
          onClick={onBack}
          className='flex items-center gap-2 rounded-2xl border border-[var(--vf-border)] px-4 py-2.5 text-sm font-medium text-[var(--vf-muted)] hover:text-[var(--vf-text)]'
        >
          <ArrowLeft className='h-4 w-4' /> Back
        </button>
        {onEdit && (
          <button
            onClick={onEdit}
            className='flex items-center gap-1.5 rounded-2xl border border-[var(--vf-border)] px-4 py-2.5 text-sm font-medium text-[var(--vf-text)]'
          >
            <Pencil className='h-3.5 w-3.5' /> Edit competition
          </button>
        )}
      </div>

      {/* Card summary (no admin controls, no click) */}
      <CompetitionCard comp={comp} />

      {/* Per-agent breakdown */}
      <div>
        <h3 className='mb-4 text-xl font-semibold text-[var(--vf-text)]'>Agent breakdown</h3>
        {breakdown === null ? (
          <div className='py-8 text-center text-sm text-[var(--vf-muted)]'>Loading breakdown...</div>
        ) : breakdown.length === 0 ? (
          <div className='rounded-2xl border border-dashed border-[var(--vf-border)] py-10 text-center text-sm text-[var(--vf-muted)]'>
            No members assigned yet.
          </div>
        ) : (
          <div className='grid gap-5 sm:grid-cols-2'>
            {breakdown.map((team) => (
              <Panel
                key={team.teamId}
                className='overflow-hidden p-0'
              >
                <div
                  className='flex items-center gap-2 border-b border-[var(--vf-border)] bg-[var(--vf-surface)] px-5 py-3'
                  style={{ borderTop: `3px solid ${team.teamColor}` }}
                >
                  <div
                    className='h-2.5 w-2.5 rounded-full'
                    style={{ background: team.teamColor }}
                  />
                  <span className='font-semibold text-[var(--vf-text)]'>{team.teamName}</span>
                  <span className='ml-auto text-sm text-[var(--vf-muted)]'>{team.agents.length} agents</span>
                </div>
                {team.agents.length === 0 ? (
                  <div className='px-5 py-6 text-sm text-[var(--vf-muted)]'>No agents on this team.</div>
                ) : (
                  <table className='w-full text-sm'>
                    <thead className='bg-[var(--vf-surface)] text-xs uppercase tracking-[0.12em] text-[var(--vf-muted)]'>
                      <tr>
                        <th className='px-5 py-2.5 text-left font-medium'>Agent</th>
                        <th className='px-5 py-2.5 text-right font-medium'>AP</th>
                        <th className='px-5 py-2.5 text-right font-medium'>Sales</th>
                      </tr>
                    </thead>
                    <tbody>
                      {team.agents.map((agent, i) => (
                        <tr
                          key={agent.agentId}
                          className={cn("border-t border-[var(--vf-border)]", i === 0 && "font-medium")}
                        >
                          <td className='px-5 py-3 text-[var(--vf-text)]'>{agent.agentName}</td>
                          <td
                            className='px-5 py-3 text-right'
                            style={{ color: team.teamColor }}
                          >
                            {fmt(agent.totalAP)}
                          </td>
                          <td className='px-5 py-3 text-right text-[var(--vf-muted)]'>{agent.salesCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Panel>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function CompetitionPage({
  competitions,
  isAdmin = false,
}: {
  competitions: Competition[];
  isAdmin?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Competition | null>(null);
  const [confirmPending, setConfirmPending] = useState<{
    action: "delete" | "end" | "activate";
    id: string;
    name: string;
  } | null>(null);
  const [featurePending, setFeaturePending] = useState<{
    id: string;
    currentFeaturedName: string;
  } | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft" | "ended">(() => {
    if (typeof window === "undefined") return "all";
    const savedFilter = window.localStorage.getItem("paradigm-competition-filter");
    return savedFilter === "all" ||
      savedFilter === "active" ||
      savedFilter === "draft" ||
      savedFilter === "ended"
      ? savedFilter
      : "all";
  });
  const selectedId = searchParams.get("competitionId");

  const selected = selectedId ? (competitions.find((c) => c.id === selectedId) ?? null) : null;

  function openCompetition(id: string) {
    router.push(`/dashboard/competition?competitionId=${id}`);
  }

  function closeCompetition() {
    router.push("/dashboard/competition");
  }

  async function deleteComp(id: string) {
    const res = await fetch(`/api/competitions/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Competition deleted");
      router.refresh();
      if (selectedId === id) closeCompetition();
    } else toast.error("Delete failed");
  }

  async function setStatus(id: string, status: string) {
    const res = await fetch(`/api/competitions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success(`Marked as ${status}`);
      router.refresh();
    } else toast.error("Update failed");
  }

  async function executeConfirmed() {
    if (!confirmPending) return;
    const { action, id } = confirmPending;
    setConfirmPending(null);
    if (action === "delete") await deleteComp(id);
    else if (action === "end") await setStatus(id, "ended");
    else if (action === "activate") await setStatus(id, "active");
  }

  async function toggleFeatured(id: string, current: boolean) {
    const res = await fetch(`/api/competitions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned: !current }),
    });
    if (res.ok) {
      toast.success(!current ? "Set as featured on welcome page" : "Removed from featured");
      router.refresh();
    } else toast.error("Update failed");
  }

  function adminCardProps(c: Competition) {
    if (!isAdmin) return {};
    return {
      onEdit: () => {
        setEditing(c);
        setModalOpen(true);
      },
      onDelete: () => setConfirmPending({ action: "delete", id: c.id, name: c.name }),
      onSetStatus: (id: string, status: string) => {
        if (status === "ended") setConfirmPending({ action: "end", id, name: c.name });
        else if (status === "active") setConfirmPending({ action: "activate", id, name: c.name });
        else void setStatus(id, status);
      },
      onToggleFeatured: () => {
        if (!c.pinned) {
          const alreadyFeatured = competitions.find((x) => x.pinned && x.id !== c.id);
          if (alreadyFeatured) {
            setFeaturePending({ id: c.id, currentFeaturedName: alreadyFeatured.name });
            return;
          }
        }
        void toggleFeatured(c.id, c.pinned);
      },
    };
  }

  const active = competitions.filter((c) => c.status === "active");
  const draft = competitions.filter((c) => c.status === "draft");
  const ended = competitions.filter((c) => c.status === "ended");
  const visibleCompetitions = competitions.filter((c) => statusFilter === "all" || c.status === statusFilter);

  function chooseStatusFilter(value: "all" | "active" | "draft" | "ended") {
    setStatusFilter(value);
    window.localStorage.setItem("paradigm-competition-filter", value);
  }

  return (
    <div className='space-y-8'>
      {isAdmin && (
        <CompetitionModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            router.refresh();
          }}
          editing={editing}
        />
      )}

      {/* Detail drill-down */}
      {selected ? (
        <CompetitionDetail
          comp={selected}
          onBack={closeCompetition}
          onEdit={
            isAdmin
              ? () => {
                  setEditing(selected);
                  setModalOpen(true);
                }
              : undefined
          }
        />
      ) : (
        <>
          <div className='flex flex-wrap items-end justify-between gap-4'>
            <PageTitle
              title='Competitions'
              description={
                isAdmin
                  ? "Create and manage competitions across your agency."
                  : "Live matchups scored on AP written during each window."
              }
              icon={<Swords className='h-6 w-6' />}
            />
            {isAdmin && (
              <button
                onClick={() => {
                  setEditing(null);
                  setModalOpen(true);
                }}
                className='flex items-center gap-2 rounded-2xl bg-[var(--vf-accent)] px-5 py-3 text-sm font-semibold text-[var(--vf-accent-fg)]'
              >
                <Plus className='h-4 w-4' /> New competition
              </button>
            )}
          </div>

          <div className='flex flex-wrap items-center gap-2'>
            {(
              [
                { label: "All", value: "all" },
                { label: "Active", value: "active" },
                { label: "Upcoming", value: "draft" },
                { label: "Past", value: "ended" },
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                onClick={() => chooseStatusFilter(option.value)}
                className={cn(
                  "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                  statusFilter === option.value
                    ? "bg-[rgba(255,255,255,0.14)] text-white"
                    : "text-[var(--vf-muted)] hover:bg-[rgba(255,255,255,0.07)] hover:text-[var(--vf-text)]",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          {competitions.length === 0 && (
            <div className='flex min-h-[360px] items-center justify-center rounded-[28px] border border-dashed border-[var(--vf-border)] bg-[var(--vf-surface)]'>
              <div className='max-w-xl text-center'>
                <Swords className='mx-auto h-12 w-12 text-[var(--vf-muted)]' />
                <div className='mt-6 text-4xl font-medium text-[var(--vf-text)]'>No competitions yet</div>
                {isAdmin && <p className='mt-4 text-lg text-[var(--vf-muted)]'>Create one to get started.</p>}
              </div>
            </div>
          )}

          {statusFilter === "all" && active.length > 0 && (
            <div className='space-y-5'>
              {active.map((c) => (
                <CompetitionCard
                  key={c.id}
                  comp={c}
                  onClick={() => openCompetition(c.id)}
                  {...adminCardProps(c)}
                />
              ))}
            </div>
          )}

          {statusFilter === "all" && draft.length > 0 && (
            <div className='space-y-3'>
              <div className='text-sm uppercase tracking-[0.18em] text-[var(--vf-muted)]'>Upcoming</div>
              {draft.map((c) => (
                <CompetitionCard
                  key={c.id}
                  comp={c}
                  onClick={() => openCompetition(c.id)}
                  {...adminCardProps(c)}
                />
              ))}
            </div>
          )}

          {statusFilter === "all" && ended.length > 0 && (
            <div className='space-y-3'>
              <div className='text-sm uppercase tracking-[0.18em] text-[var(--vf-muted)]'>
                Past competitions
              </div>
              {ended.map((c) => (
                <CompetitionCard
                  key={c.id}
                  comp={c}
                  onClick={() => openCompetition(c.id)}
                  {...adminCardProps(c)}
                />
              ))}
            </div>
          )}

          {statusFilter !== "all" && visibleCompetitions.length > 0 && (
            <div className='space-y-5'>
              {visibleCompetitions.map((c) => (
                <CompetitionCard
                  key={c.id}
                  comp={c}
                  onClick={() => openCompetition(c.id)}
                  {...adminCardProps(c)}
                />
              ))}
            </div>
          )}

          {statusFilter !== "all" && visibleCompetitions.length === 0 && competitions.length > 0 && (
            <div className='rounded-[28px] border border-dashed border-[var(--vf-border)] bg-[var(--vf-surface)] px-6 py-12 text-center'>
              <div className='text-2xl font-medium text-[var(--vf-text)]'>
                No {statusFilter === "draft" ? "upcoming" : statusFilter} competitions
              </div>
              <div className='mt-2 text-sm text-[var(--vf-muted)]'>
                Try a different filter to view the rest of your competitions.
              </div>
            </div>
          )}
        </>
      )}

      {/* Replace featured competition modal */}
      <Dialog
        open={!!featurePending}
        onOpenChange={(open) => {
          if (!open) setFeaturePending(null);
        }}
      >
        <DialogContent className='max-w-sm border-[var(--vf-border)] bg-[var(--vf-panel)] text-[var(--vf-text)]'>
          <DialogHeader>
            <DialogTitle className='text-xl font-semibold'>Replace featured competition?</DialogTitle>
          </DialogHeader>
          <p className='text-sm text-[var(--vf-muted)]'>
            <span className='font-medium text-[var(--vf-text)]'>"{featurePending?.currentFeaturedName}"</span>{" "}
            is currently featured on the welcome page. Featuring a new competition will remove it.
          </p>
          <div className='mt-2 flex justify-end gap-3'>
            <button
              onClick={() => setFeaturePending(null)}
              className='rounded-xl border border-[var(--vf-border)] bg-[var(--vf-surface)] px-4 py-2 text-sm font-medium text-[var(--vf-text)] hover:bg-[var(--vf-surface-2)]'
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (featurePending) void toggleFeatured(featurePending.id, false);
                setFeaturePending(null);
              }}
              className='rounded-xl bg-[var(--vf-accent)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90'
            >
              Feature this one
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation modal */}
      <Dialog
        open={!!confirmPending}
        onOpenChange={(open) => {
          if (!open) setConfirmPending(null);
        }}
      >
        <DialogContent className='max-w-sm border-[var(--vf-border)] bg-[var(--vf-panel)] text-[var(--vf-text)]'>
          <DialogHeader>
            <DialogTitle className='text-xl font-semibold'>
              {confirmPending?.action === "delete" && "Delete competition"}
              {confirmPending?.action === "end" && "End competition"}
              {confirmPending?.action === "activate" && "Activate competition"}
            </DialogTitle>
          </DialogHeader>
          <p className='text-sm text-[var(--vf-muted)]'>
            {confirmPending?.action === "delete" && (
              <>
                Are you sure you want to delete{" "}
                <span className='font-medium text-[var(--vf-text)]'>"{confirmPending.name}"</span>? This
                cannot be undone.
              </>
            )}
            {confirmPending?.action === "end" && (
              <>
                End <span className='font-medium text-[var(--vf-text)]'>"{confirmPending?.name}"</span>? This
                will close it to all participants.
              </>
            )}
            {confirmPending?.action === "activate" && (
              <>
                Activate <span className='font-medium text-[var(--vf-text)]'>"{confirmPending?.name}"</span>?
                It will become live and visible to all agents.
              </>
            )}
          </p>
          <div className='mt-2 flex justify-end gap-3'>
            <button
              onClick={() => setConfirmPending(null)}
              className='rounded-xl border border-[var(--vf-border)] bg-[var(--vf-surface)] px-4 py-2 text-sm font-medium text-[var(--vf-text)] hover:bg-[var(--vf-surface-2)]'
            >
              Cancel
            </button>
            <button
              onClick={() => void executeConfirmed()}
              className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${confirmPending?.action === "delete" ? "bg-red-600 hover:bg-red-700" : confirmPending?.action === "end" ? "bg-amber-600 hover:bg-amber-700" : "bg-[var(--vf-accent)] hover:opacity-90"}`}
            >
              {confirmPending?.action === "delete" && "Delete"}
              {confirmPending?.action === "end" && "End competition"}
              {confirmPending?.action === "activate" && "Activate"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

type AgencyProps = {
  metrics: {
    totalSales: number;
    agencyAP: number;
    activeWriters: number;
    trends: { totalSales: number; agencyAP: number; activeWriters: number };
  };
  agentLeaderboard: LeaderboardEntry[];
  teamLeaderboard: LeaderboardEntry[];
  selectedRange: TimeRange;
  rangeLabel: string;
  isAdmin: boolean;
  compGuide: CompGuideRecord[];
  agentCompPercentage: number;
};

export function AgencyPage({
  metrics,
  agentLeaderboard,
  teamLeaderboard,
  selectedRange,
  rangeLabel,
  isAdmin,
  compGuide,
  agentCompPercentage,
}: AgencyProps) {
  const overview = (
    <>
      <div className='flex justify-end'>
        <TimeRangeFilters
          selectedRange={selectedRange}
          storageKey='paradigm-agency-range'
        />
      </div>
      <div className='grid gap-4 md:grid-cols-3'>
        <MetricCard
          title='Total sales'
          value={String(metrics.totalSales)}
          helper={`Policies submitted in ${rangeLabel.toLowerCase()}`}
          trend={metrics.trends.totalSales}
        />
        <MetricCard
          title='Agency AP'
          value={fmt(metrics.agencyAP)}
          helper={`Combined AP in ${rangeLabel.toLowerCase()}`}
          trend={metrics.trends.agencyAP}
          emphasis
        />
        <MetricCard
          title='Active writers'
          value={String(metrics.activeWriters)}
          helper={`Submitted a policy in ${rangeLabel.toLowerCase()}`}
          trend={metrics.trends.activeWriters}
        />
      </div>
      <div className='grid gap-5 xl:grid-cols-2'>
        <LeaderboardList
          title='Agent leaderboard'
          subtitle={`Top agents by AP for ${rangeLabel.toLowerCase()}`}
          entries={agentLeaderboard}
          showProgress={false}
        />
        <LeaderboardList
          title='Team leaderboard'
          subtitle={`Top teams by combined AP for ${rangeLabel.toLowerCase()}`}
          entries={teamLeaderboard}
          showProgress={false}
        />
      </div>
    </>
  );

  return (
    <div className='space-y-8'>
      {isAdmin ? (
        <Tabs defaultValue='overview'>
          <div className='flex flex-wrap items-end justify-between gap-4'>
            <PageTitle
              title='Agency'
              description='Agency-wide production, top agents, and the master carrier comp guide.'
              icon={<Building2 className='h-6 w-6' />}
            />
            <TabsList
              variant='line'
              className='bg-transparent p-0'
            >
              <TabsTrigger
                value='overview'
                className='rounded-xl px-4 py-2 text-sm data-active:bg-[var(--vf-surface)]'
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value='comp-guide'
                className='rounded-xl px-4 py-2 text-sm data-active:bg-[var(--vf-surface)]'
              >
                Comp guide
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value='overview'
            className='space-y-8 pt-2'
          >
            {overview}
          </TabsContent>

          <TabsContent
            value='comp-guide'
            className='pt-2'
          >
            <Panel className='p-5'>
              <div className='flex flex-wrap items-start justify-between gap-3'>
                <div>
                  <div className='text-3xl font-semibold text-[var(--vf-text)]'>Master comp guide</div>
                  <div className='mt-2 text-base text-[var(--vf-muted)]'>
                    FFL master comp guide. Commission rate as % of AP at each FFL contract level.
                  </div>
                </div>
              </div>
              {(() => {
                const FFL_LEVELS = [
                  65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130, 135, 140, 145,
                ];
                const agentFflLevel = Math.floor(agentCompPercentage / 5) * 5;
                const CATEGORIES = ["Whole Life", "Term", "IUL / Annuity"] as const;
                const renderTable = (category: string) => {
                  const rows = compGuide.filter((r) => r.category === category);
                  return (
                    <div className='mt-5 overflow-x-auto rounded-[22px] border border-[var(--vf-border)]'>
                      <table className='w-full text-left text-xs'>
                        <thead className='bg-[var(--vf-surface)] text-[var(--vf-muted)]'>
                          <tr>
                            <th className='sticky left-0 z-10 bg-[var(--vf-surface)] px-4 py-3 font-medium whitespace-nowrap'>
                              Carrier
                            </th>
                            <th className='sticky left-[120px] z-10 bg-[var(--vf-surface)] px-4 py-3 font-medium whitespace-nowrap'>
                              Product
                            </th>
                            {FFL_LEVELS.map((lvl) => (
                              <th
                                key={lvl}
                                className={`px-3 py-3 text-center font-medium whitespace-nowrap${lvl === agentFflLevel ? " text-[var(--vf-accent)]" : ""}`}
                              >
                                {lvl}%
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row) => (
                            <tr
                              key={`${row.carrier}::${row.product}`}
                              className='border-t border-[var(--vf-border)]'
                            >
                              <td className='sticky left-0 z-10 bg-[var(--vf-panel)] px-4 py-2 font-medium text-[var(--vf-text)] whitespace-nowrap'>
                                {row.carrier}
                              </td>
                              <td className='sticky left-[120px] z-10 bg-[var(--vf-panel)] px-4 py-2 text-[var(--vf-muted)] whitespace-nowrap'>
                                {row.product}
                              </td>
                              {FFL_LEVELS.map((lvl) => {
                                const rate = row.rates[lvl];
                                return (
                                  <td
                                    key={lvl}
                                    className={`px-3 py-2 text-center${lvl === agentFflLevel ? " font-semibold text-[var(--vf-text)]" : " text-[var(--vf-muted)]"}`}
                                  >
                                    {rate != null ? `${rate}%` : "—"}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                };
                return (
                  <Tabs
                    defaultValue='Whole Life'
                    className='mt-5'
                  >
                    <TabsList
                      variant='line'
                      className='bg-transparent p-0'
                    >
                      {CATEGORIES.map((cat) => (
                        <TabsTrigger
                          key={cat}
                          value={cat}
                          className='rounded-xl px-4 py-2 text-sm data-active:bg-[var(--vf-surface)]'
                        >
                          {cat}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {CATEGORIES.map((cat) => (
                      <TabsContent
                        key={cat}
                        value={cat}
                      >
                        {renderTable(cat)}
                      </TabsContent>
                    ))}
                  </Tabs>
                );
              })()}
            </Panel>
          </TabsContent>
        </Tabs>
      ) : (
        <>
          <div className='flex flex-wrap items-end justify-between gap-4'>
            <PageTitle
              title='Agency'
              description='Agency-wide production, top agents, and team leaderboards.'
              icon={<Building2 className='h-6 w-6' />}
            />
          </div>
          {overview}
        </>
      )}
    </div>
  );
}

type AdminProps = {
  metrics: { totalAP: number; totalSales: number; activeAgents: number };
  agents: AdminAgentRecord[];
  uplineOptions: { id: string; name: string }[];
  subAgencyRootOptions: { id: string; name: string }[];
  leaderboardPosts: LeaderboardPostsData;
  subAgencies: SubAgency[];
};

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

// Vertical-stretch helper — applies a 1.15× y-scale anchored at the text baseline
function stretch(y: number) {
  return `matrix(1 0 0 1.15 0 ${Math.round(y * -0.15)})`;
}

let _bebasB64: string | null = null;
async function fetchBebasNeueB64(): Promise<string> {
  if (_bebasB64) return _bebasB64;
  const buf = await fetch("/fonts/bebas-neue.woff2").then((r) => r.arrayBuffer());
  const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
  _bebasB64 = `data:font/woff2;base64,${b64}`;
  return _bebasB64;
}

// ── Leaderboard background constants ────────────────────────────────────────
// The SVGMaker design (leaderboard-bg.svg) is rendered to canvas at this size.
// All overlay coordinates below are in this same 1080x1620 space.
const LB_W = 1080; // 3% smaller than 1080
const LB_H = 1620; // 3% smaller than 1620

// Avatar circle positions — tune these if photos land off-center
const LB_AV = [
  null, // index 0 unused
  { cx: 535, cy: 840, r: 116 }, // rank 1: large gold center avatar
  { cx: 215, cy: 868, r: 96 }, // rank 2: left silver avatar
  { cx: 865, cy: 868, r: 96 }, // rank 3: right silver avatar
] as const;

// Text positions below each avatar (tune after first render)
const LB_NAME_Y = [null, 1090, 1100, 1100] as const; // agent name
const LB_TOTAL_AP_LABEL_Y = [null, 1138, 1148, 1148] as const; // "TOTAL AP" label
const LB_AP_Y = [null, 1212, 1222, 1222] as const; // AP dollar value
const LB_SALES_Y = [null, 1261, 1271, 1271] as const; // "X sales"

// Period / date overlay positions
const LB_PERIOD_Y = 546;
const LB_DATE_Y = 595;

// Footer value overlay positions
const LB_FOOTER_AP_X = 345;
const LB_FOOTER_AGENTS_X = 830;
const LB_FOOTER_VAL_Y = 1428;

const F = "'Bebas Neue', Arial, sans-serif";

function leaderboardPostSvg(
  post: LeaderboardPostCard,
  imageDataUrls: Record<number, string> = {},
  bgDataUrl?: string | null,
  fontB64?: string | null,
) {
  const fmtAp = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

  const e1 = post.entries[0];
  const e2 = post.entries[1];
  const e3 = post.entries[2];

  // clipPaths for photo avatars
  const clipPaths = ([1, 2, 3] as const)
    .filter((rank) => imageDataUrls[rank])
    .map((rank) => {
      const a = LB_AV[rank]!;
      return `<clipPath id="avClip${rank}"><circle cx="${a.cx}" cy="${a.cy}" r="${a.r}"/></clipPath>`;
    })
    .join("");

  // Photo overlay per avatar slot
  const avatarOverlay = (entry: LeaderboardPostCard["entries"][number]) => {
    const a = LB_AV[entry.rank as 1 | 2 | 3]!;
    const dataUrl = imageDataUrls[entry.rank];
    if (!dataUrl) return "";
    return `<image href="${dataUrl}" x="${a.cx - a.r}" y="${a.cy - a.r}" width="${a.r * 2}" height="${a.r * 2}"
      clip-path="url(#avClip${entry.rank})" preserveAspectRatio="xMidYMid slice"/>`;
  };

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${LB_W}" height="${LB_H}" viewBox="0 0 ${LB_W} ${LB_H}">
      <defs>
        ${fontB64 ? `<style>@font-face{font-family:'Bebas Neue';src:url('${fontB64}') format('woff2');}</style>` : ""}
        <linearGradient id="goldGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"   stop-color="#F5D060"/>
          <stop offset="45%"  stop-color="#C8921A"/>
          <stop offset="100%" stop-color="#8A6010"/>
        </linearGradient>
        ${clipPaths}
      </defs>

      <!-- Cream base so transparent areas of the background SVG show this color -->
      <rect width="${LB_W}" height="${LB_H}" fill="#F2F0EA"/>

      <!-- Profile photos drawn before background so SVG's transparent circles reveal them -->
      ${e2 ? avatarOverlay(e2) : ""}
      ${e3 ? avatarOverlay(e3) : ""}
      ${e1 ? avatarOverlay(e1) : ""}

      <!-- SVGMaker background -->
      ${
        bgDataUrl
          ? `<image href="${bgDataUrl}" x="0" y="0" width="${LB_W}" height="${LB_H}" preserveAspectRatio="none"/>`
          : `<rect width="${LB_W}" height="${LB_H}" fill="#f5f3ef"/>`
      }

      <!-- Period label (DAILY / WEEKLY / MONTHLY) -->
      <text x="540" y="${LB_PERIOD_Y}" text-anchor="middle"
        font-size="112" font-family="${F}" font-weight="900" letter-spacing="4"
        fill="url(#goldGrad)">${escapeXml(post.key.toUpperCase())}</text>

      <!-- Date range -->
      <text x="540" y="${LB_DATE_Y}" text-anchor="middle" fill="#1a1a1a"
        font-size="28" font-family="${F}" font-weight="700" letter-spacing="2">${escapeXml(post.periodLabel.toUpperCase())}</text>

      <!-- Initials fallback when no photo -->
      ${
        e1 && !imageDataUrls[1]
          ? `<text x="${LB_AV[1].cx}" y="${LB_AV[1].cy + 17}" text-anchor="middle" fill="#333"
        font-size="46" font-family="${F}" font-weight="900">${escapeXml(e1.initials)}</text>`
          : ""
      }
      ${
        e2 && !imageDataUrls[2]
          ? `<text x="${LB_AV[2].cx}" y="${LB_AV[2].cy + 13}" text-anchor="middle" fill="#333"
        font-size="34" font-family="${F}" font-weight="900">${escapeXml(e2.initials)}</text>`
          : ""
      }
      ${
        e3 && !imageDataUrls[3]
          ? `<text x="${LB_AV[3].cx}" y="${LB_AV[3].cy + 13}" text-anchor="middle" fill="#333"
        font-size="34" font-family="${F}" font-weight="900">${escapeXml(e3.initials)}</text>`
          : ""
      }

      <!-- Names below each avatar -->
      ${
        e1
          ? `<text x="${LB_AV[1].cx}" y="${LB_NAME_Y[1]}" text-anchor="middle" fill="#111111"
        font-size="58" font-family="${F}" font-weight="600">${escapeXml(e1.shortName.toUpperCase())}</text>`
          : ""
      }
      ${
        e2
          ? `<text x="${LB_AV[2].cx}" y="${LB_NAME_Y[2]}" text-anchor="middle" fill="#111111"
        font-size="49" font-family="${F}" font-weight="600">${escapeXml(e2.shortName.toUpperCase())}</text>`
          : ""
      }
      ${
        e3
          ? `<text x="${LB_AV[3].cx}" y="${LB_NAME_Y[3]}" text-anchor="middle" fill="#111111"
        font-size="51" font-family="${F}" font-weight="600">${escapeXml(e3.shortName.toUpperCase())}</text>`
          : ""
      }

      <!-- "TOTAL AP" labels -->
      ${
        e1
          ? `<text x="${LB_AV[1].cx}" y="${LB_TOTAL_AP_LABEL_Y[1]}" text-anchor="middle" fill="#555555"
        font-size="28" font-family="${F}" font-weight="600" letter-spacing="2">TOTAL AP</text>`
          : ""
      }
      ${
        e2
          ? `<text x="${LB_AV[2].cx}" y="${LB_TOTAL_AP_LABEL_Y[2]}" text-anchor="middle" fill="#555555"
        font-size="25" font-family="${F}" font-weight="600" letter-spacing="2">TOTAL AP</text>`
          : ""
      }
      ${
        e3
          ? `<text x="${LB_AV[3].cx}" y="${LB_TOTAL_AP_LABEL_Y[3]}" text-anchor="middle" fill="#555555"
        font-size="25" font-family="${F}" font-weight="600" letter-spacing="2">TOTAL AP</text>`
          : ""
      }

      <!-- AP values (gold for #1, dark for #2/#3) -->
      ${
        e1
          ? `<text x="${LB_AV[1].cx}" y="${LB_AP_Y[1]}" text-anchor="middle" fill="url(#goldGrad)"
        font-size="67" font-family="${F}" font-weight="900">${fmtAp(e1.ap)}</text>`
          : ""
      }
      ${
        e2
          ? `<text x="${LB_AV[2].cx}" y="${LB_AP_Y[2]}" text-anchor="middle" fill="#1a1a1a"
        font-size="67" font-family="${F}" font-weight="900">${fmtAp(e2.ap)}</text>`
          : ""
      }
      ${
        e3
          ? `<text x="${LB_AV[3].cx}" y="${LB_AP_Y[3]}" text-anchor="middle" fill="#1a1a1a"
        font-size="67" font-family="${F}" font-weight="900">${fmtAp(e3.ap)}</text>`
          : ""
      }

      <!-- Sales counts -->
      ${
        e1
          ? `<text x="${LB_AV[1].cx}" y="${LB_SALES_Y[1]}" text-anchor="middle" fill="#000000"
        font-size="28" font-family="${F}" font-weight="700">${e1.salesCount} ${e1.salesCount === 1 ? "sale" : "sales"}</text>`
          : ""
      }
      ${
        e2
          ? `<text x="${LB_AV[2].cx}" y="${LB_SALES_Y[2]}" text-anchor="middle" fill="#000000"
        font-size="28" font-family="${F}" font-weight="700">${e2.salesCount} ${e2.salesCount === 1 ? "sale" : "sales"}</text>`
          : ""
      }
      ${
        e3
          ? `<text x="${LB_AV[3].cx}" y="${LB_SALES_Y[3]}" text-anchor="middle" fill="#000000"
        font-size="28" font-family="${F}" font-weight="700">${e3.salesCount} ${e3.salesCount === 1 ? "sale" : "sales"}</text>`
          : ""
      }

      <!-- Footer stats -->
      <text x="${LB_FOOTER_AP_X}" y="${LB_FOOTER_VAL_Y - 50}" text-anchor="middle" fill="#555555"
        font-size="36" font-family="${F}" font-weight="700" letter-spacing="1">TEAM TOTAL AP</text>
      <text x="${LB_FOOTER_AP_X}" y="${LB_FOOTER_VAL_Y}" text-anchor="middle" fill="url(#goldGrad)"
        font-size="51" font-family="${F}" font-weight="900">${fmtAp(post.totalAp)}</text>

      <line x1="540" y1="${LB_FOOTER_VAL_Y - 90}" x2="540" y2="${LB_FOOTER_VAL_Y + 8}" stroke="rgba(0,0,0,0.15)" stroke-width="1"/>

      <text x="${LB_FOOTER_AGENTS_X}" y="${LB_FOOTER_VAL_Y - 50}" text-anchor="middle" fill="#555555"
        font-size="36" font-family="${F}" font-weight="700" letter-spacing="1">WRITING AGENTS</text>
      <text x="${LB_FOOTER_AGENTS_X}" y="${LB_FOOTER_VAL_Y}" text-anchor="middle" fill="url(#goldGrad)"
        font-size="51" font-family="${F}" font-weight="900">${post.writingAgents}</text>

      <!-- Tagline -->
      <text x="220" y="${LB_FOOTER_VAL_Y + 120}" text-anchor="middle" fill="#111111"
        font-size="33" font-family="${F}" font-weight="600" letter-spacing="2">ONE TEAM</text>
      <text x="560" y="${LB_FOOTER_VAL_Y + 120}" text-anchor="middle" fill="#111111"
        font-size="33" font-family="${F}" font-weight="600" letter-spacing="2">ONE MISSION</text>
      <text x="890" y="${LB_FOOTER_VAL_Y + 120}" text-anchor="middle" fill="#111111"
        font-size="33" font-family="${F}" font-weight="600" letter-spacing="2">ONE CHAMPION</text>
    </svg>
  `.trim();
}

// ── Background pre-rendering ─────────────────────────────────────────────────
let _bgCache: string | null | undefined; // bump to reset: v10
async function fetchBgDataUrl(): Promise<string | null> {
  if (_bgCache !== undefined) return _bgCache;
  try {
    const res = await fetch("/leaderboard-bg.svg");
    if (!res.ok) {
      _bgCache = null;
      return null;
    }
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = objectUrl;
      });
      const canvas = document.createElement("canvas");
      canvas.width = LB_W;
      canvas.height = LB_H;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        _bgCache = null;
        return null;
      }
      // Draw SVG onto transparent canvas — if the design has transparent circle
      // cutouts, those stay transparent so photos drawn beneath show through.
      ctx.drawImage(img, 0, 0, LB_W, LB_H);
      _bgCache = canvas.toDataURL("image/png");
      return _bgCache;
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  } catch {
    _bgCache = null;
    return null;
  }
}

async function fetchEntryImageDataUrls(
  entries: LeaderboardPostCard["entries"],
): Promise<Record<number, string>> {
  const result: Record<number, string> = {};
  await Promise.all(
    entries.slice(0, 3).map(async (entry) => {
      if (!entry.imageUrl) return;
      try {
        const res = await fetch(entry.imageUrl);
        if (!res.ok) return;
        const blob = await res.blob();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        result[entry.rank] = dataUrl;
      } catch {
        /* skip if image fails to load */
      }
    }),
  );
  return result;
}

async function leaderboardPostPngBlob(post: LeaderboardPostCard) {
  const [imageDataUrls, bgDataUrl, fontB64] = await Promise.all([
    fetchEntryImageDataUrls(post.entries),
    fetchBgDataUrl(),
    fetchBebasNeueB64(),
  ]);
  const svg = leaderboardPostSvg(post, imageDataUrls, bgDataUrl, fontB64);
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  try {
    const image = new Image();
    const loaded = new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Failed to load generated leaderboard image"));
    });

    image.src = url;
    await loaded;

    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth || 1080;
    canvas.height = image.naturalHeight || 1350;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is not available");
    context.drawImage(image, 0, 0);

    const pngBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!pngBlob) throw new Error("Failed to encode PNG");
    return pngBlob;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function LeaderboardPostPreview({ post }: { post: LeaderboardPostCard }) {
  const [imageDataUrls, setImageDataUrls] = useState<Record<number, string>>({});
  const [bgDataUrl, setBgDataUrl] = useState<string | null>(null);
  const [fontB64, setFontB64] = useState<string | null>(null);
  useEffect(() => {
    fetchEntryImageDataUrls(post.entries).then(setImageDataUrls);
  }, [post.entries]);

  useEffect(() => {
    fetchBgDataUrl().then(setBgDataUrl);
    fetchBebasNeueB64()
      .then(setFontB64)
      .catch(() => null);
  }, []);

  const svgString = leaderboardPostSvg(post, imageDataUrls, bgDataUrl, fontB64);
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dataUrl}
      alt='Leaderboard post preview'
      className='mx-auto w-full max-w-[480px] rounded-[28px]'
    />
  );
}

// ─── Competition create/edit modal ───────────────────────────
type CompFormState = {
  name: string;
  description: string;
  prize: string;
  startDate: string;
  endDate: string;
  status: string;
  team1Name: string;
  team1Color: string;
  team2Name: string;
  team2Color: string;
};

const BLANK_COMP: CompFormState = {
  name: "",
  description: "",
  prize: "",
  startDate: "",
  endDate: "",
  status: "draft",
  team1Name: "Team A",
  team1Color: "#e2bb52",
  team2Name: "Team B",
  team2Color: "#F15025",
};

type MemberRecord = { id: string; teamId: string; agentId: string; agentName: string };
type AgentRecord = { id: string; name: string };

function CompetitionModal({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  editing: Competition | null;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"details" | "members">("details");
  const [form, setForm] = useState<CompFormState>(BLANK_COMP);
  const [saving, setSaving] = useState(false);

  // Tracks the just-created competition during the step-2 members flow
  const [createdComp, setCreatedComp] = useState<Competition | null>(null);

  // The competition being worked on: either one passed in for editing, or the one we just created
  const effectiveComp = editing ?? createdComp;

  // Members tab state
  const [allAgents, setAllAgents] = useState<AgentRecord[]>([]);
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  // Sync form when modal opens or editing changes
  useEffect(() => {
    if (!open) {
      setCreatedComp(null);
      return;
    }
    // This modal intentionally resets to the details tab whenever it opens.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTab("details");
    if (editing) {
      setForm({
        name: editing.name,
        description: editing.description ?? "",
        prize: editing.prize ?? "",
        startDate: editing.startDate,
        endDate: editing.endDate,
        status: editing.status,
        team1Name: editing.teams[0]?.name ?? "Team A",
        team1Color: editing.teams[0]?.color ?? "#e2bb52",
        team2Name: editing.teams[1]?.name ?? "Team B",
        team2Color: editing.teams[1]?.color ?? "#F15025",
      });
    } else {
      setForm(BLANK_COMP);
    }
  }, [open, editing]);

  // Fetch agents + members when Members tab is opened
  useEffect(() => {
    if (!open || tab !== "members" || !effectiveComp) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMembersLoading(true);
    Promise.all([
      fetch("/api/agents").then((r) => r.json() as Promise<AgentRecord[]>),
      fetch(`/api/competitions/${effectiveComp.id}/members`).then((r) => r.json() as Promise<MemberRecord[]>),
    ])
      .then(([agents, mems]) => {
        setAllAgents(agents);
        setMembers(mems);
      })
      .finally(() => setMembersLoading(false));
  }, [open, tab, effectiveComp]);

  function field(key: keyof CompFormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function submitDetails(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.startDate || !form.endDate) {
      toast.error("Name, start date, and end date are required");
      return;
    }
    setSaving(true);
    try {
      let res: Response;
      if (editing) {
        res = await fetch(`/api/competitions/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            description: form.description || null,
            prize: form.prize || null,
            startDate: form.startDate,
            endDate: form.endDate,
            status: form.status,
          }),
        });
      } else {
        res = await fetch("/api/competitions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            description: form.description || null,
            prize: form.prize || null,
            startDate: form.startDate,
            endDate: form.endDate,
            teams: [
              { name: form.team1Name, color: form.team1Color },
              { name: form.team2Name, color: form.team2Color },
            ],
          }),
        });

        if (res.ok) {
          const data = (await res.json()) as { competition: Competition };
          toast.success("Competition created");
          setCreatedComp(data.competition);
          setTab("members");
          router.refresh();
        } else {
          const data = (await res.json()) as { error?: string };
          toast.error(data.error ?? "Failed");
        }
        return;
      }
      if (res.ok) {
        toast.success("Competition updated");
        onClose();
        router.refresh();
      } else {
        const data = (await res.json()) as { error?: string };
        toast.error(data.error ?? "Failed");
      }
    } finally {
      setSaving(false);
    }
  }

  async function addMember(teamId: string, agentId: string) {
    if (!effectiveComp) return;
    const res = await fetch(`/api/competitions/${effectiveComp.id}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId, agentId }),
    });
    if (res.ok) {
      // Refetch to get real id
      const updated = await fetch(`/api/competitions/${effectiveComp.id}/members`).then(
        (r) => r.json() as Promise<MemberRecord[]>,
      );
      setMembers(updated);
      router.refresh();
    } else {
      const data = (await res.json()) as { error?: string };
      toast.error(data.error ?? "Failed to add member");
    }
  }

  async function removeMember(memberId: string) {
    if (!effectiveComp) return;
    const res = await fetch(`/api/competitions/${effectiveComp.id}/members/${memberId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      router.refresh();
    } else {
      toast.error("Failed to remove member");
    }
  }

  const inputCls =
    "mt-2 w-full rounded-2xl border border-[var(--vf-surface-2)] bg-[var(--vf-surface)] px-4 py-3 text-base text-[var(--vf-text)] outline-none";
  const modalControlCls =
    "mt-2 min-h-[56px] w-full rounded-2xl border border-[var(--vf-surface-2)] bg-[var(--vf-surface)] px-4 text-base text-[var(--vf-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]";
  const tabBtnCls = (active: boolean) =>
    cn(
      "px-4 py-2 text-sm rounded-xl border",
      active
        ? "border-[var(--vf-surface-2)] bg-[var(--vf-surface)] text-[var(--vf-text)]"
        : "border-transparent text-[var(--vf-muted)] hover:text-[var(--vf-text)]",
    );

  const team1 = effectiveComp?.teams[0];
  const team2 = effectiveComp?.teams[1];
  const team1Members = members.filter((m) => m.teamId === team1?.id);
  const team2Members = members.filter((m) => m.teamId === team2?.id);
  const assignedIds = new Set(members.map((m) => m.agentId));
  const available = allAgents.filter((a) => !assignedIds.has(a.id));

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className='flex sm:max-w-2xl max-h-[85vh] flex-col overflow-hidden border-[var(--vf-border)] bg-[var(--vf-panel)] text-[var(--vf-text)]'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-semibold'>
            {editing ? "Edit competition" : "New competition"}
          </DialogTitle>
          {!editing && (
            <p className='text-sm text-[var(--vf-muted)]'>
              {tab === "details" ? "Step 1 of 2: Details" : "Step 2 of 2: Add members"}
            </p>
          )}
        </DialogHeader>

        {/* Tab bar — shown when editing (not during create flow) */}
        {editing && (
          <div className='flex gap-1 border-b border-[var(--vf-border)] pb-2'>
            <button
              className={tabBtnCls(tab === "details")}
              onClick={() => setTab("details")}
            >
              Details
            </button>
            <button
              className={tabBtnCls(tab === "members")}
              onClick={() => setTab("members")}
            >
              Members
            </button>
          </div>
        )}

        {/* ── Details tab ── */}
        {tab === "details" && (
          <form
            id='competition-form'
            onSubmit={submitDetails}
            className='mt-2 flex-1 space-y-4 overflow-y-auto pr-1'
          >
            {/* Row 1: Name + Prize */}
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className='text-sm uppercase tracking-[0.14em] text-[var(--vf-muted)]'>Name *</label>
                <input
                  className={inputCls}
                  value={form.name}
                  onChange={field("name")}
                  placeholder='July Blitz'
                  required
                />
              </div>
              <div>
                <label className='text-sm uppercase tracking-[0.14em] text-[var(--vf-muted)]'>Prize</label>
                <input
                  className={inputCls}
                  value={form.prize}
                  onChange={field("prize")}
                  placeholder='$500 cash, AirPods...'
                />
              </div>
            </div>
            {/* Row 2: Description */}
            <div>
              <label className='text-sm uppercase tracking-[0.14em] text-[var(--vf-muted)]'>
                Description
              </label>
              <textarea
                className={inputCls}
                value={form.description}
                onChange={field("description")}
                rows={2}
                placeholder='Optional details...'
              />
            </div>
            {/* Row 3: Dates + optional Status */}
            <div className={`grid gap-3 ${editing ? "grid-cols-3" : "grid-cols-2"}`}>
              <div>
                <label className='text-sm uppercase tracking-[0.14em] text-[var(--vf-muted)]'>
                  Start date *
                </label>
                <DatePicker
                  value={form.startDate}
                  onChange={(v) => setForm((f) => ({ ...f, startDate: v }))}
                  placeholder='Start date'
                  className={modalControlCls}
                  disablePast
                />
              </div>
              <div>
                <label className='text-sm uppercase tracking-[0.14em] text-[var(--vf-muted)]'>
                  End date *
                </label>
                <DatePicker
                  value={form.endDate}
                  onChange={(v) => setForm((f) => ({ ...f, endDate: v }))}
                  placeholder='End date'
                  className={modalControlCls}
                  disablePast
                />
              </div>
              {editing && (
                <div>
                  <label className='text-sm uppercase tracking-[0.14em] text-[var(--vf-muted)]'>Status</label>
                  <Select value={form.status}>
                    <SelectTrigger
                      className={cn(modalControlCls, "flex h-[56px] items-center justify-between text-left")}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <span className='capitalize'>{form.status}</span>
                    </SelectTrigger>
                    <SelectContent
                      align='start'
                      side='bottom'
                      sideOffset={8}
                      alignItemWithTrigger={false}
                      className='w-[220px] p-2'
                    >
                      <SelectItem
                        value='draft'
                        className='rounded-lg px-3 py-2.5 text-base'
                        onSelect={() => setForm((f) => ({ ...f, status: "draft" }))}
                      >
                        Draft
                      </SelectItem>
                      <SelectItem
                        value='active'
                        className='rounded-lg px-3 py-2.5 text-base'
                        onSelect={() => setForm((f) => ({ ...f, status: "active" }))}
                      >
                        Active
                      </SelectItem>
                      <SelectItem
                        value='ended'
                        className='rounded-lg px-3 py-2.5 text-base'
                        onSelect={() => setForm((f) => ({ ...f, status: "ended" }))}
                      >
                        Ended
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            {/* Row 4: Teams side by side (create only) */}
            {!editing && (
              <div className='rounded-2xl border border-[var(--vf-border)] p-4'>
                <div className='mb-3 text-sm font-medium text-[var(--vf-muted)]'>Teams</div>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='grid grid-cols-[1fr_auto] items-end gap-2'>
                    <div>
                      <label className='text-sm text-[var(--vf-muted)]'>Team 1 name</label>
                      <input
                        className={inputCls}
                        value={form.team1Name}
                        onChange={field("team1Name")}
                      />
                    </div>
                    <div>
                      <label className='text-sm text-[var(--vf-muted)]'>Color</label>
                      <input
                        type='color'
                        className='mt-2 h-[50px] w-14 cursor-pointer rounded-xl border border-[var(--vf-surface-2)] bg-[var(--vf-surface)] p-1'
                        value={form.team1Color}
                        onChange={field("team1Color")}
                      />
                    </div>
                  </div>
                  <div className='grid grid-cols-[1fr_auto] items-end gap-2'>
                    <div>
                      <label className='text-sm text-[var(--vf-muted)]'>Team 2 name</label>
                      <input
                        className={inputCls}
                        value={form.team2Name}
                        onChange={field("team2Name")}
                      />
                    </div>
                    <div>
                      <label className='text-sm text-[var(--vf-muted)]'>Color</label>
                      <input
                        type='color'
                        className='mt-2 h-[50px] w-14 cursor-pointer rounded-xl border border-[var(--vf-surface-2)] bg-[var(--vf-surface)] p-1'
                        value={form.team2Color}
                        onChange={field("team2Color")}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        )}

        {/* ── Members tab ── */}
        {tab === "members" && effectiveComp && (
          <div className='mt-2 flex-1 overflow-y-auto pr-1'>
            {membersLoading ? (
              <div className='space-y-4 py-1'>
                <div className='grid grid-cols-2 gap-3'>
                  {[0, 1].map((index) => (
                    <div
                      key={index}
                      className='rounded-2xl border border-[var(--vf-border)] p-3'
                    >
                      <div className='mb-3 flex items-center gap-2'>
                        <Skeleton className='h-2.5 w-2.5 rounded-full' />
                        <Skeleton className='h-4 w-28' />
                        <Skeleton className='ml-auto h-4 w-6' />
                      </div>
                      <div className='space-y-2'>
                        {[0, 1, 2].map((row) => (
                          <div
                            key={row}
                            className='flex items-center justify-between rounded-xl border border-[var(--vf-border)] p-3'
                          >
                            <Skeleton className='h-4 w-32' />
                            <Skeleton className='h-8 w-8 rounded-lg' />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className='rounded-2xl border border-[var(--vf-border)] p-3'>
                  <div className='mb-3 flex items-center justify-between'>
                    <Skeleton className='h-4 w-40' />
                    <Skeleton className='h-4 w-10' />
                  </div>
                  <div className='space-y-2'>
                    {[0, 1, 2, 3].map((row) => (
                      <div
                        key={row}
                        className='flex items-center justify-between rounded-xl bg-[var(--vf-surface)] px-3 py-2'
                      >
                        <Skeleton className='h-4 w-36' />
                        <div className='flex gap-2'>
                          <Skeleton className='h-7 w-20 rounded-lg' />
                          <Skeleton className='h-7 w-20 rounded-lg' />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Team columns */}
                <div className='grid grid-cols-2 gap-3'>
                  {(
                    [
                      { team: team1, teamMembers: team1Members },
                      { team: team2, teamMembers: team2Members },
                    ] as const
                  ).map(
                    ({ team, teamMembers }) =>
                      team && (
                        <div
                          key={team.id}
                          className='rounded-2xl border border-[var(--vf-border)] p-3'
                        >
                          <div className='flex items-center gap-2 mb-2'>
                            <div
                              className='h-2.5 w-2.5 rounded-full'
                              style={{ background: team.color }}
                            />
                            <div className='text-sm font-semibold text-[var(--vf-text)]'>{team.name}</div>
                            <div className='ml-auto text-xs text-[var(--vf-muted)]'>{teamMembers.length}</div>
                          </div>
                          {teamMembers.length === 0 ? (
                            <div className='rounded-xl border border-dashed border-[var(--vf-border)] py-3 text-center text-xs text-[var(--vf-muted)]'>
                              No members
                            </div>
                          ) : (
                            <div className='space-y-1'>
                              {teamMembers.map((m) => (
                                <div
                                  key={m.id}
                                  className='flex items-center justify-between rounded-xl bg-[var(--vf-surface)] px-3 py-2'
                                >
                                  <span className='text-sm text-[var(--vf-text)]'>{m.agentName}</span>
                                  <button
                                    onClick={() => removeMember(m.id)}
                                    className='ml-2 text-[var(--vf-muted)] hover:text-red-400'
                                    title='Remove'
                                  >
                                    <Trash2 className='h-3.5 w-3.5' />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ),
                  )}
                </div>

                {/* Available agents */}
                <div className='mt-4'>
                  <div className='mb-2 text-sm font-medium text-[var(--vf-muted)]'>
                    Available agents{available.length > 0 ? ` (${available.length})` : " (all assigned)"}
                  </div>
                  {available.length === 0 ? (
                    <div className='rounded-2xl border border-dashed border-[var(--vf-border)] py-5 text-center text-sm text-[var(--vf-muted)]'>
                      All agents assigned
                    </div>
                  ) : (
                    <div className='space-y-1.5 rounded-2xl border border-[var(--vf-border)] p-2'>
                      {available.map((agent) => (
                        <div
                          key={agent.id}
                          className='flex items-center justify-between rounded-xl bg-[var(--vf-surface)] px-3 py-2'
                        >
                          <span className='text-sm text-[var(--vf-text)]'>{agent.name}</span>
                          <div className='flex gap-1.5'>
                            {team1 && (
                              <button
                                onClick={() => addMember(team1.id, agent.id)}
                                className='flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium'
                                style={{ background: team1.color + "22", color: team1.color }}
                              >
                                <Plus className='h-3 w-3' />
                                {team1.name}
                              </button>
                            )}
                            {team2 && (
                              <button
                                onClick={() => addMember(team2.id, agent.id)}
                                className='flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium'
                                style={{ background: team2.color + "22", color: team2.color }}
                              >
                                <Plus className='h-3 w-3' />
                                {team2.name}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Sticky footer ── */}
        <div className='mt-4 flex justify-end gap-3 border-t border-[var(--vf-border)] pt-4'>
          {tab === "members" ? (
            // Step 2 (create) or Members tab (edit) — just a Done button
            <button
              type='button'
              onClick={onClose}
              className='rounded-2xl bg-[var(--vf-accent)] px-6 py-3 text-sm font-semibold text-[var(--vf-accent-fg)]'
            >
              Done
            </button>
          ) : (
            <>
              <button
                type='button'
                onClick={onClose}
                className='rounded-2xl border border-[var(--vf-border)] px-5 py-3 text-sm text-[var(--vf-muted)]'
              >
                Cancel
              </button>
              <button
                type='submit'
                form='competition-form'
                disabled={saving}
                className='rounded-2xl bg-[var(--vf-accent)] px-6 py-3 text-sm font-semibold text-[var(--vf-accent-fg)] disabled:opacity-50'
              >
                {saving ? "Saving..." : editing ? "Save changes" : "Continue →"}
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function UplineSelect({
  agentId,
  uplineId,
  uplineName,
  uplineOptions,
  disabled,
  onChange,
  triggerClassName,
}: {
  agentId: string;
  uplineId: string | null;
  uplineName: string | null;
  uplineOptions: { id: string; name: string }[];
  disabled: boolean;
  onChange: (value: string | null) => void;
  triggerClassName?: string;
}) {
  const [search, setSearch] = useState("");
  const filtered = uplineOptions
    .filter((o) => o.id !== agentId)
    .filter((o) => o.name.toLowerCase().includes(search.toLowerCase()));
  const adminControlCls =
    "h-[52px] w-[220px] rounded-xl border-[var(--vf-surface-2)] bg-[var(--vf-surface)] px-4 text-[var(--vf-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]";

  return (
    <Select
      value={uplineId ?? "unassigned"}
      onValueChange={(v) => {
        setSearch("");
        onChange(v === "unassigned" ? null : v);
      }}
      disabled={disabled}
    >
      <SelectTrigger className={cn(adminControlCls, triggerClassName)}>
        <span>
          {uplineId ? (uplineOptions.find((o) => o.id === uplineId)?.name ?? uplineName) : "Unassigned"}
        </span>
      </SelectTrigger>
      <SelectContent
        className='w-(--anchor-width) overflow-hidden rounded-2xl border border-[var(--vf-border)] bg-[var(--vf-panel)] p-2 text-[var(--vf-text)]'
        align='start'
        side='bottom'
        sideOffset={8}
      >
        <div className='border-b border-[var(--vf-border)] bg-[var(--vf-panel)] pb-2'>
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder='Search agents...'
            className='h-11 w-full rounded-xl border border-[var(--vf-surface-2)] bg-[var(--vf-surface)] px-3 text-sm text-[var(--vf-text)] outline-none placeholder:text-[var(--vf-muted)]'
          />
        </div>
        <div className='max-h-[280px] overflow-y-auto overscroll-contain pt-2'>
          <SelectItem
            value='unassigned'
            className='rounded-lg px-3 py-2.5 text-sm'
          >
            Unassigned
          </SelectItem>
          {filtered.map((option) => (
            <SelectItem
              key={option.id}
              value={option.id}
              className='rounded-lg px-3 py-2.5 text-sm'
            >
              {option.name}
            </SelectItem>
          ))}
          {filtered.length === 0 && (
            <div className='px-3 py-3 text-sm text-[var(--vf-muted)]'>No agents found</div>
          )}
        </div>
      </SelectContent>
    </Select>
  );
}

// ─── Admin page ───────────────────────────────────────────────
export function AdminPage({
  metrics,
  agents,
  uplineOptions,
  subAgencyRootOptions,
  leaderboardPosts,
  subAgencies: initialSubAgencies,
}: AdminProps) {
  const router = useRouter();
  const [tab, setTab] = useState<"management" | "leaderboardPosts" | "subAgencies">("management");
  const adminTabStorageKey = "paradigm-admin-tab";
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteList, setInviteList] = useState("agent1@paradigmfinancial.com\nagent2@paradigmfinancial.com");
  const [inviting, setInviting] = useState(false);
  const [savingAgentId, setSavingAgentId] = useState<string | null>(null);
  const [deleteAgentPending, setDeleteAgentPending] = useState<{
    id: string;
    name: string;
    restoreEditAgent?: AdminAgentRecord;
  } | null>(null);
  const [deletingAgentId, setDeletingAgentId] = useState<string | null>(null);
  const [editAgent, setEditAgent] = useState<AdminAgentRecord | null>(null);
  const [editAgentName, setEditAgentName] = useState("");
  const [editAgentRole, setEditAgentRole] = useState<"admin" | "agent">("agent");
  const [editAgentCompPercentage, setEditAgentCompPercentage] = useState("");
  const [editAgentUplineId, setEditAgentUplineId] = useState<string | null>(null);
  const [agentFilter, setAgentFilter] = useState<"All" | "New" | "Unassigned">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState<AdminSortConfig | null>(null);
  const pageSize = 10;

  const [subAgencies, setSubAgencies] = useState<SubAgency[]>(initialSubAgencies);
  const [saName, setSaName] = useState("");
  const [saRootId, setSaRootId] = useState("");
  const [saLogoFile, setSaLogoFile] = useState<File | null>(null);
  const [saSearch, setSaSearch] = useState("");
  const [savingSa, setSavingSa] = useState(false);
  const [deletingSaId, setDeletingSaId] = useState<string | null>(null);
  const [createSaOpen, setCreateSaOpen] = useState(false);
  const [expandedSaId, setExpandedSaId] = useState<string | null>(null);
  const [deleteSaPending, setDeleteSaPending] = useState<SubAgency | null>(null);
  const [editSa, setEditSa] = useState<SubAgency | null>(null);
  const [editSaName, setEditSaName] = useState("");
  const [editSaLogoFile, setEditSaLogoFile] = useState<File | null>(null);
  const [savingEditSa, setSavingEditSa] = useState(false);
  const modalFieldCls =
    "min-h-[56px] w-full rounded-2xl border border-[var(--vf-surface-2)] bg-[var(--vf-surface)] px-4 text-base text-[var(--vf-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]";

  const sidebarItems: { label: string; key: "management" | "leaderboardPosts" | "subAgencies" }[] = [
    { label: "Management", key: "management" },
    { label: "Sub-agencies", key: "subAgencies" },
    { label: "Leaderboard Posts", key: "leaderboardPosts" },
  ];

  useEffect(() => {
    const saved = window.localStorage.getItem(adminTabStorageKey);
    if (saved === "management" || saved === "subAgencies" || saved === "leaderboardPosts") {
      setTab(saved);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(adminTabStorageKey, tab);
  }, [adminTabStorageKey, tab]);

  async function downloadLeaderboardPost(post: LeaderboardPostCard) {
    try {
      const blob = await leaderboardPostPngBlob(post);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `paradigm-${post.key}-leaderboard.png`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Leaderboard post downloaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to download leaderboard post");
    }
  }

  async function copyLeaderboardPost(post: LeaderboardPostCard) {
    try {
      if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
        toast.error("Image copy is not supported in this browser");
        return;
      }
      const blob = await leaderboardPostPngBlob(post);
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      toast.success("Leaderboard post copied");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to copy leaderboard post");
    }
  }

  async function createSubAgency(e: React.FormEvent) {
    e.preventDefault();
    if (!saName.trim() || !saRootId) return;
    setSavingSa(true);
    try {
      const res = await fetch("/api/sub-agencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: saName.trim(), root_agent_id: saRootId }),
      });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !data.id) {
        toast.error(data.error ?? "Failed to create sub-agency");
        return;
      }
      const newId = data.id;
      let logoUrl: string | null = null;
      if (saLogoFile) {
        const fd = new FormData();
        fd.append("file", saLogoFile);
        const logoRes = await fetch(`/api/sub-agencies/${newId}/logo`, { method: "POST", body: fd });
        const logoData = (await logoRes.json()) as { logoUrl?: string };
        logoUrl = logoData.logoUrl ?? null;
      }
      const rootAgentName = uplineOptions.find((a) => a.id === saRootId)?.name ?? "";
      setSubAgencies((prev) => [...prev, { id: newId, name: saName.trim(), logoUrl, rootAgentId: saRootId }]);
      setSaName("");
      setSaRootId("");
      setSaLogoFile(null);
      setCreateSaOpen(false);
      toast.success(`${saName.trim()} created`);
      void rootAgentName;
    } finally {
      setSavingSa(false);
    }
  }

  async function deleteSubAgency(id: string) {
    setDeletingSaId(id);
    try {
      const res = await fetch(`/api/sub-agencies/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        toast.error(data.error ?? "Failed to delete sub-agency");
        return;
      }
      setSubAgencies((prev) => prev.filter((sa) => sa.id !== id));
      toast.success("Sub-agency deleted");
    } finally {
      setDeletingSaId(null);
    }
  }

  async function updateSubAgency(e: React.FormEvent) {
    e.preventDefault();
    if (!editSa || !editSaName.trim()) return;

    const nameChanged = editSaName.trim() !== editSa.name;
    const hasNewLogo = !!editSaLogoFile;

    if (!nameChanged && !hasNewLogo) {
      setEditSa(null);
      return;
    }

    setSavingEditSa(true);
    try {
      const patch: Record<string, unknown> = {};
      let updatedLogoUrl = editSa.logoUrl;

      if (nameChanged) patch.name = editSaName.trim();

      if (hasNewLogo) {
        const fd = new FormData();
        fd.append("file", editSaLogoFile!);
        const logoRes = await fetch(`/api/sub-agencies/${editSa.id}/logo`, { method: "POST", body: fd });
        const logoData = (await logoRes.json()) as { logoUrl?: string; error?: string };
        if (!logoRes.ok) {
          toast.error(logoData.error ?? "Failed to upload logo");
          return;
        }
        updatedLogoUrl = logoData.logoUrl ?? updatedLogoUrl;
        patch.logo_url = updatedLogoUrl;
      }

      const res = await fetch(`/api/sub-agencies/${editSa.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Failed to update sub-agency");
        return;
      }

      setSubAgencies((prev) =>
        prev.map((sa) =>
          sa.id === editSa.id ? { ...sa, name: editSaName.trim(), logoUrl: updatedLogoUrl } : sa,
        ),
      );
      setEditSa(null);
      setEditSaLogoFile(null);
      toast.success("Sub-agency updated");
    } finally {
      setSavingEditSa(false);
    }
  }

  async function deleteAgent(id: string) {
    setDeletingAgentId(id);
    try {
      const res = await fetch("/api/agents", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(result.error ?? "Failed to delete agent");
        return;
      }
      toast.success("Agent deleted");
      router.refresh();
    } finally {
      setDeletingAgentId(null);
    }
  }

  function parseInviteList(raw: string) {
    const emails = raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (emails.length === 0) {
      return { error: "Add at least one email to the list" as string | null, emails: [] as string[] };
    }

    const invalid = emails.find((value) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
    if (invalid) {
      return { error: `Invalid email in upload list: ${invalid}`, emails: [] as string[] };
    }

    return { error: null, emails };
  }

  async function inviteSingleUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = inviteEmail.trim().toLowerCase();
    if (!email) {
      toast.error("Enter an email address");
      return;
    }

    setInviting(true);
    try {
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = (await response.json()) as {
        ok?: boolean;
        created?: string[];
        alreadyApproved?: string[];
        alreadyActive?: string[];
        error?: string;
      };

      if (!response.ok) {
        toast.error(result.error ?? "Failed to create user");
        return;
      }

      if ((result.created?.length ?? 0) > 0) {
        toast.success("User approved for Google sign-in");
      } else if ((result.alreadyActive?.length ?? 0) > 0) {
        toast.success("That user already has dashboard access");
      } else {
        toast.success("That email is already approved and waiting for first sign-in");
      }

      setInviteEmail("");
      setInviteModalOpen(false);
    } finally {
      setInviting(false);
    }
  }

  async function inviteUserList(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = parseInviteList(inviteList);
    if (parsed.error) {
      toast.error(parsed.error);
      return;
    }

    setInviting(true);
    try {
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: parsed.emails }),
      });

      const result = (await response.json()) as {
        ok?: boolean;
        created?: string[];
        alreadyApproved?: string[];
        alreadyActive?: string[];
        totalRequested?: number;
        error?: string;
      };

      if (!response.ok) {
        toast.error(result.error ?? "Failed to upload users");
        return;
      }

      toast.success(
        [
          result.created?.length ? `${result.created.length} added` : null,
          result.alreadyApproved?.length ? `${result.alreadyApproved.length} already approved` : null,
          result.alreadyActive?.length ? `${result.alreadyActive.length} already active` : null,
        ]
          .filter(Boolean)
          .join(" · ") || "Invite list processed",
      );

      setInviteModalOpen(false);
    } finally {
      setInviting(false);
    }
  }

  async function updateAgent(
    agentId: string,
    payload: { name?: string; role?: "admin" | "agent"; uplineId?: string | null; compPercentage?: number },
  ) {
    setSavingAgentId(agentId);
    try {
      const response = await fetch("/api/agents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: agentId, ...payload }),
      });

      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        toast.error(result.error ?? "Failed to update agent");
        return false;
      }

      toast.success("Agent updated");
      router.refresh();
      return true;
    } finally {
      setSavingAgentId(null);
    }
  }

  function openEditAgent(agent: AdminAgentRecord) {
    setEditAgent(agent);
    setEditAgentName(agent.name);
    setEditAgentRole(agent.role === "admin" ? "admin" : "agent");
    setEditAgentCompPercentage(String(agent.compPercentage));
    setEditAgentUplineId(agent.uplineId);
  }

  function closeEditAgent() {
    setEditAgent(null);
    setEditAgentName("");
    setEditAgentRole("agent");
    setEditAgentCompPercentage("");
    setEditAgentUplineId(null);
  }

  function closeDeleteAgentPending() {
    if (deleteAgentPending?.restoreEditAgent) {
      openEditAgent(deleteAgentPending.restoreEditAgent);
    }
    setDeleteAgentPending(null);
  }

  async function submitEditAgent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editAgent) return;

    const trimmedName = editAgentName.trim();
    if (!trimmedName) {
      toast.error("Agent name is required");
      return;
    }

    const nextCompPercentage = Number(editAgentCompPercentage);
    if (!Number.isFinite(nextCompPercentage) || nextCompPercentage < 0 || nextCompPercentage > 200) {
      toast.error("Comp must be a number between 0 and 200");
      return;
    }

    const payload: { name?: string; role?: "admin" | "agent"; uplineId?: string | null; compPercentage?: number } = {};

    if (trimmedName !== editAgent.name) payload.name = trimmedName;
    if (editAgentRole !== editAgent.role) payload.role = editAgentRole;
    if (nextCompPercentage !== editAgent.compPercentage) payload.compPercentage = nextCompPercentage;
    if (editAgentUplineId !== editAgent.uplineId) payload.uplineId = editAgentUplineId;

    if (Object.keys(payload).length === 0) {
      closeEditAgent();
      return;
    }

    const updated = await updateAgent(editAgent.id, payload);
    if (updated) closeEditAgent();
  }

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredAgents = agents.filter((agent) => {
    if (agentFilter === "New" && !agent.isNew) return false;
    if (agentFilter === "Unassigned" && agent.uplineId) return false;
    if (!normalizedSearch) return true;

    return (
      agent.name.toLowerCase().includes(normalizedSearch) ||
      agent.email.toLowerCase().includes(normalizedSearch)
    );
  });
  const sortedAgents = [...filteredAgents].sort((a, b) => {
    if (!sort) return 0;
    const left =
      sort.key === "lifetimeAP"
        ? parseFormattedNumber(a.lifetimeAP)
        : sort.key === "lifetimeSales"
          ? parseFormattedNumber(a.lifetimeSales)
          : a.compPercentage;
    const right =
      sort.key === "lifetimeAP"
        ? parseFormattedNumber(b.lifetimeAP)
        : sort.key === "lifetimeSales"
          ? parseFormattedNumber(b.lifetimeSales)
          : b.compPercentage;
    const result = left - right;
    return sort.direction === "asc" ? result : -result;
  });

  const totalPages = Math.max(1, Math.ceil(sortedAgents.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedAgents = sortedAgents.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);
  const startRow = sortedAgents.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endRow = filteredAgents.length === 0 ? 0 : startRow + paginatedAgents.length - 1;

  function toggleSort(key: AdminSortKey) {
    setSort((current) => {
      if (current?.key === key) {
        return { key, direction: current.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "desc" };
    });
    setCurrentPage(1);
  }

  function AdminSortIcon({ columnKey }: { columnKey: AdminSortKey }) {
    if (sort?.key !== columnKey) {
      return <ArrowUpDown className='h-3.5 w-3.5 text-[var(--vf-muted)]' />;
    }
    return sort.direction === "asc" ? (
      <ArrowUp className='h-3.5 w-3.5 text-[var(--vf-accent)]' />
    ) : (
      <ArrowDown className='h-3.5 w-3.5 text-[var(--vf-accent)]' />
    );
  }

  return (
    <div className='space-y-8'>
      <PageTitle
        title='Admin controls'
        description='Manage agents, sub-agencies, and leaderboard posts for your organization.'
        icon={<Shield className='h-6 w-6' />}
      />
      <div className='grid gap-4 md:grid-cols-3'>
        <MetricCard
          title='Total AP'
          value={fmt(metrics.totalAP)}
          helper='Lifetime AP across all agents'
        />
        <MetricCard
          title='Total sales'
          value={String(metrics.totalSales)}
          helper='Lifetime policies submitted'
        />
        <MetricCard
          title='Active agents'
          value={String(metrics.activeAgents)}
          helper='With at least one sale'
        />
      </div>

      <div className='space-y-5'>
        <div className='flex gap-1 border-b border-[var(--vf-border)]'>
          {sidebarItems.map(({ label, key }) => (
            <button
              key={label}
              onClick={() => {
                if (key) setTab(key);
              }}
              className={cn(
                "px-4 py-2.5 text-sm font-medium transition-colors",
                key === tab
                  ? "border-b-2 border-[var(--vf-accent)] text-[var(--vf-text)]"
                  : "text-[var(--vf-muted)] hover:text-[var(--vf-text)]",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className='space-y-5'>
          {tab === "management" && (
            <>
              <Panel className='p-5'>
                <div className='flex flex-wrap items-center justify-between gap-3'>
                  <div>
                    <div className='text-3xl font-semibold text-[var(--vf-text)]'>Agents</div>
                    <div className='mt-2 text-base text-[var(--vf-muted)]'>
                      {filteredAgents.length} matching agents
                    </div>
                  </div>
                  <div className='flex flex-wrap items-center gap-2'>
                    {(["All", "New", "Unassigned"] as const).map((label) => (
                      <button
                        key={label}
                        onClick={() => {
                          setAgentFilter(label);
                          setCurrentPage(1);
                        }}
                        className={cn(
                          "rounded-xl px-4 py-2 text-sm transition-colors",
                          agentFilter === label
                            ? "bg-[rgba(255,255,255,0.12)] text-white"
                            : "text-[var(--vf-muted)] hover:bg-[rgba(255,255,255,0.07)] hover:text-[var(--vf-text)]",
                        )}
                      >
                        {label}
                      </button>
                    ))}
                    <input
                      type='search'
                      value={searchQuery}
                      onChange={(event) => {
                        setSearchQuery(event.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder='Search name or email'
                      className='rounded-2xl border border-[var(--vf-surface-2)] bg-[var(--vf-surface)] px-4 py-2 text-[var(--vf-text)] outline-none placeholder:text-[var(--vf-muted)]'
                    />
                  </div>
                </div>

                <div className='mt-5 overflow-x-auto rounded-[22px] border border-[var(--vf-border)]'>
                  <table className='w-full min-w-[980px] text-left'>
                    <thead className='bg-[var(--vf-surface)] text-sm text-[var(--vf-muted)]'>
                      <tr>
                        <th className='px-4 py-4 font-medium'>Agent</th>
                        <th className='px-4 py-4 font-medium'>
                          <button
                            onClick={() => toggleSort("lifetimeAP")}
                            className='flex cursor-pointer items-center gap-1.5 transition hover:text-[var(--vf-text)]'
                          >
                            <span>Lifetime AP</span>
                            <AdminSortIcon columnKey='lifetimeAP' />
                          </button>
                        </th>
                        <th className='px-4 py-4 font-medium'>
                          <button
                            onClick={() => toggleSort("lifetimeSales")}
                            className='flex cursor-pointer items-center gap-1.5 transition hover:text-[var(--vf-text)]'
                          >
                            <span>Sales</span>
                            <AdminSortIcon columnKey='lifetimeSales' />
                          </button>
                        </th>
                        <th className='px-4 py-4 font-medium'>
                          <button
                            onClick={() => toggleSort("compPercentage")}
                            className='flex cursor-pointer items-center gap-1.5 transition hover:text-[var(--vf-text)]'
                          >
                            <span>Comp</span>
                            <AdminSortIcon columnKey='compPercentage' />
                          </button>
                        </th>
                        <th className='px-4 py-4 font-medium'>Role</th>
                        <th className='px-4 py-4 font-medium'>Upline</th>
                        <th className='px-4 py-4 font-medium' />
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedAgents.map((agent) => (
                        <tr
                          key={agent.id}
                          className='border-t border-[var(--vf-border)] text-sm'
                        >
                          <td className='px-4 py-3'>
                            <div className='flex items-center gap-3 min-w-0'>
                              <Avatar
                                name={agent.name}
                                imageUrl={agent.imageUrl}
                                small
                              />
                              <div className='min-w-0 flex-1'>
                                <div className='flex flex-wrap items-center gap-1.5 font-medium text-[var(--vf-text)]'>
                                  {agent.name}
                                  {(() => {
                                    const isDev = agent.id === "ab3e26d9-b1c0-482f-a408-06a9205ee854";
                                    const isAdmin = agent.role === "admin";
                                    if (isDev)
                                      return (
                                        <span className='rounded-full bg-[rgba(88,101,242,0.15)] border border-[rgba(88,101,242,0.3)] px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-[#5865F2]'>
                                          Dev
                                        </span>
                                      );
                                    if (isAdmin)
                                      return (
                                        <span className='rounded-full bg-[#5865F2] px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-white'>
                                          Admin
                                        </span>
                                      );
                                    if (agent.isNew)
                                      return (
                                        <span className='rounded-full bg-[#3f9e50] px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-white'>
                                          New
                                        </span>
                                      );
                                    return null;
                                  })()}
                                </div>
                                <div className='mt-0.5 truncate text-sm text-[var(--vf-muted)]'>
                                  {agent.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className='px-4 py-3 text-[var(--vf-text)]'>{agent.lifetimeAP}</td>
                          <td className='px-4 py-3 text-[var(--vf-text)]'>{agent.lifetimeSales}</td>
                          <td className='px-4 py-3 text-[var(--vf-text)]'>{agent.compPercentage}%</td>
                          <td className='px-4 py-3 text-[var(--vf-text)]'>
                            {agent.role === "admin" ? "Admin" : "Agent"}
                          </td>
                          <td className='px-4 py-3 text-[var(--vf-text)]'>
                            <div className='max-w-[220px] truncate'>
                              {agent.uplineName || <span className='text-[var(--vf-muted)]'>Unassigned</span>}
                            </div>
                          </td>
                          <td className='px-4 py-3 text-right'>
                            <button
                              onClick={() => openEditAgent(agent)}
                              className='inline-flex items-center gap-2 rounded-xl border border-[var(--vf-border)] bg-[var(--vf-surface)] px-3 py-2 text-sm font-medium text-[var(--vf-text)] transition hover:bg-[var(--vf-surface-2)]'
                            >
                              <Pencil className='h-4 w-4' />
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                      {paginatedAgents.length === 0 && (
                        <tr>
                          <td
                            colSpan={7}
                            className='px-4 py-10 text-center text-sm text-[var(--vf-muted)]'
                          >
                            No agents found for this filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className='mt-4 flex items-center justify-between text-[var(--vf-muted)]'>
                  <div>
                    Showing {startRow}–{endRow} of {filteredAgents.length}
                  </div>
                  <div className='flex items-center gap-3'>
                    <button
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      disabled={safeCurrentPage === 1}
                      className='rounded-xl border border-[var(--vf-border)] px-3 py-2 disabled:opacity-50'
                    >
                      Prev
                    </button>
                    <span>
                      {safeCurrentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      disabled={safeCurrentPage === totalPages}
                      className='rounded-xl border border-[var(--vf-border)] px-3 py-2 disabled:opacity-50'
                    >
                      Next
                    </button>
                  </div>
                </div>
              </Panel>
            </>
          )}

          {tab === "leaderboardPosts" && (
            <div className='space-y-5'>
              {leaderboardPosts.cards.map((post) => (
                <div
                  key={post.key}
                  className='py-2'
                >
                  <div className='flex flex-wrap items-start justify-between gap-4'>
                    <div className='flex items-center gap-3'>
                      <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--vf-surface)] text-[var(--vf-accent)]'>
                        <ImageIcon className='h-5 w-5' />
                      </div>
                      <div>
                        <h2 className='text-3xl font-semibold text-[var(--vf-text)]'>{post.title}</h2>
                        <p className='mt-1 text-sm text-[var(--vf-muted)]'>
                          {post.periodLabel} · {post.shareLabel}
                        </p>
                      </div>
                    </div>

                    <div className='flex flex-wrap items-center gap-2'>
                      <button
                        onClick={() => void copyLeaderboardPost(post)}
                        disabled={!post.ready}
                        className='inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-[var(--vf-border)] bg-[var(--vf-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--vf-text)] disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        <Copy className='h-4 w-4' />
                        Copy image
                      </button>
                      <button
                        onClick={() => void downloadLeaderboardPost(post)}
                        disabled={!post.ready}
                        className='inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-[var(--vf-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--vf-accent-fg)] disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        <Download className='h-4 w-4' />
                        Download PNG
                      </button>
                    </div>
                  </div>

                  <div className='mt-6'>
                    {post.ready ? (
                      <LeaderboardPostPreview post={post} />
                    ) : (
                      <div className='rounded-[28px] border border-dashed border-[var(--vf-border)] bg-[var(--vf-surface)] px-6 py-10 text-center text-[var(--vf-muted)]'>
                        {post.emptyMessage}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "subAgencies" && (
            <Panel className='p-6'>
              <div className='flex items-start justify-between gap-4'>
                <div>
                  <h2 className='text-2xl font-semibold text-[var(--vf-text)]'>Sub-agencies</h2>
                  <p className='mt-1 text-sm text-[var(--vf-muted)]'>
                    Recognize a branch as its own sub-agency. They'll appear on the team leaderboard with
                    their name and optional logo.
                  </p>
                </div>
                <button
                  onClick={() => setCreateSaOpen(true)}
                  className='shrink-0 rounded-2xl bg-[var(--vf-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--vf-accent-fg)]'
                >
                  + Add sub-agency
                </button>
              </div>

              {subAgencies.length === 0 ? (
                <div className='mt-8 flex flex-col items-center justify-center py-10 text-center'>
                  <div className='text-sm text-[var(--vf-muted)]'>No sub-agencies yet</div>
                  <div className='mt-1 text-xs text-[var(--vf-muted)] opacity-60'>
                    Click "Add sub-agency" to recognize a branch.
                  </div>
                </div>
              ) : (
                (() => {
                  const childrenByUpline = new Map<string, AdminAgentRecord[]>();
                  for (const a of agents) {
                    if (!a.uplineId) continue;
                    if (!childrenByUpline.has(a.uplineId)) childrenByUpline.set(a.uplineId, []);
                    childrenByUpline.get(a.uplineId)!.push(a);
                  }
                  function subtreeAgents(rootId: string): AdminAgentRecord[] {
                    const result: AdminAgentRecord[] = [];
                    const queue = [rootId];
                    while (queue.length) {
                      const id = queue.shift()!;
                      for (const child of childrenByUpline.get(id) ?? []) {
                        result.push(child);
                        queue.push(child.id);
                      }
                    }
                    return result;
                  }
                  return (
                    <div className='mt-5 divide-y divide-[var(--vf-border)] rounded-2xl border border-[var(--vf-border)]'>
                      {subAgencies.map((sa) => {
                        const rootName =
                          uplineOptions.find((a) => a.id === sa.rootAgentId)?.name ?? "Unknown agent";
                        const members = subtreeAgents(sa.rootAgentId);
                        const isExpanded = expandedSaId === sa.id;
                        return (
                          <div key={sa.id}>
                            <div
                              className='flex cursor-pointer items-center gap-4 px-4 py-3 hover:bg-[rgba(255,255,255,0.02)]'
                              onClick={() => setExpandedSaId(isExpanded ? null : sa.id)}
                            >
                              {sa.logoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={sa.logoUrl}
                                  alt={sa.name}
                                  className='h-9 w-9 shrink-0 rounded-full object-cover'
                                />
                              ) : (
                                <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(88,101,242,0.2)] text-xs font-semibold text-white'>
                                  {initials(sa.name)}
                                </div>
                              )}
                              <div className='min-w-0 flex-1'>
                                <div className='truncate text-sm font-semibold text-[var(--vf-text)]'>
                                  {sa.name}
                                </div>
                                <div className='text-xs text-[var(--vf-muted)]'>
                                  {rootName}&apos;s Team · {members.length} agent
                                  {members.length !== 1 ? "s" : ""}
                                </div>
                              </div>
                              <ChevronDown
                                className={cn(
                                  "h-4 w-4 shrink-0 text-[var(--vf-muted)] transition-transform",
                                  isExpanded && "rotate-180",
                                )}
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditSa(sa);
                                  setEditSaName(sa.name);
                                  setEditSaLogoFile(null);
                                }}
                                className='shrink-0 rounded-xl border border-[var(--vf-border)] px-3 py-1.5 text-xs text-[var(--vf-muted)] hover:border-[var(--vf-accent)]/40 hover:text-[var(--vf-text)]'
                              >
                                Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteSaPending(sa);
                                }}
                                disabled={deletingSaId === sa.id}
                                className='shrink-0 rounded-xl border border-[var(--vf-border)] px-3 py-1.5 text-xs text-[var(--vf-muted)] hover:border-red-500/40 hover:text-red-400 disabled:opacity-50'
                              >
                                {deletingSaId === sa.id ? "Deleting…" : "Delete"}
                              </button>
                            </div>
                            {isExpanded &&
                              (() => {
                                type TreeNode = {
                                  agent: AdminAgentRecord;
                                  depth: number;
                                  hasChildren: boolean;
                                };
                                const treeNodes: TreeNode[] = [];
                                function traverseSa(id: string, depth: number) {
                                  const children = childrenByUpline.get(id) ?? [];
                                  for (const child of children) {
                                    const hasKids = (childrenByUpline.get(child.id)?.length ?? 0) > 0;
                                    treeNodes.push({ agent: child, depth, hasChildren: hasKids });
                                    traverseSa(child.id, depth + 1);
                                  }
                                }
                                traverseSa(sa.rootAgentId, 0);
                                return (
                                  <div className='border-t border-[var(--vf-border)] bg-[rgba(255,255,255,0.02)] py-2'>
                                    {treeNodes.length === 0 ? (
                                      <p className='px-4 py-2 text-xs text-[var(--vf-muted)]'>
                                        No agents under this root yet.
                                      </p>
                                    ) : (
                                      treeNodes.map(({ agent: m, depth, hasChildren: hasKids }) => (
                                        <div
                                          key={m.id}
                                          className='flex items-center px-4 py-1.5 text-sm'
                                        >
                                          <div
                                            className='flex items-center shrink-0'
                                            style={{ paddingLeft: depth * 24 }}
                                          >
                                            {depth > 0 && (
                                              <div className='mr-1.5 flex h-8 flex-col items-center'>
                                                <div className='w-px flex-1 bg-[var(--vf-border)]' />
                                                <div className='h-px w-3 bg-[var(--vf-border)]' />
                                              </div>
                                            )}
                                            <div
                                              className={cn(
                                                "mr-1.5 h-5 w-5 shrink-0",
                                                !hasKids && depth === 0 && "invisible",
                                              )}
                                            />
                                          </div>
                                          <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgba(88,101,242,0.15)] text-[10px] font-semibold text-white'>
                                            {initials(m.name)}
                                          </div>
                                          <span className='ml-2.5 flex-1 truncate font-medium text-[var(--vf-text)]'>
                                            {m.name}
                                          </span>
                                          <span className='shrink-0 text-xs text-[var(--vf-muted)]'>
                                            {m.compPercentage}%
                                          </span>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                );
                              })()}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()
              )}
            </Panel>
          )}

          <Dialog
            open={createSaOpen}
            onOpenChange={(o) => {
              if (!o) {
                setCreateSaOpen(false);
                setSaName("");
                setSaRootId("");
                setSaLogoFile(null);
                setSaSearch("");
              }
            }}
          >
            <DialogContent className='flex max-w-md max-h-[85vh] flex-col overflow-hidden border-[var(--vf-border)] bg-[var(--vf-panel)] text-[var(--vf-text)]'>
              <DialogHeader>
                <DialogTitle className='text-2xl font-semibold'>Add sub-agency</DialogTitle>
              </DialogHeader>
              <form
                id='create-sa-form'
                onSubmit={(e) => void createSubAgency(e)}
                className='mt-2 flex-1 space-y-5 overflow-y-auto pr-1'
              >
                <div>
                  <label className='text-sm uppercase tracking-[0.14em] text-[var(--vf-muted)]'>Name</label>
                  <input
                    className='mt-2 w-full rounded-2xl border border-[var(--vf-surface-2)] bg-[var(--vf-surface)] px-4 py-3 text-sm text-[var(--vf-text)] outline-none'
                    placeholder='e.g. Paradigm Financial JR.'
                    value={saName}
                    onChange={(e) => setSaName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className='flex items-baseline gap-2 text-sm uppercase tracking-[0.14em] text-[var(--vf-muted)]'>
                    Root agent
                    <span className='normal-case text-xs tracking-normal font-normal'>
                      only agents with at least 1 downline
                    </span>
                  </label>
                  <Select
                    value={saRootId || "none"}
                    onValueChange={(v) => {
                      setSaSearch("");
                      setSaRootId(v === "none" ? "" : (v ?? ""));
                    }}
                  >
                    <SelectTrigger className='mt-2 w-full rounded-2xl border border-[var(--vf-surface-2)] bg-[var(--vf-surface)] px-4 py-3 text-sm text-[var(--vf-text)] outline-none data-[size=default]:h-auto'>
                      <span className={saRootId ? "text-[var(--vf-text)]" : "text-[var(--vf-muted)]"}>
                        {saRootId
                          ? (subAgencyRootOptions.find((a) => a.id === saRootId)?.name ?? "Select an agent…")
                          : "Select an agent…"}
                      </span>
                    </SelectTrigger>
                    <SelectContent
                      className='w-[280px] max-h-[300px] p-2'
                      align='start'
                    >
                      <div className='pb-2'>
                        <input
                          autoFocus
                          value={saSearch}
                          onChange={(e) => setSaSearch(e.target.value)}
                          onKeyDown={(e) => e.stopPropagation()}
                          placeholder='Search agents...'
                          className='w-full rounded-lg bg-[rgba(255,255,255,0.07)] px-3 py-2 text-sm text-[var(--vf-text)] outline-none placeholder:text-[var(--vf-muted)]'
                        />
                      </div>
                      {subAgencyRootOptions
                        .filter((a) => !subAgencies.some((sa) => sa.rootAgentId === a.id))
                        .filter((a) => a.name.toLowerCase().includes(saSearch.toLowerCase()))
                        .map((a) => (
                          <SelectItem
                            key={a.id}
                            value={a.id}
                            className='rounded-lg px-3 py-2.5 text-sm'
                          >
                            {a.name}
                          </SelectItem>
                        ))}
                      {subAgencyRootOptions.filter(
                        (a) =>
                          !subAgencies.some((sa) => sa.rootAgentId === a.id) &&
                          a.name.toLowerCase().includes(saSearch.toLowerCase()),
                      ).length === 0 && (
                        <div className='px-3 py-3 text-sm text-[var(--vf-muted)]'>No agents found</div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className='text-sm uppercase tracking-[0.14em] text-[var(--vf-muted)]'>
                    Logo <span className='normal-case'>(optional)</span>
                  </label>
                  <input
                    type='file'
                    accept='image/jpeg,image/png,image/webp,image/gif'
                    className='mt-2 w-full cursor-pointer rounded-2xl border border-[var(--vf-surface-2)] bg-[var(--vf-surface)] px-4 py-3 text-sm text-[var(--vf-muted)] file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[var(--vf-accent)] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-[var(--vf-accent-fg)]'
                    onChange={(e) => setSaLogoFile(e.target.files?.[0] ?? null)}
                  />
                  <p className='mt-1 text-xs text-[var(--vf-muted)]'>JPG, PNG, WEBP, or GIF up to 5 MB</p>
                </div>
              </form>
              <div className='mt-4 flex justify-end gap-3 border-t border-[var(--vf-border)] pt-4'>
                <button
                  type='button'
                  onClick={() => {
                    setCreateSaOpen(false);
                    setSaName("");
                    setSaRootId("");
                    setSaLogoFile(null);
                    setSaSearch("");
                  }}
                  className='rounded-2xl border border-[var(--vf-border)] px-5 py-3 text-sm text-[var(--vf-muted)]'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  form='create-sa-form'
                  disabled={savingSa || !saName.trim() || !saRootId}
                  className='rounded-2xl bg-[var(--vf-accent)] px-6 py-3 text-sm font-semibold text-[var(--vf-accent-fg)] disabled:opacity-50'
                >
                  {savingSa ? "Creating…" : "Create"}
                </button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={!!editSa}
            onOpenChange={(o) => {
              if (!o) {
                setEditSa(null);
                setEditSaLogoFile(null);
              }
            }}
          >
            <DialogContent className='flex max-w-md max-h-[85vh] flex-col overflow-hidden border-[var(--vf-border)] bg-[var(--vf-panel)] text-[var(--vf-text)]'>
              <DialogHeader>
                <DialogTitle className='text-2xl font-semibold'>Edit sub-agency</DialogTitle>
              </DialogHeader>
              <form
                id='edit-sa-form'
                onSubmit={(e) => void updateSubAgency(e)}
                className='mt-2 flex-1 space-y-5 overflow-y-auto pr-1'
              >
                <div>
                  <label className='text-sm uppercase tracking-[0.14em] text-[var(--vf-muted)]'>Name</label>
                  <input
                    className='mt-2 w-full rounded-2xl border border-[var(--vf-surface-2)] bg-[var(--vf-surface)] px-4 py-3 text-sm text-[var(--vf-text)] outline-none'
                    value={editSaName}
                    onChange={(e) => setEditSaName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className='text-sm uppercase tracking-[0.14em] text-[var(--vf-muted)]'>
                    Logo <span className='normal-case'>(optional)</span>
                  </label>
                  {editSa?.logoUrl && !editSaLogoFile && (
                    <div className='mt-2 flex items-center gap-3'>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={editSa.logoUrl}
                        alt={editSa.name}
                        className='h-10 w-10 rounded-full object-cover'
                      />
                      <span className='text-xs text-[var(--vf-muted)]'>
                        Current logo. Upload a new file to replace.
                      </span>
                    </div>
                  )}
                  <input
                    type='file'
                    accept='image/jpeg,image/png,image/webp,image/gif'
                    className='mt-2 w-full cursor-pointer rounded-2xl border border-[var(--vf-surface-2)] bg-[var(--vf-surface)] px-4 py-3 text-sm text-[var(--vf-muted)] file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[var(--vf-accent)] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-[var(--vf-accent-fg)]'
                    onChange={(e) => setEditSaLogoFile(e.target.files?.[0] ?? null)}
                  />
                  <p className='mt-1 text-xs text-[var(--vf-muted)]'>JPG, PNG, WEBP, or GIF up to 5 MB</p>
                </div>
              </form>
              <div className='mt-4 flex justify-end gap-3 border-t border-[var(--vf-border)] pt-4'>
                <button
                  type='button'
                  onClick={() => {
                    setEditSa(null);
                    setEditSaLogoFile(null);
                  }}
                  className='rounded-2xl border border-[var(--vf-border)] px-5 py-3 text-sm text-[var(--vf-muted)]'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  form='edit-sa-form'
                  disabled={savingEditSa || !editSaName.trim()}
                  className='rounded-2xl bg-[var(--vf-accent)] px-6 py-3 text-sm font-semibold text-[var(--vf-accent-fg)] disabled:opacity-50'
                >
                  {savingEditSa ? "Saving…" : "Save"}
                </button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={!!deleteSaPending}
            onOpenChange={(o) => {
              if (!o) setDeleteSaPending(null);
            }}
          >
            <DialogContent className='max-w-sm border-[var(--vf-border)] bg-[var(--vf-panel)] text-[var(--vf-text)]'>
              <DialogHeader>
                <DialogTitle className='text-xl font-semibold'>Delete sub-agency</DialogTitle>
              </DialogHeader>
              <p className='text-sm text-[var(--vf-muted)]'>
                Are you sure you want to delete{" "}
                <span className='font-medium text-[var(--vf-text)]'>"{deleteSaPending?.name}"</span>? This
                only removes the sub-agency label. Agents and their data are unaffected.
              </p>
              <div className='mt-2 flex justify-end gap-3'>
                <button
                  onClick={() => setDeleteSaPending(null)}
                  className='rounded-xl border border-[var(--vf-border)] bg-[var(--vf-surface)] px-4 py-2 text-sm font-medium text-[var(--vf-text)]'
                >
                  Cancel
                </button>
                <button
                  disabled={!!deletingSaId}
                  onClick={() => {
                    if (deleteSaPending) {
                      void deleteSubAgency(deleteSaPending.id);
                      setDeleteSaPending(null);
                    }
                  }}
                  className='rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50'
                >
                  Delete
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog
        open={!!editAgent}
        onOpenChange={(open) => {
          if (!open) closeEditAgent();
        }}
      >
        <DialogContent className='max-h-[85vh] overflow-y-auto border-[var(--vf-border)] bg-[var(--vf-panel)] text-[var(--vf-text)] sm:max-w-2xl'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-2xl font-semibold'>
              <Pencil className='h-5 w-5 text-[var(--vf-accent)]' />
              Edit agent
            </DialogTitle>
            <DialogDescription className='text-[var(--vf-muted)]'>
              Update this agent&apos;s name, comp, access level, and upline from one place.
            </DialogDescription>
          </DialogHeader>

          {editAgent && (
            <form
              className='mt-4 space-y-5'
              onSubmit={submitEditAgent}
            >
              <div className='grid gap-5 sm:grid-cols-2'>
                <div className='sm:col-span-2'>
                  <label className='mb-2 block text-sm text-[var(--vf-muted)]'>Agent name</label>
                  <input
                    type='text'
                    value={editAgentName}
                    onChange={(event) => setEditAgentName(event.target.value)}
                    disabled={savingAgentId === editAgent.id}
                    className={cn(
                      modalFieldCls,
                      "outline-none transition focus:border-[var(--vf-accent)] disabled:opacity-60",
                    )}
                  />
                </div>
                <div>
                  <label className='mb-2 block text-sm text-[var(--vf-muted)]'>Comp percentage</label>
                  <div className='relative'>
                    <input
                      type='number'
                      min={0}
                      max={200}
                      step='5'
                      value={editAgentCompPercentage}
                      onChange={(event) => setEditAgentCompPercentage(event.target.value)}
                      disabled={savingAgentId === editAgent.id}
                      className={cn(
                        modalFieldCls,
                        "pr-10 outline-none transition focus:border-[var(--vf-accent)] disabled:opacity-60",
                      )}
                    />
                    <span className='pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--vf-muted)]'>
                      %
                    </span>
                  </div>
                </div>
                <div>
                  <label className='mb-2 block text-sm text-[var(--vf-muted)]'>Role</label>
                  <Select
                    value={editAgentRole}
                    onValueChange={(value) => setEditAgentRole(value as "admin" | "agent")}
                    disabled={savingAgentId === editAgent.id}
                  >
                    <SelectTrigger
                      className={cn(
                        modalFieldCls,
                        "data-[size=default]:h-auto",
                      )}
                    >
                      <span>{editAgentRole === "admin" ? "Admin" : "Agent"}</span>
                    </SelectTrigger>
                    <SelectContent
                      align='start'
                      side='bottom'
                      sideOffset={8}
                      alignItemWithTrigger={false}
                      className='w-[var(--radix-popper-anchor-width)] p-2'
                    >
                      <SelectItem
                        value='admin'
                        className='rounded-lg px-3 py-2.5 text-base'
                      >
                        Admin
                      </SelectItem>
                      <SelectItem
                        value='agent'
                        className='rounded-lg px-3 py-2.5 text-base'
                      >
                        Agent
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='sm:col-span-2'>
                  <label className='mb-2 block text-sm text-[var(--vf-muted)]'>Upline</label>
                  <UplineSelect
                    agentId={editAgent.id}
                    uplineId={editAgentUplineId}
                    uplineName={uplineOptions.find((option) => option.id === editAgentUplineId)?.name ?? ""}
                    uplineOptions={uplineOptions}
                    disabled={savingAgentId === editAgent.id}
                    onChange={(value) => setEditAgentUplineId(value)}
                    triggerClassName='min-h-[56px] w-full rounded-2xl data-[size=default]:h-auto'
                  />
                </div>
              </div>

              <div className='flex flex-wrap items-center justify-between gap-3 border-t border-[var(--vf-border)] pt-5'>
                <button
                  type='button'
                  onClick={() => {
                    setDeleteAgentPending({
                      id: editAgent.id,
                      name: editAgent.name,
                      restoreEditAgent: editAgent,
                    });
                    closeEditAgent();
                  }}
                  disabled={deletingAgentId === editAgent.id || savingAgentId === editAgent.id}
                  className='rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 transition hover:bg-red-500/20 disabled:opacity-60'
                >
                  Delete agent
                </button>
                <div className='flex items-center gap-3'>
                  <button
                    type='button'
                    onClick={closeEditAgent}
                    className='rounded-xl border border-[var(--vf-border)] bg-[var(--vf-surface)] px-4 py-2 text-sm font-medium text-[var(--vf-text)] hover:bg-[var(--vf-surface-2)]'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    disabled={savingAgentId === editAgent.id}
                    className='rounded-xl bg-[var(--vf-accent)] px-4 py-2 text-sm font-semibold text-[var(--vf-accent-fg)] disabled:opacity-60'
                  >
                    {savingAgentId === editAgent.id ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteAgentPending}
        onOpenChange={(open) => {
          if (!open) closeDeleteAgentPending();
        }}
      >
        <DialogContent className='max-w-sm border-[var(--vf-border)] bg-[var(--vf-panel)] text-[var(--vf-text)]'>
          <DialogHeader>
            <DialogTitle className='text-xl font-semibold'>Delete agent</DialogTitle>
          </DialogHeader>
          <p className='text-sm text-[var(--vf-muted)]'>
            Are you sure you want to delete{" "}
            <span className='font-medium text-[var(--vf-text)]'>&quot;{deleteAgentPending?.name}&quot;</span>? This will
            permanently remove them and all associated data. This cannot be undone.
          </p>
          <p className='mt-2 text-xs text-[var(--vf-muted)]'>
            This is a confirmation step for the delete action from the edit modal.
          </p>
          <div className='mt-2 flex justify-end gap-3'>
            <button
              onClick={closeDeleteAgentPending}
              className='rounded-xl border border-[var(--vf-border)] bg-[var(--vf-surface)] px-4 py-2 text-sm font-medium text-[var(--vf-text)] hover:bg-[var(--vf-surface-2)]'
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (deleteAgentPending) {
                  void deleteAgent(deleteAgentPending.id);
                  setDeleteAgentPending(null);
                }
              }}
              className='rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700'
            >
              Delete
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
      >
        <DialogContent className='max-h-[85vh] overflow-y-auto border-[var(--vf-border)] bg-[var(--vf-panel)] text-[var(--vf-text)] sm:max-w-2xl'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-2xl font-semibold'>
              <Plus className='h-5 w-5 text-[var(--vf-accent)]' />
              Create new user
            </DialogTitle>
          </DialogHeader>
          <p className='text-sm text-[var(--vf-muted)]'>
            Allow a new email to sign in with Google. The user won&apos;t appear in your dashboard lists until
            they complete their first successful sign-in.
          </p>

          <div className='mt-6 grid gap-6'>
            <form
              className='space-y-4'
              onSubmit={inviteSingleUser}
            >
              <div className='text-lg font-medium text-[var(--vf-text)]'>Single user</div>
              <div>
                <label className='mb-2 block text-sm text-[var(--vf-muted)]'>Email address</label>
                <input
                  type='email'
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  placeholder='newagent@paradigmfinancial.com'
                  className='w-full rounded-2xl border border-[var(--vf-surface-2)] bg-[var(--vf-surface)] px-4 py-3 text-base text-[var(--vf-text)] outline-none transition focus:border-[var(--vf-accent)]'
                />
              </div>
              <button
                type='submit'
                disabled={inviting}
                className='rounded-2xl bg-[var(--vf-accent)] px-5 py-3 font-semibold text-[var(--vf-accent-fg)] disabled:opacity-60'
              >
                {inviting ? "Saving..." : "Allow sign-in"}
              </button>
            </form>

            <div className='border-t border-[var(--vf-border)] pt-6'>
              <form
                className='space-y-4'
                onSubmit={inviteUserList}
              >
                <div className='text-lg font-medium text-[var(--vf-text)]'>Bulk upload users</div>
                <p className='text-sm text-[var(--vf-muted)]'>
                  Paste one email per line. The example is already loaded below.
                </p>
                <div>
                  <label className='mb-2 block text-sm text-[var(--vf-muted)]'>Email list</label>
                  <textarea
                    value={inviteList}
                    onChange={(event) => setInviteList(event.target.value)}
                    spellCheck={false}
                    rows={8}
                    className='w-full rounded-2xl border border-[var(--vf-surface-2)] bg-[var(--vf-surface)] px-4 py-3 font-mono text-sm text-[var(--vf-text)] outline-none transition focus:border-[var(--vf-accent)]'
                  />
                </div>
                <button
                  type='submit'
                  disabled={inviting}
                  className='rounded-2xl bg-[var(--vf-accent)] px-5 py-3 font-semibold text-[var(--vf-accent-fg)] disabled:opacity-60'
                >
                  {inviting ? "Uploading..." : "Allow sign-in for list"}
                </button>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function ProfilePage({
  profile,
}: {
  profile: {
    name: string;
    email: string;
    phone: string | null;
    image?: string | null;
    discord: {
      userId: string | null;
      username: string | null;
      displayName: string | null;
      avatarUrl: string | null;
      connectedAt: string | null;
    };
  };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [nameValue, setNameValue] = useState(profile.name);
  const [nameFocused, setNameFocused] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [emailValue, setEmailValue] = useState(profile.email);
  const [emailFocused, setEmailFocused] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);

  const carriers = [
    [
      "Americo",
      [
        ["WL", "125"],
        ["Term", "115"],
        ["IUL", "115"],
      ],
    ],
    [
      "Mutual of Omaha",
      [
        ["WL", "115"],
        ["Term", "125"],
        ["Graded", "50"],
        ["IUL", "105"],
      ],
    ],
    ["Aetna", [["WL", "130"]]],
    ["American Amicable", [["WL", "115"]]],
    [
      "Corebridge",
      [
        ["WL", "122"],
        ["Graded / Guaranteed", "75"],
      ],
    ],
    [
      "Ethos",
      [
        ["WL", "110"],
        ["Term", "113"],
      ],
    ],
    [
      "Transamerica",
      [
        ["WL", "130"],
        ["Term", "100"],
      ],
    ],
    ["Royal Neighbors", [["WL", "110"]]],
    ["NLG", [["WL", "110"]]],
    ["F&G", [["WL", "110"]]],
    ["Chubb", [["WL", "88"]]],
    [
      "Instabrain",
      [
        ["Level default", "70"],
        ["Guaranteed default", "70"],
      ],
    ],
    ["Other", [["WL", "70"]]],
  ] as const;

  useEffect(() => {
    const status = searchParams.get("discord");
    if (!status) return;

    if (status === "connected") {
      toast.success("Discord connected successfully");
    } else if (status === "disconnected") {
      toast.success("Discord disconnected");
    } else if (status === "cancelled") {
      toast.error("Discord connection was cancelled");
    } else if (status === "error_taken") {
      toast.error("That Discord account is already linked to another user");
    } else if (status === "error_config") {
      toast.error("Discord is not configured yet");
    } else {
      toast.error("We couldn't finish connecting Discord");
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete("discord");
    router.replace(params.size ? `${pathname}?${params.toString()}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const discordLabel = profile.discord.displayName || profile.discord.username || "Discord not connected";
  const discordHandle = profile.discord.username ? `@${profile.discord.username}` : null;
  const connectedDate = profile.discord.connectedAt ? profile.discord.connectedAt.slice(0, 10) : null;

  return (
    <div className='space-y-8'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <PageTitle
          title='Profile'
          description='Manage your agent card, display name, and account details.'
          icon={<UserCircle2 className='h-6 w-6' />}
        />
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className='shrink-0 rounded-xl border border-[var(--vf-border)] bg-[var(--vf-surface)] px-4 py-2 text-sm text-[var(--vf-text)]'
        >
          Sign out
        </button>
      </div>

      <Panel className='p-6'>
        <h2 className='text-3xl font-semibold text-[var(--vf-text)]'>Agent card</h2>
        <p className='mt-2 text-base text-[var(--vf-muted)]'>
          Shown next to your name on the Welcome board and leaderboards.
        </p>
        <div className='mt-5 flex flex-wrap items-center gap-5'>
          {profile.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.image}
              alt={profile.name}
              className='h-14 w-14 rounded-full object-cover'
            />
          ) : (
            <Avatar name={profile.name} />
          )}
          <input
            ref={fileInputRef}
            type='file'
            accept='image/jpeg,image/png,image/webp,image/gif'
            className='hidden'
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;

              const formData = new FormData();
              formData.append("file", file);

              setUploadingPhoto(true);
              try {
                const response = await fetch("/api/profile/photo", {
                  method: "POST",
                  body: formData,
                });

                const result = (await response.json()) as { error?: string };
                if (!response.ok) {
                  toast.error(result.error ?? "Failed to upload profile photo");
                  return;
                }

                toast.success("Profile photo updated");
                router.refresh();
              } finally {
                setUploadingPhoto(false);
                event.target.value = "";
              }
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingPhoto}
            className='rounded-2xl bg-[var(--vf-accent)] px-4 py-3 text-sm font-semibold text-[var(--vf-accent-fg)] disabled:opacity-60'
          >
            {uploadingPhoto ? "Uploading..." : "Change profile photo"}
          </button>
        </div>
        <p className='mt-3 text-sm text-[var(--vf-muted)]'>
          JPG, PNG, WEBP, or GIF up to 5 MB. Used on the agent leaderboard.
        </p>

        <div className='mt-8 grid gap-6 md:grid-cols-2'>
          <div>
            <div className='text-sm uppercase tracking-[0.16em] text-[var(--vf-muted)]'>Name</div>
            <div className='relative mt-2'>
              <input
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onFocus={() => setNameFocused(true)}
                onKeyDown={async (e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                  if (e.key === "Escape") {
                    setNameValue(profile.name);
                    setNameFocused(false);
                    e.currentTarget.blur();
                  }
                }}
                onBlur={async () => {
                  setNameFocused(false);
                  const trimmed = nameValue.trim();
                  if (!trimmed || trimmed === profile.name) {
                    setNameValue(profile.name);
                    return;
                  }
                  setSavingName(true);
                  try {
                    const res = await fetch("/api/profile", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name: trimmed }),
                    });
                    if (res.ok) {
                      toast.success("Name updated");
                      router.refresh();
                    } else {
                      toast.error("Failed to update name");
                      setNameValue(profile.name);
                    }
                  } finally {
                    setSavingName(false);
                  }
                }}
                disabled={savingName}
                className={cn(
                  "w-full bg-transparent py-1 pl-0 pr-16 text-xl text-[var(--vf-text)] outline-none transition-all duration-150",
                  nameFocused
                    ? "rounded-xl border border-[var(--vf-accent)] bg-[var(--vf-surface)] pl-3"
                    : "border-b border-[var(--vf-border)]",
                )}
              />
              <Pencil
                className={cn(
                  "pointer-events-none absolute top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--vf-muted)] transition-all duration-150",
                  nameFocused ? "right-10 opacity-0" : "right-2 opacity-60",
                )}
              />
              <div
                className={cn(
                  "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 flex items-center rounded border px-1.5 py-0.5 transition-all duration-150",
                  nameFocused
                    ? "border-[var(--vf-border)] bg-[var(--vf-surface-2)] opacity-100 translate-x-0"
                    : "opacity-0 translate-x-1",
                )}
              >
                <span className='text-[10px] font-medium text-[var(--vf-muted)]'>enter</span>
              </div>
            </div>
          </div>
          <div>
            <div className='text-sm uppercase tracking-[0.16em] text-[var(--vf-muted)]'>Email</div>
            <div className='relative mt-2'>
              <input
                type='email'
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                  if (e.key === "Escape") {
                    setEmailValue(profile.email);
                    setEmailFocused(false);
                    e.currentTarget.blur();
                  }
                }}
                onBlur={async () => {
                  setEmailFocused(false);
                  const trimmed = emailValue.trim();
                  if (!trimmed || trimmed === profile.email) {
                    setEmailValue(profile.email);
                    return;
                  }
                  setSavingEmail(true);
                  try {
                    const res = await fetch("/api/profile", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email: trimmed }),
                    });
                    if (res.ok) {
                      toast.success("Email updated");
                      router.refresh();
                    } else {
                      toast.error("Failed to update email");
                      setEmailValue(profile.email);
                    }
                  } finally {
                    setSavingEmail(false);
                  }
                }}
                disabled={savingEmail}
                className={cn(
                  "w-full bg-transparent py-1 pl-0 pr-16 text-xl text-[var(--vf-text)] outline-none transition-all duration-150",
                  emailFocused
                    ? "rounded-xl border border-[var(--vf-accent)] bg-[var(--vf-surface)] pl-3"
                    : "border-b border-[var(--vf-border)]",
                )}
              />
              <Pencil
                className={cn(
                  "pointer-events-none absolute top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--vf-muted)] transition-all duration-150",
                  emailFocused ? "right-10 opacity-0" : "right-2 opacity-60",
                )}
              />
              <div
                className={cn(
                  "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 flex items-center rounded border px-1.5 py-0.5 transition-all duration-150",
                  emailFocused
                    ? "border-[var(--vf-border)] bg-[var(--vf-surface-2)] opacity-100 translate-x-0"
                    : "opacity-0 translate-x-1",
                )}
              >
                <span className='text-[10px] font-medium text-[var(--vf-muted)]'>enter</span>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <Panel className='overflow-hidden p-0'>
        <div className='border-b border-[var(--vf-border)] bg-[linear-gradient(135deg,rgba(88,101,242,0.16),rgba(241,80,37,0.08))] px-5 py-5 sm:px-6 sm:py-6'>
          <div className='flex items-start gap-4'>
            <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#5865F2] text-white shadow-[0_12px_24px_rgba(88,101,242,0.25)] sm:h-14 sm:w-14'>
              <DiscordIcon className='h-6 w-6 sm:h-7 sm:w-7' />
            </div>
            <div className='min-w-0'>
              <div className='flex flex-wrap items-center gap-2'>
                <h2 className='text-xl font-semibold text-[var(--vf-text)] sm:text-3xl'>Connect Discord</h2>
                <span
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]",
                    profile.discord.userId
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-[var(--vf-border)] bg-[var(--vf-surface)] text-[var(--vf-muted)]",
                  )}
                >
                  {profile.discord.userId ? (
                    <ShieldCheck className='h-3.5 w-3.5' />
                  ) : (
                    <Link2 className='h-3.5 w-3.5' />
                  )}
                  {profile.discord.userId ? "Connected" : "Not connected"}
                </span>
              </div>
              <p className='mt-2 text-sm text-[var(--vf-muted)] sm:text-base'>
                Your Discord account is your identity on this platform. Sales data, rankings, and activity are
                all tied to it.
              </p>
            </div>
          </div>
        </div>

        <div className='px-4 py-4 sm:px-6 sm:py-6'>
          <div className='rounded-[24px] border border-[var(--vf-border)] bg-[var(--vf-surface)] p-4 sm:p-5'>
            <div className='text-sm uppercase tracking-[0.16em] text-[var(--vf-muted)]'>Linked account</div>
            <div className='mt-4 flex items-center gap-4'>
              {profile.discord.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.discord.avatarUrl}
                  alt={discordLabel}
                  className='h-14 w-14 rounded-2xl object-cover ring-1 ring-[var(--vf-border)]'
                />
              ) : (
                <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5865F2] text-white'>
                  <DiscordIcon className='h-7 w-7' />
                </div>
              )}
              <div className='min-w-0'>
                <div className='truncate text-2xl font-semibold text-[var(--vf-text)]'>{discordLabel}</div>
                <div className='mt-1 truncate text-sm text-[var(--vf-muted)]'>
                  {discordHandle ?? "No Discord account linked yet"}
                </div>
              </div>
            </div>

            <div className='mt-5 grid gap-4 sm:grid-cols-2'>
              <div className='rounded-2xl border border-[var(--vf-border)] bg-[var(--vf-panel)] px-4 py-4'>
                <div className='text-xs uppercase tracking-[0.14em] text-[var(--vf-muted)]'>Discord ID</div>
                <div className='mt-2 break-all text-sm text-[var(--vf-text)]'>
                  {profile.discord.userId ?? "Waiting for connection"}
                </div>
              </div>
              <div className='rounded-2xl border border-[var(--vf-border)] bg-[var(--vf-panel)] px-4 py-4'>
                <div className='text-xs uppercase tracking-[0.14em] text-[var(--vf-muted)]'>Connected on</div>
                <div className='mt-2 text-sm text-[var(--vf-text)]'>
                  {connectedDate ?? "Not connected yet"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}
