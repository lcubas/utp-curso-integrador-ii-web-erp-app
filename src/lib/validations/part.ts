import { z } from "zod";
import { es } from "zod/locales";

z.config(es());

export const partSchema = z.object({
  code: z.string().min(2, "El código debe tener al menos 2 caracteres"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  stock: z.coerce.number().int().min(0, "El stock no puede ser negativo"),
  price: z.coerce.number().positive("El precio debe ser mayor a 0"),
});

export const updatePartSchema = z.object({
  code: z
    .string()
    .min(2, "El código debe tener al menos 2 caracteres")
    .optional(),
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .optional(),
  stock: z.coerce
    .number()
    .int()
    .min(0, "El stock no puede ser negativo")
    .optional(),
  price: z.coerce.number().positive("El precio debe ser mayor a 0").optional(),
});

export const adjustStockSchema = z.object({
  quantity: z.coerce.number().int("La cantidad debe ser un número entero"),
  type: z.enum(["ADD", "SUBTRACT"]),
});

export type PartFormData = z.infer<typeof partSchema>;
export type UpdatePartFormData = z.infer<typeof updatePartSchema>;
export type AdjustStockData = z.infer<typeof adjustStockSchema>;
