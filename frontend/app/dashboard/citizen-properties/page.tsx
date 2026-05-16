"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import {
  useAssignCitizenProperty,
  useCitizenProperties,
} from "@/hooks/property/use-property";

export default function CitizenPropertiesPage() {
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    citizen_id: 0,
    property_id: 0,
    ownership_type: "owner",
  });

  const {
    data,
    isLoading,
  } = useCitizenProperties();

  const assignMutation = useAssignCitizenProperty();

  const items = data?.data || [];

  async function handleAssign() {
    await assignMutation.mutateAsync({
      ...formData,
      citizen_id: Number(formData.citizen_id),
      property_id: Number(formData.property_id),
    });

    setOpen(false);

    setFormData({
      citizen_id: 0,
      property_id: 0,
      ownership_type: "owner",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Citizen Properties</h1>
          <p className="text-sm text-muted-foreground">
            Assign municipality properties to citizens
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Assign Property</Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Property</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <Input
                type="number"
                placeholder="Citizen ID"
                value={formData.citizen_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    citizen_id: Number(e.target.value),
                  })
                }
              />

              <Input
                type="number"
                placeholder="Property ID"
                value={formData.property_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    property_id: Number(e.target.value),
                  })
                }
              />

              <select
                value={formData.ownership_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ownership_type: e.target.value,
                  })
                }
                className="w-full rounded-md border px-3 py-2"
              >
                <option value="owner">Owner</option>
                <option value="co_owner">Co Owner</option>
                <option value="lease_holder">Lease Holder</option>
              </select>

              <Button onClick={handleAssign} disabled={assignMutation.isPending}>
                {assignMutation.isPending ? "Assigning..." : "Assign"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Citizen Property Assignments</CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Citizen</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Ownership</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : items.length > 0 ? (
                items.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.citizen?.full_name || item.citizen_id}
                    </TableCell>

                    <TableCell>
                      {item.property?.title || item.property_id}
                    </TableCell>

                    <TableCell>
                      {item.ownership_type}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    No assignments found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
