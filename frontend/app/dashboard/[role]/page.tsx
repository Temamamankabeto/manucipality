import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardConfig, type AppRoleKey } from "@/config/dashboard.config";

export default async function RoleDashboardPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  const config = dashboardConfig[role as AppRoleKey];
  if (!config) notFound();
  const Icon = config.icon;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Municipality dashboard</p>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{config.title}</h1>
          <p className="mt-1 text-muted-foreground">{config.subtitle}</p>
        </div>
        <div className="rounded-2xl bg-primary/10 p-4 text-primary"><Icon className="h-8 w-8" /></div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle>Citizen Registration</CardTitle><CardDescription>Draft and submitted citizen registrations.</CardDescription></CardHeader><CardContent className="text-sm text-muted-foreground">Use Citizen Management from the sidebar to create, update, upload documents, and submit registrations.</CardContent></Card>
        <Card><CardHeader><CardTitle>Administrative Scope</CardTitle><CardDescription>Data access is filtered by assigned level.</CardDescription></CardHeader><CardContent className="text-sm text-muted-foreground">Super Admin sees all; Admin users see only their city/subcity/woreda/zone.</CardContent></Card>
        <Card><CardHeader><CardTitle>Next Phase</CardTitle><CardDescription>Verification and approval workflow.</CardDescription></CardHeader><CardContent className="text-sm text-muted-foreground">Phase 2 will add review queues, approval, rejection, and escalation.</CardContent></Card>
      </div>
    </div>
  );
}
