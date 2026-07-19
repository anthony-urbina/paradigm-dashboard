import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserPlus, Search, TrendingUp, Users, DollarSign, FileText } from "lucide-react";

const agents = [
  {
    name: "Sarah Mitchell",
    initials: "SM",
    role: "Agent",
    status: "Active",
    premium: 14200,
    policies: 9,
    goal: 100000,
    currentYTD: 14200,
    joinDate: "Jan 2024",
    phone: "(555) 201-3344",
  },
  {
    name: "Carlos Vega",
    initials: "CV",
    role: "Agent",
    status: "Active",
    premium: 9800,
    policies: 7,
    goal: 80000,
    currentYTD: 9800,
    joinDate: "Mar 2024",
    phone: "(555) 402-7721",
  },
  {
    name: "Dana Park",
    initials: "DP",
    role: "Senior Agent",
    status: "Active",
    premium: 18500,
    policies: 12,
    goal: 120000,
    currentYTD: 18500,
    joinDate: "Aug 2023",
    phone: "(555) 318-0099",
  },
  {
    name: "Troy Ellis",
    initials: "TE",
    role: "Agent",
    status: "Active",
    premium: 5750,
    policies: 4,
    goal: 60000,
    currentYTD: 5750,
    joinDate: "Feb 2025",
    phone: "(555) 772-4410",
  },
  {
    name: "Maria Flores",
    initials: "MF",
    role: "Agent",
    status: "Inactive",
    premium: 0,
    policies: 0,
    goal: 60000,
    currentYTD: 0,
    joinDate: "Jan 2025",
    phone: "(555) 991-3302",
  },
];

export default function TeamPage() {
  const active = agents.filter((a) => a.status === "Active");
  const totalPremium = agents.reduce((s, a) => s + a.premium, 0);
  const totalPolicies = agents.reduce((s, a) => s + a.policies, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Team</h1>
          <p className="text-muted-foreground">Manage and track your agent downline.</p>
        </div>
        <Button size="sm">
          <UserPlus className="h-4 w-4 mr-1" />
          Add Agent
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Agents", value: agents.length, icon: Users },
          { label: "Active", value: active.length, icon: TrendingUp },
          { label: "Team Premium YTD", value: `$${totalPremium.toLocaleString()}`, icon: DollarSign },
          { label: "Team Policies YTD", value: totalPolicies, icon: FileText },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search agents..." className="pl-9" />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Premium YTD</TableHead>
                <TableHead className="text-right">Policies</TableHead>
                <TableHead>Goal Progress</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => {
                const pct = Math.min(Math.round((agent.currentYTD / agent.goal) * 100), 100);
                return (
                  <TableRow key={agent.name} className="cursor-pointer hover:bg-muted/40">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs font-semibold bg-muted">
                            {agent.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{agent.name}</div>
                          <div className="text-xs text-muted-foreground">{agent.phone}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{agent.role}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          agent.status === "Active"
                            ? "border-emerald-300 text-emerald-700 bg-emerald-50"
                            : "border-gray-300 text-gray-500"
                        }
                      >
                        {agent.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-sm">
                      ${agent.premium.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-sm">{agent.policies}</TableCell>
                    <TableCell className="min-w-[140px]">
                      <div className="flex items-center gap-2">
                        <Progress value={pct} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground w-8">{pct}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{agent.joinDate}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
