"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { signOut } from "next-auth/react";
import {
  ArrowLeft,
  Building2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Copy,
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
  Shield,
  ShieldCheck,
  Star,
  Swords,
  Trash2,
  Trophy,
  UserCircle2,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

import { cn } from "@/lib/utils";
import type {
  AdminAgentRecord,
  CompGuideRecord,
  LeaderboardPostCard,
  LeaderboardPostsData,
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

const navItems = [
  { label: "Welcome", href: "/dashboard", icon: Home },
  { label: "Goals", href: "/dashboard/goals", icon: Gauge },
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

function Avatar({ name, small = false, ring = false }: { name: string; small?: boolean; ring?: boolean }) {
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
  const labelSize = size <= 130 ? "text-3xl" : "text-5xl";
  const clamp = Math.max(0, Math.min(100, value));
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
      <div className='absolute inset-[14px] flex flex-col items-center justify-center rounded-full bg-[var(--vf-surface)]'>
        <div className={`${labelSize} font-semibold text-[var(--vf-accent)]`}>{label}</div>
        <div className='mt-1 text-xs text-[var(--vf-muted)]'>{sublabel}</div>
      </div>
    </div>
  );
}

const timeRangeOptions: { value: TimeRange; label: string }[] = [
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
            <p className='mt-1 text-xs text-[var(--vf-muted)] opacity-60'>Submit a sale to appear on the leaderboard</p>
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
              <Avatar
                name={entry.name}
                small
                ring={entry.rank <= 3}
              />
              <div className='min-w-0 flex-1'>
                <div className='truncate text-sm font-semibold text-white sm:text-base'>
                  {entry.name}
                  {entry.badge ? (
                    <span className='ml-1.5 text-xs font-normal text-[var(--vf-muted)]'>
                      {entry.badge}
                    </span>
                  ) : null}
                </div>
                <div className='mt-0.5 text-xs text-[var(--vf-muted)]'>
                  {entry.subtitle}
                </div>
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
  emphasis = false,
}: {
  title: string;
  value: string;
  helper: string;
  delta?: string;
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
      {delta ? (
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
  const [value, setValue] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, target: Number(value) }),
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
      <div className='mt-3 flex flex-wrap gap-4'>
        <div className='flex w-full max-w-xs items-center rounded-2xl border border-[var(--vf-surface-2)] bg-[var(--vf-surface)] px-4 py-3 text-lg text-[var(--vf-text)]'>
          <span className='mr-3 text-[var(--vf-muted)]'>$</span>
          <input
            className='w-full bg-transparent outline-none'
            type='number'
            min={0}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <button
          onClick={save}
          disabled={saving}
          className='rounded-2xl bg-[var(--vf-accent)] px-6 py-3 text-lg font-semibold text-[var(--vf-accent-fg)] disabled:opacity-50'
        >
          {saving ? "Saving..." : "Save goal"}
        </button>
      </div>
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

  const adminBadge = isAdmin ? (
    <div className='absolute -bottom-1 -right-1 inline-flex translate-x-[calc(1/3*100%+0.5rem)] translate-y-1/3 items-center gap-0.5 rounded-full border border-[rgba(88,101,242,0.4)] bg-[#5865F2] px-1.5 py-0.5 text-[6px] font-semibold uppercase tracking-[0.16em] text-white shadow-[0_2px_8px_rgba(88,101,242,0.4)]'>
      <Shield className='h-2 w-2' />
      Admin
    </div>
  ) : null;

  const brand = !logoBroken ? (
    <div className='relative inline-flex'>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src='/Paradigm Financial Logo-21.png'
        alt='Paradigm Financial logo'
        className='h-12 w-auto max-w-[135px] object-contain sm:max-w-[165px]'
        onError={() => setLogoBroken(true)}
      />
      {adminBadge}
    </div>
  ) : (
    <div className='relative inline-flex'>
      <div className='text-[1.05rem] font-semibold uppercase tracking-[0.38em] text-[var(--vf-text)]'>
        Paradigm Financial
      </div>
      {adminBadge}
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
            {brand}
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
            className='flex items-center gap-3'
          >
            {brand}
          </Link>
          <NavLinks
            pathname={pathname}
            teamUnlocked={teamUnlocked}
            isAdmin={isAdmin}
            onNavigate={() => setMenuOpen(false)}
          />
          <div className='mt-auto space-y-4 pt-8'>
            <button className='flex items-center gap-2 text-sm text-[var(--vf-text)]'>
              <CircleHelp className='h-4 w-4 text-[var(--vf-blurple)]' />
              Guide
            </button>
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
          <button className='flex items-center gap-2 text-sm text-[var(--vf-text)]'>
            <CircleHelp className='h-4 w-4 text-[var(--vf-blurple)]' />
            Guide
          </button>
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

type WelcomeProps = {
  agentName: string;
  latestSale: { agentName: string; initials: string; carrier: string; ap: number } | null;
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
  const [logSaleOpen, setLogSaleOpen] = useState(false);
  const router = useRouter();
  return (
    <div className='space-y-8'>
      <LogSaleModal
        open={logSaleOpen}
        onClose={() => setLogSaleOpen(false)}
      />
      {latestSale && (
        <div className='flex flex-wrap items-center gap-3 rounded-[22px] border border-[var(--vf-accent)] bg-[var(--vf-accent)] px-4 py-3 text-[var(--vf-accent-fg)] sm:gap-4 sm:px-5 sm:py-4'>
          <div className='shrink-0 text-xs font-semibold uppercase tracking-[0.2em]'>Latest Sale</div>
          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(0,0,0,0.2)] text-sm font-semibold text-[var(--vf-accent-fg)] sm:h-10 sm:w-10'>
            {latestSale.initials}
          </div>
          <p className='min-w-0 text-sm font-medium sm:text-xl'>
            {latestSale.agentName} just wrote {fmt(latestSale.ap)} with {latestSale.carrier}. Keep it going!
          </p>
        </div>
      )}

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
        <button
          onClick={() => setLogSaleOpen(true)}
          className='flex items-center gap-2 rounded-2xl bg-[var(--vf-accent)] px-5 py-3 text-base font-semibold text-[var(--vf-accent-fg)] shadow-[0_0_24px_rgba(241,80,37,0.4)] transition hover:shadow-[0_0_32px_rgba(241,80,37,0.55)]'
        >
          <Plus className='h-4 w-4' />
          Log sale
        </button>
      </div>

      <div className='grid gap-5 xl:grid-cols-2'>
        <Panel className='relative min-h-[260px] overflow-hidden p-6'>
          <div className='absolute inset-0 bg-[linear-gradient(135deg,rgba(241,80,37,0.07),transparent_60%)] pointer-events-none' />
          <div className='text-5xl font-bold text-[var(--vf-blurple)] opacity-80'>&ldquo;</div>
          <div className='mt-8 max-w-md text-xl font-medium leading-snug text-[var(--vf-text)] sm:text-[2rem]'>
            Treat today like the day that changes everything, and one day it will.
          </div>
          <div className='mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--vf-muted)]'>
            Daily motivation
          </div>
          <button className='mt-4 rounded-xl bg-[var(--vf-blurple)] px-4 py-2 text-sm font-semibold text-white shadow-[0_0_16px_var(--vf-blurple-dim)] transition hover:opacity-90'>
            Hype me up
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
                  <div className='text-sm uppercase tracking-[0.2em] text-[var(--vf-muted)]'>
                    Sales production
                  </div>
                  <div className='mt-3 flex items-center gap-4'>
                    <ProgressRing
                      value={salesGoal.pct}
                      label={`${salesGoal.pct}%`}
                      sublabel={`of ${fmt(salesGoal.target)}`}
                      size={126}
                    />
                    <div>
                      <div className='text-4xl font-semibold text-[var(--vf-text)]'>{fmt(salesGoal.ap)}</div>
                      <div className='mt-1 text-sm text-[var(--vf-muted)]'>/ {fmt(salesGoal.target)}</div>
                      <div className='mt-2 text-base text-[var(--vf-muted)]'>
                        {fmt(salesGoal.target - salesGoal.ap)} to go
                      </div>
                    </div>
                  </div>
                </Panel>
              )}
              {teamGoal && (
                <Panel className='rounded-[24px] bg-[var(--vf-surface)] p-4'>
                  <div className='text-sm uppercase tracking-[0.2em] text-[var(--vf-muted)]'>
                    Team production
                  </div>
                  <div className='mt-3 flex items-center gap-4'>
                    <ProgressRing
                      value={teamGoal.pct}
                      label={`${teamGoal.pct}%`}
                      sublabel={`of ${fmt(teamGoal.target)}`}
                      size={126}
                    />
                    <div>
                      <div className='text-4xl font-semibold text-[var(--vf-text)]'>{fmt(teamGoal.ap)}</div>
                      <div className='mt-1 text-sm text-[var(--vf-muted)]'>/ {fmt(teamGoal.target)}</div>
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
}: {
  teamGrowth: { count: number; target: number; pct: number; deadline: string } | null;
}) {
  const router = useRouter();
  const [target, setTarget] = useState(String(teamGrowth?.target ?? ""));
  const [deadline, setDeadline] = useState(teamGrowth?.deadline ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!target || Number(target) < 0) {
      toast.error("Enter a valid target");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "team_growth",
          target: Number(target),
          deadlineDate: deadline || undefined,
        }),
      });
      if (res.ok) {
        toast.success("Team growth goal saved");
        router.refresh();
      } else toast.error("Failed to save");
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
        <div className='text-3xl font-semibold text-[var(--vf-text)]'>Set your goals</div>
      </div>
      <p className='mt-5 text-base text-[var(--vf-muted)]'>
        Set a target number of agents to recruit by a specific deadline. Tracks automatically from your
        downline. Set to 0 to clear.
      </p>
      <div className='mt-8 text-lg font-medium text-[var(--vf-text)]'>Team growth target</div>
      <input
        className='mt-2 w-full rounded-2xl border border-[var(--vf-surface-2)] bg-[var(--vf-surface)] px-4 py-3 text-lg text-[var(--vf-text)] outline-none'
        type='number'
        min={0}
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        placeholder='e.g. 25'
      />
      <div className='mt-5 text-sm text-[var(--vf-muted)]'>Target deadline (optional)</div>
      <DatePicker
        value={deadline}
        onChange={setDeadline}
        placeholder='Pick a deadline'
        className='mt-2 text-lg'
      />
      <div className='mt-3 text-sm text-[var(--vf-muted)]'>
        Total agents in your downline: {teamGrowth?.count ?? 0}
      </div>
      <button
        onClick={save}
        disabled={saving}
        className='mt-6 rounded-2xl bg-[var(--vf-accent)] px-6 py-3 text-lg font-semibold text-[var(--vf-accent-fg)] disabled:opacity-50'
      >
        {saving ? "Saving..." : "Save goal"}
      </button>
    </Panel>
  );
}

