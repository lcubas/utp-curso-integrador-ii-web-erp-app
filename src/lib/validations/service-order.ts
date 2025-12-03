import { z } from "zod";
import { es } from "zod/locales";

z.config(es());

export const serviceOrderSchema = z.object({
  customerId: z.string().min(1, "Debe seleccionar un cliente"),
  vehicleId: z.string().min(1, "Debe seleccionar un vehículo"),
  diagnosis: z.string().optional(),
  cost: z.coerce.number().min(0, "El costo no puede ser negativo").optional(),
  partRequests: z
    .array(
      z.object({
        partId: z.string().min(1, "Debe seleccionar un repuesto"),
        quantity: z.coerce
          .number()
          .int()
          .min(1, "La cantidad debe ser al menos 1"),
        reason: z.string().optional(),
      }),
    )
    .optional(),
});

export const updateServiceOrderSchema = z.object({
  diagnosis: z.string().optional(),
  cost: z.coerce.number().min(0, "El costo no puede ser negativo").optional(),
  status: z.enum(["EN_PROCESO", "PAUSADO", "COMPLETADO"]).optional(),
});

export type ServiceOrderFormData = z.infer<typeof serviceOrderSchema>;
export type UpdateServiceOrderFormData = z.infer<
  typeof updateServiceOrderSchema
>;
