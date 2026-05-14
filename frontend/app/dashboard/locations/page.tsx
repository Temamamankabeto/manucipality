"use client";

import { FormEvent, useMemo, useState } from "react";
import { Edit, Loader2, MapPinned, MoreHorizontal, Plus, Power, RefreshCw, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { officeSchema } from "@/lib/schemas/office.schema";
import { useAllOfficesQuery, useCreateOfficeMutation, useDeleteOfficeMutation, useOfficesQuery, useOfficeTreeQuery, useToggleOfficeMutation, useUpdateOfficeMutation } from "@/hooks";
import type { OfficeItem, OfficePayload, OfficeStatusFilter, OfficeType } from "@/types/location/office.type";

const emptyForm: OfficePayload = { name: "", code: "", type: "subcity", parent_id: undefined, is_active: true };

const typeLabels: Record<OfficeType, string> = {
  city: "City",
  subcity: "Subcity",
  woreda: "Woreda",
  zone: "Zone",
};

const parentTypeFor: Partial<Record<OfficeType, OfficeType>> = {
  subcity: "city",
  woreda: "subcity",
  zone: "woreda",
};

function typeBadgeVariant(type: OfficeType) {
  if (type === "city") return "default";
  if (type === "subcity") return "secondary";
  return "outline";
}

export default function LocationManagementPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<OfficeType | "all">("all");
  const [status, setStatus] = useState<OfficeStatusFilter>("active");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState<OfficeItem | null>(null);
  const [deleteOffice, setDeleteOffice] = useState<OfficeItem | null>(null);
  const [form, setForm] = useState<OfficePayload>(emptyForm);

  const params = useMemo(() => ({ search, type, status, page, per_page: 10 }), [search, type, status, page]);
  const officesQuery = useOfficesQuery(params);
  const allOfficesQuery = useAllOfficesQuery({ status: "active" });
  const treeQuery = useOfficeTreeQuery(status);

  const createOffice = useCreateOfficeMutation(() => {
    setFormOpen(false);
    setForm(emptyForm);
    toast.success("Office created");
  });
  const updateOffice = useUpdateOfficeMutation(() => {
    setFormOpen(false);
    setSelectedOffice(null);
    setForm(emptyForm);
    toast.success("Office updated");
  });
  const toggleOffice = useToggleOfficeMutation();
  const removeOffice = useDeleteOfficeMutation(() => toast.success("Office deleted"));

  const rows = officesQuery.data?.data ?? [];
  const meta = officesQuery.data?.meta;
  const allOffices = allOfficesQuery.data ?? [];
  const parentType = parentTypeFor[form.type];
  const parentOptions = parentType ? allOffices.filter((office) => office.type === parentType) : [];
  const busy = createOffice.isPending || updateOffice.isPending;

  function runAfterMenuClose(action: () => void) {
    window.setTimeout(action, 0);
  }

  function openCreate() {
    setSelectedOffice(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEdit(office: OfficeItem) {
    setSelectedOffice(office);
    setForm({
      name: office.name,
      code: office.code,
      type: office.type,
      parent_id: office.parent_id ? String(office.parent_id) : undefined,
      is_active: office.is_active,
    });
    setFormOpen(true);
  }

  function updateForm(next: Partial<OfficePayload>) {
    setForm((current) => ({ ...current, ...next }));
  }

  function updateType(nextType: OfficeType) {
    setForm((current) => ({
      ...current,
      type: nextType,
      parent_id: nextType === "city" ? null : undefined,
    }));
  }

  function submitForm(event: FormEvent) {
    event.preventDefault();

    try {
      const payload = officeSchema.parse(form);
      if (selectedOffice) updateOffice.mutate({ id: selectedOffice.id, payload });
      else createOffice.mutate(payload);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Please check the form");
    }
  }

  function toggle(id: number | string) {
    toggleOffice.mutate(id, {
      onSuccess: () => toast.success("Office status updated"),
      onError: (error) => toast.error(error instanceof Error ? error.message : "Status update failed"),
    });
  }

  function confirmDelete() {
    if (!deleteOffice) return;
    removeOffice.mutate(deleteOffice.id, {
      onSuccess: () => setDeleteOffice(null),
      onError: (error) => toast.error(error instanceof Error ? error.message : "Delete failed"),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Location Management</h1>
          <p className="text-muted-foreground">Manage Adama city, subcities, woredas, and zones.</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> New Location</Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <CardTitle>Locations</CardTitle>
              <div className="flex flex-col gap-2 md:flex-row">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-8 md:w-72" placeholder="Search name or code..." value={search} onChange={(event) => { setPage(1); setSearch(event.target.value); }} />
                </div>
                <Select value={type} onValueChange={(value) => { setPage(1); setType(value as OfficeType | "all"); }}>
                  <SelectTrigger className="md:w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All levels</SelectItem>
                    <SelectItem value="city">City</SelectItem>
                    <SelectItem value="subcity">Subcity</SelectItem>
                    <SelectItem value="woreda">Woreda</SelectItem>
                    <SelectItem value="zone">Zone</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={status} onValueChange={(value) => { setPage(1); setStatus(value as OfficeStatusFilter); }}>
                  <SelectTrigger className="md:w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => { officesQuery.refetch(); treeQuery.refetch(); }}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {officesQuery.isLoading ? (
              <div className="flex justify-center py-10 text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading locations...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Parent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No locations found</TableCell></TableRow>
                    ) : rows.map((office) => (
                      <TableRow key={office.id}>
                        <TableCell className="font-medium">{office.name}</TableCell>
                        <TableCell>{office.code}</TableCell>
                        <TableCell><Badge variant={typeBadgeVariant(office.type)}>{typeLabels[office.type]}</Badge></TableCell>
                        <TableCell>{office.parent?.name ?? "—"}</TableCell>
                        <TableCell><Badge variant={office.is_active ? "default" : "secondary"}>{office.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild><Button type="button" variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => runAfterMenuClose(() => openEdit(office))}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => runAfterMenuClose(() => toggle(office.id))}><Power className="mr-2 h-4 w-4" /> {office.is_active ? "Deactivate" : "Activate"}</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem disabled={!office.can_delete} className="text-destructive" onSelect={() => runAfterMenuClose(() => setDeleteOffice(office))}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {meta && meta.last_page > 1 && (
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <span>Page {meta.current_page} of {meta.last_page} • {meta.total} locations</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
                  <Button variant="outline" size="sm" disabled={page >= meta.last_page} onClick={() => setPage((p) => p + 1)}>Next</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><MapPinned className="h-5 w-5" /> Hierarchy</CardTitle></CardHeader>
          <CardContent>
            {treeQuery.isLoading ? (
              <div className="flex justify-center py-8 text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading tree...</div>
            ) : (
              <div className="max-h-[620px] overflow-y-auto pr-2">
                <OfficeTree nodes={treeQuery.data ?? []} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedOffice ? "Edit Location" : "Create Location"}</DialogTitle>
            <DialogDescription>City has no parent. Subcity belongs to city, woreda belongs to subcity, and zone belongs to woreda.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={submitForm}>
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(event) => updateForm({ name: event.target.value })} required />
            </div>
            <div className="grid gap-2">
              <Label>Code</Label>
              <Input value={form.code ?? ""} onChange={(event) => updateForm({ code: event.target.value })} placeholder="Auto-generated if empty" />
            </div>
            <div className="grid gap-2">
              <Label>Level</Label>
              <Select value={form.type} onValueChange={(value) => updateType(value as OfficeType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="city">City</SelectItem>
                  <SelectItem value="subcity">Subcity</SelectItem>
                  <SelectItem value="woreda">Woreda</SelectItem>
                  <SelectItem value="zone">Zone</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.type !== "city" && (
              <div className="grid gap-2">
                <Label>Parent {parentType ? typeLabels[parentType] : "Office"}</Label>
                <Select value={form.parent_id ? String(form.parent_id) : undefined} onValueChange={(value) => updateForm({ parent_id: value })}>
                  <SelectTrigger><SelectValue placeholder="Select parent" /></SelectTrigger>
                  <SelectContent>
                    {parentOptions.map((office) => <SelectItem key={office.id} value={String(office.id)}>{office.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <label className="flex items-center gap-2 rounded-lg border p-3 text-sm">
              <Checkbox checked={Boolean(form.is_active)} onCheckedChange={(checked) => updateForm({ is_active: Boolean(checked) })} />
              Active
            </label>
            <Button className="w-full" disabled={busy}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save location</Button>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteOffice)} onOpenChange={(open) => !open && setDeleteOffice(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete location?</AlertDialogTitle>
            <AlertDialogDescription>
              This deletes {deleteOffice?.name}. Locations with child offices, users, or citizens cannot be deleted. Deactivate instead when history must be kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function OfficeTree({ nodes, depth = 0 }: { nodes: OfficeItem[]; depth?: number }) {
  if (!nodes.length) return <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">No hierarchy found.</div>;

  return (
    <div className="space-y-2">
      {nodes.map((node) => (
        <div key={node.id} className="space-y-2">
          <div className="rounded-xl border bg-card p-3" style={{ marginLeft: depth ? depth * 12 : 0 }}>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{node.name}</p>
                <p className="truncate text-xs text-muted-foreground">{node.code}</p>
              </div>
              <Badge variant={typeBadgeVariant(node.type)}>{typeLabels[node.type]}</Badge>
            </div>
          </div>
          {node.children?.length ? <OfficeTree nodes={node.children} depth={depth + 1} /> : null}
        </div>
      ))}
    </div>
  );
}
