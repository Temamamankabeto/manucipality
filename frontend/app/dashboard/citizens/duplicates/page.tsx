"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCitizenDuplicateFlagsQuery } from "@/hooks";

export default function CitizenDuplicatesPage() {
  const [status, setStatus] = useState("open");
  const [page, setPage] = useState(1);
  const params = useMemo(() => ({ status, page, per_page: 10 }), [status, page]);
  const query = useCitizenDuplicateFlagsQuery(params);
  const rows = query.data?.data ?? [];
  const meta = query.data?.meta;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Duplicate Alerts</h1>
          <p className="text-muted-foreground">Review duplicate registrations detected by National ID or phone number.</p>
        </div>
        <Button variant="outline" onClick={() => query.refetch()}><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle>Duplicate Flags</CardTitle>
            <Select value={status} onValueChange={(value) => { setPage(1); setStatus(value); }}>
              <SelectTrigger className="md:w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {query.isLoading ? (
            <div className="flex justify-center py-10 text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading duplicate alerts...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Citizen</TableHead><TableHead>Matched Citizen</TableHead><TableHead>Reason</TableHead><TableHead>Status</TableHead><TableHead>Flagged</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                <TableBody>
                  {rows.length === 0 ? <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No duplicate alerts found.</TableCell></TableRow> : rows.map((flag) => (
                    <TableRow key={flag.id}>
                      <TableCell>{flag.citizen?.full_name ?? `Citizen #${flag.citizen_id}`}</TableCell>
                      <TableCell>{flag.matched_citizen?.full_name ?? "Manual flag"}</TableCell>
                      <TableCell className="min-w-64">{flag.remarks ?? [flag.national_id, flag.phone].filter(Boolean).join(" / ")}</TableCell>
                      <TableCell><Badge variant={flag.status === "open" ? "destructive" : "secondary"}>{flag.status}</Badge></TableCell>
                      <TableCell>{flag.flagged_at ? new Date(flag.flagged_at).toLocaleString() : "—"}</TableCell>
                      <TableCell className="text-right">{flag.citizen_id ? <Button asChild size="sm" variant="outline"><Link href={`/dashboard/citizens/${flag.citizen_id}`}>View</Link></Button> : null}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {meta && meta.last_page > 1 && <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground"><span>Page {meta.current_page} of {meta.last_page}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button><Button variant="outline" size="sm" disabled={page >= meta.last_page} onClick={() => setPage((p) => p + 1)}>Next</Button></div></div>}
        </CardContent>
      </Card>
    </div>
  );
}
