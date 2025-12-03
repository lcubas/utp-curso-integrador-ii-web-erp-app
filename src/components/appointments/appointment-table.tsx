"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AppointmentWithRelations } from "@/types";

interface AppointmentTableProps {
  appointments: AppointmentWithRelations[];
}

const statusVariants: Record<string, "default" | "secondary" | "destructive"> =
  {
    PENDIENTE: "secondary",
    CONFIRMADA: "default",
    CANCELADA: "destructive",
  };

const statusLabels: Record<string, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADA: "Confirmada",
  CANCELADA: "Cancelada",
};

export function AppointmentTable({ appointments }: AppointmentTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-orange-50">
            <TableHead>Fecha</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead className="text-center">Estado</TableHead>
            <TableHead>Solicitado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-gray-500">
                No hay citas registradas
              </TableCell>
            </TableRow>
          ) : (
            appointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell className="font-medium">
                  {format(new Date(appointment.date), "dd/MM/yyyy", {
                    locale: es,
                  })}
                </TableCell>
                <TableCell>{appointment.name}</TableCell>
                <TableCell className="text-sm">{appointment.email}</TableCell>
                <TableCell>{appointment.phone}</TableCell>
                <TableCell
                  className="max-w-xs truncate"
                  title={appointment.description}
                >
                  {appointment.description}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={statusVariants[appointment.status]}>
                    {statusLabels[appointment.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {format(new Date(appointment.createdAt), "dd/MM/yyyy HH:mm", {
                    locale: es,
                  })}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
