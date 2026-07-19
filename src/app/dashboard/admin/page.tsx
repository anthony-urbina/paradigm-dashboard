import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  Users,
  Shield,
  Bell,
  UserPlus,
  MoreHorizontal,
  Trash2,
  Edit,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const users = [
  { name: "Dom Scalice", initials: "DS", email: "dom@paradigmfinancial.com", role: "Admin", status: "Active", lastLogin: "Today" },
  { name: "Dana Park", initials: "DP", email: "dana@paradigmfinancial.com", role: "Agent", status: "Active", lastLogin: "Today" },
  { name: "Sarah Mitchell", initials: "SM", email: "sarah@paradigmfinancial.com", role: "Agent", status: "Active", lastLogin: "Yesterday" },
  { name: "Carlos Vega", initials: "CV", email: "carlos@paradigmfinancial.com", role: "Agent", status: "Active", lastLogin: "2 days ago" },
  { name: "Troy Ellis", initials: "TE", email: "troy@paradigmfinancial.com", role: "Agent", status: "Active", lastLogin: "3 days ago" },
  { name: "Maria Flores", initials: "MF", email: "maria@paradigmfinancial.com", role: "Agent", status: "Inactive", lastLogin: "1 month ago" },
];

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
        <p className="text-muted-foreground">Manage users, roles, and platform settings.</p>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">
            <Users className="h-3.5 w-3.5 mr-1.5" />
            Users
          </TabsTrigger>
          <TabsTrigger value="roles">
            <Shield className="h-3.5 w-3.5 mr-1.5" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-3.5 w-3.5 mr-1.5" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-3.5 w-3.5 mr-1.5" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Users */}
        <TabsContent value="users" className="mt-4">
          <div className="flex justify-end mb-3">
            <Button size="sm">
              <UserPlus className="h-4 w-4 mr-1" />
              Invite Agent
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.email}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs font-semibold bg-muted">
                              {user.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">{user.name}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            user.role === "Admin"
                              ? "bg-black text-white text-xs"
                              : "bg-muted text-foreground text-xs"
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            user.status === "Active"
                              ? "border-emerald-300 text-emerald-700 bg-emerald-50 text-xs"
                              : "border-gray-300 text-gray-500 text-xs"
                          }
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{user.lastLogin}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit user
                            </DropdownMenuItem>
                            <DropdownMenuItem>Change role</DropdownMenuItem>
                            <DropdownMenuItem>Reset password</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove user
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles */}
        <TabsContent value="roles" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                role: "Admin",
                description: "Full access to all features including user management, settings, and all agent data.",
                permissions: ["Manage users", "View all agent data", "Edit agency profile", "Configure settings", "Manage contests"],
              },
              {
                role: "Agent",
                description: "Access to personal dashboard, goals, team view, and resources.",
                permissions: ["View own dashboard", "Set personal goals", "View team leaderboard", "Access guide", "View own competition progress"],
              },
            ].map((r) => (
              <Card key={r.role}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <CardTitle className="text-base">{r.role}</CardTitle>
                  </div>
                  <CardDescription>{r.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {r.permissions.map((p) => (
                      <li key={p} className="flex items-center gap-2 text-sm">
                        <div className="h-1.5 w-1.5 rounded-full bg-foreground" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="mt-4">
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle className="text-base">Notification Preferences</CardTitle>
              <CardDescription>Control which events trigger email and in-app alerts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "New policy submitted", description: "Notify when an agent submits a new policy" },
                { label: "Goal milestone reached", description: "Notify when 50%, 75%, or 100% of a goal is hit" },
                { label: "Contest qualification", description: "Notify when an agent qualifies for a contest" },
                { label: "New agent joined", description: "Notify when a new agent accepts their invitation" },
                { label: "License expiring soon", description: "Notify 60 days before any license expires" },
                { label: "Monthly summary report", description: "Send a monthly production summary on the 1st" },
              ].map((n, i) => (
                <div key={n.label}>
                  {i > 0 && <Separator className="mb-4" />}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">{n.label}</p>
                      <p className="text-xs text-muted-foreground">{n.description}</p>
                    </div>
                    <Switch defaultChecked={i < 4} />
                  </div>
                </div>
              ))}
              <Button className="mt-2">Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="mt-4">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-3xl">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Platform Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Platform Name</Label>
                  <Input defaultValue="Paradigm Dashboard" />
                </div>
                <div className="space-y-1.5">
                  <Label>Fiscal Year Start</Label>
                  <Select defaultValue="january">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="january">January</SelectItem>
                      <SelectItem value="july">July</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Default Currency</Label>
                  <Select defaultValue="usd">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button>Save Settings</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions for your platform.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-md border border-destructive/30 p-4 space-y-2">
                  <p className="text-sm font-medium text-destructive">Reset all agent goals</p>
                  <p className="text-xs text-muted-foreground">Clear all goal progress for all agents. This cannot be undone.</p>
                  <Button variant="destructive" size="sm">Reset Goals</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
