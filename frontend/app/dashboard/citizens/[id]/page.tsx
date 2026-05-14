"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Download, Loader2, Send, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CitizenForm from "@/components/citizens/citizen-form";
import CitizenStatusBadge from "@/components/citizens/status-badge";
import { useCitizenQuery, useDeleteCitizenDocumentMutation, useSubmitCitizenMutation, useUpdateCitizenMutation, useUploadCitizenDocumentMutation } from "@/hooks/citizen/use-citizens";
import type { CitizenDocumentType } from "@/types/citizen/citizen.type";

const documentLabels: Record<string, string> = {
  national_id: "National ID",
  birth_certificate: "Birth Certificate",
  kebele_letter: "Kebele Letter",
  passport_photo: "Passport Photo",
  other: "Other",
};

export default function CitizenDetailPage() {
  const { id } = useParams<{ id: string }>();
  const citizenQuery = useCitizenQuery(id);
  const [editing, setEditing] = useState(false);
  const updateCitizen = useUpdateCitizenMutation(() => { setEditing(false); citizenQuery.refetch(); });
  const submitCitizen = useSubmitCitizenMutation(() => citizenQuery.refetch());
  const citizen = citizenQuery.data;

  if (citizenQuery.isLoading) return <div className="flex justify-center py-12 text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading citizen...</div>;
  if (!citizen) return <Card><CardContent className="py-10 text-center text-muted-foreground">Citizen not found.</CardContent></Card>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-3"><Link href="/dashboard/citizens"><ArrowLeft className="mr-2 h-4 w-4" /> Back to citizens</Link></Button>
          <h1 className="text-2xl font-bold">{citizen.full_name}</h1>
          <p className="text-muted-foreground">{citizen.registration_number} · {citizen.national_id}</p>
        </div>
        <div className="flex flex-wrap gap-2"><CitizenStatusBadge status={citizen.status} /><Button variant="outline" onClick={() => setEditing((value) => !value)}>{editing ? "Cancel edit" : "Edit"}</Button>{citizen.status === "draft" && <Button onClick={() => submitCitizen.mutate(citizen.id)} disabled={submitCitizen.isPending}>{submitCitizen.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />} Submit</Button>}</div>
      </div>
      {editing ? <CitizenForm initial={citizen} loading={updateCitizen.isPending} submitLabel="Update citizen" onSubmit={(payload) => updateCitizen.mutate({ id: citizen.id, payload })} /> : <CitizenProfile citizen={citizen} />}
      <CitizenDocuments citizenId={citizen.id} documents={citizen.documents ?? []} missing={citizen.missing_required_documents ?? []} />
    </div>
  );
}

function CitizenProfile({ citizen }: { citizen: any }) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2"><CardHeader><CardTitle>Citizen Profile</CardTitle><CardDescription>Phase 1 registration data.</CardDescription></CardHeader><CardContent className="grid gap-4 md:grid-cols-2"><Info label="Full Name" value={citizen.full_name} /><Info label="Gender" value={citizen.gender} /><Info label="Date of Birth" value={citizen.date_of_birth} /><Info label="Phone" value={citizen.phone} /><Info label="Email" value={citizen.email || "—"} /><Info label="Nationality" value={citizen.nationality} /><Info label="Occupation" value={citizen.occupation || "—"} /><Info label="Emergency Contact" value={citizen.emergency_contact || "—"} /></CardContent></Card>
      <Card><CardHeader><CardTitle>Address</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><Info label="City" value={citizen.city?.name || "—"} /><Info label="Subcity" value={citizen.subcity?.name || "—"} /><Info label="Woreda" value={citizen.woreda?.name || "—"} /><Info label="Zone" value={citizen.zone?.name || "—"} /><Info label="House" value={citizen.address?.house_number || "—"} /><Info label="Address" value={citizen.address?.address || "—"} /></CardContent></Card>
    </div>
  );
}

function CitizenDocuments({ citizenId, documents, missing }: { citizenId: number | string; documents: any[]; missing: CitizenDocumentType[] }) {
  const [type, setType] = useState<CitizenDocumentType>("national_id");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const uploadDocument = useUploadCitizenDocumentMutation();
  const deleteDocument = useDeleteCitizenDocumentMutation();

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!file) return;
    uploadDocument.mutate(
      { id: citizenId, payload: { type, title: title || undefined, file } },
      { onSuccess: () => { setTitle(""); setFile(null); } }
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle>Required Documents</CardTitle><CardDescription>National ID and Birth Certificate are required before submission. Kebele Letter and Passport Photo are optional.</CardDescription></CardHeader>
      <CardContent className="space-y-5">
        {missing.length ? <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">Missing: {missing.map((item) => documentLabels[item]).join(", ")}</div> : <div className="rounded-lg border border-green-500/40 bg-green-500/5 p-3 text-sm">All required documents uploaded.</div>}
        <form className="grid gap-3 md:grid-cols-[220px_1fr_1fr_auto]" onSubmit={submit}>
          <div className="grid gap-2"><Label>Type</Label><Select value={type} onValueChange={(value) => setType(value as CitizenDocumentType)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(documentLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div>
          <div className="grid gap-2"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Optional title" /></div>
          <div className="grid gap-2"><Label>File</Label><Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></div>
          <div className="flex items-end"><Button disabled={!file || uploadDocument.isPending}>{uploadDocument.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />} Upload</Button></div>
        </form>
        <div className="space-y-2">
          {documents.length === 0 ? <p className="py-4 text-center text-sm text-muted-foreground">No documents uploaded.</p> : documents.map((document) => (
            <div key={document.id} className="flex flex-col justify-between gap-3 rounded-lg border p-3 md:flex-row md:items-center">
              <div><p className="font-medium">{document.title || documentLabels[document.type] || document.type}</p><p className="text-xs text-muted-foreground">{document.original_name || "Uploaded document"}</p></div>
              <div className="flex gap-2">{document.file_url ? <Button asChild variant="outline" size="sm"><a href={document.file_url} target="_blank" rel="noreferrer"><Download className="mr-2 h-4 w-4" /> Open</a></Button> : null}<Button variant="destructive" size="sm" onClick={() => deleteDocument.mutate({ id: citizenId, documentId: document.id })}><Trash2 className="h-4 w-4" /></Button></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function Info({ label, value }: { label: string; value?: string | number | null }) {
  return <div className="rounded-xl border p-3"><p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p><p className="mt-1 break-words text-sm font-medium capitalize">{value ?? "—"}</p></div>;
}
