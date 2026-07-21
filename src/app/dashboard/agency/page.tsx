import { auth } from "@/auth";
import { AgencyPage } from "@/components/paradigm";
import { getCurrentAgent } from "@/lib/current-agent";
import { getAgencyData, getCompGuideData, type TimeRange } from "@/lib/data";

function normalizeRange(value: string | string[] | undefined): TimeRange {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate === "90d" || candidate === "180d" || candidate === "365d" ? candidate : "30d";
}

export default async function DashboardAgencyPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  const agent = await getCurrentAgent(session);
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const range = normalizeRange(resolvedSearchParams?.range);
  const isAdmin = agent?.role === "admin";
  const [data, compGuide] = await Promise.all([
    getAgencyData(range, agent?.id),
    isAdmin ? getCompGuideData() : Promise.resolve([]),
  ]);
  return <AgencyPage {...data} selectedRange={range} isAdmin={isAdmin} compGuide={compGuide} />;
}
