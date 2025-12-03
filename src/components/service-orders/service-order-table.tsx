"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Truck } from "lucide-react";
import { ServiceOrderDetailsDialog } from "./service-order-details-dialog";
import { ChangeStatusDialog } from "./change-status-dialog";
import { DispatchPartsDialog } from "./dispatch-parts-dialog";
import { ServiceOrderWithRelations } from "@/types";

interface ServiceOrderTableProps {
  orders: ServiceOrderWithRelations[];
  onUpdate: () => void;
  userRole: string;
}

const statusVariants: Record<string, "default" | "secondary" | "destructive"> =
  {
    EN_PROCESO: "default",
    PAUSADO: "secondary",
    COMPLETADO: "destructive",
  };

const statusLabels: Record<string, string> = {
  EN_PROCESO: "En Proceso",
  PAUSADO: "Pausado",
  COMPLETADO: "Completado",
};

export function ServiceOrderTable({
  orders,
  onUpdate,
  userRole,
}: ServiceOrderTableProps) {
  const [viewingOrder, setViewingOrder] = useState<string | null>(null);
  const [changingStatus, setChangingStatus] =
    useState<ServiceOrderWithRelations | null>(null);
  const [dispatchingParts, setDispatchingParts] =
    useState<ServiceOrderWithRelations | null>(null);

  const canEdit = ["ADMIN", "ASESOR"].includes(userRole);

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-orange-50">
              <TableHead>Nro. Orden</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Vehículo</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-right">Costo (S/.)</TableHead>
              <TableHead className="text-center">Repuestos</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500">
                  No hay órdenes de servicio registradas
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
                const pendingParts = order.partRequests.filter(
                  (pr) => !pr.dispatched,
                );

                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono font-bold">
                      #{order.orderNumber}
                    </TableCell>
                    <TableCell>{order.customer.name}</TableCell>
                    <TableCell>
                      {order.vehicle.brand} {order.vehicle.model}
                      <span className="block text-xs text-gray-500">
                        {order.vehicle.plate}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={statusVariants[order.status]}>
                        {statusLabels[order.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      S/. {order.cost?.toFixed(2) || "0.00"}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="space-y-1">
                        <Badge variant="outline">
                          {order.partRequests.length} solicitados
                        </Badge>
                        {pendingParts.length > 0 && (
                          <Badge
                            variant="secondary"
                            className="bg-yellow-100 text-yellow-800"
                          >
                            {pendingParts.length} pendientes
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setViewingOrder(order.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {canEdit && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setChangingStatus(order)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {pendingParts.length > 0 && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => setDispatchingParts(order)}
                            >
                              <Truck className="w-4 h-4" />
                            </Button>
                          )}
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {viewingOrder && (
        <ServiceOrderDetailsDialog
          orderId={viewingOrder}
          onClose={() => setViewingOrder(null)}
        />
      )}

      {changingStatus && (
        <ChangeStatusDialog
          order={changingStatus}
          onClose={() => setChangingStatus(null)}
          onSuccess={() => {
            setChangingStatus(null);
            onUpdate();
          }}
        />
      )}

      {dispatchingParts && (
        <DispatchPartsDialog
          order={dispatchingParts}
          onClose={() => setDispatchingParts(null)}
          onSuccess={() => {
            setDispatchingParts(null);
            onUpdate();
          }}
        />
      )}
    </>
  );
}
