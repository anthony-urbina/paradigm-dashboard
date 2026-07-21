import { auth } from "@/auth";
import { AdminPage } from "@/components/paradigm";
import { getCurrentAgent } from "@/lib/current-agent";
import { getAdminData } from "@/lib/data";
import { redirect } from "next/navigation";

export default async function DashboardAdminPage() {
  const session = await auth();
  const agent = await getCurrentAgent(session);
  if (agent?.role !== "admin") {
    redirect("/dashboard");
  }

  const data = await getAdminData();
  return <AdminPage {...data} />;
}