type GoalsProps = {
  salesGoal: GoalProgress | null;
  teamGoal: GoalProgress | null;
  teamGrowth: { count: number; target: number; pct: number; deadline: string } | null;
  teamUnlocked: boolean;
};

export function GoalsPage({ salesGoal, teamGoal, teamGrowth, teamUnlocked }: GoalsProps) {
  return (
    <div className='space-y-6'>
      <PageTitle
        title='Goals'
        description='Set targets for your sales production, team production, and growth, then track your progress automatically from your sales and team.'
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
                <button className='mt-4 w-fit rounded-xl border border-[var(--vf-surface-2)] bg-[var(--vf-surface)] px-4 py-2 text-sm text-[var(--vf-accent)]'>
                  Pinned to welcome page
                </button>
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
                ? "Tracks your whole team&apos;s AP for the Agency leaderboard and resets each month."
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
                <button className='mt-4 w-fit rounded-xl border border-[var(--vf-surface-2)] bg-[var(--vf-surface)] px-4 py-2 text-sm text-[var(--vf-accent)]'>
                  Pinned to welcome page
                </button>
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

      <div className='grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]'>
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

        <TeamGrowthEditor teamGrowth={teamGrowth} />
      </div>
    </div>
  );
}

type TeamProps = {
  metrics: { totalTeam: number; directAgents: number; teamAP: number; activeWriters: number };
  growthBars: [string, string, number][];
  teamAgents: TeamAgentRecord[];
  teamUnlocked: boolean;
  selectedRange: TimeRange;
  rangeLabel: string;
};

