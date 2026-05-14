import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getRoleFromRoute } from "@/config/dashboard.config";

export default async function RoleDashboardPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  const config = getRoleFromRoute(role);

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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {config.metrics.map((metric) => (
          <Card key={metric.label} className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardDescription>{metric.label}</CardDescription>
              <CardTitle className="text-2xl">{metric.value}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{metric.description}</CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>{config.roleName}</CardTitle>
          <CardDescription>Use the sidebar to manage users, offices, audit records, citizen workflow, reports, and notifications within this role scope.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex min-h-64 items-center justify-center rounded-2xl border border-dashed bg-muted/30 p-10 text-center text-muted-foreground">
            Dynamic role dashboard area for {config.roleName}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
