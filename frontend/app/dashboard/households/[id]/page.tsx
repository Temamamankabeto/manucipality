"use client";

import { FormEvent, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAddHouseholdMemberMutation, useDeleteHouseholdMemberMutation, useHouseholdQuery } from "@/hooks";
import type { HouseholdMemberPayload, RelationshipType } from "@/types/citizen/phase-three.type";

const relationships: RelationshipType[] = ["spouse", "child", "parent", "sibling", "dependent", "other"];

export default function HouseholdDetailPage() {
  const { id } = useParams<{ id: string }>();
  const query = useHouseholdQuery(id);
  const addMember = useAddHouseholdMemberMutation(() => setOpen(false));
  const deleteMember = useDeleteHouseholdMemberMutation();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<HouseholdMemberPayload>({ citizen_id: "", relationship: "child", is_dependent: false, status: "active" });

  function submit(event: FormEvent) {
    event.preventDefault();
    addMember.mutate({ householdId: id, payload: form });
  }

  if (query.isLoading) return <div className="flex justify-center py-10 text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading household...</div>;
  const household = query.data;
  if (!household) return <Card><CardContent className="py-10 text-center text-muted-foreground">Household not found.</CardContent></Card>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div><h1 className="text-2xl font-bold">{household.household_number}</h1><p className="text-muted-foreground">Head: {household.head_citizen?.full_name ?? "—"}</p></div>
        <Button onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" /> Add Member</Button>
      </div>

      <Card><CardHeader><CardTitle>Household Information</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-4"><Info label="Status" value={household.status} /><Info label="House No." value={household.house_number ?? "—"} /><Info label="Members" value={String(household.members?.length ?? 0)} /><Info label="Location" value={[household.city?.name, household.subcity?.name, household.woreda?.name, household.zone?.name].filter(Boolean).join(" / ")} /></CardContent></Card>

      <Card><CardHeader><CardTitle>Members</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Relationship</TableHead><TableHead>Dependent</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{(household.members ?? []).map((member) => <TableRow key={member.id}><TableCell>{member.citizen?.full_name}</TableCell><TableCell><Badge>{member.relationship}</Badge></TableCell><TableCell>{member.is_dependent ? "Yes" : "No"}</TableCell><TableCell>{member.status}</TableCell><TableCell className="text-right">{!member.is_head && <Button size="icon" variant="ghost" onClick={() => deleteMember.mutate({ householdId: id, memberId: member.id })}><Trash2 className="h-4 w-4" /></Button>}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card>

      <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>Add Household Member</DialogTitle></DialogHeader><form className="space-y-4" onSubmit={submit}><Field label="Citizen ID"><Input value={String(form.citizen_id ?? "")} onChange={(event) => setForm({ ...form, citizen_id: event.target.value })} required /></Field><Field label="Relationship"><Select value={form.relationship} onValueChange={(value) => setForm({ ...form, relationship: value as RelationshipType })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{relationships.map((relationship) => <SelectItem key={relationship} value={relationship}>{relationship}</SelectItem>)}</SelectContent></Select></Field><Button className="w-full" disabled={addMember.isPending}>{addMember.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Add member</Button></form></DialogContent></Dialog>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border p-4"><p className="text-xs uppercase text-muted-foreground">{label}</p><p className="mt-2 font-medium">{value}</p></div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="grid gap-2"><Label>{label}</Label>{children}</div>; }
