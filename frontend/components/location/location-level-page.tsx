"use client";

import { FormEvent, useMemo, useState } from "react";
import { Edit, Loader2, MoreHorizontal, Plus, Power, RefreshCw, Search, Trash2 } from "lucide-react";
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
import { useAllOfficesQuery, useCreateOfficeMutation, useDeleteOfficeMutation, useOfficesQuery, useToggleOfficeMutation, useUpdateOfficeMutation } from "@/hooks/location/use-offices";
import { officeSchema } from "@/lib/schemas/office.schema";
import type { OfficeItem, OfficePayload, OfficeStatusFilter, OfficeType } from "@/types/location/office.type";

type Props = {
  type: OfficeType;
  title: string;
  description: string;
  parentType?: OfficeType;
  parentLabel?: string;
};

const labels: Record<OfficeType, string> = {
  city: "City",
  subcity: "Subcity",
  woreda: "Woreda",
  zone: "Zone",
};

function emptyForm(type: OfficeType): OfficePayload {
  return { name: "", code: "", type, parent_id: null, is_active: true };
}

export default function LocationLevelPage({ type, title, description, parentType, parentLabel }: Props) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OfficeStatusFilter>("active");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState<OfficeItem | null>(null);
  const [deleteOffice, setDeleteOffice] = useState<OfficeItem | null>(null);
  const [form, setForm] = useState<OfficePayload>(() => emptyForm(type));

  const params = useMemo(() => ({ type, search, status, page, per_page: 10 }), [type, search, status, page]);
  const officesQuery = useOfficesQuery(params);
  const parentsQuery = useAllOfficesQuery(parentType ? { type: parentType, status: "active", all: true } : { type: "city", status: "active", all: true });

  const createOffice = useCreateOfficeMutation(() => {
    setFormOpen(false);
    setForm(emptyForm(type));
    toast.success(`${labels[type]} created`);
  });
  const updateOffice = useUpdateOfficeMutation(() => {
    setFormOpen(false);
    setSelectedOffice(null);
    setForm(emptyForm(type));
    toast.success(`${labels[type]} updated`);
  });
  const toggleOffice = useToggleOfficeMutation();
  const removeOffice = useDeleteOfficeMutation(() => toast.success(`${labels[type]} deleted`));

  const rows = officesQuery.data?.data ?? [];
  const meta = officesQuery.data?.meta;
  const parentOptions = parentType ? (parentsQuery.data ?? []).filter((office) => office.type === parentType) : [];
  const busy = createOffice.isPending || updateOffice.isPending;

  function openCreate() {
    setSelectedOffice(null);
    setForm(emptyForm(type));
    setFormOpen(true);
  }

  function openEdit(office: OfficeItem) {
    setSelectedOffice(office);
    setForm({
      name: office.name,
      code: office.code ?? "",
      type,
      parent_id: office.parent_id ?? null,
      is_active: office.is_active ?? true,
    });
    setFormOpen(true);
  }

  function updateForm(next: Partial<OfficePayload>) {
    setForm((current) => ({ ...current, ...next, type }));
  }

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = officeSchema.safeParse({ ...form, type });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }

    const payload: OfficePayload = { ...parsed.data, type };

    if (selectedOffice) {
      updateOffice.mutate({ id: selectedOffice.id, payload });
      return;
    }

    createOffice.mutate(payload);
  }

  function toggle(id: number | string) {
    toggleOffice.mutate(id, {
      onSuccess: () => toast.success(`${labels[type]} status updated`),
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
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> New {labels[type]}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle>{labels[type]} List</CardTitle>
            <div className="flex flex-col gap-2 md:flex-row">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input className="pl-8 md:w-72" placeholder="Search name or code..." value={search} onChange={(event) => { setPage(1); setSearch(event.target.value); }} />
              </div>
              <Select value={status} onValueChange={(value) => { setPage(1); setStatus(value as OfficeStatusFilter); }}>
                <SelectTrigger className="md:w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => officesQuery.refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {officesQuery.isLoading ? (
            <div className="flex justify-center py-10 text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading {title.toLowerCase()}...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    {parentType ? <TableHead>{parentLabel ?? "Parent"}</TableHead> : null}
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow><TableCell colSpan={parentType ? 5 : 4} className="py-8 text-center text-muted-foreground">No {title.toLowerCase()} found</TableCell></TableRow>
                  ) : rows.map((office) => (
                    <TableRow key={office.id}>
                      <TableCell className="font-medium">{office.name}</TableCell>
                      <TableCell>{office.code ?? "—"}</TableCell>
                      {parentType ? <TableCell>{office.parent?.name ?? "—"}</TableCell> : null}
                      <TableCell><Badge variant={office.is_active ? "default" : "secondary"}>{office.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild><Button type="button" variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => window.setTimeout(() => openEdit(office), 0)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => window.setTimeout(() => toggle(office.id), 0)}><Power className="mr-2 h-4 w-4" /> {office.is_active ? "Deactivate" : "Activate"}</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem disabled={!office.can_delete} className="text-destructive" onSelect={() => window.setTimeout(() => setDeleteOffice(office), 0)}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {meta && meta.last_page > 1 ? (
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>Page {meta.current_page} of {meta.last_page} • {meta.total} records</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= meta.last_page} onClick={() => setPage((current) => current + 1)}>Next</Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedOffice ? `Edit ${labels[type]}` : `Create ${labels[type]}`}</DialogTitle>
            <DialogDescription>{parentType ? `${labels[type]} belongs to ${parentLabel ?? labels[parentType]}.` : "City is the top level location."}</DialogDescription>
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
            {parentType ? (
              <div className="grid gap-2">
                <Label>{parentLabel ?? labels[parentType]}</Label>
                <Select value={form.parent_id ? String(form.parent_id) : "none"} onValueChange={(value) => updateForm({ parent_id: value === "none" ? null : value })}>
                  <SelectTrigger><SelectValue placeholder={`Select ${parentLabel ?? labels[parentType]}`} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select {parentLabel ?? labels[parentType]}</SelectItem>
                    {parentOptions.map((office) => <SelectItem key={office.id} value={String(office.id)}>{office.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            <label className="flex items-center gap-2 rounded-lg border p-3 text-sm">
              <Checkbox checked={Boolean(form.is_active)} onCheckedChange={(checked) => updateForm({ is_active: Boolean(checked) })} /> Active
            </label>
            <Button className="w-full" disabled={busy}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save {labels[type]}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteOffice)} onOpenChange={(open) => !open && setDeleteOffice(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {labels[type]}?</AlertDialogTitle>
            <AlertDialogDescription>Locations with child records, users, or citizens cannot be deleted. Deactivate instead when history must be kept.</AlertDialogDescription>
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
