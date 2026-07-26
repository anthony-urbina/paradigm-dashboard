import { auth } from "@/auth";
import { MySalesPage } from "@/components/paradigm";
import { getCurrentAgent } from "@/lib/current-agent";
import { getMySalesData, type TimeRange } from "@/lib/data";

function normalizeRange(value: string | string[] | undefined): TimeRange {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate === "7d" || candidate === "90d" || candidate === "180d" || candidate === "365d" ? candidate : "30d";
}

export default async function DashboardSalesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  const agent = await getCurrentAgent(session);
  const resolvedParams = searchParams ? await searchParams : undefined;
  const range = normalizeRange(resolvedParams?.range);

  if (!agent) {
    return (
      <MySalesPage
        sales={[]}
        compPercentage={80}
        selectedRange={range}
        rangeLabel="Last 30 days"
        metrics={{
          totalSales: 0, submittedAP: 0, avgAP: 0, twelveMonthComm: 0, nineMonthAdv: 0,
          trends: { totalSales: 0, submittedAP: 0, avgAP: 0, twelveMonthComm: 0, nineMonthAdv: 0 },
        }}
      />
    );
  }

  const { sales, compPercentage, metrics, rangeLabel } = await getMySalesData(agent.id, range);
  return (
    <MySalesPage
      sales={sales}
      compPercentage={compPercentage}
      metrics={metrics}
      selectedRange={range}
      rangeLabel={rangeLabel}
    />
  );
}
