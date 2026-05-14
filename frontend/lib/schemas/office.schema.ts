import { z } from "zod";

export const officeSchema = z.object({
  name: z.string().min(1, "Name is required").max(150),
  code: z.string().max(80).optional().or(z.literal("")),
  type: z.enum(["city", "subcity", "woreda", "zone"]),
  parent_id: z.union([z.string(), z.number()]).nullable().optional(),
  is_active: z.boolean().optional(),
}).superRefine((value, ctx) => {
  if (value.type !== "city" && (!value.parent_id || String(value.parent_id) === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["parent_id"],
      message: "Parent office is required",
    });
  }
});

export type OfficeFormValues = z.infer<typeof officeSchema>;
