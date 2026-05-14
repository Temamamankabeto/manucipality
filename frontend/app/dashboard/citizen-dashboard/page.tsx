"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCitizenDashboardMetricsQuery } from "@/hooks";

const labels: Record<string, string> = {
  total_households: "Total Households",
  total_registered_citizens: "Registered Citizens",
  active_citizens: "Active Citizens",
  pending_verifications: "Pending Verifications",
  escalated_cases: "Escalated Cases",
  duplicate_alerts: "Duplicate Alerts",
  suspended_citizens: "Suspended Citizens",
};

export default function CitizenDashboardPage() {
  const query = useCitizenDashboardMetricsQuery();
  const metrics = query.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Citizen Administration Dashboard</h1>
          <p className="text-muted-foreground">Citizen, household, verification, duplicate, and suspension metrics.</p>
        </div>
        <Button variant="outline" onClick={() => query.refetch()}><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button>
      </div>

      {query.isLoading ? (
        <div className="flex justify-center py-10 text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading metrics...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Object.entries(labels).map(([key, label]) => (
            <Card key={key}>
              <CardHeader><CardTitle className="text-sm text-muted-foreground">{label}</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">{Number((metrics as any)?.[key] ?? 0).toLocaleString()}</p></CardContent>
            </Card>
          ))}
          <Card>
            <CardHeader><CardTitle className="text-sm text-muted-foreground">Average Household Members</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">{metrics?.household_statistics?.average_members ?? 0}</p></CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
