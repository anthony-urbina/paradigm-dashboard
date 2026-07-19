import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Building2, Shield, FileText, ExternalLink, Edit, Plus } from "lucide-react";

const carriers = [
  {
    name: "Mutual of Omaha",
    products: ["Term Life", "Whole Life", "Medicare Supplement"],
    contractLevel: "GA",
    status: "Active",
    commissionRate: "110%",
  },
  {
    name: "North American",
    products: ["Indexed Universal Life", "Fixed Annuity"],
    contractLevel: "MGA",
    status: "Active",
    commissionRate: "105%",
  },
  {
    name: "American Equity",
    products: ["Fixed Indexed Annuity"],
    contractLevel: "GA",
    status: "Active",
    commissionRate: "100%",
  },
  {
    name: "Foresters Financial",
    products: ["Term Life", "Whole Life"],
    contractLevel: "Agent",
    status: "Pending",
    commissionRate: "—",
  },
  {
    name: "Transamerica",
    products: ["Final Expense", "Term Life"],
    contractLevel: "MGA",
    status: "Active",
    commissionRate: "115%",
  },
];

const documents = [
  { name: "Agency Agreement — Mutual of Omaha", type: "Contract", date: "Jan 15, 2024" },
  { name: "E&O Certificate 2025", type: "Compliance", date: "Mar 1, 2025" },
  { name: "State License — TX", type: "License", date: "Apr 10, 2024" },
  { name: "State License — FL", type: "License", date: "Apr 10, 2024" },
  { name: "W-9 Form", type: "Tax", date: "Jan 2, 2024" },
];

export default function AgencyPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agency</h1>
          <p className="text-muted-foreground">Agency profile, carriers, and compliance documents.</p>
        </div>
        <Button size="sm" variant="outline">
          <Edit className="h-4 w-4 mr-1" />
          Edit Profile
        </Button>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="carriers">Carriers</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile" className="mt-4">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Agency Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Agency Name</Label>
                    <Input defaultValue="Paradigm Financial Group" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>DBA / Brand Name</Label>
                    <Input defaultValue="Paradigm Financial" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>NPN Number</Label>
                    <Input defaultValue="19847263" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Tax ID (EIN)</Label>
                    <Input defaultValue="82-4719033" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Phone</Label>
                    <Input defaultValue="(555) 400-7700" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input defaultValue="info@paradigmfinancial.com" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Address</Label>
                  <Input defaultValue="1200 Main St, Suite 400, Dallas, TX 75201" />
                </div>
                <div className="space-y-1.5">
                  <Label>Agency Bio</Label>
                  <Textarea
                    defaultValue="Paradigm Financial is a premier life insurance agency dedicated to protecting families and building financial legacies across Texas and Florida."
                    rows={3}
                  />
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Compliance Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "E&O Insurance", status: "Current", expires: "Mar 1, 2026" },
                    { label: "TX License", status: "Active", expires: "Apr 10, 2026" },
                    { label: "FL License", status: "Active", expires: "Apr 10, 2026" },
                    { label: "Background Check", status: "Clear", expires: "Annual" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">Exp: {item.expires}</p>
                      </div>
                      <Badge variant="outline" className="text-xs border-emerald-300 text-emerald-700 bg-emerald-50">
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Licensed States</span>
                    <span className="font-semibold">TX, FL</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Carriers</span>
                    <span className="font-semibold">4</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Agents</span>
                    <span className="font-semibold">5</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Agency Tier</span>
                    <span className="font-semibold">MGA</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Carriers */}
        <TabsContent value="carriers" className="mt-4">
          <div className="flex justify-end mb-3">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Carrier
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Carrier</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Contract Level</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {carriers.map((c) => (
                    <TableRow key={c.name}>
                      <TableCell className="font-medium text-sm">{c.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {c.products.map((p) => (
                            <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{c.contractLevel}</TableCell>
                      <TableCell className="text-sm font-semibold">{c.commissionRate}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            c.status === "Active"
                              ? "border-emerald-300 text-emerald-700 bg-emerald-50 text-xs"
                              : "border-yellow-300 text-yellow-700 bg-yellow-50 text-xs"
                          }
                        >
                          {c.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents */}
        <TabsContent value="documents" className="mt-4">
          <div className="flex justify-end mb-3">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Upload Document
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.name}>
                      <TableCell className="font-medium text-sm flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {doc.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{doc.type}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{doc.date}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
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
