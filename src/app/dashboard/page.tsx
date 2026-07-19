import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Users,
  DollarSign,
  FileText,
  Target,
  Trophy,
} from "lucide-react";

const stats = [
  {
    title: "Total Premium Written",
    value: "$48,250",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
  },
  {
    title: "Policies Issued",
    value: "34",
    change: "+4",
    trend: "up",
    icon: FileText,
  },
  {
    title: "Active Agents",
    value: "8",
    change: "0",
    trend: "neutral",
    icon: Users,
  },
  {
    title: "Monthly Goal",
    value: "72%",
    change: "on track",
    trend: "up",
    icon: Target,
  },
];

const recentActivity = [
  { agent: "Sarah Mitchell", action: "Policy issued", client: "J. Thompson", premium: "$3,200", time: "2h ago" },
  { agent: "Carlos Vega", action: "Application submitted", client: "M. Rivera", premium: "$1,800", time: "4h ago" },
  { agent: "Dana Park", action: "Policy issued", client: "B. Johnson", premium: "$5,500", time: "Yesterday" },
  { agent: "Troy Ellis", action: "Application submitted", client: "A. Williams", premium: "$2,100", time: "Yesterday" },
  { agent: "Sarah Mitchell", action: "Policy issued", client: "K. Davis", premium: "$4,700", time: "2 days ago" },
];

const goalProgress = [
  { label: "Annual Premium", current: 48250, target: 100000, pct: 48 },
  { label: "Policies Issued", current: 34, target: 60, pct: 57 },
  { label: "New Clients", current: 12, target: 25, pct: 48 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back — here&apos;s your production overview.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 mt-1">
                {stat.trend === "up" && <TrendingUp className="h-3 w-3 text-emerald-600" />}
                <span className="text-xs text-muted-foreground">{stat.change} this month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{item.agent}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.action} · {item.client}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <span className="text-sm font-semibold">{item.premium}</span>
                    <span className="text-xs text-muted-foreground w-16">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Goal Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Goal Progress</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-5">
            {goalProgress.map((g) => (
              <div key={g.label} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{g.label}</span>
                  <Badge variant="outline" className="text-xs">{g.pct}%</Badge>
                </div>
                <Progress value={g.pct} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{typeof g.current === "number" && g.current > 999 ? `$${g.current.toLocaleString()}` : g.current}</span>
                  <span>of {typeof g.target === "number" && g.target > 999 ? `$${g.target.toLocaleString()}` : g.target}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
