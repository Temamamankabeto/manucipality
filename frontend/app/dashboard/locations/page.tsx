import Link from "next/link";
import { Building2, GitBranch, MapPinned, Navigation } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const items = [
  { title: "Cities", href: "/dashboard/locations/cities", icon: Building2, description: "Manage city records." },
  { title: "Subcities", href: "/dashboard/locations/subcities", icon: GitBranch, description: "Manage subcities under a city." },
  { title: "Woredas", href: "/dashboard/locations/woredas", icon: MapPinned, description: "Manage woredas under a subcity." },
  { title: "Zones", href: "/dashboard/locations/zones", icon: Navigation, description: "Manage zones under a woreda." },
];

export default function LocationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Location Hierarchy</h1>
        <p className="text-muted-foreground">Manage City → Subcity → Woreda → Zone separately for cascading forms.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Card className="h-full transition hover:bg-muted/50">
                <CardHeader><Icon className="mb-3 h-7 w-7" /><CardTitle>{item.title}</CardTitle><CardDescription>{item.description}</CardDescription></CardHeader>
                <CardContent className="text-sm text-primary">Open {item.title}</CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