type FlatNode = {
  agent: TeamAgentRecord;
  depth: number;
  hasChildren: boolean;
};

function buildFlatTree(rows: TeamAgentRecord[], collapsed: Set<string>): FlatNode[] {
  const childrenOf = new Map<string, TeamAgentRecord[]>();
  rows.forEach((agent) => {
    const upline = agent.uplineName;
    if (!childrenOf.has(upline)) childrenOf.set(upline, []);
    childrenOf.get(upline)!.push(agent);
  });

  const result: FlatNode[] = [];

  function traverse(parentName: string, depth: number) {
    const children = childrenOf.get(parentName) ?? [];
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
              <td className='px-4 py-3 text-[var(--vf-text)]'>{fmtPct(row.baseRate)}</td>
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
  teamAgents,
  teamUnlocked,
  selectedRange,
  rangeLabel,
}: TeamProps) {
  const [view, setView] = useState<"ranked" | "hierarchy">("ranked");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [selectedAgent, setSelectedAgent] = useState<TeamAgentRecord | null>(null);
  const [agentDetail, setAgentDetail] = useState<TeamAgentCompensationDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

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

  const flatNodes = buildFlatTree(teamAgents, collapsed);

  const rankedCols = [
    "Agent",
    "Upline",
    "Direct",
    "Team AP",
    "AP",
    "Sales",
    "Dials",
    "Convos",
    "Appts",
    "Pres",
  ];
  const hierCols = ["Agent", "Direct", "Team AP", "Own AP", "Sales", "Dials", "Convos", "Appts", "Pres"];

  return (
    <div className='space-y-8'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <PageTitle
          title='My team'
          description="This month's sales and activity for you and everyone in your downline. Once you have agents assigned, they'll appear here beneath you."
          icon={<Users className='h-6 w-6' />}
        />
        <TimeRangeFilters selectedRange={selectedRange} storageKey="paradigm-team-range" />
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
              emphasis
            />
            <MetricCard
              title='Active writers'
              value={String(metrics.activeWriters)}
              helper='Submitted a policy this month'
            />
          </div>

          <Panel className='p-6'>
            <div className='flex flex-wrap items-start justify-between gap-4'>
              <div>
                <h2 className='text-2xl font-semibold text-[var(--vf-text)] sm:text-3xl'>My team growth</h2>
                <p className='mt-2 text-base text-[var(--vf-muted)]'>
                  Team AP volume across {rangeLabel.toLowerCase()}.
                </p>
              </div>
            </div>
            <div className='mt-8 grid grid-cols-4 gap-4 md:grid-cols-8'>
              {growthBars.map(([month, amount, height], index) => (
                <div
                  key={`${month}-${index}`}
                  className='flex flex-col items-center gap-2'
                >
                  <div className='text-xs text-[var(--vf-muted)]'>{amount}</div>
                  <div className='flex h-44 items-end'>
                    <div
                      className={cn(
                        "w-10 rounded-t-xl",
                        index === growthBars.length - 1
                          ? "bg-[var(--vf-accent)]"
                          : "bg-[var(--vf-surface-2)]",
                      )}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <div className='text-sm text-[var(--vf-muted)]'>{month}</div>
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
                          key={col}
                          className='px-3 py-3 font-medium'
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {teamAgents.map((agent) => (
                      <tr
                        key={agent.id}
                        onClick={() => openAgent(agent)}
                        className='cursor-pointer border-b border-[var(--vf-border)] text-sm transition hover:bg-[color:rgba(226,187,82,0.10)]'
                      >
                        <td className='px-3 py-4'>
                          <div className='flex items-center gap-3'>
                            <Avatar
                              name={agent.name}
                              small
                            />
                            <div className='font-medium text-[var(--vf-text)]'>{agent.name}</div>
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
                          key={col}
                          className='px-3 py-3 font-medium'
                        >
                          {col}
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
                                small
                              />
                              <div className='ml-3 font-medium text-[var(--vf-text)]'>{name}</div>
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
                  <div key={i} className='rounded-[20px] border border-[var(--vf-border)] bg-[var(--vf-surface)] p-4'>
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
                    {['w-20', 'w-32', 'w-16', 'w-20', 'w-20', 'w-24', 'w-20', 'w-16'].map((w, i) => (
                      <Skeleton key={i} className={`h-3 ${w}`} />
                    ))}
                  </div>
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className='flex gap-8 border-t border-[var(--vf-border)] px-4 py-3.5'>
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
              <div className='flex flex-wrap items-start justify-between gap-4'>
                <div className='space-y-1'>
                  <div className='text-sm text-[var(--vf-muted)]'>
                    {agentDetail.subject.name} is at {fmtPct(agentDetail.subject.compPercentage)} comp. Your
                    override on this branch is {fmtPct(agentDetail.summary.overrideDelta)}.
                  </div>
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
                  <TabsTrigger
                    value='overrides'
                    className='rounded-xl px-4 py-2 text-sm data-active:bg-[var(--vf-surface)]'
                  >
                    Override
                  </TabsTrigger>
                </TabsList>
              </div>

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
                    helper={`${fmtPct(agentDetail.subject.compPercentage)} of carrier comp`}
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
                    helper='Across this downline branch'
                  />
                  <MetricCard
                    title='Override AP'
                    value={fmt(agentDetail.summary.overrideApTotal)}
                    helper='AP eligible for your override'
                  />
                  <MetricCard
                    title='Est. override'
                    value={fmt(agentDetail.summary.overrideTotal)}
                    helper={`${fmtPct(agentDetail.summary.overrideDelta)} branch delta`}
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
                    No override is currently available on this branch for {rangeLabel.toLowerCase()}.
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
  const [confirmPending, setConfirmPending] = useState<{ action: "delete" | "end" | "activate"; id: string; name: string } | null>(null);
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
      onToggleFeatured: () => toggleFeatured(c.id, c.pinned),
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
              description='Live matchups scored on AP written during each window. Go get it.'
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

      {/* Confirmation modal */}
      <Dialog open={!!confirmPending} onOpenChange={(open) => { if (!open) setConfirmPending(null); }}>
        <DialogContent className="max-w-sm border-[var(--vf-border)] bg-[var(--vf-panel)] text-[var(--vf-text)]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {confirmPending?.action === "delete" && "Delete competition"}
              {confirmPending?.action === "end" && "End competition"}
              {confirmPending?.action === "activate" && "Activate competition"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[var(--vf-muted)]">
            {confirmPending?.action === "delete" && <>Are you sure you want to delete <span className="font-medium text-[var(--vf-text)]">"{confirmPending.name}"</span>? This cannot be undone.</>}
            {confirmPending?.action === "end" && <>End <span className="font-medium text-[var(--vf-text)]">"{confirmPending?.name}"</span>? This will close it to all participants.</>}
            {confirmPending?.action === "activate" && <>Activate <span className="font-medium text-[var(--vf-text)]">"{confirmPending?.name}"</span>? It will become live and visible to all agents.</>}
          </p>
          <div className="mt-2 flex justify-end gap-3">
            <button
              onClick={() => setConfirmPending(null)}
              className="rounded-xl border border-[var(--vf-border)] bg-[var(--vf-surface)] px-4 py-2 text-sm font-medium text-[var(--vf-text)] hover:bg-[var(--vf-surface-2)]"
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
  metrics: { totalSales: number; agencyAP: number; activeWriters: number };
  agentLeaderboard: LeaderboardEntry[];
  teamLeaderboard: LeaderboardEntry[];
  selectedRange: TimeRange;
  rangeLabel: string;
  isAdmin: boolean;
  compGuide: CompGuideRecord[];
};

export function AgencyPage({
  metrics,
  agentLeaderboard,
  teamLeaderboard,
  selectedRange,
  rangeLabel,
  isAdmin,
  compGuide,
}: AgencyProps) {
  const router = useRouter();
  const [savingGuideId, setSavingGuideId] = useState<string | null>(null);

  async function updateCompGuide(id: string, value: number) {
    setSavingGuideId(id);
    try {
      const res = await fetch("/api/comp-guide", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, baseRate: value }),
      });
      if (!res.ok) throw new Error();
      toast.success("Comp guide updated");
      router.refresh();
    } catch {
      toast.error("Could not update comp guide");
    } finally {
      setSavingGuideId(null);
    }
  }

  const overview = (
    <>
      <div className='flex justify-end'>
        <TimeRangeFilters selectedRange={selectedRange} storageKey="paradigm-agency-range" />
      </div>
      <div className='grid gap-4 md:grid-cols-3'>
        <MetricCard
          title='Total sales'
          value={String(metrics.totalSales)}
          helper={`Policies submitted in ${rangeLabel.toLowerCase()}`}
        />
        <MetricCard
          title='Agency AP'
          value={fmt(metrics.agencyAP)}
          helper={`Combined AP in ${rangeLabel.toLowerCase()}`}
          emphasis
        />
        <MetricCard
          title='Active writers'
          value={String(metrics.activeWriters)}
          helper={`Submitted a policy in ${rangeLabel.toLowerCase()}`}
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
              title='Agency overview'
              description='Track agency production and manage the master carrier comp guide.'
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
                    Agency-owned carrier and product rates used to estimate agent commissions and stacked
                    overrides.
                  </div>
                </div>
              </div>
              <div className='mt-5 overflow-x-auto rounded-[22px] border border-[var(--vf-border)]'>
                <table className='w-full min-w-[720px] text-left text-sm'>
                  <thead className='bg-[var(--vf-surface)] text-[var(--vf-muted)]'>
                    <tr>
                      <th className='px-4 py-4 font-medium'>Carrier</th>
                      <th className='px-4 py-4 font-medium'>Product</th>
                      <th className='px-4 py-4 font-medium'>Base rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compGuide.map((row) => (
                      <tr
                        key={row.id}
                        className='border-t border-[var(--vf-border)]'
                      >
                        <td className='px-4 py-3 font-medium text-[var(--vf-text)]'>{row.carrier}</td>
                        <td className='px-4 py-3 text-[var(--vf-text)]'>{row.product}</td>
                        <td className='px-4 py-3'>
                          <div className='relative inline-flex items-center'>
                            <input
                              type='number'
                              min={0}
                              max={200}
                              step='0.5'
                              defaultValue={row.baseRate}
                              disabled={savingGuideId === row.id}
                              onBlur={(event) => {
                                const nextValue = Number(event.target.value);
                                if (!Number.isFinite(nextValue) || nextValue === row.baseRate) {
                                  event.target.value = row.baseRate.toString();
                                  return;
                                }
                                void updateCompGuide(row.id, nextValue);
                              }}
                              className='w-[120px] rounded-xl border border-[var(--vf-surface-2)] bg-[var(--vf-surface)] py-2 pl-3 pr-7 text-[var(--vf-text)] outline-none'
                            />
                            <span className='pointer-events-none absolute right-3 text-sm text-[var(--vf-muted)]'>%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </TabsContent>
        </Tabs>
      ) : (
        overview
      )}
    </div>
  );
}

type AdminProps = {
  metrics: { totalAP: number; totalSales: number; activeAgents: number };
  agents: AdminAgentRecord[];
  uplineOptions: { id: string; name: string }[];
  leaderboardPosts: LeaderboardPostsData;
};

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function leaderboardPostSvg(post: LeaderboardPostCard) {
  // Helper to format AP as dollar string
  const fmtAp = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

  // Podium entries (top 3)
  const e1 = post.entries[0];
  const e2 = post.entries[1];
  const e3 = post.entries[2];

  // Grid entries (ranks 4+), up to 9 more to fill two columns of up to ~5 rows each
  const gridEntries = post.entries.slice(3, 13);

  // Split grid into left column (even indices) and right column (odd indices)
  const leftCol = gridEntries.filter((_, i) => i % 2 === 0);
  const rightCol = gridEntries.filter((_, i) => i % 2 === 1);
  const rowCount = Math.max(leftCol.length, rightCol.length);

  const gridStartY = 800;
  const rowH = 52;

  const gridRows = Array.from({ length: rowCount }, (_, i) => {
    const y = gridStartY + i * rowH;
    const lEntry = leftCol[i];
    const rEntry = rightCol[i];
    const separatorY = y + rowH - 4;
    const leftSvg = lEntry ? `
      <text x="86" y="${y + 30}" fill="#F15025" font-size="22" font-family="Arial, sans-serif" font-weight="700">#${lEntry.rank}</text>
      <text x="130" y="${y + 30}" fill="#DBDEE1" font-size="22" font-family="Arial, sans-serif">${escapeXml(lEntry.shortName)}</text>
      <text x="360" y="${y + 22}" fill="#949BA4" font-size="16" font-family="Arial, sans-serif" text-anchor="end">${lEntry.salesCount} ${lEntry.salesCount === 1 ? "sale" : "sales"}</text>
      <text x="516" y="${y + 30}" fill="#ffffff" font-size="22" font-family="Arial, sans-serif" font-weight="700" text-anchor="end">${fmtAp(lEntry.ap)}</text>
    ` : "";
    const rightSvg = rEntry ? `
      <text x="558" y="${y + 30}" fill="#F15025" font-size="22" font-family="Arial, sans-serif" font-weight="700">#${rEntry.rank}</text>
      <text x="602" y="${y + 30}" fill="#DBDEE1" font-size="22" font-family="Arial, sans-serif">${escapeXml(rEntry.shortName)}</text>
      <text x="830" y="${y + 22}" fill="#949BA4" font-size="16" font-family="Arial, sans-serif" text-anchor="end">${rEntry.salesCount} ${rEntry.salesCount === 1 ? "sale" : "sales"}</text>
      <text x="988" y="${y + 30}" fill="#ffffff" font-size="22" font-family="Arial, sans-serif" font-weight="700" text-anchor="end">${fmtAp(rEntry.ap)}</text>
    ` : "";
    const sep = i < rowCount - 1 ? `<line x1="72" y1="${separatorY}" x2="1008" y2="${separatorY}" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>` : "";
    return leftSvg + rightSvg + sep;
  }).join("");

  // Podium avatar helper
  const avatar = (cx: number, cy: number, r: number, initials: string, ringColor: string, badgeRank: number) => {
    const badgeCy = cy + r - 4;
    const badgeColor = badgeRank === 1 ? "#F15025" : badgeRank === 2 ? "#5865F2" : "rgba(205,127,79,0.9)";
    return `
      <circle cx="${cx}" cy="${cy}" r="${r + 6}" fill="${ringColor}" />
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="#1e2124" />
      <text x="${cx}" y="${cy + (r > 70 ? 16 : 12)}" text-anchor="middle" fill="#ffffff" font-size="${r > 70 ? 44 : 34}" font-family="Arial, sans-serif" font-weight="700">${escapeXml(initials)}</text>
      <circle cx="${cx}" cy="${badgeCy}" r="18" fill="${badgeColor}" />
      <text x="${cx}" y="${badgeCy + 6}" text-anchor="middle" fill="#ffffff" font-size="16" font-family="Arial, sans-serif" font-weight="700">${badgeRank}</text>
    `;
  };

  // Name card helper
  const nameCard = (x: number, y: number, w: number, h: number, name: string, ap: number, borderColor: string, apColor: string) => `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="#161819" stroke="${borderColor}" stroke-width="1.5"/>
    <text x="${x + w / 2}" y="${y + 36}" text-anchor="middle" fill="#DBDEE1" font-size="24" font-family="Arial, sans-serif" font-weight="600">${escapeXml(name)}</text>
    <text x="${x + w / 2}" y="${y + 60}" text-anchor="middle" fill="#949BA4" font-size="14" font-family="Arial, sans-serif" letter-spacing="3">TOTAL AP</text>
    <text x="${x + w / 2}" y="${y + 94}" text-anchor="middle" fill="${apColor}" font-size="30" font-family="Arial, sans-serif" font-weight="700">${fmtAp(ap)}</text>
  `;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
      <defs>
        <linearGradient id="bg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#0d0f11" />
          <stop offset="100%" stop-color="#111214" />
        </linearGradient>
        <linearGradient id="accentGrad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stop-color="#F15025" />
          <stop offset="100%" stop-color="#ff8a67" />
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="1080" height="1350" fill="url(#bg)" />

      <!-- Top orange accent bar -->
      <rect x="0" y="0" width="1080" height="6" fill="url(#accentGrad)" />

      <!-- Logo circle -->
      <circle cx="540" cy="108" r="56" fill="rgba(241,80,37,0.12)" stroke="#F15025" stroke-width="2" />
      <g transform="translate(540, 108)">
        <polygon points="0,-26 -14,-4 14,-4" stroke="rgba(255,255,255,0.9)" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
        <polygon points="-14,-4 -20,8 20,8 14,-4" stroke="rgba(255,255,255,0.9)" stroke-width="2" fill="none" stroke-linejoin="round"/>
        <polygon points="-20,8 -28,22 28,22 20,8" stroke="rgba(255,255,255,0.9)" stroke-width="2" fill="none" stroke-linejoin="round"/>
        <polyline points="-22,34 -16,27 -10,34" stroke="rgba(255,255,255,0.5)" stroke-width="1.5" fill="none" stroke-linejoin="round"/>
        <polyline points="-4,34 2,27 8,34" stroke="rgba(255,255,255,0.5)" stroke-width="1.5" fill="none" stroke-linejoin="round"/>
      </g>

      <!-- Company name -->
      <text x="540" y="200" text-anchor="middle" fill="#F15025" font-size="22" font-family="Arial, sans-serif" font-weight="700" letter-spacing="8">PARADIGM FINANCIAL</text>

      <!-- Main title -->
      <text x="540" y="264" text-anchor="middle" fill="#ffffff" font-size="64" font-family="Arial, sans-serif" font-weight="900" font-style="italic">${escapeXml(post.title.replace(" post", "").toUpperCase())}</text>

      <!-- Date range pill -->
      <rect x="390" y="280" width="300" height="40" rx="20" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
      <text x="540" y="306" text-anchor="middle" fill="#949BA4" font-size="18" font-family="Arial, sans-serif">${escapeXml(post.periodLabel)}</text>

      <!-- Crown above #1 -->
      <text x="540" y="415" text-anchor="middle" font-size="52">&#x1F451;</text>

      <!-- Podium avatars -->
      ${e2 ? avatar(205, 516, 68, e2.initials, "#5865F2", 2) : ""}
      ${e1 ? avatar(540, 488, 86, e1.initials, "#F15025", 1) : ""}
      ${e3 ? avatar(875, 516, 68, e3.initials, "rgba(205,127,79,0.8)", 3) : ""}

      <!-- Name cards -->
      ${e2 ? nameCard(72, 610, 266, 148, e2.shortName, e2.ap, "rgba(255,255,255,0.12)", "#ffffff") : ""}
      ${e1 ? nameCard(362, 596, 356, 168, e1.shortName, e1.ap, "#F15025", "#F15025") : ""}
      ${e3 ? nameCard(742, 610, 266, 148, e3.shortName, e3.ap, "rgba(255,255,255,0.12)", "#ffffff") : ""}

      <!-- Grid section divider -->
      <line x1="72" y1="790" x2="1008" y2="790" stroke="rgba(255,255,255,0.10)" stroke-width="1"/>
      <!-- Vertical column divider -->
      <line x1="532" y1="800" x2="532" y2="${gridStartY + rowCount * rowH - 8}" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>

      <!-- Grid rows -->
      ${gridRows}

      <!-- Footer stats bar -->
      <rect x="72" y="1080" width="936" height="112" rx="22" fill="#1a1b1e" stroke="rgba(255,255,255,0.10)" stroke-width="1"/>
      <line x1="540" y1="1092" x2="540" y2="1180" stroke="rgba(255,255,255,0.10)" stroke-width="1"/>
      <text x="306" y="1120" text-anchor="middle" fill="#949BA4" font-size="16" font-family="Arial, sans-serif" letter-spacing="4">TEAM TOTAL AP</text>
      <text x="306" y="1164" text-anchor="middle" fill="#F15025" font-size="38" font-family="Arial, sans-serif" font-weight="700">${fmtAp(post.totalAp)}</text>
      <text x="774" y="1120" text-anchor="middle" fill="#949BA4" font-size="16" font-family="Arial, sans-serif" letter-spacing="4">WRITING AGENTS</text>
      <text x="774" y="1164" text-anchor="middle" fill="#ffffff" font-size="38" font-family="Arial, sans-serif" font-weight="700">${post.writingAgents}</text>

      <!-- Tagline -->
      <text x="540" y="1260" text-anchor="middle" fill="#F15025" font-size="18" font-family="Arial, sans-serif" letter-spacing="3">&#9670; PROTECT FAMILIES &#183; CHANGE LIVES &#183; BUILD LEGACY &#9670;</text>
    </svg>
  `.trim();
}

async function leaderboardPostPngBlob(post: LeaderboardPostCard) {
  const svg = leaderboardPostSvg(post);
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
    canvas.width = 1080;
    canvas.height = 1350;
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
  const svgString = leaderboardPostSvg(post);
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dataUrl}
      alt="Leaderboard post preview"
      className="mx-auto w-full max-w-[480px] rounded-[28px]"
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

  // Members tab state
  const [allAgents, setAllAgents] = useState<AgentRecord[]>([]);
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  // Sync form when modal opens or editing changes
  useEffect(() => {
    if (!open) return;
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
    if (!open || tab !== "members" || !editing) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMembersLoading(true);
    Promise.all([
      fetch("/api/agents").then((r) => r.json() as Promise<AgentRecord[]>),
      fetch(`/api/competitions/${editing.id}/members`).then((r) => r.json() as Promise<MemberRecord[]>),
    ])
      .then(([agents, mems]) => {
        setAllAgents(agents);
        setMembers(mems);
      })
      .finally(() => setMembersLoading(false));
  }, [open, tab, editing]);

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
      }
      if (res.ok) {
        toast.success(editing ? "Competition updated" : "Competition created");
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
    if (!editing) return;
    const res = await fetch(`/api/competitions/${editing.id}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId, agentId }),
    });
    if (res.ok) {
      // Refetch to get real id
      const updated = await fetch(`/api/competitions/${editing.id}/members`).then(
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
    if (!editing) return;
    const res = await fetch(`/api/competitions/${editing.id}/members/${memberId}`, { method: "DELETE" });
    if (res.ok) {
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      router.refresh();
    } else {
      toast.error("Failed to remove member");
    }
  }

  const inputCls =
    "mt-2 w-full rounded-2xl border border-[var(--vf-surface-2)] bg-[var(--vf-surface)] px-4 py-3 text-base text-[var(--vf-text)] outline-none";
  const tabBtnCls = (active: boolean) =>
    cn(
      "px-4 py-2 text-sm rounded-xl border",
      active
        ? "border-[var(--vf-surface-2)] bg-[var(--vf-surface)] text-[var(--vf-text)]"
        : "border-transparent text-[var(--vf-muted)] hover:text-[var(--vf-text)]",
    );

  const team1 = editing?.teams[0];
  const team2 = editing?.teams[1];
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
        </DialogHeader>

        {/* Tab bar — only shown when editing */}
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
                  className='mt-2'
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
                  className='mt-2'
                  disablePast
                />
              </div>
              {editing && (
                <div>
                  <label className='text-sm uppercase tracking-[0.14em] text-[var(--vf-muted)]'>Status</label>
                  <select
                    className={inputCls}
                    value={form.status}
                    onChange={field("status")}
                  >
                    <option value='draft'>Draft</option>
                    <option value='active'>Active</option>
                    <option value='ended'>Ended</option>
                  </select>
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
        {tab === "members" && editing && (
          <div className='mt-2 flex-1 overflow-y-auto pr-1'>
            {membersLoading ? (
              <div className='py-8 text-center text-sm text-[var(--vf-muted)]'>Loading...</div>
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
                    Available agents{available.length > 0 ? ` (${available.length})` : " — all assigned"}
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
          <button
            type='button'
            onClick={onClose}
            className='rounded-2xl border border-[var(--vf-border)] px-5 py-3 text-sm text-[var(--vf-muted)]'
          >
            {tab === "members" ? "Done" : "Cancel"}
          </button>
          {tab === "details" && (
            <button
              type='submit'
              form='competition-form'
              disabled={saving}
              className='rounded-2xl bg-[var(--vf-accent)] px-6 py-3 text-sm font-semibold text-[var(--vf-accent-fg)] disabled:opacity-50'
            >
              {saving ? "Saving..." : editing ? "Save changes" : "Create"}
            </button>
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
}: {
  agentId: string;
  uplineId: string | null;
  uplineName: string | null;
  uplineOptions: { id: string; name: string }[];
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  const [search, setSearch] = useState("");
  const filtered = uplineOptions
    .filter((o) => o.id !== agentId)
    .filter((o) => o.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Select
      value={uplineId ?? "unassigned"}
      onValueChange={(v) => { setSearch(""); onChange(v); }}
      disabled={disabled}
    >
      <SelectTrigger className='w-[220px] rounded-xl border-[var(--vf-surface-2)] bg-[var(--vf-surface)] text-[var(--vf-text)]'>
        <span>{uplineId ? (uplineOptions.find((o) => o.id === uplineId)?.name ?? uplineName) : "Unassigned"}</span>
      </SelectTrigger>
      <SelectContent className='w-[280px] max-h-[300px] p-2' align="end" alignItemWithTrigger={false}>
        <div className='pb-2'>
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder='Search agents...'
            className='w-full rounded-lg bg-[rgba(255,255,255,0.07)] px-3 py-2 text-sm text-[var(--vf-text)] outline-none placeholder:text-[var(--vf-muted)]'
          />
        </div>
        <SelectItem value='unassigned' className='rounded-lg px-3 py-2.5 text-sm'>Unassigned</SelectItem>
        {filtered.map((option) => (
          <SelectItem key={option.id} value={option.id} className='rounded-lg px-3 py-2.5 text-sm'>{option.name}</SelectItem>
        ))}
        {filtered.length === 0 && (
          <div className='px-3 py-3 text-sm text-[var(--vf-muted)]'>No agents found</div>
        )}
      </SelectContent>
    </Select>
  );
}

// ─── Admin page ───────────────────────────────────────────────
export function AdminPage({ metrics, agents, uplineOptions, leaderboardPosts }: AdminProps) {
  const router = useRouter();
  const [tab, setTab] = useState<"management" | "leaderboardPosts">("management");
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteList, setInviteList] = useState("agent1@paradigmfinancial.com\nagent2@paradigmfinancial.com");
  const [inviting, setInviting] = useState(false);
  const [savingAgentId, setSavingAgentId] = useState<string | null>(null);
  const [deleteAgentPending, setDeleteAgentPending] = useState<{ id: string; name: string } | null>(null);
  const [deletingAgentId, setDeletingAgentId] = useState<string | null>(null);
  const [focusedAgentId, setFocusedAgentId] = useState<string | null>(null);
  const [agentFilter, setAgentFilter] = useState<"All" | "New" | "Unassigned">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 10;

  const sidebarItems: { label: string; key: "management" | "leaderboardPosts" }[] = [
    { label: "Management", key: "management" },
    { label: "Leaderboard Posts", key: "leaderboardPosts" },
  ];

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
    payload: { role?: "admin" | "agent"; uplineId?: string | null; compPercentage?: number },
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
        return;
      }

      toast.success("Agent updated");
      router.refresh();
    } finally {
      setSavingAgentId(null);
    }
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

  const totalPages = Math.max(1, Math.ceil(filteredAgents.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedAgents = filteredAgents.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);
  const startRow = filteredAgents.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endRow = filteredAgents.length === 0 ? 0 : startRow + paginatedAgents.length - 1;

  return (
    <div className='space-y-8'>
      <PageTitle
        title='Admin controls'
        description='Manage agents, KPIs, and all sales across your team.'
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
              onClick={() => { if (key) setTab(key); }}
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
                    <button
                      onClick={() => setInviteModalOpen(true)}
                      className='inline-flex items-center gap-2 rounded-2xl bg-[var(--vf-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--vf-accent-fg)]'
                    >
                      <Plus className='h-4 w-4' />
                      Create new user
                    </button>
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
                        {["Agent", "Lifetime AP", "Sales", "Comp", "Access", "Upline", ""].map((label) => (
                          <th
                            key={label}
                            className='px-4 py-4 font-medium'
                          >
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedAgents.map((agent) => (
                        <tr
                          key={agent.id}
                          className='border-t border-[var(--vf-border)] text-sm'
                        >
                          <td className='px-4 py-3'>
                            <div className='flex items-center gap-3'>
                              <Avatar
                                name={agent.name}
                                small
                              />
                              <div>
                                <div className='font-medium text-[var(--vf-text)]'>
                                  {agent.name}
                                  {agent.isNew ? (
                                    <span className='ml-2 rounded-full bg-[#3f9e50] px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-white'>
                                      New
                                    </span>
                                  ) : null}
                                </div>
                                <div className='text-[var(--vf-muted)]'>{agent.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className='px-4 py-3 text-[var(--vf-text)]'>{agent.lifetimeAP}</td>
                          <td className='px-4 py-3 text-[var(--vf-text)]'>{agent.lifetimeSales}</td>
                          <td className='px-4 py-3 text-[var(--vf-text)]'>
                            <div className='relative inline-flex items-center'>
                              <input
                                type='number'
                                min={0}
                                max={200}
                                step='5'
                                defaultValue={agent.compPercentage}
                                disabled={savingAgentId === agent.id}
                                onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }}
                                onFocus={(e) => { e.currentTarget.select(); setFocusedAgentId(agent.id); }}
                                onBlur={(event) => { setFocusedAgentId(null);
                                  const nextValue = Number(event.target.value);
                                  if (!Number.isFinite(nextValue) || nextValue === agent.compPercentage) {
                                    event.target.value = agent.compPercentage.toString();
                                    return;
                                  }
                                  void updateAgent(agent.id, { compPercentage: nextValue });
                                }}
                                className='w-[150px] rounded-xl border border-[var(--vf-surface-2)] bg-[var(--vf-surface)] py-2 pl-3 pr-16 text-[var(--vf-text)] outline-none transition-colors focus:border-[var(--vf-accent)]'
                              />
                              <span className={cn('pointer-events-none absolute text-sm text-[var(--vf-muted)] transition-all duration-150', focusedAgentId === agent.id ? 'right-8' : 'right-3')}>%</span>
                              <div className={cn('pointer-events-none absolute right-2 flex items-center rounded border px-1.5 py-0.5 transition-all duration-150', focusedAgentId === agent.id ? 'border-[var(--vf-border)] bg-[var(--vf-surface-2)] opacity-100 translate-x-0' : 'opacity-0 translate-x-1')}>
                                <span className='text-[9px] font-medium text-[var(--vf-muted)]'>↵</span>
                              </div>
                            </div>
                          </td>
                          <td className='px-4 py-3 text-[var(--vf-text)]'>
                            <Select
                              value={agent.role}
                              onValueChange={(value) =>
                                updateAgent(agent.id, { role: value as "admin" | "agent" })
                              }
                              disabled={savingAgentId === agent.id}
                            >
                              <SelectTrigger className='w-[150px] rounded-xl border-[var(--vf-surface-2)] bg-[var(--vf-surface)] text-[var(--vf-text)]'>
                                <span>{agent.role === "admin" ? "Admin" : "Stats only"}</span>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='admin'>Admin</SelectItem>
                                <SelectItem value='agent'>Stats only</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className='px-4 py-3 text-[var(--vf-text)]'>
                            <UplineSelect
                              agentId={agent.id}
                              uplineId={agent.uplineId}
                              uplineName={agent.uplineName}
                              uplineOptions={uplineOptions}
                              disabled={savingAgentId === agent.id}
                              onChange={(value) => updateAgent(agent.id, { uplineId: value === "unassigned" ? null : value })}
                            />
                          </td>
                          <td className='px-4 py-3' />
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
                <div key={post.key} className='py-2'>
                  <div className='flex flex-wrap items-start justify-between gap-4'>
                    <div>
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

                  {post.ready ? (
                    <div className='mt-6'>
                      <LeaderboardPostPreview post={post} />
                    </div>
                  ) : (
                    <div className='mt-6 rounded-[28px] border border-dashed border-[var(--vf-border)] bg-[var(--vf-surface)] px-6 py-10 text-center text-[var(--vf-muted)]'>
                      {post.emptyMessage}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!deleteAgentPending} onOpenChange={(open) => { if (!open) setDeleteAgentPending(null); }}>
        <DialogContent className='max-w-sm border-[var(--vf-border)] bg-[var(--vf-panel)] text-[var(--vf-text)]'>
          <DialogHeader>
            <DialogTitle className='text-xl font-semibold'>Delete agent</DialogTitle>
          </DialogHeader>
          <p className='text-sm text-[var(--vf-muted)]'>
            Are you sure you want to delete{' '}
            <span className='font-medium text-[var(--vf-text)]'>"{deleteAgentPending?.name}"</span>?
            This will permanently remove them and all associated data. This cannot be undone.
          </p>
          <div className='mt-2 flex justify-end gap-3'>
            <button
              onClick={() => setDeleteAgentPending(null)}
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
          description='Manage your photo, account details, and carrier commission rates.'
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
        <h2 className='text-3xl font-semibold text-[var(--vf-text)]'>Profile photo</h2>
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
                  if (e.key === "Escape") { setNameValue(profile.name); setNameFocused(false); e.currentTarget.blur(); }
                }}
                onBlur={async () => {
                  setNameFocused(false);
                  const trimmed = nameValue.trim();
                  if (!trimmed || trimmed === profile.name) { setNameValue(profile.name); return; }
                  setSavingName(true);
                  try {
                    const res = await fetch("/api/profile", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name: trimmed }),
                    });
                    if (res.ok) { toast.success("Name updated"); router.refresh(); }
                    else { toast.error("Failed to update name"); setNameValue(profile.name); }
                  } finally { setSavingName(false); }
                }}
                disabled={savingName}
                className={cn(
                  'w-full bg-transparent py-1 pl-0 pr-16 text-xl text-[var(--vf-text)] outline-none transition-all duration-150',
                  nameFocused
                    ? 'rounded-xl border border-[var(--vf-accent)] bg-[var(--vf-surface)] pl-3'
                    : 'border-b border-[var(--vf-border)]',
                )}
              />
              <Pencil className={cn(
                'pointer-events-none absolute top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--vf-muted)] transition-all duration-150',
                nameFocused ? 'right-10 opacity-0' : 'right-2 opacity-60',
              )} />
              <div className={cn(
                'pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 flex items-center rounded border px-1.5 py-0.5 transition-all duration-150',
                nameFocused
                  ? 'border-[var(--vf-border)] bg-[var(--vf-surface-2)] opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-1',
              )}>
                <span className='text-[10px] font-medium text-[var(--vf-muted)]'>enter</span>
              </div>
            </div>
          </div>
          <div>
            <div className='text-sm uppercase tracking-[0.16em] text-[var(--vf-muted)]'>Email</div>
            <div className='mt-2 text-xl text-[var(--vf-text)]'>{profile.email}</div>
          </div>
        </div>
      </Panel>

      <Panel className='overflow-hidden p-0'>
        <div className='border-b border-[var(--vf-border)] bg-[linear-gradient(135deg,rgba(88,101,242,0.16),rgba(241,80,37,0.08))] px-6 py-6'>
          <div className='flex flex-wrap items-start justify-between gap-4'>
            <div className='flex items-center gap-4'>
              <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5865F2] text-white shadow-[0_12px_24px_rgba(88,101,242,0.25)]'>
                <DiscordIcon className='h-7 w-7' />
              </div>
              <div>
                <div className='flex flex-wrap items-center gap-3'>
                  <h2 className='text-3xl font-semibold text-[var(--vf-text)]'>Connect Discord</h2>
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
                <p className='mt-2 text-base text-[var(--vf-muted)] whitespace-nowrap'>
                  Your Discord account is your identity on this platform. Sales data, rankings, and activity are all tied to it.
                </p>
              </div>
            </div>

          </div>
        </div>

        <div className='px-6 py-6'>
          <div className='rounded-[24px] border border-[var(--vf-border)] bg-[var(--vf-surface)] p-5'>
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
