"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { Loader2, Plus, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAllOfficesQuery, useCreateHouseholdMutation, useHouseholdsQuery } from "@/hooks";
import type { HouseholdPayload, HouseholdStatus } from "@/types/citizen/phase-three.type";
import type { OfficeItem } from "@/types/location/office.type";

const emptyForm: HouseholdPayload = { head_citizen_id: "", city_id: "", subcity_id: "", woreda_id: "", zone_id: "", house_number: "", address: "", status: "active" };

export default function HouseholdsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<HouseholdStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<HouseholdPayload>(emptyForm);

  const params = useMemo(() => ({ search, status, page, per_page: 10 }), [search, status, page]);
  const query = useHouseholdsQuery(params);
  const offices = useAllOfficesQuery({ status: "active", all: true }).data ?? [];
  const createHousehold = useCreateHouseholdMutation(() => { setOpen(false); setForm(emptyForm); });

  const rows = query.data?.data ?? [];
  const meta = query.data?.meta;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.head_citizen_id || !form.city_id || !form.subcity_id || !form.woreda_id || !form.zone_id) {
      toast.error("Head citizen and full location hierarchy are required");
      return;
    }
    createHousehold.mutate(form);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div><h1 className="text-2xl font-bold">Households</h1><p className="text-muted-foreground">Create households, assign heads, and manage family grouping.</p></div>
        <Button onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" /> New Household</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle>Household List</CardTitle>
            <div className="flex flex-col gap-2 md:flex-row">
              <div className="relative"><Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-8 md:w-72" placeholder="Search household/head..." value={search} onChange={(event) => { setPage(1); setSearch(event.target.value); }} /></div>
              <Select value={status} onValueChange={(value) => { setPage(1); setStatus(value as HouseholdStatus | "all"); }}><SelectTrigger className="md:w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem><SelectItem value="suspended">Suspended</SelectItem></SelectContent></Select>
              <Button variant="outline" onClick={() => query.refetch()}><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {query.isLoading ? <div className="flex justify-center py-10 text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading households...</div> : (
            <Table>
              <TableHeader><TableRow><TableHead>No.</TableHead><TableHead>Head</TableHead><TableHead>Location</TableHead><TableHead>Members</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>{rows.length === 0 ? <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No households found</TableCell></TableRow> : rows.map((household) => (
                <TableRow key={household.id}>
                  <TableCell className="font-medium">{household.household_number}</TableCell>
                  <TableCell>{household.head_citizen?.full_name ?? "—"}</TableCell>
                  <TableCell>{[household.city?.name, household.subcity?.name, household.woreda?.name, household.zone?.name].filter(Boolean).join(" / ")}</TableCell>
                  <TableCell>{household.members_count ?? household.members?.length ?? 0}</TableCell>
                  <TableCell><Badge>{household.status}</Badge></TableCell>
                  <TableCell className="text-right"><Button asChild size="sm" variant="outline"><Link href={`/dashboard/households/${household.id}`}>Manage</Link></Button></TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          )}
          {meta && meta.last_page > 1 && <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground"><span>Page {meta.current_page} of {meta.last_page}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button><Button variant="outline" size="sm" disabled={page >= meta.last_page} onClick={() => setPage((p) => p + 1)}>Next</Button></div></div>}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Create Household</DialogTitle><DialogDescription>Head citizen must already be active and in the selected location.</DialogDescription></DialogHeader>
          <form className="space-y-4" onSubmit={submit}>
            <div className="grid gap-4 md:grid-cols-2"><Field label="Head Citizen ID"><Input value={String(form.head_citizen_id)} onChange={(event) => setForm({ ...form, head_citizen_id: event.target.value })} required /></Field><Field label="House Number"><Input value={form.house_number ?? ""} onChange={(event) => setForm({ ...form, house_number: event.target.value })} /></Field></div>
            <LocationFields offices={offices} form={form} onChange={setForm} />
            <Field label="Address"><Input value={form.address ?? ""} onChange={(event) => setForm({ ...form, address: event.target.value })} /></Field>
            <Button className="w-full" disabled={createHousehold.isPending}>{createHousehold.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Household</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="grid gap-2"><Label>{label}</Label>{children}</div>; }
function selectOptions(offices: OfficeItem[], type: string, parent?: string | number) { return offices.filter((office) => office.type === type && (!parent || String(office.parent_id) === String(parent))); }
function LocationFields({ offices, form, onChange }: { offices: OfficeItem[]; form: HouseholdPayload; onChange: (form: HouseholdPayload) => void }) {
  const cities = selectOptions(offices, "city");
  const subcities = selectOptions(offices, "subcity", form.city_id);
  const woredas = selectOptions(offices, "woreda", form.subcity_id);
  const zones = selectOptions(offices, "zone", form.woreda_id);
  return <div className="grid gap-4 md:grid-cols-4"><LocationSelect label="City" value={form.city_id} options={cities} onValueChange={(id) => onChange({ ...form, city_id: id, subcity_id: "", woreda_id: "", zone_id: "" })} /><LocationSelect label="Subcity" value={form.subcity_id} options={subcities} onValueChange={(id) => onChange({ ...form, subcity_id: id, woreda_id: "", zone_id: "" })} /><LocationSelect label="Woreda" value={form.woreda_id} options={woredas} onValueChange={(id) => onChange({ ...form, woreda_id: id, zone_id: "" })} /><LocationSelect label="Zone" value={form.zone_id} options={zones} onValueChange={(id) => onChange({ ...form, zone_id: id })} /></div>;
}
function LocationSelect({ label, value, options, onValueChange }: { label: string; value?: number | string; options: OfficeItem[]; onValueChange: (id: string) => void }) { return <Field label={label}><Select value={value ? String(value) : ""} onValueChange={onValueChange}><SelectTrigger><SelectValue placeholder={`Select ${label}`} /></SelectTrigger><SelectContent>{options.map((option) => <SelectItem key={option.id} value={String(option.id)}>{option.name}</SelectItem>)}</SelectContent></Select></Field>; }
