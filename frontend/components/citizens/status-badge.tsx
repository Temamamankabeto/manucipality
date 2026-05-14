import { Badge } from "@/components/ui/badge";
import type { CitizenStatus } from "@/types/citizen/citizen.type";

export default function CitizenStatusBadge({ status }: { status?: CitizenStatus | string }) {
  const value = status ?? "draft";
  const label = value.replace(/_/g, " ");
  const variant = value === "draft" ? "secondary" : value === "submitted" ? "default" : value === "rejected" || value === "suspended" ? "destructive" : "outline";

  return <Badge variant={variant as any} className="capitalize">{label}</Badge>;
}
