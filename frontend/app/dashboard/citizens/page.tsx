"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Loader2, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import CitizenStatusBadge from "@/components/citizens/status-badge";
import { useCitizensQuery, useDeleteCitizenMutation } from "@/hooks/citizen/use-citizens";
import type { CitizenItem, CitizenStatus } from "@/types/citizen/citizen.type";

export default function CitizensPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CitizenStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [deleteCitizen, setDeleteCitizen] = useState<CitizenItem | null>(null);
  const params = useMemo(() => ({ search, status, page, per_page: 10 }), [search, status, page]);
  const citizensQuery = useCitizensQuery(params);
  const deleteMutation = useDeleteCitizenMutation(() => citizensQuery.refetch());

  const rows = citizensQuery.data?.data ?? [];
  const meta = citizensQuery.data?.meta;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div><h1 className="text-2xl font-bold">Citizen Registry</h1><p className="text-muted-foreground">Register citizens, manage draft records, upload documents, and submit for verification.</p></div>
        <Button asChild><Link href="/dashboard/citizens/create"><Plus className="mr-2 h-4 w-4" /> Register Citizen</Link></Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle>Citizens</CardTitle>
            <div className="flex flex-col gap-2 md:flex-row">
              <div className="relative"><Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-8 md:w-80" placeholder="Search name, national ID, phone..." value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} /></div>
              <Select value={status} onValueChange={(value) => { setPage(1); setStatus(value as CitizenStatus | "all"); }}><SelectTrigger className="md:w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="draft">Draft</SelectItem><SelectItem value="submitted">Submitted</SelectItem><SelectItem value="under_review">Under Review</SelectItem><SelectItem value="approved">Approved</SelectItem><SelectItem value="rejected">Rejected</SelectItem><SelectItem value="suspended">Suspended</SelectItem></SelectContent></Select>
              <Button variant="outline" onClick={() => citizensQuery.refetch()}><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {citizensQuery.isLoading ? <div className="flex justify-center py-10 text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading citizens...</div> : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Registration #</TableHead><TableHead>Name</TableHead><TableHead>National ID</TableHead><TableHead>Phone</TableHead><TableHead>Zone</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {rows.length === 0 ? <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">No citizen records found</TableCell></TableRow> : rows.map((citizen) => (
                    <TableRow key={citizen.id}>
                      <TableCell className="font-mono text-xs">{citizen.registration_number}</TableCell>
                      <TableCell className="font-medium">{citizen.full_name}</TableCell>
                      <TableCell>{citizen.national_id ?? "—"}</TableCell>
                      <TableCell>{citizen.phone ?? "—"}</TableCell>
                      <TableCell>{citizen.zone?.name ?? "—"}</TableCell>
                      <TableCell><CitizenStatusBadge status={citizen.status} /></TableCell>
                      <TableCell className="text-right"><div className="flex justify-end gap-2"><Button asChild size="sm" variant="outline"><Link href={`/dashboard/citizens/${citizen.id}`}><Eye className="mr-2 h-4 w-4" /> View</Link></Button><Button size="sm" variant="destructive" onClick={() => setDeleteCitizen(citizen)}><Trash2 className="h-4 w-4" /></Button></div></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {meta && meta.last_page > 1 && <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground"><span>Page {meta.current_page} of {meta.last_page} • {meta.total} citizens</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button><Button variant="outline" size="sm" disabled={page >= meta.last_page} onClick={() => setPage((p) => p + 1)}>Next</Button></div></div>}
        </CardContent>
      </Card>

      <AlertDialog open={Boolean(deleteCitizen)} onOpenChange={(open) => !open && setDeleteCitizen(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete citizen?</AlertDialogTitle><AlertDialogDescription>This will remove {deleteCitizen?.full_name}. The record is soft-deleted for audit safety.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { if (deleteCitizen) deleteMutation.mutate(deleteCitizen.id); setDeleteCitizen(null); }}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
