import { z } from "zod";
import { es } from "zod/locales";

z.config(es());

export const invoiceSchema = z.object({
  serviceOrderId: z.string().min(1, "Debe seleccionar una orden de servicio"),
  dni: z.string().min(8, "El DNI/RUC debe tener al menos 8 caracteres"),
  businessName: z
    .string()
    .min(2, "El nombre/razón social debe tener al menos 2 caracteres"),
  subtotal: z.coerce.number().positive("El subtotal debe ser mayor a 0"),
  igv: z.coerce.number().min(0, "El IGV no puede ser negativo"),
  total: z.coerce.number().positive("El total debe ser mayor a 0"),
});

export const paymentSchema = z.object({
  invoiceId: z.string().min(1, "Debe especificar una factura"),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  paymentMethod: z.enum(["EFECTIVO", "TARJETA", "TRANSFERENCIA"]),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;
export type PaymentFormData = z.infer<typeof paymentSchema>;
