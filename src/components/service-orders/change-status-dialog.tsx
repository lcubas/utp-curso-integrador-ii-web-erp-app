"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import type { ServiceOrder } from "@/app/generated/prisma/client";

interface ChangeStatusDialogProps {
  order: ServiceOrder;
  onClose: () => void;
  onSuccess: () => void;
}

export function ChangeStatusDialog({
  order,
  onClose,
  onSuccess,
}: ChangeStatusDialogProps) {
  const [newStatus, setNewStatus] = useState(order.status);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (newStatus === order.status) {
      alert("Debe seleccionar un estado diferente");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/service-orders/${order.id}/change-status`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al cambiar estado");
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message || "Error al cambiar el estado");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cambiar Estado de la Orden</DialogTitle>
          <DialogDescription>
            Orden #{order.orderNumber} - Estado actual:{" "}
            {order.status.replace("_", " ")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1 text-sm text-blue-900">
              <p className="font-medium">
                El cliente será notificado por email
              </p>
              <p className="mt-1 text-blue-700">
                Se enviará un correo automático informando el cambio de estado.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Nuevo Estado</Label>
            <Select
              value={newStatus}
              onValueChange={(value) =>
                setNewStatus(value as ServiceOrder["status"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EN_PROCESO">En Proceso</SelectItem>
                <SelectItem value="PAUSADO">Pausado</SelectItem>
                <SelectItem value="COMPLETADO">Completado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Actualizando..." : "Actualizar y Notificar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
