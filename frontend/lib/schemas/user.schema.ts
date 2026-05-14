import { z } from "zod";
import type { AdminLevel, CreateUserPayload, UpdateUserPayload } from "@/types/user-management/user.type";

const nullableNumber = z.preprocess((value) => {
  if (value === "" || value === undefined || value === null || value === "none") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? value : parsed;
}, z.number().int().positive().nullable().optional());

export const adminLevels = ["city", "subcity", "woreda", "zone"] as const;

const commonUserFields = {
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
};

function validateAdminScope(value: {
  role?: "Super Admin" | "Admin" | string;
  admin_level?: AdminLevel | null;
  office_id?: number | null;
  sub_city_id?: number | null;
  woreda_id?: number | null;
  zone_id?: number | null;
}, ctx: z.RefinementCtx) {
  if (value.role === "Super Admin") return;

  if (value.role === "Admin" && !value.admin_level) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["admin_level"], message: "Admin level is required" });
  }

  if (value.role === "Admin" && value.admin_level === "city" && !value.office_id) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["office_id"], message: "City is required" });
  }

  if (value.role === "Admin" && value.admin_level === "subcity" && !value.sub_city_id) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["sub_city_id"], message: "Subcity is required" });
  }

  if (value.role === "Admin" && value.admin_level === "woreda" && !value.woreda_id) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["woreda_id"], message: "Woreda is required" });
  }

  if (value.role === "Admin" && value.admin_level === "zone" && !value.zone_id) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["zone_id"], message: "Zone is required" });
  }
}

const createShape = z.object({
  ...commonUserFields,
  password: z.string().min(8, "Password must be at least 8 characters").max(255),
});

const updateShape = z.object(commonUserFields);

export const createUserSchema = createShape.superRefine(validateAdminScope) as unknown as z.ZodType<CreateUserPayload>;
export const updateUserSchema = updateShape.superRefine(validateAdminScope) as unknown as z.ZodType<UpdateUserPayload>;

export const resetUserPasswordSchema = z.object({
  new_password: z.string().min(8, "Password must be at least 8 characters").max(255),
});
