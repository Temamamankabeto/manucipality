import { z } from "zod";

export const roleSchema = z.object({
  name: z.enum(["Super Admin", "Admin"]),
});
