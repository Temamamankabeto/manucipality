"use client";

import { FormEvent, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDuplicateCitizenMutation, useOfficesQuery } from "@/hooks/citizen/use-citizens";
import { citizenSchema } from "@/lib/schemas/citizen.schema";
import type { CitizenItem, CitizenPayload, OfficeItem } from "@/types/citizen/citizen.type";

const emptyForm: CitizenPayload = {
  national_id: "",
  first_name: "",
  middle_name: "",
  last_name: "",
  gender: "male",
  date_of_birth: "",
  place_of_birth: "",
  nationality: "Ethiopian",
  marital_status: "single",
  phone: "",
  email: "",
  occupation: "",
  education_level: "",
  disability_status: false,
  emergency_contact: "",
  registration_channel: "municipal_office",
  address: "",
  house_number: "",
  city_id: "",
  subcity_id: "",
  woreda_id: "",
  zone_id: "",
  photo: null,
};

function officeName(offices: OfficeItem[], id: string | number) {
  return offices.find((office) => String(office.id) === String(id))?.name ?? "";
}

export default function CitizenForm({ initial, loading, submitLabel = "Save citizen", onSubmit }: { initial?: CitizenItem | null; loading?: boolean; submitLabel?: string; onSubmit: (payload: CitizenPayload) => void }) {
  const officeQuery = useOfficesQuery();
  const offices = officeQuery.data ?? [];
  const duplicateCheck = useDuplicateCitizenMutation();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<CitizenPayload>(() => initial ? {
    ...emptyForm,
    national_id: initial.national_id ?? "",
    first_name: initial.first_name ?? "",
    middle_name: initial.middle_name ?? "",
    last_name: initial.last_name ?? "",
    gender: initial.gender ?? "male",
    date_of_birth: initial.date_of_birth ?? "",
    place_of_birth: initial.place_of_birth ?? "",
    nationality: initial.nationality ?? "Ethiopian",
    marital_status: initial.marital_status ?? "single",
    phone: initial.phone ?? "",
    email: initial.email ?? "",
    occupation: initial.occupation ?? "",
    education_level: initial.education_level ?? "",
    disability_status: Boolean(initial.disability_status),
    emergency_contact: initial.emergency_contact ?? "",
    registration_channel: initial.registration_channel ?? "municipal_office",
    address: initial.address?.address ?? "",
    house_number: initial.address?.house_number ?? "",
    city_id: initial.city_id ?? "",
    subcity_id: initial.subcity_id ?? "",
    woreda_id: initial.woreda_id ?? "",
    zone_id: initial.zone_id ?? "",
    photo: null,
  } : emptyForm);

  const cityOptions = useMemo(() => offices.filter((office) => office.type === "city"), [offices]);
  const subcityOptions = useMemo(() => offices.filter((office) => office.type === "subcity" && String(office.parent_id) === String(form.city_id)), [offices, form.city_id]);
  const woredaOptions = useMemo(() => offices.filter((office) => office.type === "woreda" && String(office.parent_id) === String(form.subcity_id)), [offices, form.subcity_id]);
  const zoneOptions = useMemo(() => offices.filter((office) => office.type === "zone" && String(office.parent_id) === String(form.woreda_id)), [offices, form.woreda_id]);

  function update<K extends keyof CitizenPayload>(key: K, value: CitizenPayload[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const parsed = citizenSchema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    onSubmit(parsed.data as CitizenPayload);
  }

  function checkDuplicates() {
    duplicateCheck.mutate({ national_id: form.national_id, phone: form.phone, exclude_citizen_id: initial?.id });
  }

  return (
    <form className="space-y-6" onSubmit={submit}>
      <Card>
        <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Field label="National ID" error={errors.national_id}><Input value={form.national_id} onChange={(e) => update("national_id", e.target.value)} /></Field>
          <Field label="First Name" error={errors.first_name}><Input value={form.first_name} onChange={(e) => update("first_name", e.target.value)} /></Field>
          <Field label="Middle Name"><Input value={form.middle_name} onChange={(e) => update("middle_name", e.target.value)} /></Field>
          <Field label="Last Name" error={errors.last_name}><Input value={form.last_name} onChange={(e) => update("last_name", e.target.value)} /></Field>
          <Field label="Gender"><Select value={form.gender} onValueChange={(value) => update("gender", value as any)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></Field>
          <Field label="Date of Birth" error={errors.date_of_birth}><Input type="date" value={form.date_of_birth} onChange={(e) => update("date_of_birth", e.target.value)} /></Field>
          <Field label="Place of Birth"><Input value={form.place_of_birth} onChange={(e) => update("place_of_birth", e.target.value)} /></Field>
          <Field label="Nationality"><Input value={form.nationality} onChange={(e) => update("nationality", e.target.value)} /></Field>
          <Field label="Marital Status"><Select value={form.marital_status} onValueChange={(value) => update("marital_status", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="single">Single</SelectItem><SelectItem value="married">Married</SelectItem><SelectItem value="divorced">Divorced</SelectItem><SelectItem value="widowed">Widowed</SelectItem></SelectContent></Select></Field>
          <Field label="Phone" error={errors.phone}><Input value={form.phone} onChange={(e) => update("phone", e.target.value)} /></Field>
          <Field label="Email"><Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} /></Field>
          <Field label="Emergency Contact"><Input value={form.emergency_contact} onChange={(e) => update("emergency_contact", e.target.value)} /></Field>
          <Field label="Occupation"><Input value={form.occupation} onChange={(e) => update("occupation", e.target.value)} /></Field>
          <Field label="Education Level"><Input value={form.education_level} onChange={(e) => update("education_level", e.target.value)} /></Field>
          <div className="flex items-center gap-2 rounded-md border p-3 md:mt-6"><Checkbox checked={Boolean(form.disability_status)} onCheckedChange={(value) => update("disability_status", Boolean(value))} /><Label>Disability Status</Label></div>
          <Field label="Photo"><Input type="file" accept="image/*" onChange={(e) => update("photo", e.target.files?.[0] ?? null)} /></Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Address & Registration</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Registration Channel"><Select value={form.registration_channel} onValueChange={(value) => update("registration_channel", value as any)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="municipal_office">Municipal Office</SelectItem><SelectItem value="mobile_registration">Mobile Registration</SelectItem></SelectContent></Select></Field>
          <Field label="City" error={errors.city_id}><Select value={String(form.city_id)} onValueChange={(value) => update("city_id", value)}><SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger><SelectContent>{cityOptions.map((office) => <SelectItem key={office.id} value={String(office.id)}>{office.name}</SelectItem>)}</SelectContent></Select></Field>
          <Field label="Subcity" error={errors.subcity_id}><Select value={String(form.subcity_id)} onValueChange={(value) => { update("subcity_id", value); update("woreda_id", ""); update("zone_id", ""); }}><SelectTrigger><SelectValue placeholder="Select subcity" /></SelectTrigger><SelectContent>{subcityOptions.map((office) => <SelectItem key={office.id} value={String(office.id)}>{office.name}</SelectItem>)}</SelectContent></Select></Field>
          <Field label="Woreda" error={errors.woreda_id}><Select value={String(form.woreda_id)} onValueChange={(value) => { update("woreda_id", value); update("zone_id", ""); }}><SelectTrigger><SelectValue placeholder="Select woreda" /></SelectTrigger><SelectContent>{woredaOptions.map((office) => <SelectItem key={office.id} value={String(office.id)}>{office.name}</SelectItem>)}</SelectContent></Select></Field>
          <Field label="Zone" error={errors.zone_id}><Select value={String(form.zone_id)} onValueChange={(value) => update("zone_id", value)}><SelectTrigger><SelectValue placeholder="Select zone" /></SelectTrigger><SelectContent>{zoneOptions.map((office) => <SelectItem key={office.id} value={String(office.id)}>{office.name}</SelectItem>)}</SelectContent></Select></Field>
          <Field label="House Number"><Input value={form.house_number} onChange={(e) => update("house_number", e.target.value)} /></Field>
          <div className="md:col-span-2"><Field label="Address" error={errors.address}><textarea className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm" value={form.address} onChange={(e) => update("address", e.target.value)} /></Field></div>
        </CardContent>
      </Card>

      {duplicateCheck.data ? (
        <Card className={duplicateCheck.data.has_duplicates ? "border-destructive" : "border-green-500"}>
          <CardContent className="py-4 text-sm">
            {duplicateCheck.data.has_duplicates ? `${duplicateCheck.data.matches.length} possible duplicate(s) found.` : "No duplicate found."}
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-col gap-2 md:flex-row md:justify-end">
        <Button type="button" variant="outline" onClick={checkDuplicates} disabled={!form.national_id && !form.phone || duplicateCheck.isPending}>
          {duplicateCheck.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Check duplicates
        </Button>
        <Button disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {submitLabel}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="grid gap-2"><Label>{label}</Label>{children}{error ? <p className="text-xs text-destructive">{error}</p> : null}</div>;
}
