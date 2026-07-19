import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Plus, TrendingUp, Calendar } from "lucide-react";

const annualGoals = [
  {
    name: "Annual Premium Written",
    target: 100000,
    current: 48250,
    unit: "$",
    period: "Annual",
  },
  {
    name: "Policies Issued",
    target: 60,
    current: 34,
    unit: "",
    period: "Annual",
  },
  {
    name: "New Clients",
    target: 25,
    current: 12,
    unit: "",
    period: "Annual",
  },
  {
    name: "Team Recruits",
    target: 4,
    current: 1,
    unit: "",
    period: "Annual",
  },
];

const monthlyGoals = [
  {
    name: "Monthly Premium",
    target: 8500,
    current: 6200,
    unit: "$",
    period: "Monthly",
  },
  {
    name: "Policies Issued",
    target: 5,
    current: 3,
    unit: "",
    period: "Monthly",
  },
  {
    name: "Appointments Set",
    target: 20,
    current: 14,
    unit: "",
    period: "Monthly",
  },
];

function GoalCard({ goal }: { goal: typeof annualGoals[0] }) {
  const pct = Math.min(Math.round((goal.current / goal.target) * 100), 100);
  const fmt = (v: number) =>
    goal.unit === "$" ? `$${v.toLocaleString()}` : v.toString();

  const status =
    pct >= 100 ? "Achieved" : pct >= 70 ? "On Track" : pct >= 40 ? "In Progress" : "Behind";

  const statusColor: Record<string, string> = {
    Achieved: "bg-black text-white",
    "On Track": "bg-emerald-100 text-emerald-800",
    "In Progress": "bg-gray-100 text-gray-800",
    Behind: "bg-red-100 text-red-700",
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">{goal.name}</CardTitle>
            <CardDescription className="text-xs mt-0.5">{goal.period} Goal</CardDescription>
          </div>
          <Badge className={`text-xs ${statusColor[status]}`}>{status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={pct} className="h-2.5" />
        <div className="flex justify-between items-center">
          <div>
            <span className="text-2xl font-bold">{fmt(goal.current)}</span>
            <span className="text-sm text-muted-foreground ml-1">/ {fmt(goal.target)}</span>
          </div>
          <div className="flex items-center gap-1 text-sm font-semibold">
            <TrendingUp className="h-4 w-4" />
            {pct}%
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {fmt(goal.target - goal.current)} remaining to reach goal
        </p>
      </CardContent>
    </Card>
  );
}

export default function GoalsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Goals</h1>
          <p className="text-muted-foreground">Track your personal and team production targets.</p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Set Goal
        </Button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Goals On Track", value: "2 / 4", icon: Target },
          { label: "Best Month", value: "March", icon: TrendingUp },
          { label: "Days Remaining", value: "164", icon: Calendar },
        ].map((s) => (
          <Card key={s.label} className="text-center">
            <CardContent className="pt-5 pb-4">
              <s.icon className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <div className="text-xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="annual">
        <TabsList>
          <TabsTrigger value="annual">Annual Goals</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="annual" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {annualGoals.map((g) => (
              <GoalCard key={g.name} goal={g} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {monthlyGoals.map((g) => (
              <GoalCard key={g.name} goal={g} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
