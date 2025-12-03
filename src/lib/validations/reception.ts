import { z } from "zod";

export const receptionSchema = z.object({
  customerId: z.string().min(1, "Debe seleccionar un cliente"),
  vehicleId: z.string().min(1, "Debe seleccionar un vehículo"),
});

export const revisionSchema = z.object({
  serviceOrderId: z.string().min(1, "Debe seleccionar una orden de servicio"),
  diagnosis: z
    .string()
    .min(10, "El diagnóstico debe tener al menos 10 caracteres"),
  cost: z.coerce.number().min(0, "El costo no puede ser negativo"),
  partRequests: z
    .array(
      z.object({
        partId: z.string().min(1, "Debe seleccionar un repuesto"),
        quantity: z.coerce
          .number()
          .int()
          .min(1, "La cantidad debe ser al menos 1"),
      }),
    )
    .optional(),
});

export type ReceptionFormData = z.infer<typeof receptionSchema>;
export type RevisionFormData = z.infer<typeof revisionSchema>;
