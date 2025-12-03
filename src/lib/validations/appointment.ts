import { z } from "zod";

export const appointmentSchema = z.object({
  email: z.string().email("Email inválido"),
  phone: z.string().min(6, "El teléfono debe tener al menos 6 caracteres"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z
    .string()
    .min(10, "Describe brevemente el problema (mínimo 10 caracteres)"),
  date: z.string().refine((date) => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  }, "La fecha debe ser hoy o posterior"),
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;
