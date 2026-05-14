"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { Edit, Loader2, MoreHorizontal, Plus, Power, RefreshCw, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { officeSchema } from "@/lib/schemas/office.schema";
import { useAllCitiesQuery, useAllSubcitiesQuery, useAllWoredasQuery, useCreateLocationMutation, useDeleteLocationMutation, useLocationLevelQuery, useToggleLocationMutation, useUpdateLocationMutation } from "@/hooks/location/use-offices";
import type { OfficeItem, OfficePayload, OfficeStatusFilter, OfficeType } from "@/types/location/office.type";

type Props = {
  type: OfficeType;
  title: string;
  description: string;
};

const parentType: Partial<Record<OfficeType, OfficeType>> = { subcity: "city", woreda: "subcity", zone: "woreda" };
const parentLabels: Record<OfficeType, string> = { city: "City", subcity: "Subcity", woreda: "Woreda", zone: "Zone" };

function defaultForm(type: OfficeType): OfficePayload {
  return { name: "", code: "", type, parent_id: type === "city" ? null : undefined, is_active: true };
}

function numberOrNull(value?: string | null) {
  if (!value || value === "none") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export default function LocationLevelPage({ type, title, description }: Props) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OfficeStatusFilter>("active");
  const [page, setPage] = useState(1);
  const [parentFilter, setParentFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState<OfficeItem | null>(null);
  const [deleteOffice, setDeleteOffice] = useState<OfficeItem | null>(null);
  const [form, setForm] = useState<OfficePayload>(defaultForm(type));

  const listParams = useMemo(() => ({ search, status, page, per_page: 10, ...(parentFilter !== "all" ? { parent_id: parentFilter } : {}) }), [search, status, page, parentFilter]);
  const locationsQuery = useLocationLevelQuery(type, listParams);
  const cities = useAllCitiesQuery({ status: "active", all: true });
  const subcities = useAllSubcitiesQuery({ status: "active", all: true });
  const woredas = useAllWoredasQuery({ status: "active", all: true });

  const createLocation = useCreateLocationMutation(type, () => { setFormOpen(false); setForm(defaultForm(type)); toast.success(`${title} created`); });
  const updateLocation = useUpdateLocationMutation(type, () => { setFormOpen(false); setSelectedOffice(null); setForm(defaultForm(type)); toast.success(`${title} updated`); });
  const toggleLocation = useToggleLocationMutation(type, () => toast.success(`${title} status updated`));
  const deleteLocation = useDeleteLocationMutation(type, () => toast.success(`${title} deleted`));

  const rows = locationsQuery.data?.data ?? [];
  const meta = locationsQuery.data?.meta;
  const currentParentType = parentType[type];
  const parentOptions = currentParentType === "city" ? (cities.data ?? []) : currentParentType === "subcity" ? (subcities.data ?? []) : currentParentType === "woreda" ? (woredas.data ?? []) : [];
  const busy = createLocation.isPending || updateLocation.isPending;

  function openCreate() {
    setSelectedOffice(null);
    setForm(defaultForm(type));
    setFormOpen(true);
  }

  function openEdit(office: OfficeItem) {
    setSelectedOffice(office);
    setForm({ name: office.name, code: office.code ?? "", type, parent_id: office.parent_id ?? null, is_active: Boolean(office.is_active) });
    setFormOpen(true);
  }

  function submitForm(event: FormEvent) {
    event.preventDefault();
    const parsed = officeSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }

    const payload = { ...parsed.data, type } as OfficePayload;
    if (selectedOffice) updateLocation.mutate({ id: selectedOffice.id, payload });
    else createLocation.mutate(payload);
  }

  function confirmDelete() {
    if (!deleteOffice) return;
    deleteLocation.mutate(deleteOffice.id, {
      onSuccess: () => setDeleteOffice(null),
      onError: (error) => toast.error(error instanceof Error ? error.message : "Delete failed"),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold">{title} Management</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> New {title}</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>{title} List</CardTitle>
              <CardDescription>Separate CRUD for {title.toLowerCase()} records.</CardDescription>
            </div>
            <div className="flex flex-col gap-2 md:flex-row">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input className="pl-8 md:w-64" placeholder="Search name or code..." value={search} onChange={(event) => { setPage(1); setSearch(event.target.value); }} />
              </div>
              {currentParentType && (
                <Select value={parentFilter} onValueChange={(value) => { setPage(1); setParentFilter(value); }}>
                  <SelectTrigger className="md:w-56"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All {parentLabels[currentParentType]}</SelectItem>
                    {parentOptions.map((parent) => <SelectItem key={parent.id} value={String(parent.id)}>{parent.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              <Select value={status} onValueChange={(value) => { setPage(1); setStatus(value as OfficeStatusFilter); }}>
                <SelectTrigger className="md:w-36"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem><SelectItem value="all">All</SelectItem></SelectContent>
              </Select>
              <Button variant="outline" onClick={() => locationsQuery.refetch()}><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {locationsQuery.isLoading ? <div className="flex justify-center py-10 text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</div> : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Code</TableHead><TableHead>Parent</TableHead><TableHead>Status</TableHead><TableHead>Children</TableHead><TableHead>Users</TableHead><TableHead>Citizens</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {rows.length === 0 ? <TableRow><TableCell colSpan={8} className="py-8 text-center text-muted-foreground">No records found</TableCell></TableRow> : rows.map((office) => (
                    <TableRow key={office.id}>
                      <TableCell className="font-medium">{office.name}</TableCell>
                      <TableCell>{office.code ?? "—"}</TableCell>
                      <TableCell>{office.parent?.name ?? "—"}</TableCell>
                      <TableCell><Badge variant={office.is_active ? "default" : "secondary"}>{office.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                      <TableCell>{office.children_count ?? 0}</TableCell>
                      <TableCell>{office.users_count ?? 0}</TableCell>
                      <TableCell>{office.citizens_count ?? 0}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild><Button type="button" variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => setTimeout(() => openEdit(office), 0)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setTimeout(() => toggleLocation.mutate(office.id), 0)}><Power className="mr-2 h-4 w-4" /> {office.is_active ? "Deactivate" : "Activate"}</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem disabled={!office.can_delete} className="text-destructive" onSelect={() => setTimeout(() => setDeleteOffice(office), 0)}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {meta && meta.last_page > 1 && <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground"><span>Page {meta.current_page} of {meta.last_page} • {meta.total} records</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button><Button variant="outline" size="sm" disabled={page >= meta.last_page} onClick={() => setPage((p) => p + 1)}>Next</Button></div></div>}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline"><Link href="/dashboard/locations/cities">Cities</Link></Button>
        <Button asChild variant="outline"><Link href="/dashboard/locations/subcities">Subcities</Link></Button>
        <Button asChild variant="outline"><Link href="/dashboard/locations/woredas">Woredas</Link></Button>
        <Button asChild variant="outline"><Link href="/dashboard/locations/zones">Zones</Link></Button>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{selectedOffice ? `Edit ${title}` : `Create ${title}`}</DialogTitle><DialogDescription>{currentParentType ? `${title} belongs to a ${parentLabels[currentParentType]}.` : "City has no parent."}</DialogDescription></DialogHeader>
          <form className="space-y-4" onSubmit={submitForm}>
            <div className="grid gap-2"><Label>Name</Label><Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required /></div>
            <div className="grid gap-2"><Label>Code</Label><Input value={form.code ?? ""} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))} placeholder="Auto-generated if empty" /></div>
            {currentParentType && (
              <div className="grid gap-2"><Label>Parent {parentLabels[currentParentType]}</Label><Select value={form.parent_id ? String(form.parent_id) : "none"} onValueChange={(next) => setForm((current) => ({ ...current, parent_id: numberOrNull(next) }))}><SelectTrigger><SelectValue placeholder="Select parent" /></SelectTrigger><SelectContent><SelectItem value="none">Select parent</SelectItem>{parentOptions.map((parent) => <SelectItem key={parent.id} value={String(parent.id)}>{parent.name}</SelectItem>)}</SelectContent></Select></div>
            )}
            <label className="flex items-center gap-2 rounded-lg border p-3 text-sm"><Checkbox checked={Boolean(form.is_active)} onCheckedChange={(checked) => setForm((current) => ({ ...current, is_active: Boolean(checked) }))} />Active</label>
            <Button className="w-full" disabled={busy}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save</Button>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteOffice)} onOpenChange={(open) => !open && setDeleteOffice(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete {title}?</AlertDialogTitle><AlertDialogDescription>This deletes {deleteOffice?.name}. Locations with children, users, or citizens cannot be deleted.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={confirmDelete}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
