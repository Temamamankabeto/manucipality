"use client";

import Link from "next/link";
import { Building2, Loader2, Map, MapPinned, Navigation, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOfficeTreeQuery } from "@/hooks/location/use-offices";
import type { OfficeItem, OfficeType } from "@/types/location/office.type";

const links = [
  { href: "/dashboard/locations/cities", label: "Cities", description: "Manage city records", icon: Building2 },
  { href: "/dashboard/locations/subcities", label: "Subcities", description: "Manage subcities under a city", icon: Navigation },
  { href: "/dashboard/locations/woredas", label: "Woredas", description: "Manage woredas under a subcity", icon: Map },
  { href: "/dashboard/locations/zones", label: "Zones", description: "Manage zones under a woreda", icon: MapPinned },
];

const labels: Record<OfficeType, string> = { city: "City", subcity: "Subcity", woreda: "Woreda", zone: "Zone" };

export default function LocationsPage() {
  const treeQuery = useOfficeTreeQuery("active");

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Location Hierarchy</h1>
          <p className="text-muted-foreground">Manage City → Subcity → Woreda → Zone separately.</p>
        </div>
        <Button variant="outline" onClick={() => treeQuery.refetch()}><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.href} className="hover:bg-muted/40">
              <CardHeader><CardTitle className="flex items-center gap-2"><Icon className="h-5 w-5" />{item.label}</CardTitle><CardDescription>{item.description}</CardDescription></CardHeader>
              <CardContent><Button asChild className="w-full"><Link href={item.href}>Open {item.label}</Link></Button></CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader><CardTitle>Active Hierarchy</CardTitle><CardDescription>Current cascading location structure.</CardDescription></CardHeader>
        <CardContent>{treeQuery.isLoading ? <div className="flex justify-center py-10 text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading hierarchy...</div> : <OfficeTree nodes={treeQuery.data ?? []} />}</CardContent>
      </Card>
    </div>
  );
}

function OfficeTree({ nodes, depth = 0 }: { nodes: OfficeItem[]; depth?: number }) {
  if (!nodes.length) return <div className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">No active locations found.</div>;

  return <div className="space-y-2">{nodes.map((node) => <div key={node.id} className="space-y-2"><div className="rounded-xl border p-3" style={{ marginLeft: depth ? depth * 16 : 0 }}><div className="flex items-center justify-between gap-2"><div><p className="font-medium">{node.name}</p><p className="text-xs text-muted-foreground">{node.code ?? "No code"}</p></div><Badge>{labels[node.type]}</Badge></div></div>{node.children?.length ? <OfficeTree nodes={node.children} depth={depth + 1} /> : null}</div>)}</div>;
}
