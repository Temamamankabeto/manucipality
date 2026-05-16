"use client";

import { useState } from "react";

import {
  Button,
} from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Input,
} from "@/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  useCreateProperty,
  useProperties,
} from "@/hooks/property/use-property";

export default function PropertiesPage() {
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    property_category_id: 1,
    title: "",
    property_type: "residential",
    address: "",
  });

  const {
    data,
    isLoading,
  } = useProperties();

  const createMutation = useCreateProperty();

  const properties =
    data?.data || [];

  async function handleCreate() {
    await createMutation.mutateAsync(formData);

    setOpen(false);

    setFormData({
      property_category_id: 1,
      title: "",
      property_type: "residential",
      address: "",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Properties
          </h1>

          <p className="text-sm text-muted-foreground">
            Municipality property management
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              Create Property
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Create Property
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <Input
                placeholder="Property title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    title: e.target.value,
                  })
                }
              />

              <Input
                placeholder="Property address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: e.target.value,
                  })
                }
              />

              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending
                  ? "Saving..."
                  : "Save Property"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Properties List
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  Number
                </TableHead>

                <TableHead>
                  Title
                </TableHead>

                <TableHead>
                  Type
                </TableHead>

                <TableHead>
                  Address
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : properties.length > 0 ? (
                properties.map((property: any) => (
                  <TableRow key={property.id}>
                    <TableCell>
                      {property.property_number}
                    </TableCell>

                    <TableCell>
                      {property.title}
                    </TableCell>

                    <TableCell>
                      {property.property_type}
                    </TableCell>

                    <TableCell>
                      {property.address}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No properties found
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
