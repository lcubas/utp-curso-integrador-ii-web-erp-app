"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, User, Car, Package, DollarSign } from "lucide-react";
import type {
  Customer,
  Part,
  PartRequest,
  ServiceOrder,
  Vehicle,
} from "@/app/generated/prisma/client";

interface ServiceOrderWithDetails extends ServiceOrder {
  customer: Customer;
  vehicle: Vehicle;
  partRequests: (PartRequest & { part: Part })[];
}

interface ServiceOrderDetailsDialogProps {
  orderId: string;
  onClose: () => void;
}

export function ServiceOrderDetailsDialog({
  orderId,
  onClose,
}: ServiceOrderDetailsDialogProps) {
  const [order, setOrder] = useState<ServiceOrderWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/service-orders/${orderId}`);
        if (!response.ok) throw new Error("Error al cargar orden");
        const data = await response.json();
        setOrder(data);
      } catch (error) {
        console.error("Error:", error);
        alert("Error al cargar los detalles de la orden");
        onClose();
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, onClose]);

  if (isLoading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-3xl">
          <div className="text-center py-8">Cargando...</div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!order) return null;

  const totalParts = order.partRequests.reduce(
    (sum, pr) => sum + pr.part.price * pr.quantity,
    0
  );
  const totalGeneral = (order.cost || 0) + totalParts;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center space-x-3">
            <FileText className="w-6 h-6 text-orange-600" />
            <span>Orden de Servicio #{order.orderNumber}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estado */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-600">
              Estado Actual
            </span>
            <Badge
              variant={
                order.status === "COMPLETADO"
                  ? "default"
                  : order.status === "EN_PROCESO"
                  ? "secondary"
                  : "destructive"
              }
              className="text-base px-4 py-1"
            >
              {order.status.replace("_", " ")}
            </Badge>
          </div>

          {/* Cliente */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Cliente</span>
            </h3>
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Nombre</p>
                <p className="font-medium">{order.customer.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Teléfono</p>
                <p className="font-medium">{order.customer.phone || "N/A"}</p>
              </div>
              {order.customer.email && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{order.customer.email}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Vehículo */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Car className="w-5 h-5" />
              <span>Vehículo</span>
            </h3>
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Marca</p>
                <p className="font-medium">{order.vehicle.brand}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Modelo</p>
                <p className="font-medium">{order.vehicle.model}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Placa</p>
                <p className="font-medium">{order.vehicle.plate}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Diagnóstico */}
          {order.diagnosis && (
            <>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Diagnóstico</h3>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {order.diagnosis}
                  </p>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Repuestos */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Repuestos Solicitados ({order.partRequests.length})</span>
            </h3>
            {order.partRequests.length === 0 ? (
              <p className="text-sm text-gray-500">
                No hay repuestos solicitados
              </p>
            ) : (
              <div className="space-y-2">
                {order.partRequests.map((pr) => (
                  <div
                    key={pr.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{pr.part.name}</p>
                      <p className="text-sm text-gray-500">
                        Código: {pr.part.code}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm">
                        Cantidad:{" "}
                        <span className="font-bold">{pr.quantity}</span>
                      </p>
                      <p className="text-sm font-medium">
                        S/. {(pr.part.price * pr.quantity).toFixed(2)}
                      </p>
                      <Badge variant={pr.dispatched ? "default" : "secondary"}>
                        {pr.dispatched ? "Despachado" : "Pendiente"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Costos */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>Resumen de Costos</span>
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between p-3 bg-gray-50 rounded">
                <span className="text-gray-600">Mano de Obra</span>
                <span className="font-medium">
                  S/. {(order.cost || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded">
                <span className="text-gray-600">Repuestos</span>
                <span className="font-medium">S/. {totalParts.toFixed(2)}</span>
              </div>
              <div className="flex justify-between p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                <span className="text-lg font-bold text-orange-900">Total</span>
                <span className="text-xl font-bold text-orange-600">
                  S/. {totalGeneral.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
