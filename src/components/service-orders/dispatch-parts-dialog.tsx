"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import type {
  Customer,
  Part,
  PartRequest,
  ServiceOrder,
  Vehicle,
} from "@/app/generated/prisma/client";

interface ServiceOrderWithParts extends ServiceOrder {
  customer: Customer;
  vehicle: Vehicle;
  partRequests: (PartRequest & { part: Part })[];
}

interface DispatchPartsDialogProps {
  order: ServiceOrderWithParts;
  onClose: () => void;
  onSuccess: () => void;
}

export function DispatchPartsDialog({
  order,
  onClose,
  onSuccess,
}: DispatchPartsDialogProps) {
  const pendingParts = order.partRequests.filter((pr) => !pr.dispatched);
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = (partRequestId: string) => {
    setSelectedParts((prev) =>
      prev.includes(partRequestId)
        ? prev.filter((id) => id !== partRequestId)
        : [...prev, partRequestId],
    );
  };

  const handleDispatch = async () => {
    if (selectedParts.length === 0) {
      alert("Debe seleccionar al menos un repuesto");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/service-orders/${order.id}/dispatch-parts`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ partRequestIds: selectedParts }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.details) {
          alert(`Stock insuficiente:\n\n${errorData.details.join("\n")}`);
        } else {
          throw new Error(errorData.error || "Error al despachar repuestos");
        }
        return;
      }

      const result = await response.json();
      if (result.lowStockAlerts > 0) {
        alert(
          `Repuestos despachados. ${result.lowStockAlerts} repuesto(s) con stock bajo.`,
        );
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message || "Error al despachar repuestos");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Despachar Repuestos</DialogTitle>
          <DialogDescription>
            Orden #{order.orderNumber} - Seleccione los repuestos a despachar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="flex-1 text-sm text-yellow-900">
              <p className="font-medium">Importante</p>
              <p className="mt-1 text-yellow-700">
                Al despachar, el stock del inventario se reducirá
                automáticamente.
              </p>
            </div>
          </div>

          {pendingParts.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No hay repuestos pendientes de despacho
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {pendingParts.map((pr) => {
                const hasStock = pr.part.stock >= pr.quantity;

                return (
                  <div
                    key={pr.id}
                    className={`flex items-start space-x-4 p-4 border rounded-lg ${
                      !hasStock ? "bg-red-50 border-red-200" : ""
                    }`}
                  >
                    <Checkbox
                      id={pr.id}
                      checked={selectedParts.includes(pr.id)}
                      onCheckedChange={() => handleToggle(pr.id)}
                      disabled={!hasStock}
                    />
                    <Label
                      htmlFor={pr.id}
                      className="flex-1 cursor-pointer space-y-1"
                    >
                      <p className="font-medium">{pr.part.name}</p>
                      <p className="text-sm text-gray-500">
                        Código: {pr.part.code}
                      </p>
                      <div className="flex items-center space-x-3 mt-2">
                        <span className="text-sm">
                          Solicitado: <strong>{pr.quantity}</strong>
                        </span>
                        <span className="text-sm">
                          Stock:{" "}
                          <strong
                            className={
                              hasStock ? "text-green-600" : "text-red-600"
                            }
                          >
                            {pr.part.stock}
                          </strong>
                        </span>
                        {!hasStock && (
                          <Badge variant="destructive" className="text-xs">
                            Stock Insuficiente
                          </Badge>
                        )}
                      </div>
                    </Label>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        S/. {(pr.part.price * pr.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-sm text-gray-600">
              {selectedParts.length} de {pendingParts.length} seleccionados
            </p>
            <div className="space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                onClick={handleDispatch}
                disabled={isLoading || selectedParts.length === 0}
              >
                {isLoading ? "Despachando..." : "Despachar Seleccionados"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
