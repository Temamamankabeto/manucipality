"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { Edit, Loader2, MoreHorizontal, Plus, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { parseOfficePayload } from "@/lib/schemas/office.schema";
import { useAllOfficesQuery, useCreateOfficeMutation, useOfficesQuery, useUpdateOfficeMutation } from "@/hooks";
import type { OfficeItem, OfficePayload, OfficeStatusFilter, OfficeType } from "@/types/location/office.type";

const emptyForm: OfficePayload = { name: "", code: "", type: "subcity", parent_id: null, is_active: true };
const typeLabels: Record<OfficeType, string> = { city: "City", subcity: "Subcity", woreda: "Woreda", zone: "Zone" };
const parentTypeFor: Partial<Record<OfficeType, OfficeType>> = { subcity: "city", woreda: "subcity", zone: "woreda" };

export default function LocationManagementPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<OfficeType | "all">("all");
  const [status, setStatus] = useState<OfficeStatusFilter>("active");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState<OfficeItem | null>(null);
  const [form, setForm] = useState<OfficePayload>(emptyForm);

  const params = useMemo(() => ({ search, type, status, page, per_page: 10 }), [search, type, status, page]);
  const officesQuery = useOfficesQuery(params);
  const allOffices = useAllOfficesQuery({ status: "active", all: true }).data ?? [];
  const createOffice = useCreateOfficeMutation(() => { setFormOpen(false); setForm(emptyForm); toast.success("Location created"); });
  const updateOffice = useUpdateOfficeMutation(() => { setFormOpen(false); setSelectedOffice(null); setForm(emptyForm); toast.success("Location updated"); });

  const rows = officesQuery.data?.data ?? [];
  const meta = officesQuery.data?.meta;
  const parentType = parentTypeFor[form.type];
  const parentOptions = parentType ? allOffices.filter((office) => office.type === parentType) : [];

  function openEdit(office: OfficeItem) {
    setSelectedOffice(office);
    setForm({ name: office.name, code: office.code ?? "", type: office.type, parent_id: office.parent_id ?? null, is_active: office.is_active ?? true });
    setFormOpen(true);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    try {
      const payload = parseOfficePayload(form);
      if (selectedOffice) updateOffice.mutate({ id: selectedOffice.id, payload });
      else createOffice.mutate(payload);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Please check the form");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div><h1 className="text-2xl font-bold">Location Management</h1><p className="text-muted-foreground">Manage City, Subcity, Woreda, and Zone records.</p></div>
        <div className="flex gap-2"><Button asChild variant="outline"><Link href="/dashboard/locations/cities">Separate CRUD</Link></Button><Button onClick={() => { setSelectedOffice(null); setForm(emptyForm); setFormOpen(true); }}><Plus className="mr-2 h-4 w-4" /> New Location</Button></div>
      </div>

      <Card>
        <CardHeader><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><CardTitle>Locations</CardTitle><div className="flex flex-col gap-2 md:flex-row"><div className="relative"><Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-8 md:w-72" value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} placeholder="Search locations..." /></div><Select value={type} onValueChange={(v) => { setPage(1); setType(v as OfficeType | "all"); }}><SelectTrigger className="md:w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All levels</SelectItem><SelectItem value="city">City</SelectItem><SelectItem value="subcity">Subcity</SelectItem><SelectItem value="woreda">Woreda</SelectItem><SelectItem value="zone">Zone</SelectItem></SelectContent></Select><Button variant="outline" onClick={() => officesQuery.refetch()}><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button></div></div></CardHeader>
        <CardContent>{officesQuery.isLoading ? <div className="flex justify-center py-10 text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</div> : <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Code</TableHead><TableHead>Type</TableHead><TableHead>Parent</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{rows.length === 0 ? <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No locations found</TableCell></TableRow> : rows.map((office) => <TableRow key={office.id}><TableCell>{office.name}</TableCell><TableCell>{office.code}</TableCell><TableCell>{typeLabels[office.type]}</TableCell><TableCell>{office.parent?.name ?? "—"}</TableCell><TableCell className="text-right"><DropdownMenu modal={false}><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => setTimeout(() => openEdit(office), 0)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell></TableRow>)}</TableBody></Table>}{meta && meta.last_page > 1 && <div className="mt-4 flex justify-between text-sm text-muted-foreground"><span>Page {meta.current_page} of {meta.last_page}</span><div className="flex gap-2"><Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button><Button size="sm" variant="outline" disabled={page >= meta.last_page} onClick={() => setPage((p) => p + 1)}>Next</Button></div></div>}</CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}><DialogContent><DialogHeader><DialogTitle>{selectedOffice ? "Edit Location" : "Create Location"}</DialogTitle><DialogDescription>Subcity belongs to City, Woreda belongs to Subcity, Zone belongs to Woreda.</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={submit}><Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field><Field label="Code"><Input value={form.code ?? ""} onChange={(e) => setForm({ ...form, code: e.target.value })} /></Field><Field label="Type"><Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as OfficeType, parent_id: v === "city" ? null : undefined })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="city">City</SelectItem><SelectItem value="subcity">Subcity</SelectItem><SelectItem value="woreda">Woreda</SelectItem><SelectItem value="zone">Zone</SelectItem></SelectContent></Select></Field>{form.type !== "city" && <Field label={`Parent ${parentType ? typeLabels[parentType] : "Location"}`}><Select value={form.parent_id ? String(form.parent_id) : ""} onValueChange={(v) => setForm({ ...form, parent_id: v })}><SelectTrigger><SelectValue placeholder="Select parent" /></SelectTrigger><SelectContent>{parentOptions.map((office) => <SelectItem key={office.id} value={String(office.id)}>{office.name}</SelectItem>)}</SelectContent></Select></Field>}<Button className="w-full" disabled={createOffice.isPending || updateOffice.isPending}>Save</Button></form></DialogContent></Dialog>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="grid gap-2"><Label>{label}</Label>{children}</div>; }
