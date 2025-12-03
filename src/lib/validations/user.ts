import { z } from "zod";
import { es } from "zod/locales";

z.config(es());

export const userSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.email("Email inválido"),
  role: z.enum(["ADMIN", "ASESOR", "MECANICO"]),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .optional(),
  role: z.enum(["ADMIN", "ASESOR", "MECANICO"]).optional(),
  isActive: z.boolean().optional(),
});

export type UserFormData = z.infer<typeof userSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
