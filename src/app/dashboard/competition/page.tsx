import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trophy, Calendar, Users, Plane } from "lucide-react";

const contests = [
  {
    name: "Summit 2025 — Hawaii Trip",
    carrier: "Mutual of Omaha",
    description: "Top 10 agents by premium written qualify for an all-expenses-paid trip to Maui.",
    type: "Trip",
    deadline: "Dec 31, 2025",
    requirement: "$150,000 premium",
    currentProgress: 48250,
    target: 150000,
    status: "Active",
    prize: "Maui, Hawaii — 5 nights",
  },
  {
    name: "Q3 Blitz Contest",
    carrier: "North American",
    description: "Most policies issued July–September earns a $2,500 bonus.",
    type: "Cash Bonus",
    deadline: "Sep 30, 2025",
    requirement: "15 policies",
    currentProgress: 8,
    target: 15,
    status: "Active",
    prize: "$2,500 cash bonus",
  },
  {
    name: "Rising Star Award",
    carrier: "American Equity",
    description: "Agents with 100% growth vs prior year earn the Rising Star designation.",
    type: "Designation",
    deadline: "Dec 31, 2025",
    requirement: "100% YoY growth",
    currentProgress: 62,
    target: 100,
    status: "Active",
    prize: "Rising Star designation + plaque",
  },
];

const leaderboard = [
  { rank: 1, name: "Dana Park", initials: "DP", premium: 18500, policies: 12, trips: 2 },
  { rank: 2, name: "Sarah Mitchell", initials: "SM", premium: 14200, policies: 9, trips: 1 },
  { rank: 3, name: "Carlos Vega", initials: "CV", premium: 9800, policies: 7, trips: 0 },
  { rank: 4, name: "Troy Ellis", initials: "TE", premium: 5750, policies: 4, trips: 0 },
  { rank: 5, name: "Maria Flores", initials: "MF", premium: 0, policies: 0, trips: 0 },
];

const typeIcon: Record<string, React.ElementType> = {
  Trip: Plane,
  "Cash Bonus": Trophy,
  Designation: Trophy,
};

export default function CompetitionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Competition</h1>
        <p className="text-muted-foreground">Active contests, incentive trips, and team leaderboard.</p>
      </div>

      <Tabs defaultValue="contests">
        <TabsList>
          <TabsTrigger value="contests">Active Contests</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="contests" className="mt-4 space-y-4">
          {contests.map((contest) => {
            const pct = Math.min(Math.round((contest.currentProgress / contest.target) * 100), 100);
            const Icon = typeIcon[contest.type] ?? Trophy;
            return (
              <Card key={contest.name}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-md bg-muted">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{contest.name}</CardTitle>
                        <CardDescription className="mt-0.5">{contest.carrier} · {contest.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <Badge className="bg-black text-white text-xs">{contest.status}</Badge>
                      <Badge variant="outline" className="text-xs">{contest.type}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress toward qualification</span>
                      <span className="font-semibold">{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-2.5" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Prize</p>
                      <p className="font-medium">{contest.prize}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Requirement</p>
                      <p className="font-medium">{contest.requirement}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Deadline</p>
                        <p className="font-medium">{contest.deadline}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Team Leaderboard — YTD</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Rank</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead className="text-right">Premium YTD</TableHead>
                    <TableHead className="text-right">Policies</TableHead>
                    <TableHead className="text-right">Trips Qualified</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.map((a) => (
                    <TableRow key={a.rank}>
                      <TableCell>
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                            a.rank === 1
                              ? "bg-black text-white"
                              : a.rank === 2
                              ? "bg-[#898989] text-white"
                              : a.rank === 3
                              ? "bg-gray-200 text-gray-700"
                              : "text-muted-foreground"
                          }`}
                        >
                          {a.rank}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-xs font-semibold bg-muted">
                              {a.initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">{a.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-sm">
                        ${a.premium.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-sm">{a.policies}</TableCell>
                      <TableCell className="text-right">
                        {a.trips > 0 ? (
                          <Badge className="bg-black text-white text-xs">{a.trips}</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
