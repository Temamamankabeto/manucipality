import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
const links=[['Cities','/dashboard/locations/cities'],['Subcities','/dashboard/locations/subcities'],['Woredas','/dashboard/locations/woredas'],['Zones','/dashboard/locations/zones']];
export default function LocationsPage(){return <div className="space-y-6"><h1 className="text-2xl font-bold">Location Management</h1><div className="grid gap-4 md:grid-cols-4">{links.map(([label,href])=><Link key={href} href={href}><Card className="hover:bg-muted/40"><CardHeader><CardTitle>{label}</CardTitle></CardHeader><CardContent>Manage {label.toLowerCase()}</CardContent></Card></Link>)}</div></div>}
