import { z } from "zod";
import type { CreateUserPayload, UpdateUserPayload } from "@/types/user-management/user.type";

const nullableNumber = z.preprocess((value) => {
  if (value === "" || value === undefined || value === null || value === "none") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? value : parsed;
}, z.number().int().positive().nullable().optional());

export const adminLevels = ["city", "subcity", "woreda", "zone"] as const;

const userBaseSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Valid email is required").max(100),
  phone: z.string().trim().min(6, "Phone is required").max(20),
  role: z.enum(["Super Admin", "Admin"]),
  admin_level: z.enum(adminLevels).nullable().optional(),
  address: z.string().trim().max(500).optional().or(z.literal("")),
  office_id: nullableNumber,
  sub_city_id: nullableNumber,
  woreda_id: nullableNumber,
  zone_id: nullableNumber,
});

function validateAdminScope(value: any, ctx: z.RefinementCtx) {
  if (value.role !== "Admin") return;
  if (!value.admin_level) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["admin_level"], message: "Admin level is required" });
  if (value.admin_level === "city" && !value.office_id) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["office_id"], message: "City is required" });
  if (value.admin_level === "subcity" && !value.sub_city_id) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["sub_city_id"], message: "Subcity is required" });
  if (value.admin_level === "woreda" && !value.woreda_id) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["woreda_id"], message: "Woreda is required" });
  if (value.admin_level === "zone" && !value.zone_id) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["zone_id"], message: "Zone is required" });
}

export const createUserSchema = userBaseSchema
  .extend({ password: z.string().min(8, "Password must be at least 8 characters").max(255) })
  .superRefine(validateAdminScope) as unknown as z.ZodType<CreateUserPayload>;

export const updateUserSchema = userBaseSchema
  .superRefine(validateAdminScope) as unknown as z.ZodType<UpdateUserPayload>;

export const resetUserPasswordSchema = z.object({
  new_password: z.string().min(8, "Password must be at least 8 characters").max(255),
});
