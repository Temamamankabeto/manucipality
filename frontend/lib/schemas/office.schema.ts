import { z } from "zod";
import type { OfficePayload, OfficeType } from "@/types/location/office.type";

const officeTypes = ["city", "subcity", "woreda", "zone"] as const;

const nullableParent = z.preprocess((value) => {
  if (value === "" || value === undefined || value === null || value === "none") {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? value : parsed;
}, z.number().int().positive().nullable().optional());

export const officeSchema = z
  .object({
    name: z.string().trim().min(2, "Name is required").max(150, "Name is too long"),
    code: z.string().trim().max(80, "Code is too long").optional().or(z.literal("")),
    type: z.enum(officeTypes),
    parent_id: nullableParent,
    is_active: z.boolean().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.type === "city") {
      return;
    }

    if (!value.parent_id) {
      const parentLabel: Record<OfficeType, string> = {
        city: "parent",
        subcity: "city",
        woreda: "subcity",
        zone: "woreda",
      };

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["parent_id"],
        message: `${parentLabel[value.type]} is required`,
      });
    }
  });

export function parseOfficePayload(value: unknown): OfficePayload {
  return officeSchema.parse(value) as OfficePayload;
}
