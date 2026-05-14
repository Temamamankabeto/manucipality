"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, Flag, IdCard, Loader2, PlayCircle, RefreshCw, ShieldCheck, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  useActivateCitizenMutation,
  useCitizenWorkflowQueueQuery,
  useFlagCitizenMutation,
  useGenerateCitizenIdMutation,
  useRejectCitizenMutation,
  useStartCitizenReviewMutation,
  useSubcityApproveCitizenMutation,
  useVerifyCitizenDocumentsMutation,
  useWoredaVerifyCitizenMutation,
} from "@/hooks";
import type { CitizenItem, CitizenWorkflowStage } from "@/types/citizen/citizen.type";

const statusLabels: Record<string, string> = {
  submitted: "Submitted",
  under_review: "Under Review",
  woreda_verified: "Woreda Verified",
  subcity_approved: "Subcity Approved",
  city_id_generated: "ID Generated",
  active: "Active",
  rejected: "Rejected",
  flagged: "Flagged",
  suspended: "Suspended",
};

function statusVariant(status: string) {
  if (["active", "city_id_generated", "subcity_approved", "woreda_verified"].includes(status)) return "default";
  if (["flagged", "rejected", "suspended"].includes(status)) return "destructive";
  return "secondary";
}

function locationLabel(citizen: CitizenItem) {
  return [citizen.city?.name, citizen.subcity?.name, citizen.woreda?.name, citizen.zone?.name].filter(Boolean).join(" / ") || "—";
}

type Props = {
  title: string;
  description: string;
  stage?: CitizenWorkflowStage;
  allowedActions?: Array<"start" | "verify-documents" | "woreda-verify" | "subcity-approve" | "generate-id" | "activate" | "reject" | "flag">;
};

export default function WorkflowQueue({ title, description, stage, allowedActions = [] }: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const params = useMemo(() => ({ search, stage, page, per_page: 10 }), [search, stage, page]);
  const query = useCitizenWorkflowQueueQuery(params);
  const rows = query.data?.data ?? [];
  const meta = query.data?.meta;

  const startReview = useStartCitizenReviewMutation();
  const verifyDocuments = useVerifyCitizenDocumentsMutation();
  const woredaVerify = useWoredaVerifyCitizenMutation();
  const subcityApprove = useSubcityApproveCitizenMutation();
  const generateId = useGenerateCitizenIdMutation();
  const activate = useActivateCitizenMutation();
  const reject = useRejectCitizenMutation();
  const flag = useFlagCitizenMutation();

  function runAction(action: string, citizen: CitizenItem) {
    const reason = action === "reject" || action === "flag" ? window.prompt(`${action === "reject" ? "Reject" : "Flag"} reason`) : undefined;
    if ((action === "reject" || action === "flag") && !reason) return;

    const payload = reason ? { reason, remarks: reason } : { remarks: `Workflow action: ${action}` };

    const map = {
      start: startReview,
      "verify-documents": verifyDocuments,
      "woreda-verify": woredaVerify,
      "subcity-approve": subcityApprove,
      "generate-id": generateId,
      activate,
      reject,
      flag,
    } as const;

    const mutation = map[action as keyof typeof map];
    if (!mutation) return;

    if (action === "verify-documents") {
      verifyDocuments.mutate({ id: citizen.id, payload: { remarks: "All uploaded documents marked valid." } });
      return;
    }

    mutation.mutate({ id: citizen.id, payload } as any, {
      onError: (error) => toast.error(error instanceof Error ? error.message : "Workflow action failed"),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <Button variant="outline" onClick={() => query.refetch()}><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle>Workflow Queue</CardTitle>
            <Input className="md:w-80" placeholder="Search name, registration, phone..." value={search} onChange={(event) => { setPage(1); setSearch(event.target.value); }} />
          </div>
        </CardHeader>
        <CardContent>
          {query.isLoading ? (
            <div className="flex justify-center py-10 text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading workflow queue...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Citizen</TableHead>
                    <TableHead>Registration</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No citizens found in this queue.</TableCell></TableRow>
                  ) : rows.map((citizen) => (
                    <TableRow key={citizen.id}>
                      <TableCell>
                        <div className="font-medium">{citizen.full_name}</div>
                        <div className="text-xs text-muted-foreground">{citizen.phone ?? "No phone"}</div>
                      </TableCell>
                      <TableCell>{citizen.citizen_uid ?? citizen.registration_number}</TableCell>
                      <TableCell className="min-w-64">{locationLabel(citizen)}</TableCell>
                      <TableCell><Badge variant={statusVariant(citizen.status) as any}>{statusLabels[citizen.status] ?? citizen.status}</Badge></TableCell>
                      <TableCell>{citizen.submitted_at ? new Date(citizen.submitted_at).toLocaleDateString() : "—"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button asChild size="sm" variant="outline"><Link href={`/dashboard/citizens/${citizen.id}`}>View</Link></Button>
                          {allowedActions.includes("start") && citizen.status === "submitted" && <ActionButton icon={PlayCircle} label="Start" onClick={() => runAction("start", citizen)} />}
                          {allowedActions.includes("verify-documents") && citizen.status === "under_review" && <ActionButton icon={ShieldCheck} label="Docs" onClick={() => runAction("verify-documents", citizen)} />}
                          {allowedActions.includes("woreda-verify") && citizen.status === "under_review" && <ActionButton icon={CheckCircle2} label="Verify" onClick={() => runAction("woreda-verify", citizen)} />}
                          {allowedActions.includes("subcity-approve") && citizen.status === "woreda_verified" && <ActionButton icon={CheckCircle2} label="Approve" onClick={() => runAction("subcity-approve", citizen)} />}
                          {allowedActions.includes("generate-id") && citizen.status === "subcity_approved" && <ActionButton icon={IdCard} label="ID" onClick={() => runAction("generate-id", citizen)} />}
                          {allowedActions.includes("activate") && citizen.status === "city_id_generated" && <ActionButton icon={CheckCircle2} label="Activate" onClick={() => runAction("activate", citizen)} />}
                          {allowedActions.includes("flag") && !["active", "rejected", "suspended"].includes(citizen.status) && <ActionButton icon={Flag} label="Flag" variant="outline" onClick={() => runAction("flag", citizen)} />}
                          {allowedActions.includes("reject") && !["active", "rejected", "suspended"].includes(citizen.status) && <ActionButton icon={XCircle} label="Reject" variant="destructive" onClick={() => runAction("reject", citizen)} />}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {meta && meta.last_page > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>Page {meta.current_page} of {meta.last_page} • {meta.total} citizens</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= meta.last_page} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ActionButton({ icon: Icon, label, variant = "default", onClick }: { icon: any; label: string; variant?: "default" | "outline" | "destructive"; onClick: () => void }) {
  return <Button size="sm" variant={variant} onClick={onClick}><Icon className="mr-1 h-4 w-4" />{label}</Button>;
}
