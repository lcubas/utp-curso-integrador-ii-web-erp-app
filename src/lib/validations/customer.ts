import { z } from "zod";
import { es } from "zod/locales";

z.config(es());

export const customerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.email("Email inválido").optional().or(z.literal("")),
  phone: z
    .string()
    .min(6, "El teléfono debe tener al menos 6 caracteres")
    .optional()
    .or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
});

export const updateCustomerSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z
    .string()
    .min(6, "El teléfono debe tener al menos 6 caracteres")
    .optional()
    .or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
});

export type CustomerFormData = z.infer<typeof customerSchema>;
export type UpdateCustomerFormData = z.infer<typeof updateCustomerSchema>;
