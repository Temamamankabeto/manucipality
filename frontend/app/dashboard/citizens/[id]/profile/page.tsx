"use client";

import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCitizenProfileQuery } from "@/hooks";

export default function CitizenProfilePage() {
  const { id } = useParams<{ id: string }>();
  const query = useCitizenProfileQuery(id);

  if (query.isLoading) return <div className="flex justify-center py-10 text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading profile...</div>;
  const profile = query.data;
  if (!profile) return <Card><CardContent className="py-10 text-center text-muted-foreground">Profile not found.</CardContent></Card>;

  const personal = profile.personal_information as Record<string, any>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Citizen Profile</h1><p className="text-muted-foreground">Personal, family, household, documents, property placeholder, and audit sections.</p></div>
      <Card><CardHeader><CardTitle>Personal Information</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-3"><Info label="Name" value={personal.full_name} /><Info label="Citizen ID" value={personal.citizen_uid ?? personal.registration_number} /><Info label="Status" value={personal.status} /><Info label="Phone" value={personal.phone ?? "—"} /><Info label="Gender" value={personal.gender ?? "—"} /><Info label="Age" value={personal.age ? String(personal.age) : "—"} /></CardContent></Card>
      <Card><CardHeader><CardTitle>Family Information</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Relationship</TableHead><TableHead>Dependent</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{profile.family_information.members?.length ? profile.family_information.members.map((member) => <TableRow key={member.id}><TableCell>{member.citizen?.full_name}</TableCell><TableCell><Badge>{member.relationship}</Badge></TableCell><TableCell>{member.is_dependent ? "Yes" : "No"}</TableCell><TableCell>{member.status}</TableCell></TableRow>) : <TableRow><TableCell colSpan={4} className="py-6 text-center text-muted-foreground">No household family members found.</TableCell></TableRow>}</TableBody></Table></CardContent></Card>
      <Card><CardHeader><CardTitle>Household Information</CardTitle></CardHeader><CardContent>{profile.household_information ? <div className="grid gap-4 md:grid-cols-3"><Info label="Household No." value={profile.household_information.household_number} /><Info label="Head" value={profile.household_information.head_citizen?.full_name ?? "—"} /><Info label="Location" value={[profile.household_information.city?.name, profile.household_information.subcity?.name, profile.household_information.woreda?.name, profile.household_information.zone?.name].filter(Boolean).join(" / ")} /></div> : <p className="text-muted-foreground">No household assigned.</p>}</CardContent></Card>
      <Card><CardHeader><CardTitle>Documents</CardTitle></CardHeader><CardContent><pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">{JSON.stringify(profile.documents, null, 2)}</pre></CardContent></Card>
      <Card><CardHeader><CardTitle>Property Ownership</CardTitle></CardHeader><CardContent className="text-muted-foreground">{profile.property_ownership.message}</CardContent></Card>
      <Card><CardHeader><CardTitle>Audit</CardTitle></CardHeader><CardContent><pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">{JSON.stringify(profile.audit, null, 2)}</pre></CardContent></Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border p-4"><p className="text-xs uppercase text-muted-foreground">{label}</p><p className="mt-2 break-words font-medium">{value}</p></div>; }
