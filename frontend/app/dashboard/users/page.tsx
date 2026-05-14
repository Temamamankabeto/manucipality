"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { Edit, Eye, KeyRound, Loader2, MoreHorizontal, Plus, RefreshCw, Search, Trash2, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCreateUserMutation, useDeleteUserMutation, useOfficesLiteQuery, useResetUserPasswordMutation, useToggleUserMutation, useUpdateUserMutation, useUserRolesLiteQuery, useUsersQuery } from "@/hooks";
import { createUserSchema, updateUserSchema } from "@/lib/schemas/user.schema";
import type { AdminLevel, CreateUserPayload, OfficeItem, UpdateUserPayload, UserItem, UserStatus } from "@/types/user-management/user.type";

const emptyCreate: CreateUserPayload & { city_id?: number | null } = { name: "", email: "", phone: "", password: "", role: "Admin", admin_level: "zone", office_id: null, sub_city_id: null, woreda_id: null, zone_id: null, city_id: null };
const emptyEdit: UpdateUserPayload & { city_id?: number | null } = { name: "", email: "", phone: "", role: "Admin", admin_level: "zone", office_id: null, sub_city_id: null, woreda_id: null, zone_id: null, city_id: null };

const levelLabels: Record<AdminLevel, string> = { city: "City level", subcity: "Subcity level", woreda: "Woreda level", zone: "Zone level" };

