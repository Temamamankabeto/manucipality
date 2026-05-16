"use client";

import { FormEvent, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  useAddHouseholdMemberMutation,
  useCitizensQuery,
  useDeleteHouseholdMemberMutation,
  useHouseholdQuery,
} from "@/hooks";

import type { CitizenItem } from "@/types/citizen/citizen.type";
import type {
  HouseholdMemberPayload,
  RelationshipType,
} from "@/types/citizen/phase-three.type";

const relationships: RelationshipType[] = [
  "spouse",
  "child",
  "parent",
  "sibling",
  "dependent",
  "other",
];

const emptyMemberForm: HouseholdMemberPayload = {
  citizen_id: "",
  relationship: "child",
  is_dependent: false,
  status: "active",
};

export default function HouseholdDetailPage() {
  const { id } = useParams<{ id: string }>();

  const query = useHouseholdQuery(id);
  const addMember = useAddHouseholdMemberMutation(() => {
    setOpen(false);
    setForm(emptyMemberForm);
  });
  const deleteMember = useDeleteHouseholdMemberMutation();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<HouseholdMemberPayload>(emptyMemberForm);

  const household = query.data;

  function submit(event: FormEvent) {
    event.preventDefault();

    if (!form.citizen_id) {
      return;
    }

    addMember.mutate({
      householdId: id,
      payload: form,
    });
  }

  if (query.isLoading) {
    return (
      <div className="flex justify-center py-10 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading household...
      </div>
    );
  }

  if (!household) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Household not found.
        </CardContent>
      </Card>
    );
  }

  const existingMemberIds = (household.members ?? []).map((member) =>
    String(member.citizen_id)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold">{household.household_number}</h1>
          <p className="text-muted-foreground">
            Head: {household.head_citizen?.full_name ?? "—"}
          </p>
        </div>

        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Household Information</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-4">
          <Info label="Status" value={household.status} />
          <Info label="House No." value={household.house_number ?? "—"} />
          <Info
            label="Members"
            value={String(household.members?.length ?? 0)}
          />
          <Info
            label="Location"
            value={
              [
                household.city?.name,
                household.subcity?.name,
                household.woreda?.name,
                household.zone?.name,
              ]
                .filter(Boolean)
                .join(" / ") || "—"
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Relationship</TableHead>
                <TableHead>Dependent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {(household.members ?? []).length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No members found.
                  </TableCell>
                </TableRow>
              ) : (
                (household.members ?? []).map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="font-medium">
                        {member.citizen?.full_name ?? "—"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {member.citizen?.phone ?? member.citizen?.registration_number ?? "—"}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge>{member.relationship}</Badge>
                      {member.is_head ? (
                        <Badge className="ml-2" variant="secondary">
                          Head
                        </Badge>
                      ) : null}
                    </TableCell>

                    <TableCell>{member.is_dependent ? "Yes" : "No"}</TableCell>
                    <TableCell>{member.status}</TableCell>

                    <TableCell className="text-right">
                      {!member.is_head ? (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            deleteMember.mutate({
                              householdId: id,
                              memberId: member.id,
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Household Member</DialogTitle>
          </DialogHeader>

          <form className="space-y-4" onSubmit={submit}>
            <ActiveCitizenSelect
              value={form.citizen_id}
              excludedCitizenIds={existingMemberIds}
              onSelect={(citizen) =>
                setForm({
                  ...form,
                  citizen_id: citizen?.id ?? "",
                })
              }
            />

            <Field label="Relationship">
              <Select
                value={form.relationship}
                onValueChange={(value) =>
                  setForm({
                    ...form,
                    relationship: value as RelationshipType,
                    is_dependent:
                      value === "child" || value === "dependent"
                        ? true
                        : form.is_dependent,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {relationships.map((relationship) => (
                    <SelectItem key={relationship} value={relationship}>
                      {relationship}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Dependent">
              <Select
                value={form.is_dependent ? "yes" : "no"}
                onValueChange={(value) =>
                  setForm({
                    ...form,
                    is_dependent: value === "yes",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Button
              className="w-full"
              disabled={addMember.isPending || !form.citizen_id}
            >
              {addMember.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Add member
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ActiveCitizenSelect({
  value,
  excludedCitizenIds = [],
  onSelect,
}: {
  value?: number | string;
  excludedCitizenIds?: string[];
  onSelect: (citizen: CitizenItem | null) => void;
}) {
  const [search, setSearch] = useState("");

  const citizensQuery = useCitizensQuery({
    search,
    status: "active",
    per_page: 20,
  });

  const citizens = (citizensQuery.data?.data ?? []).filter(
    (citizen) => !excludedCitizenIds.includes(String(citizen.id))
  );

  const selectedCitizen =
    citizens.find((citizen) => String(citizen.id) === String(value)) ?? null;

  return (
    <div className="space-y-3">
      <Field label="Search Active Citizen">
        <Input
          placeholder="Search by name, phone, national ID..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </Field>

      <div className="rounded-lg border">
        {citizensQuery.isLoading ? (
          <div className="flex items-center p-3 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading active citizens...
          </div>
        ) : citizens.length === 0 ? (
          <div className="p-3 text-sm text-muted-foreground">
            No active citizens found. Search by name, phone, or national ID.
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto">
            {citizens.map((citizen) => {
              const active = String(citizen.id) === String(value);

              return (
                <button
                  key={citizen.id}
                  type="button"
                  onClick={() => onSelect(citizen)}
                  className={`w-full border-b p-3 text-left text-sm last:border-b-0 hover:bg-muted ${
                    active ? "bg-muted" : ""
                  }`}
                >
                  <div className="font-semibold">{citizen.full_name}</div>
                  <div className="text-xs text-muted-foreground">
                    ID: {citizen.id} • {citizen.registration_number} •{" "}
                    {citizen.phone ?? citizen.national_id ?? "No phone"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {[
                      citizen.city?.name,
                      citizen.subcity?.name,
                      citizen.woreda?.name,
                      citizen.zone?.name,
                    ]
                      .filter(Boolean)
                      .join(" / ") || "No location"}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedCitizen ? (
        <div className="rounded-lg border bg-muted/30 p-3 text-sm">
          <p className="font-semibold">Selected: {selectedCitizen.full_name}</p>
          <p className="text-muted-foreground">
            {selectedCitizen.registration_number} •{" "}
            {selectedCitizen.phone ?? "No phone"}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border p-4">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="mt-2 font-medium">{value}</p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}