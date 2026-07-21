import { format, startOfDay, startOfMonth, startOfWeek } from "date-fns";

import { createServiceClient } from "./supabase";

// ─── Shared types ────────────────────────────────────────────
export type LeaderboardEntry = {
  rank: number;
  name: string;
  subtitle: string;
  value: string;
  badge?: string;
  tone?: "gold" | "accent";
  progressLabel?: string;
  progressValue?: number;
};

export type GoalProgress = {
  ap: number;
  target: number;
  pct: number;
};

export type CompetitionTeam = {
  id: string;
  name: string;
  color: string;
  totalAP: number;
  salesCount: number;
  members: string[];
};

export type Competition = {
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

export type ProfileData = {
  name: string;
  email: string;
  phone: string | null;
  profileImageUrl: string | null;
  discordUserId: string | null;
  discordUsername: string | null;
  discordGlobalName: string | null;
  discordAvatarUrl: string | null;
  discordConnectedAt: string | null;
};

export type TeamAccessData = {
  teamUnlocked: boolean;
  directAgents: number;
};

export type TimeRange = "30d" | "90d" | "180d" | "365d";

type AgentNode = {
  id: string;
  name: string;
  upline_id: string | null;
  comp_percentage?: number;
};

type SalesRow = {
  id?: string;
  agent_id: string;
  carrier?: string;
  product?: string;
  ap: number;
  sold_at: string;
  client_name?: string | null;
};

type ActivityRow = {
  agent_id: string;
  dials: number;
  conversations: number;
  appointments: number;
  presentations: number;
};

export type AdminAgentRecord = {
  id: string;
  name: string;
  email: string;
  lifetimeAP: string;
  lifetimeSales: string;
  compPercentage: number;
  role: string;
  uplineId: string | null;
  uplineName: string;
  isNew: boolean;
};

export type TeamAgentRecord = {
  id: string;
  name: string;
  uplineName: string;
  directCount: number;
  teamAP: number;
  ownAP: number;
  salesCount: number;
  dials: number;
  conversations: number;
  appointments: number;
  presentations: number;
};

export type CompGuideRecord = {
  id: string;
  carrier: string;
  product: string;
  baseRate: number;
};

export type CompensationLineItem = {
  saleId: string;
  saleAgentId: string;
  saleAgentName: string;
  clientName: string;
  carrier: string;
  product: string;
  ap: number;
  soldAt: string;
  baseRate: number;
  compPercentage: number;
  effectiveRate: number;
  estimatedTotal: number;
  estimatedAdvance: number;
};

export type TeamAgentCompensationDetail = {
  subject: { id: string; name: string; compPercentage: number };
  viewer: { id: string; name: string; compPercentage: number };
  branchAgent: { id: string; name: string; compPercentage: number; isSelf: boolean };
  summary: {
    ownSalesCount: number;
    ownApTotal: number;
    ownCommissionTotal: number;
    ownAdvanceTotal: number;
    overrideSalesCount: number;
    overrideApTotal: number;
    overrideDelta: number;
    overrideTotal: number;
    overrideAdvanceTotal: number;
  };
  commissions: CompensationLineItem[];
  overrides: CompensationLineItem[];
};

export type LeaderboardPostEntry = {
  rank: number;
  name: string;
  shortName: string;
  initials: string;
  ap: number;
  salesCount: number;
};

export type LeaderboardPostCard = {
  key: "daily" | "weekly" | "monthly";
  title: string;
  periodLabel: string;
  shareLabel: string;
  entries: LeaderboardPostEntry[];
  totalAp: number;
  writingAgents: number;
  ready: boolean;
  emptyMessage?: string;
};

export type LeaderboardPostsData = {
  cards: LeaderboardPostCard[];
};

// ─── Helpers ─────────────────────────────────────────────────
function fmt(n: number): string {
  return "$" + Math.round(n).toLocaleString("en-US");
}

function tone(rank: number): "gold" | "accent" | undefined {
  if (rank === 1) return "gold";
  if (rank <= 3) return "accent";
  return undefined;
}

function goalPct(ap: number, target: number): number {
  if (!target) return 0;
  return Math.min(Math.round((ap / target) * 100), 100);
}

function pct(value: number): number {
  return Number.isFinite(value) ? value / 100 : 0;
}

function normalizeCompRate(carrier: string, product: string): string {
  return `${carrier.trim().toLowerCase()}::${product.trim().toLowerCase()}`;
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function getRangeStart(range: TimeRange): string {
  const now = new Date();
  const daysBack = range === "30d" ? 29 : range === "90d" ? 89 : range === "180d" ? 179 : 364;
  const start = new Date(now);
  start.setDate(now.getDate() - daysBack);
  return start.toISOString();
}

function getRangeLabel(range: TimeRange): string {
  return range === "30d" ? "Last 30 days" : range === "90d" ? "Last 90 days" : range === "180d" ? "Last 180 days" : "Last 365 days";
}

function buildChildrenMap(agents: AgentNode[]) {
  const childrenByUpline = new Map<string, AgentNode[]>();
  for (const agent of agents) {
    if (!agent.upline_id) continue;
    if (!childrenByUpline.has(agent.upline_id)) childrenByUpline.set(agent.upline_id, []);
    childrenByUpline.get(agent.upline_id)!.push(agent);
  }
  return childrenByUpline;
}

function collectDescendants(rootId: string, childrenByUpline: Map<string, AgentNode[]>) {
  const descendants: AgentNode[] = [];
  const stack = [...(childrenByUpline.get(rootId) ?? [])];

  while (stack.length > 0) {
    const current = stack.pop()!;
    descendants.push(current);
    stack.push(...(childrenByUpline.get(current.id) ?? []));
  }

  return descendants;
}

function buildAgentMap(agents: AgentNode[]) {
  return new Map(agents.map((agent) => [agent.id, agent]));
}

function isDescendant(descendantId: string, ancestorId: string, agentsById: Map<string, AgentNode>) {
  let cursor = agentsById.get(descendantId);
  while (cursor?.upline_id) {
    if (cursor.upline_id === ancestorId) return true;
    cursor = agentsById.get(cursor.upline_id);
  }
  return false;
}

function getDirectBranchChild(descendantId: string, ancestorId: string, agentsById: Map<string, AgentNode>) {
  let cursor = agentsById.get(descendantId);
  let directChild: AgentNode | null = null;

  while (cursor?.upline_id) {
    const parent = agentsById.get(cursor.upline_id);
    if (!parent) return null;
    if (parent.id === ancestorId) {
      return directChild ?? cursor;
    }
    directChild = parent;
    cursor = parent;
  }

  return null;
}

function getMonthsInRange(range: TimeRange) {
  const now = new Date();
  const start = new Date(getRangeStart(range));
  const months: Date[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  while (cursor <= endMonth) {
    months.push(new Date(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return months;
}

function initialsForName(name: string) {
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function shortNameForLeaderboard(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return name;
  return `${parts[0]} ${parts[parts.length - 1][0] ?? ""}.`;
}

function toLeaderboardPostEntries(sales: SalesRow[], agentNameById: Map<string, string>, limit?: number): LeaderboardPostEntry[] {
  const byAgent = new Map<string, { ap: number; salesCount: number }>();

  for (const sale of sales) {
    const current = byAgent.get(sale.agent_id) ?? { ap: 0, salesCount: 0 };
    current.ap += Number(sale.ap);
    current.salesCount += 1;
    byAgent.set(sale.agent_id, current);
  }

  const ranked = Array.from(byAgent.entries())
    .map(([agentId, totals]) => {
      const name = agentNameById.get(agentId) ?? "Unknown agent";
      return {
        name,
        ap: totals.ap,
        salesCount: totals.salesCount,
      };
    })
    .sort((a, b) => b.ap - a.ap);

  const sliced = typeof limit === "number" ? ranked.slice(0, limit) : ranked;

  return sliced.map((entry, index) => ({
    rank: index + 1,
    name: entry.name,
    shortName: shortNameForLeaderboard(entry.name),
    initials: initialsForName(entry.name),
    ap: roundCurrency(entry.ap),
    salesCount: entry.salesCount,
  }));
}

// ─── Weekly leaders ──────────────────────────────────────────
export async function getWeeklyLeaders(currentAgentId?: string): Promise<LeaderboardEntry[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.rpc("get_weekly_leaders", { lim: 10 });
  if (error || !data) return [];

  return (data as { id: string; name: string; ap: number; sales_count: number }[]).map(
    (row, i) => ({
      rank: i + 1,
      name: row.name,
      subtitle: `${row.sales_count} ${row.sales_count === 1 ? "sale" : "sales"}`,
      value: fmt(row.ap),
      tone: tone(i + 1),
      badge: row.id === currentAgentId ? "(you)" : undefined,
    })
  );
}

// ─── Monthly leaders ─────────────────────────────────────────
export async function getMonthlyLeaders(currentAgentId?: string): Promise<LeaderboardEntry[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("agent_monthly_ap")
    .select("agent_id, name, ap, sales_count")
    .gt("ap", 0)
    .order("ap", { ascending: false })
    .limit(10);

  if (error || !data) return [];

  return (data as { agent_id: string; name: string; ap: number; sales_count: number }[]).map(
    (row, i) => ({
      rank: i + 1,
      name: row.name,
      subtitle: `${row.sales_count} ${row.sales_count === 1 ? "sale" : "sales"}`,
      value: fmt(row.ap),
      tone: tone(i + 1),
      badge: row.agent_id === currentAgentId ? "(you)" : undefined,
    })
  );
}

// ─── Latest sale ─────────────────────────────────────────────
export async function getLatestSale() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("sales")
    .select("ap, carrier, agents(name)")
    .order("sold_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  const row = data as unknown as { ap: number; carrier: string; agents: { name: string } | null };
  const agentName = row.agents?.name ?? "Someone";
  const parts = agentName.split(" ");
  const initials = parts.map((p: string) => p[0]).join("").slice(0, 2).toUpperCase();

  return { agentName, initials, carrier: row.carrier, ap: row.ap };
}

// ─── Goals for current user ──────────────────────────────────
async function getGoal(agentId: string, type: string): Promise<{ ap: number; target: number; pct: number } | null> {
  const supabase = createServiceClient();
  const today = new Date().toISOString().slice(0, 10);

  const [goalRes, apRes] = await Promise.all([
    supabase
      .from("goals")
      .select("target")
      .eq("agent_id", agentId)
      .eq("type", type)
      .lte("period_start", today)
      .gte("period_end", today)
      .maybeSingle(),
    supabase
      .from("agent_monthly_ap")
      .select("ap")
      .eq("agent_id", agentId)
      .maybeSingle(),
  ]);

  if (!goalRes.data) return null;
  const target = Number(goalRes.data.target);
  const ap = Number(apRes.data?.ap ?? 0);
  return { ap, target, pct: goalPct(ap, target) };
}

async function getTeamGoalProgress(agentId: string): Promise<GoalProgress | null> {
  const supabase = createServiceClient();
  const today = new Date().toISOString().slice(0, 10);

  const [goalRes, metricsRes] = await Promise.all([
    supabase
      .from("goals")
      .select("target")
      .eq("agent_id", agentId)
      .eq("type", "team_ap")
      .lte("period_start", today)
      .gte("period_end", today)
      .maybeSingle(),
    supabase.rpc("get_team_metrics", { root_id: agentId }),
  ]);

  if (!goalRes.data) return null;
  const target = Number(goalRes.data.target);
  const ap = Number((metricsRes.data as { team_ap: number }[] | null)?.[0]?.team_ap ?? 0);
  return { ap, target, pct: goalPct(ap, target) };
}

// ─── Welcome page ────────────────────────────────────────────
export async function getWelcomeData(agentId: string) {
  const [weeklyLeaders, monthlyLeaders, latestSale, salesGoal, teamGoal] = await Promise.all([
    getWeeklyLeaders(agentId),
    getMonthlyLeaders(agentId),
    getLatestSale(),
    getGoal(agentId, "sales_ap"),
    getTeamGoalProgress(agentId),
  ]);
  return { weeklyLeaders, monthlyLeaders, latestSale, salesGoal, teamGoal };
}

// ─── Goals page ──────────────────────────────────────────────
export async function getGoalsData(agentId: string) {
  const supabase = createServiceClient();
  const today = new Date().toISOString().slice(0, 10);

  const [salesGoal, teamGoal, growthGoalRes, metricsRes] = await Promise.all([
    getGoal(agentId, "sales_ap"),
    getTeamGoalProgress(agentId),
    supabase
      .from("goals")
      .select("target, period_end")
      .eq("agent_id", agentId)
      .eq("type", "team_growth")
      .lte("period_start", today)
      .gte("period_end", today)
      .maybeSingle(),
    supabase.rpc("get_team_metrics", { root_id: agentId }),
  ]);

  const growthTarget = Number(growthGoalRes.data?.target ?? 0);
  const teamCount = Number((metricsRes.data as { total_team: number }[] | null)?.[0]?.total_team ?? 0);
  const teamGrowth = growthGoalRes.data
    ? {
        count: teamCount,
        target: growthTarget,
        pct: goalPct(teamCount, growthTarget),
        deadline: growthGoalRes.data.period_end as string,
      }
    : null;

  return { salesGoal, teamGoal, teamGrowth };
}

// ─── Team page ───────────────────────────────────────────────
export async function getTeamData(agentId: string, range: TimeRange = "30d") {
  const supabase = createServiceClient();
  const rangeStart = getRangeStart(range);

  const { data: agentsData } = await supabase
    .from("agents")
    .select("id, name, upline_id, comp_percentage");

  const agents = (agentsData ?? []) as AgentNode[];
  const childrenByUpline = buildChildrenMap(agents);
  const descendants = collectDescendants(agentId, childrenByUpline);
  const directAgents = (childrenByUpline.get(agentId) ?? []).length;
  const descendantIds = descendants.map((agent) => agent.id);
  const idsForGrowth = Array.from(new Set([agentId, ...descendantIds]));

  const today = new Date().toISOString().slice(0, 10);
  const [salesRes, activityRes, compGuide, teamGoalRes] = await Promise.all([
    descendantIds.length > 0
      ? supabase
          .from("sales")
          .select("agent_id, carrier, product, ap, sold_at")
          .in("agent_id", descendantIds)
          .gte("sold_at", rangeStart)
      : Promise.resolve({ data: [] as SalesRow[], error: null }),
    descendantIds.length > 0
      ? supabase
          .from("activity")
          .select("agent_id, dials, conversations, appointments, presentations")
          .in("agent_id", descendantIds)
          .gte("date", rangeStart.slice(0, 10))
      : Promise.resolve({ data: [] as ActivityRow[], error: null }),
    getCompGuideData(),
    supabase
      .from("goals")
      .select("target")
      .eq("agent_id", agentId)
      .eq("type", "team_ap")
      .lte("period_start", today)
      .gte("period_end", today)
      .maybeSingle(),
  ]);
  const teamGoalTarget = teamGoalRes.data ? Number(teamGoalRes.data.target) : null;
  const sales = (salesRes.data ?? []) as SalesRow[];
  const activity = (activityRes.data ?? []) as ActivityRow[];

  const ownSalesByAgent = new Map<string, { ap: number; salesCount: number }>();
  for (const sale of sales) {
    const current = ownSalesByAgent.get(sale.agent_id) ?? { ap: 0, salesCount: 0 };
    current.ap += Number(sale.ap);
    current.salesCount += 1;
    ownSalesByAgent.set(sale.agent_id, current);
  }

  const activityByAgent = new Map<string, { dials: number; conversations: number; appointments: number; presentations: number }>();
  for (const row of activity) {
    const current = activityByAgent.get(row.agent_id) ?? { dials: 0, conversations: 0, appointments: 0, presentations: 0 };
    current.dials += Number(row.dials);
    current.conversations += Number(row.conversations);
    current.appointments += Number(row.appointments);
    current.presentations += Number(row.presentations);
    activityByAgent.set(row.agent_id, current);
  }

  const totalApByAgent = new Map<string, number>();
  function computeSubtreeAp(agentNodeId: string): number {
    const cached = totalApByAgent.get(agentNodeId);
    if (cached !== undefined) return cached;

    const ownAp = ownSalesByAgent.get(agentNodeId)?.ap ?? 0;
    const childAp = (childrenByUpline.get(agentNodeId) ?? []).reduce((sum, child) => sum + computeSubtreeAp(child.id), 0);
    const total = ownAp + childAp;
    totalApByAgent.set(agentNodeId, total);
    return total;
  }

  const agentNameById = new Map(agents.map((agent) => [agent.id, agent.name]));
  const teamAgents = descendants
    .map((agent) => {
      const own = ownSalesByAgent.get(agent.id) ?? { ap: 0, salesCount: 0 };
      const kpis = activityByAgent.get(agent.id) ?? { dials: 0, conversations: 0, appointments: 0, presentations: 0 };
      return {
        id: agent.id,
        name: agent.name,
        uplineName: agent.upline_id === agentId ? "You" : (agentNameById.get(agent.upline_id ?? "") ?? "—"),
        directCount: (childrenByUpline.get(agent.id) ?? []).length,
        teamAP: computeSubtreeAp(agent.id),
        ownAP: own.ap,
        salesCount: own.salesCount,
        dials: kpis.dials,
        conversations: kpis.conversations,
        appointments: kpis.appointments,
        presentations: kpis.presentations,
      } satisfies TeamAgentRecord;
    })
    .sort((a, b) => b.ownAP - a.ownAP);

  const months = getMonthsInRange(range);
  const apByMonth = new Map<string, number>();
  for (const sale of sales) {
    const key = new Date(sale.sold_at).toISOString().slice(0, 7);
    apByMonth.set(key, (apByMonth.get(key) ?? 0) + Number(sale.ap));
  }
  if (idsForGrowth.includes(agentId)) {
    const { data: rootSales } = await supabase
      .from("sales")
      .select("agent_id, ap, sold_at")
      .eq("agent_id", agentId)
      .gte("sold_at", rangeStart);
    for (const sale of ((rootSales ?? []) as SalesRow[])) {
      const key = new Date(sale.sold_at).toISOString().slice(0, 7);
      apByMonth.set(key, (apByMonth.get(key) ?? 0) + Number(sale.ap));
    }
  }
  const monthValues = months.map((month) => {
    const key = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
    return apByMonth.get(key) ?? 0;
  });
  const maxMonth = Math.max(...monthValues, teamGoalTarget ?? 0, 1);
  const growthBars = months.map((month, index) => {
    const amount = monthValues[index];
    return [
      month.toLocaleDateString("en-US", { month: "short" }),
      amount === 0 ? "$0" : fmt(amount),
      Math.round((amount / maxMonth) * 85 + 5),
    ] as [string, string, number];
  });
  const goalBarHeight = teamGoalTarget
    ? Math.min(Math.round((teamGoalTarget / maxMonth) * 85 + 5), 95)
    : null;

  const totalTeam = descendants.length;
  const teamAP = sales.reduce((sum, sale) => sum + Number(sale.ap), 0);
  const activeWriters = new Set(sales.map((sale) => sale.agent_id)).size;
  const agentsById = buildAgentMap(agents);
  const viewerComp = Number(agentsById.get(agentId)?.comp_percentage ?? 80);
  const guideByKey = new Map(compGuide.map((row) => [normalizeCompRate(row.carrier, row.product), row.baseRate]));
  const totalOverrides = roundCurrency(
    sales.reduce((sum, sale) => {
      const branchAgent = getDirectBranchChild(sale.agent_id, agentId, agentsById);
      if (!branchAgent) return sum;

      const branchComp = Number(branchAgent.comp_percentage ?? 80);
      const overrideDelta = Math.max(viewerComp - branchComp, 0);
      if (overrideDelta <= 0) return sum;

      const baseRate = guideByKey.get(normalizeCompRate(sale.carrier ?? "", sale.product ?? "")) ?? 100;
      return sum + Number(sale.ap) * pct(baseRate) * pct(overrideDelta);
    }, 0)
  );

  return {
    metrics: {
      totalTeam,
      directAgents,
      teamAP,
      activeWriters,
      totalOverrides,
    },
    growthBars,
    goalBarHeight,
    teamGoalTarget,
    teamAgents,
    rangeLabel: getRangeLabel(range),
  };
}

export async function getTeamAccessData(agentId: string): Promise<TeamAccessData> {
  const supabase = createServiceClient();
  const { data } = await supabase.rpc("get_team_metrics", { root_id: agentId });

  const metrics = (data as { direct_agents: number }[] | null)?.[0];
  const directAgents = Number(metrics?.direct_agents ?? 0);

  return {
    teamUnlocked: directAgents > 0,
    directAgents,
  };
}

// ─── Agency page ─────────────────────────────────────────────
export async function getAgencyData(range: TimeRange = "30d", currentAgentId?: string) {
  const supabase = createServiceClient();
  const rangeStart = getRangeStart(range);

  const [agentsRes, salesRes] = await Promise.all([
    supabase.from("agents").select("id, name, upline_id"),
    supabase
      .from("sales")
      .select("agent_id, ap, sold_at")
      .gte("sold_at", rangeStart),
  ]);

  const agents = (agentsRes.data ?? []) as AgentNode[];
  const sales = (salesRes.data ?? []) as SalesRow[];
  const childrenByUpline = buildChildrenMap(agents);

  const ownSalesByAgent = new Map<string, { ap: number; salesCount: number }>();
  for (const sale of sales) {
    const current = ownSalesByAgent.get(sale.agent_id) ?? { ap: 0, salesCount: 0 };
    current.ap += Number(sale.ap);
    current.salesCount += 1;
    ownSalesByAgent.set(sale.agent_id, current);
  }

  const subtreeApByAgent = new Map<string, number>();
  const subtreeWritersByAgent = new Map<string, Set<string>>();
  const subtreeSalesCountByAgent = new Map<string, number>();

  function computeAgencySubtree(agentId: string) {
    if (subtreeApByAgent.has(agentId)) {
      return {
        ap: subtreeApByAgent.get(agentId)!,
        writers: subtreeWritersByAgent.get(agentId)!,
        salesCount: subtreeSalesCountByAgent.get(agentId)!,
      };
    }

    const own = ownSalesByAgent.get(agentId) ?? { ap: 0, salesCount: 0 };
    const writers = new Set<string>(own.salesCount > 0 ? [agentId] : []);
    let ap = own.ap;
    let salesCount = own.salesCount;

    for (const child of childrenByUpline.get(agentId) ?? []) {
      const childStats = computeAgencySubtree(child.id);
      ap += childStats.ap;
      salesCount += childStats.salesCount;
      for (const writer of childStats.writers) writers.add(writer);
    }

    subtreeApByAgent.set(agentId, ap);
    subtreeWritersByAgent.set(agentId, writers);
    subtreeSalesCountByAgent.set(agentId, salesCount);

    return { ap, writers, salesCount };
  }

  const agentLeaderboard = agents
    .map((agent) => {
      const own = ownSalesByAgent.get(agent.id) ?? { ap: 0, salesCount: 0 };
      return {
        id: agent.id,
        name: agent.name,
        ap: own.ap,
        salesCount: own.salesCount,
      };
    })
    .filter((agent) => agent.ap > 0)
    .sort((a, b) => b.ap - a.ap)
    .slice(0, 10)
    .map((agent, i) => ({
      rank: i + 1,
      name: agent.name,
      subtitle: `${agent.salesCount} sales`,
      value: fmt(agent.ap),
      tone: tone(i + 1),
      badge: agent.id === currentAgentId ? "(you)" : undefined,
    }));

  const teamLeaderboard = agents
    .map((agent) => {
      const stats = computeAgencySubtree(agent.id);
      return {
        id: agent.id,
        name: agent.name,
        teamAP: stats.ap,
        writingAgents: stats.writers.size,
        salesCount: stats.salesCount,
      };
    })
    .filter((agent) => agent.teamAP > 0)
    .sort((a, b) => b.teamAP - a.teamAP)
    .slice(0, 10)
    .map((agent, i) => ({
      rank: i + 1,
      name: agent.name,
      subtitle: `${agent.writingAgents} writing agents · ${agent.salesCount} sales`,
      value: fmt(agent.teamAP),
      tone: tone(i + 1),
    }));

  const totalSales = sales.length;
  const agencyAP = sales.reduce((sum, sale) => sum + Number(sale.ap), 0);
  const activeWriters = new Set(sales.map((sale) => sale.agent_id)).size;

  return {
    metrics: { totalSales, agencyAP, activeWriters },
    agentLeaderboard,
    teamLeaderboard,
    rangeLabel: getRangeLabel(range),
  };
}

// ─── Admin page ──────────────────────────────────────────────
export async function getAdminData() {
  const supabase = createServiceClient();
  const [{ data, error }, { data: agentOptions }, leaderboardPosts] = await Promise.all([
    supabase.rpc("get_admin_agents"),
    supabase.from("agents").select("id, name, upline_id").order("name"),
    getLeaderboardPostsData(),
  ]);
  if (error || !data) {
    return {
      metrics: { totalAP: 0, totalSales: 0, activeAgents: 0 },
      agents: [] as AdminAgentRecord[],
      uplineOptions: [],
      leaderboardPosts: { cards: [] } as LeaderboardPostsData,
    };
  }

  type AdminRow = {
    id: string;
    name: string;
    email: string;
    lifetime_ap: number;
    lifetime_sales: number;
    comp_percentage: number;
    role: string;
    upline_name: string;
    is_new: boolean;
  };

  const rows = (data as AdminRow[]).filter((row) => !!row.name);
  const totalAP     = rows.reduce((s, r) => s + Number(r.lifetime_ap), 0);
  const totalSales  = rows.reduce((s, r) => s + Number(r.lifetime_sales), 0);
  const activeAgents = rows.filter((r) => r.lifetime_sales > 0).length;

  const agentMetaById = new Map(
    (((agentOptions ?? []) as { id: string; name: string; upline_id: string | null }[])).map((agent) => [
      agent.id,
      agent,
    ])
  );

  const agents: AdminAgentRecord[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    lifetimeAP: fmt(r.lifetime_ap),
    lifetimeSales: String(r.lifetime_sales),
    compPercentage: Number(r.comp_percentage ?? 80),
    role: r.role,
    uplineId: agentMetaById.get(r.id)?.upline_id ?? null,
    uplineName: r.upline_name,
    isNew: r.is_new,
  }));

  const uplineOptions = ((agentOptions ?? []) as { id: string; name: string }[]).filter((agent) => agent.name.trim().length > 0);

  return { metrics: { totalAP, totalSales, activeAgents }, agents, uplineOptions, leaderboardPosts };
}

export async function getLeaderboardPostsData(): Promise<LeaderboardPostsData> {
  const supabase = createServiceClient();
  const now = new Date();
  const dayStart = startOfDay(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);
  const earliestStart = new Date(Math.min(dayStart.getTime(), weekStart.getTime(), monthStart.getTime()));

  const [{ data: salesData, error: salesError }, { data: agentsData, error: agentsError }] = await Promise.all([
    supabase
      .from("sales")
      .select("agent_id, ap, sold_at")
      .gte("sold_at", earliestStart.toISOString())
      .order("sold_at", { ascending: false }),
    supabase.from("agents").select("id, name"),
  ]);

  if (salesError || agentsError) {
    return { cards: [] };
  }

  const agentNameById = new Map(((agentsData ?? []) as { id: string; name: string }[]).map((agent) => [agent.id, agent.name]));
  const sales = (salesData ?? []) as SalesRow[];

  const dailySales = sales.filter((sale) => new Date(sale.sold_at) >= dayStart);
  const weeklySales = sales.filter((sale) => new Date(sale.sold_at) >= weekStart);
  const monthlySales = sales.filter((sale) => new Date(sale.sold_at) >= monthStart);

  const buildCard = (
    key: LeaderboardPostCard["key"],
    title: string,
    periodLabel: string,
    sourceSales: SalesRow[],
    emptyMessage: string,
    limit?: number,
  ): LeaderboardPostCard => ({
    key,
    title,
    periodLabel,
    shareLabel: "ready to share on Instagram (1080×1350)",
    entries: toLeaderboardPostEntries(sourceSales, agentNameById, limit),
    totalAp: roundCurrency(sourceSales.reduce((sum, sale) => sum + Number(sale.ap), 0)),
    writingAgents: new Set(sourceSales.map((sale) => sale.agent_id)).size,
    ready: sourceSales.length > 0,
    emptyMessage,
  });

  return {
    cards: [
      buildCard(
        "daily",
        "Daily leaderboard post",
        format(now, "MMMM d, yyyy"),
        dailySales,
        "No sales have been submitted in this daily window yet. The post will appear here once the first sale comes in.",
        12,
      ),
      buildCard(
        "weekly",
        "Weekly leaderboard post",
        `${format(weekStart, "MMM d")} – ${format(now, "MMM d, yyyy")}`,
        weeklySales,
        "No sales have been submitted in this weekly window yet.",
        12,
      ),
      buildCard(
        "monthly",
        "Monthly leaderboard post",
        format(now, "MMMM yyyy"),
        monthlySales,
        "No sales have been submitted in this monthly window yet.",
        20,
      ),
    ],
  };
}

export async function getCompGuideData(): Promise<CompGuideRecord[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("carrier_product_comp_rates")
    .select("id, carrier, product, base_rate")
    .order("carrier")
    .order("product");

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    carrier: row.carrier,
    product: row.product,
    baseRate: Number(row.base_rate),
  }));
}

export async function getTeamAgentCompensation(
  viewerId: string,
  subjectAgentId: string,
  range: TimeRange = "30d",
  options?: { canViewAny?: boolean }
): Promise<TeamAgentCompensationDetail | null> {
  const supabase = createServiceClient();
  const rangeStart = getRangeStart(range);

  const [{ data: agentsData, error: agentsError }, compGuide] = await Promise.all([
    supabase.from("agents").select("id, name, upline_id, comp_percentage"),
    getCompGuideData(),
  ]);

  let normalizedAgentsData = agentsData;
  if (agentsError) {
    console.warn("[team-comp] agents query fallback", {
      viewerId,
      subjectAgentId,
      error: agentsError.message,
    });

    const fallbackAgents = await supabase
      .from("agents")
      .select("id, name, upline_id");

    if (fallbackAgents.error) {
      console.error("[team-comp] agents fallback query failed", {
        viewerId,
        subjectAgentId,
        error: fallbackAgents.error.message,
      });
      return null;
    }

    normalizedAgentsData = (fallbackAgents.data ?? []).map((agent) => ({
      ...agent,
      comp_percentage: 80,
    }));
  }

  const agents = (normalizedAgentsData ?? []) as AgentNode[];
  const agentsById = buildAgentMap(agents);
  const viewer = agentsById.get(viewerId);
  const subject = agentsById.get(subjectAgentId);
  const canViewAny = options?.canViewAny ?? false;

  if (!viewer || !subject) {
    console.error("[team-comp] missing agent", {
      viewerId,
      subjectAgentId,
      hasViewer: Boolean(viewer),
      hasSubject: Boolean(subject),
      canViewAny,
      loadedAgentCount: agents.length,
    });
    return null;
  }

  if (!canViewAny && !isDescendant(subjectAgentId, viewerId, agentsById)) {
    console.error("[team-comp] subject outside viewer downline", {
      viewerId,
      subjectAgentId,
      canViewAny,
    });
    return null;
  }

  const childrenByUpline = buildChildrenMap(agents);
  const subjectDescendants = collectDescendants(subjectAgentId, childrenByUpline);
  const subjectSubtreeIds = [subjectAgentId, ...subjectDescendants.map((agent) => agent.id)];
  const subjectNameById = new Map(subjectSubtreeIds.map((id) => [id, agentsById.get(id)?.name ?? "Unknown"]));

  const { data: salesData, error: salesError } = await supabase
    .from("sales")
    .select("id, agent_id, carrier, product, ap, sold_at, client_name")
    .in("agent_id", subjectSubtreeIds)
    .gte("sold_at", rangeStart)
    .order("sold_at", { ascending: false });

  let normalizedSalesData = salesData;
  if (salesError) {
    console.warn("[team-comp] sales query fallback", {
      viewerId,
      subjectAgentId,
      range,
      error: salesError.message,
    });

    const fallbackSales = await supabase
      .from("sales")
      .select("id, agent_id, carrier, product, ap, sold_at")
      .in("agent_id", subjectSubtreeIds)
      .gte("sold_at", rangeStart)
      .order("sold_at", { ascending: false });

    if (fallbackSales.error) {
      console.error("[team-comp] sales query failed", {
        viewerId,
        subjectAgentId,
        range,
        rangeStart,
        subjectSubtreeIds,
        error: fallbackSales.error.message,
      });
      return null;
    }

    normalizedSalesData = (fallbackSales.data ?? []).map((sale) => ({
      ...sale,
      client_name: null,
    }));
  }

  if (!normalizedSalesData) {
    console.error("[team-comp] sales query failed", {
      viewerId,
      subjectAgentId,
      range,
      rangeStart,
      subjectSubtreeIds,
      error: "No sales data returned",
    });
    return null;
  }

  const guideByKey = new Map(compGuide.map((row) => [normalizeCompRate(row.carrier, row.product), row.baseRate]));
  const subjectComp = Number(subject.comp_percentage ?? 80);
  const viewerComp = Number(viewer.comp_percentage ?? 80);
  const branchAgent =
    subject.upline_id && isDescendant(subjectAgentId, viewerId, agentsById)
      ? getDirectBranchChild(subjectAgentId, viewerId, agentsById) ?? subject
      : subject;
  const branchComp = Number(branchAgent.comp_percentage ?? subjectComp);
  const overrideDelta = Math.max(viewerComp - branchComp, 0);
  const sales = (normalizedSalesData ?? []) as SalesRow[];

  console.log("[team-comp] resolved", {
    viewerId,
    subjectAgentId,
    range,
    canViewAny,
    subjectSubtreeIds,
    subjectComp,
    viewerComp,
    branchAgentId: branchAgent.id,
    branchComp,
    overrideDelta,
    salesCount: sales.length,
  });

  const toLineItem = (sale: SalesRow, compPercentage: number, saleAgentName: string): CompensationLineItem => {
    const baseRate = guideByKey.get(normalizeCompRate(sale.carrier ?? "", sale.product ?? "")) ?? 100;
    const effectiveRate = roundCurrency(baseRate * pct(compPercentage));
    const estimatedTotal = roundCurrency(Number(sale.ap) * pct(baseRate) * pct(compPercentage));
    const estimatedAdvance = roundCurrency(estimatedTotal * 0.75);

    return {
      saleId: sale.id ?? `${sale.agent_id}-${sale.sold_at}`,
      saleAgentId: sale.agent_id,
      saleAgentName,
      clientName: sale.client_name?.trim() || "Unnamed client",
      carrier: sale.carrier ?? "Unknown carrier",
      product: sale.product ?? "Unknown product",
      ap: Number(sale.ap),
      soldAt: sale.sold_at,
      baseRate,
      compPercentage,
      effectiveRate,
      estimatedTotal,
      estimatedAdvance,
    };
  };

  const commissionRows = sales
    .filter((sale) => sale.agent_id === subjectAgentId)
    .map((sale) => toLineItem(sale, subjectComp, subject.name));

  const overrideRows = overrideDelta > 0
    ? sales.map((sale) => toLineItem(sale, overrideDelta, subjectNameById.get(sale.agent_id) ?? subject.name))
    : [];

  const ownApTotal = commissionRows.reduce((sum, row) => sum + row.ap, 0);
  const ownCommissionTotal = commissionRows.reduce((sum, row) => sum + row.estimatedTotal, 0);
  const ownAdvanceTotal = commissionRows.reduce((sum, row) => sum + row.estimatedAdvance, 0);
  const overrideApTotal = overrideRows.reduce((sum, row) => sum + row.ap, 0);
  const overrideTotal = overrideRows.reduce((sum, row) => sum + row.estimatedTotal, 0);
  const overrideAdvanceTotal = overrideRows.reduce((sum, row) => sum + row.estimatedAdvance, 0);

  return {
    subject: {
      id: subject.id,
      name: subject.name,
      compPercentage: subjectComp,
    },
    viewer: {
      id: viewer.id,
      name: viewer.name,
      compPercentage: viewerComp,
    },
    branchAgent: {
      id: branchAgent.id,
      name: branchAgent.name,
      compPercentage: branchComp,
      isSelf: branchAgent.id === subjectAgentId,
    },
    summary: {
      ownSalesCount: commissionRows.length,
      ownApTotal: roundCurrency(ownApTotal),
      ownCommissionTotal: roundCurrency(ownCommissionTotal),
      ownAdvanceTotal: roundCurrency(ownAdvanceTotal),
      overrideSalesCount: overrideRows.length,
      overrideApTotal: roundCurrency(overrideApTotal),
      overrideDelta: roundCurrency(overrideDelta),
      overrideTotal: roundCurrency(overrideTotal),
      overrideAdvanceTotal: roundCurrency(overrideAdvanceTotal),
    },
    commissions: commissionRows,
    overrides: overrideRows,
  };
}

// ─── Competitions page ───────────────────────────────────────
export async function getCompetitionsData(): Promise<Competition[]> {
  const supabase = createServiceClient();

  const [compsRes, apRes] = await Promise.all([
    supabase
      .from("competitions")
      .select(`
        id, name, description, prize, start_date, end_date, status, pinned,
        competition_teams (
          id, name, color,
          competition_members ( agents ( name ) )
        ),
        competition_results ( winning_team_id )
      `)
      .order("created_at", { ascending: false }),
    supabase.from("competition_team_ap").select("*"),
  ]);

  if (compsRes.error || !compsRes.data) return [];

  type RawComp = {
    id: string; name: string; description: string | null; prize: string | null;
    start_date: string; end_date: string; status: string; pinned: boolean;
    competition_teams: {
      id: string; name: string; color: string;
      competition_members: { agents: { name: string } | null }[];
    }[];
    competition_results: { winning_team_id: string | null }[];
  };

  type APRow = { team_id: string; total_ap: number; sales_count: number };
  const apMap = new Map<string, APRow>(
    ((apRes.data as APRow[]) ?? []).map((r) => [r.team_id, r])
  );

  return (compsRes.data as unknown as RawComp[]).map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    prize: c.prize,
    startDate: c.start_date,
    endDate: c.end_date,
    status: c.status,
    pinned: c.pinned,
    winningTeamId: c.competition_results[0]?.winning_team_id ?? null,
    teams: c.competition_teams.map((t) => ({
      id: t.id,
      name: t.name,
      color: t.color,
      totalAP: Number(apMap.get(t.id)?.total_ap ?? 0),
      salesCount: Number(apMap.get(t.id)?.sales_count ?? 0),
      members: t.competition_members
        .map((m) => m.agents?.name ?? "")
        .filter(Boolean),
    })),
  }));
}

export async function getProfileData(agentId: string): Promise<ProfileData | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("agents")
    .select("name, email, phone, profile_image_url, discord_user_id, discord_username, discord_global_name, discord_avatar_url, discord_connected_at")
    .eq("id", agentId)
    .maybeSingle();

  if (!error && data) {
    return {
      name: data.name,
      email: data.email,
      phone: data.phone,
      profileImageUrl: data.profile_image_url,
      discordUserId: data.discord_user_id,
      discordUsername: data.discord_username,
      discordGlobalName: data.discord_global_name,
      discordAvatarUrl: data.discord_avatar_url,
      discordConnectedAt: data.discord_connected_at,
    };
  }

  console.warn("[profile] falling back to base agent fields", {
    agentId,
    error: error?.message ?? "Unknown profile query error",
  });

  const fallback = await supabase
    .from("agents")
    .select("name, email, phone")
    .eq("id", agentId)
    .maybeSingle();

  if (fallback.error || !fallback.data) return null;

  return {
    name: fallback.data.name,
    email: fallback.data.email,
    phone: fallback.data.phone,
    profileImageUrl: null,
    discordUserId: null,
    discordUsername: null,
    discordGlobalName: null,
    discordAvatarUrl: null,
    discordConnectedAt: null,
  };
}