function numberOrNull(value?: string | null) {
  if (!value || value === "none") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function roleOf(user: UserItem) {
  if (user.role) return user.role;
  const first = user.roles?.[0];
  return !first ? "—" : typeof first === "string" ? first : first.name;
}

function levelOf(user: UserItem) {
  return user.role === "Super Admin" ? "System" : user.admin_level ? levelLabels[user.admin_level] : "—";
}

function officeLabel(user: UserItem) {
  return user.zone?.name ?? user.woreda?.name ?? user.sub_city?.name ?? user.office?.name ?? "—";
}

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<UserStatus | "all">("all");
  const [adminLevel, setAdminLevel] = useState<AdminLevel | "all">("all");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState<UserItem | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [createForm, setCreateForm] = useState<CreateUserPayload & { city_id?: number | null }>(emptyCreate);
  const [editForm, setEditForm] = useState<UpdateUserPayload & { city_id?: number | null }>(emptyEdit);
  const [newPassword, setNewPassword] = useState("");

  const params = useMemo(() => ({ search, status, admin_level: adminLevel, page, per_page: 10 }), [search, status, adminLevel, page]);
  const usersQuery = useUsersQuery(params);
  const roles = useUserRolesLiteQuery().data ?? [];
  const offices = useOfficesLiteQuery().data ?? [];
  const createUser = useCreateUserMutation(() => { setCreateOpen(false); setCreateForm(emptyCreate); toast.success("User created"); });
  const updateUser = useUpdateUserMutation(() => { setEditOpen(false); setSelectedUser(null); toast.success("User updated"); });
  const toggleUser = useToggleUserMutation(() => toast.success("User status updated"));
  const removeUser = useDeleteUserMutation(() => toast.success("User deleted"));
  const resetPassword = useResetUserPasswordMutation(() => { setResetOpen(false); setSelectedUser(null); setNewPassword(""); toast.success("Password reset"); });

  const rows = usersQuery.data?.data ?? [];
  const meta = usersQuery.data?.meta;
  const busy = createUser.isPending || updateUser.isPending || resetPassword.isPending;

  function deriveCityId(user: UserItem) {
    return user.office?.type === "city" ? user.office.id : null;
  }

  function openEdit(user: UserItem) {
    setSelectedUser(user);
    setEditForm({ name: user.name ?? "", email: user.email ?? "", phone: user.phone ?? "", address: user.address ?? "", role: roleOf(user) || "Admin", admin_level: user.admin_level ?? "zone", office_id: user.office_id ?? null, sub_city_id: user.sub_city_id ?? null, woreda_id: user.woreda_id ?? null, zone_id: user.zone_id ?? null, city_id: deriveCityId(user) });
    setEditOpen(true);
  }

  function submitCreate(e: FormEvent) {
    e.preventDefault();
    const parsed = createUserSchema.safeParse(createForm);
    if (!parsed.success) return toast.error(parsed.error.issues[0]?.message ?? "Invalid user data");
    createUser.mutate(parsed.data);
  }

  function submitEdit(e: FormEvent) {
    e.preventDefault();
    if (!selectedUser) return;
    const parsed = updateUserSchema.safeParse(editForm);
    if (!parsed.success) return toast.error(parsed.error.issues[0]?.message ?? "Invalid user data");
    updateUser.mutate({ id: selectedUser.id, payload: parsed.data });
  }

  function submitReset(e: FormEvent) {
    e.preventDefault();
    if (!selectedUser || newPassword.length < 8) return toast.error("Password must be at least 8 characters");
    resetPassword.mutate({ id: selectedUser.id, payload: { new_password: newPassword } });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div><h1 className="text-2xl font-bold">Users</h1><p className="text-muted-foreground">Manage Super Admin and scoped Admin users across City, Subcity, Woreda, and Zone levels.</p></div>
        <Button onClick={() => setCreateOpen(true)}><Plus className="mr-2 h-4 w-4" /> New User</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle>User List</CardTitle>
            <div className="flex flex-col gap-2 md:flex-row">
              <div className="relative"><Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-8 md:w-72" placeholder="Search name, email or phone..." value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} /></div>
              <Select value={status} onValueChange={(v) => { setPage(1); setStatus(v as UserStatus | "all"); }}><SelectTrigger className="md:w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="disabled">Disabled</SelectItem></SelectContent></Select>
              <Select value={adminLevel} onValueChange={(v) => { setPage(1); setAdminLevel(v as AdminLevel | "all"); }}><SelectTrigger className="md:w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All levels</SelectItem>{Object.entries(levelLabels).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent></Select>
              <Button variant="outline" onClick={() => usersQuery.refetch()}><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {usersQuery.isLoading ? <div className="flex justify-center py-10 text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading users...</div> : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead>Role</TableHead><TableHead>Level</TableHead><TableHead>Office</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {rows.length === 0 ? <TableRow><TableCell colSpan={8} className="py-8 text-center text-muted-foreground">No users found</TableCell></TableRow> : rows.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell><TableCell>{user.email}</TableCell><TableCell>{user.phone ?? "—"}</TableCell><TableCell>{roleOf(user)}</TableCell><TableCell>{levelOf(user)}</TableCell><TableCell>{officeLabel(user)}</TableCell><TableCell><Badge variant={user.status === "disabled" ? "secondary" : "default"}>{user.status ?? "active"}</Badge></TableCell>
                      <TableCell className="text-right"><DropdownMenu modal={false}><DropdownMenuTrigger asChild><Button type="button" variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem asChild><Link href={`/dashboard/users/${user.id}`}><Eye className="mr-2 h-4 w-4" /> View</Link></DropdownMenuItem><DropdownMenuItem onSelect={() => setTimeout(() => openEdit(user), 0)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem><DropdownMenuItem onSelect={() => setTimeout(() => toggleUser.mutate(user.id), 0)}>{user.status === "disabled" ? <UserCheck className="mr-2 h-4 w-4" /> : <UserX className="mr-2 h-4 w-4" />}{user.status === "disabled" ? "Enable" : "Disable"}</DropdownMenuItem><DropdownMenuItem onSelect={() => setTimeout(() => { setSelectedUser(user); setNewPassword(""); setResetOpen(true); }, 0)}><KeyRound className="mr-2 h-4 w-4" /> Reset password</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem className="text-destructive" onSelect={() => setTimeout(() => setDeleteUser(user), 0)}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {meta && meta.last_page > 1 && <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground"><span>Page {meta.current_page} of {meta.last_page} • {meta.total} users</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button><Button variant="outline" size="sm" disabled={page >= meta.last_page} onClick={() => setPage((p) => p + 1)}>Next</Button></div></div>}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Create User</DialogTitle><DialogDescription>Add a Super Admin or scoped Admin user.</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={submitCreate}><UserFields form={createForm} roles={roles.map((r) => r.name)} offices={offices} onChange={setCreateForm} includePassword /><Button className="w-full" disabled={busy}>{createUser.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save user</Button></form></DialogContent></Dialog>
      <Dialog open={editOpen} onOpenChange={setEditOpen}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Edit User</DialogTitle><DialogDescription>Update profile, role, level, and office scope.</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={submitEdit}><UserFields form={editForm} roles={roles.map((r) => r.name)} offices={offices} onChange={setEditForm} /><Button className="w-full" disabled={busy}>{updateUser.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update user</Button></form></DialogContent></Dialog>
      <Dialog open={resetOpen} onOpenChange={setResetOpen}><DialogContent><DialogHeader><DialogTitle>Reset Password</DialogTitle><DialogDescription>Set a new password for {selectedUser?.name ?? "this user"}.</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={submitReset}><div className="grid gap-2"><Label>New Password</Label><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} /></div><Button className="w-full" disabled={resetPassword.isPending}>{resetPassword.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Reset password</Button></form></DialogContent></Dialog>
      <AlertDialog open={Boolean(deleteUser)} onOpenChange={(open) => !open && setDeleteUser(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete user?</AlertDialogTitle><AlertDialogDescription>This will delete {deleteUser?.name}. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { if (deleteUser) removeUser.mutate(deleteUser.id); setDeleteUser(null); }}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
}

function findParent(offices: OfficeItem[], id?: number | null) {
  return offices.find((office) => office.id === id)?.parent_id ?? null;
}

function getCityId(form: any, offices: OfficeItem[]) {
  if (form.city_id) return Number(form.city_id);
  if (form.admin_level === "city" && form.office_id) return Number(form.office_id);
  if (form.sub_city_id) return findParent(offices, Number(form.sub_city_id));
  if (form.woreda_id) {
    const subcityId = findParent(offices, Number(form.woreda_id));
    return findParent(offices, subcityId);
  }
  if (form.zone_id) {
    const woredaId = findParent(offices, Number(form.zone_id));
    const subcityId = findParent(offices, woredaId);
    return findParent(offices, subcityId);
  }
  return null;
}

function UserFields({ form, roles, offices, onChange, includePassword = false }: { form: (CreateUserPayload | UpdateUserPayload) & { city_id?: number | null }; roles: string[]; offices: OfficeItem[]; onChange: (form: any) => void; includePassword?: boolean }) {
  const isSuperAdmin = form.role === "Super Admin";
  const selectedCityId = getCityId(form, offices);
  const cities = offices.filter((office) => office.type === "city");
  const subCities = offices.filter((office) => office.type === "subcity" && (!selectedCityId || office.parent_id === selectedCityId));
  const woredas = offices.filter((office) => office.type === "woreda" && (!form.sub_city_id || office.parent_id === form.sub_city_id));
  const zones = offices.filter((office) => office.type === "zone" && (!form.woreda_id || office.parent_id === form.woreda_id));

  function setRole(role: string) {
    onChange({ ...form, role, admin_level: role === "Super Admin" ? null : (form.admin_level ?? "zone"), city_id: null, office_id: null, sub_city_id: null, woreda_id: null, zone_id: null });
  }

  function setLevel(level: AdminLevel) {
    onChange({ ...form, admin_level: level, city_id: null, office_id: null, sub_city_id: null, woreda_id: null, zone_id: null });
  }

  function setCity(id: number | null) {
    onChange({ ...form, city_id: id, office_id: form.admin_level === "city" ? id : null, sub_city_id: null, woreda_id: null, zone_id: null });
  }

  function setSubcity(id: number | null) {
    onChange({ ...form, sub_city_id: id, office_id: form.admin_level === "subcity" ? id : null, woreda_id: null, zone_id: null });
  }

  function setWoreda(id: number | null) {
    onChange({ ...form, woreda_id: id, office_id: form.admin_level === "woreda" ? id : null, zone_id: null });
  }

  function setZone(id: number | null) {
    onChange({ ...form, zone_id: id, office_id: form.admin_level === "zone" ? id : null });
  }

  return <><div className="grid gap-4 md:grid-cols-2"><div className="grid gap-2"><Label>Name</Label><Input value={form.name} onChange={(e) => onChange({ ...form, name: e.target.value })} required /></div><div className="grid gap-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => onChange({ ...form, email: e.target.value })} required /></div><div className="grid gap-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => onChange({ ...form, phone: e.target.value })} required /></div><div className="grid gap-2"><Label>Role</Label><Select value={form.role || "Admin"} onValueChange={setRole}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{roles.map((role) => <SelectItem key={role} value={role}>{role}</SelectItem>)}</SelectContent></Select></div></div><div className="grid gap-2"><Label>Address</Label><Input value={form.address ?? ""} onChange={(e) => onChange({ ...form, address: e.target.value })} /></div>{!isSuperAdmin && <><div className="grid gap-2"><Label>Admin Level</Label><Select value={form.admin_level ?? "zone"} onValueChange={(value) => setLevel(value as AdminLevel)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(levelLabels).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent></Select></div><div className="grid gap-4 md:grid-cols-4"><OfficeSelect label="City" value={selectedCityId} offices={cities} disabled={false} onValueChange={setCity} /><OfficeSelect label="Subcity" value={form.sub_city_id} offices={subCities} disabled={!selectedCityId || !["subcity", "woreda", "zone"].includes(form.admin_level ?? "")} onValueChange={setSubcity} /><OfficeSelect label="Woreda" value={form.woreda_id} offices={woredas} disabled={!form.sub_city_id || !["woreda", "zone"].includes(form.admin_level ?? "")} onValueChange={setWoreda} /><OfficeSelect label="Zone" value={form.zone_id} offices={zones} disabled={!form.woreda_id || form.admin_level !== "zone"} onValueChange={setZone} /></div></>}{includePassword && "password" in form && <div className="grid gap-2"><Label>Password</Label><Input type="password" value={form.password} onChange={(e) => onChange({ ...form, password: e.target.value })} required minLength={8} /></div>}</>;
}

function OfficeSelect({ label, value, offices, disabled, onValueChange }: { label: string; value?: number | null; offices: OfficeItem[]; disabled?: boolean; onValueChange: (value: number | null) => void }) {
  return <div className="grid gap-2"><Label>{label}</Label><Select value={value ? String(value) : "none"} onValueChange={(next) => onValueChange(numberOrNull(next))} disabled={disabled}><SelectTrigger><SelectValue placeholder={`Select ${label}`} /></SelectTrigger><SelectContent><SelectItem value="none">None</SelectItem>{offices.map((office) => <SelectItem key={office.id} value={String(office.id)}>{office.name}</SelectItem>)}</SelectContent></Select></div>;
}
