"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { Loader2, Plus, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  useAllOfficesQuery,
  useCitizensQuery,
  useCreateHouseholdMutation,
  useHouseholdsQuery,
} from "@/hooks";

import type { CitizenItem } from "@/types/citizen/citizen.type";
import type {
  HouseholdPayload,
  HouseholdStatus,
} from "@/types/citizen/phase-three.type";
import type { OfficeItem } from "@/types/location/office.type";

const emptyForm: HouseholdPayload = {
  head_citizen_id: "",
  city_id: "",
  subcity_id: "",
  woreda_id: "",
  zone_id: "",
  house_number: "",
  address: "",
  status: "active",
};

export default function HouseholdsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<HouseholdStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<HouseholdPayload>(emptyForm);

  const params = useMemo(
    () => ({ search, status, page, per_page: 10 }),
    [search, status, page]
  );

  const query = useHouseholdsQuery(params);
  const offices = useAllOfficesQuery({ status: "active", all: true }).data ?? [];

  const createHousehold = useCreateHouseholdMutation(() => {
    setOpen(false);
    setForm(emptyForm);
  });

  const rows = query.data?.data ?? [];
  const meta = query.data?.meta;

  function submit(event: FormEvent) {
    event.preventDefault();

    if (!form.head_citizen_id) {
      toast.error("Please select active household head citizen");
      return;
    }

    createHousehold.mutate({
      ...form,
      city_id: form.city_id || null,
      subcity_id: form.subcity_id || null,
      woreda_id: form.woreda_id || null,
      zone_id: form.zone_id || null,
    });
  }

  function handleHeadCitizenSelect(citizen: CitizenItem | null) {
    if (!citizen) {
      setForm({
        ...form,
        head_citizen_id: "",
        city_id: "",
        subcity_id: "",
        woreda_id: "",
        zone_id: "",
      });
      return;
    }

    setForm({
      ...form,
      head_citizen_id: citizen.id,
      city_id: citizen.city_id ?? citizen.city?.id ?? "",
      subcity_id: citizen.subcity_id ?? citizen.subcity?.id ?? "",
      woreda_id: citizen.woreda_id ?? citizen.woreda?.id ?? "",
      zone_id: citizen.zone_id ?? citizen.zone?.id ?? "",
      address: citizen.address?.address ?? form.address ?? "",
      house_number: citizen.address?.house_number ?? form.house_number ?? "",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Households</h1>
          <p className="text-muted-foreground">
            Create households, assign heads, and manage family grouping.
          </p>
        </div>

        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Household
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle>Household List</CardTitle>

            <div className="flex flex-col gap-2 md:flex-row">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-8 md:w-72"
                  placeholder="Search household/head..."
                  value={search}
                  onChange={(event) => {
                    setPage(1);
                    setSearch(event.target.value);
                  }}
                />
              </div>

              <Select
                value={status}
                onValueChange={(value) => {
                  setPage(1);
                  setStatus(value as HouseholdStatus | "all");
                }}
              >
                <SelectTrigger className="md:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => query.refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {query.isLoading ? (
            <div className="flex justify-center py-10 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading households...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No.</TableHead>
                  <TableHead>Head</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No households found
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((household) => (
                    <TableRow key={household.id}>
                      <TableCell className="font-medium">
                        {household.household_number}
                      </TableCell>
                      <TableCell>{household.head_citizen?.full_name ?? "—"}</TableCell>
                      <TableCell>
                        {[
                          household.city?.name,
                          household.subcity?.name,
                          household.woreda?.name,
                          household.zone?.name,
                        ]
                          .filter(Boolean)
                          .join(" / ") || "—"}
                      </TableCell>
                      <TableCell>
                        {household.members_count ?? household.members?.length ?? 0}
                      </TableCell>
                      <TableCell>
                        <Badge>{household.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/dashboard/households/${household.id}`}>
                            Manage
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {meta && meta.last_page > 1 ? (
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Page {meta.current_page} of {meta.last_page}
              </span>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Previous
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.last_page}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Household</DialogTitle>
            <DialogDescription>
              Select an active citizen as the household head. Location is filled
              automatically from the selected citizen.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={submit}>
            <ActiveCitizenSelect
              value={form.head_citizen_id}
              onSelect={handleHeadCitizenSelect}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="House Number">
                <Input
                  value={form.house_number ?? ""}
                  onChange={(event) =>
                    setForm({ ...form, house_number: event.target.value })
                  }
                />
              </Field>

              <Field label="Status">
                <Select
                  value={form.status ?? "active"}
                  onValueChange={(value) =>
                    setForm({ ...form, status: value as HouseholdStatus })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <LocationPreview offices={offices} form={form} />

            <Field label="Address">
              <Input
                value={form.address ?? ""}
                onChange={(event) =>
                  setForm({ ...form, address: event.target.value })
                }
              />
            </Field>

            <Button className="w-full" disabled={createHousehold.isPending}>
              {createHousehold.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Save Household
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ActiveCitizenSelect({
  value,
  onSelect,
}: {
  value?: number | string;
  onSelect: (citizen: CitizenItem | null) => void;
}) {
  const [search, setSearch] = useState("");

  const citizensQuery = useCitizensQuery({
    search,
    status: "active",
    per_page: 20,
  });

  const citizens = citizensQuery.data?.data ?? [];

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

function LocationPreview({
  offices,
  form,
}: {
  offices: OfficeItem[];
  form: HouseholdPayload;
}) {
  function officeName(id?: number | string | null) {
    return offices.find((office) => String(office.id) === String(id))?.name ?? "—";
  }

  return (
    <div className="grid gap-3 rounded-lg border bg-muted/30 p-3 text-sm md:grid-cols-4">
      <Info label="City" value={officeName(form.city_id)} />
      <Info label="Subcity" value={officeName(form.subcity_id)} />
      <Info label="Woreda" value={officeName(form.woreda_id)} />
      <Info label="Zone" value={officeName(form.zone_id)} />
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

function Info({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="font-semibold">{value ?? "—"}</p>
    </div>
  );
}