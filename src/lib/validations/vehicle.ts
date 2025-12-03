import { z } from "zod";
import { es } from "zod/locales";

z.config(es());

export const vehicleSchema = z.object({
  customerId: z.string().min(1, "Debe seleccionar un cliente"),
  brand: z.string().min(2, "La marca debe tener al menos 2 caracteres"),
  model: z.string().min(2, "El modelo debe tener al menos 2 caracteres"),
  plate: z
    .string()
    .min(6, "La placa debe tener al menos 6 caracteres")
    .max(10, "La placa no puede tener más de 10 caracteres"),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;
