"use client";

import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useDuplicateCitizenMutation } from "@/hooks/citizen/use-citizens";
import { citizenSchema } from "@/lib/schemas/citizen.schema";

import type {
  CitizenItem,
  CitizenPayload,
} from "@/types/citizen/citizen.type";

const occupationOptions = [
  "Student",
  "Government Employee",
  "Private Employee",
  "Self Employed",
  "Farmer",
  "Merchant",
  "Daily Laborer",
  "Unemployed",
  "Retired",
  "Other",
];

const educationOptions = [
  "No Formal Education",
  "Primary",
  "Secondary",
  "TVET / Diploma",
  "Bachelor Degree",
  "Master Degree",
  "PhD",
  "Other",
];

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
  address: "",
  house_number: "",
  photo: null,
};

export default function CitizenForm({
  initial,
  loading,
  submitLabel = "Save citizen",
  onSubmit,
}: {
  initial?: CitizenItem | null;
  loading?: boolean;
  submitLabel?: string;
  onSubmit: (payload: CitizenPayload) => void;
}) {
  const duplicateCheck = useDuplicateCitizenMutation();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<CitizenPayload>(() =>
    initial
      ? {
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
          address: initial.address?.address ?? "",
          house_number: initial.address?.house_number ?? "",
          photo: null,
        }
      : emptyForm
  );

  function update<K extends keyof CitizenPayload>(
    key: K,
    value: CitizenPayload[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  function submit(event: FormEvent) {
    event.preventDefault();

    const parsed = citizenSchema.safeParse(form);

    if (!parsed.success) {
      const next: Record<string, string> = {};

      for (const issue of parsed.error.issues) {
        next[String(issue.path[0])] = issue.message;
      }

      setErrors(next);
      return;
    }

    onSubmit(parsed.data as CitizenPayload);
  }

  function checkDuplicates() {
    duplicateCheck.mutate({
      national_id: form.national_id,
      phone: form.phone,
      exclude_citizen_id: initial?.id,
    });
  }

  return (
    <form className="space-y-6" onSubmit={submit}>
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-3">
          <Field label="National ID" error={errors.national_id}>
            <Input
              value={form.national_id}
              onChange={(event) => update("national_id", event.target.value)}
            />
          </Field>

          <Field label="First Name" error={errors.first_name}>
            <Input
              value={form.first_name}
              onChange={(event) => update("first_name", event.target.value)}
            />
          </Field>

          <Field label="Middle Name">
            <Input
              value={form.middle_name ?? ""}
              onChange={(event) => update("middle_name", event.target.value)}
            />
          </Field>

          <Field label="Last Name" error={errors.last_name}>
            <Input
              value={form.last_name}
              onChange={(event) => update("last_name", event.target.value)}
            />
          </Field>

          <Field label="Gender">
            <Select
              value={form.gender}
              onValueChange={(value) =>
                update("gender", value as CitizenPayload["gender"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Date of Birth" error={errors.date_of_birth}>
            <Input
              type="date"
              value={form.date_of_birth}
              onChange={(event) => update("date_of_birth", event.target.value)}
            />
          </Field>

          <Field label="Place of Birth">
            <Input
              value={form.place_of_birth ?? ""}
              onChange={(event) => update("place_of_birth", event.target.value)}
            />
          </Field>

          <Field label="Nationality">
            <Input
              value={form.nationality}
              onChange={(event) => update("nationality", event.target.value)}
            />
          </Field>

          <Field label="Marital Status">
            <Select
              value={form.marital_status ?? "single"}
              onValueChange={(value) => update("marital_status", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="married">Married</SelectItem>
                <SelectItem value="divorced">Divorced</SelectItem>
                <SelectItem value="widowed">Widowed</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Phone" error={errors.phone}>
            <Input
              value={form.phone}
              onChange={(event) => update("phone", event.target.value)}
            />
          </Field>

          <Field label="Email">
            <Input
              type="email"
              value={form.email ?? ""}
              onChange={(event) => update("email", event.target.value)}
            />
          </Field>

          <Field label="Emergency Contact">
            <Input
              value={form.emergency_contact ?? ""}
              onChange={(event) =>
                update("emergency_contact", event.target.value)
              }
            />
          </Field>

          <Field label="Occupation">
            <Select
              value={form.occupation ?? ""}
              onValueChange={(value) => update("occupation", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select occupation" />
              </SelectTrigger>
              <SelectContent>
                {occupationOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Education Level">
            <Select
              value={form.education_level ?? ""}
              onValueChange={(value) => update("education_level", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select education level" />
              </SelectTrigger>
              <SelectContent>
                {educationOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="flex items-center gap-2 rounded-md border p-3 md:mt-6">
            <Checkbox
              checked={Boolean(form.disability_status)}
              onCheckedChange={(value) =>
                update("disability_status", Boolean(value))
              }
            />
            <Label>Disability Status</Label>
          </div>

          <Field label="Photo">
            <Input
              type="file"
              accept="image/*"
              onChange={(event) =>
                update("photo", event.target.files?.[0] ?? null)
              }
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Address</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-muted/30 p-3 text-sm md:col-span-2">
            Location is assigned automatically from the logged-in admin scope.
            It is stored by the backend and cannot be changed from this form.
          </div>

          <Field label="House Number">
            <Input
              value={form.house_number ?? ""}
              onChange={(event) => update("house_number", event.target.value)}
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Address" error={errors.address}>
              <textarea
                className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={form.address}
                onChange={(event) => update("address", event.target.value)}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      {duplicateCheck.data ? (
        <Card
          className={
            duplicateCheck.data.has_duplicates
              ? "border-destructive"
              : "border-green-500"
          }
        >
          <CardContent className="space-y-4 py-4 text-sm">
            {!duplicateCheck.data.has_duplicates ? (
              <p className="font-medium text-green-700">No duplicate found.</p>
            ) : (
              <>
                <p className="font-semibold text-destructive">
                  {duplicateCheck.data.matches.length} possible duplicate(s)
                  found.
                </p>

                <div className="space-y-3">
                  {duplicateCheck.data.matches.map((match) => (
                    <div
                      key={match.id}
                      className="rounded-lg border bg-background p-3"
                    >
                      <div className="grid gap-3 md:grid-cols-3">
                        <InfoItem label="Full Name" value={match.full_name} />
                        <InfoItem
                          label="Registration No"
                          value={match.registration_number}
                        />
                        <InfoItem
                          label="Citizen ID"
                          value={match.citizen_uid ?? "—"}
                        />
                        <InfoItem
                          label="National ID"
                          value={match.national_id ?? "—"}
                        />
                        <InfoItem label="Phone" value={match.phone ?? "—"} />
                        <InfoItem label="Status" value={match.status} />
                        <InfoItem label="Gender" value={match.gender} />
                        <InfoItem
                          label="Location"
                          value={
                            [
                              match.city?.name,
                              match.subcity?.name,
                              match.woreda?.name,
                              match.zone?.name,
                            ]
                              .filter(Boolean)
                              .join(" / ") || "—"
                          }
                        />
                        <InfoItem
                          label="Created"
                          value={
                            match.created_at
                              ? new Date(match.created_at).toLocaleString()
                              : "—"
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground">
                  Review the existing record before creating a new citizen
                  draft.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-col gap-2 md:flex-row md:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={checkDuplicates}
          disabled={(!form.national_id && !form.phone) || duplicateCheck.isPending}
        >
          {duplicateCheck.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Check duplicates
        </Button>

        <Button disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="break-words font-semibold capitalize">{value ?? "—"}</p>
    </div>
  );
}