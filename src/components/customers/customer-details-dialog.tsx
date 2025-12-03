"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, Car, FileText } from "lucide-react";
import { Customer, ServiceOrder, Vehicle } from "@/app/generated/prisma/client";

interface CustomerWithDetails extends Customer {
  vehicles: Vehicle[];
  serviceOrders: (ServiceOrder & { vehicle: Vehicle })[];
  _count: {
    serviceOrders: number;
    invoices: number;
  };
}

interface CustomerDetailsDialogProps {
  customerId: string;
  onClose: () => void;
}

export function CustomerDetailsDialog({
  customerId,
  onClose,
}: CustomerDetailsDialogProps) {
  const [customer, setCustomer] = useState<CustomerWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await fetch(`/api/customers/${customerId}`);
        if (!response.ok) throw new Error("Error al cargar cliente");
        const data = await response.json();
        setCustomer(data);
      } catch (error) {
        console.error("Error:", error);
        alert("Error al cargar los detalles del cliente");
        onClose();
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId, onClose]);

  if (isLoading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-3xl">
          <div className="text-center py-8">Cargando...</div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!customer) return null;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Detalles del Cliente</DialogTitle>
          <DialogDescription>
            Información completa del cliente y sus registros
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información básica */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Información Personal</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nombre</p>
                <p className="font-medium">{customer.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">ID</p>
                <p className="font-mono text-sm">
                  {customer.id.slice(0, 12)}...
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {customer.email && (
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{customer.email}</span>
                </div>
              )}
              {customer.phone && (
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{customer.phone}</span>
                </div>
              )}
              {customer.address && (
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{customer.address}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Vehículos */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Car className="w-5 h-5" />
              <span>Vehículos ({customer.vehicles.length})</span>
            </h3>
            {customer.vehicles.length === 0 ? (
              <p className="text-sm text-gray-500">
                No hay vehículos registrados
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {customer.vehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="p-3 border rounded-lg space-y-1"
                  >
                    <p className="font-medium">
                      {vehicle.brand} {vehicle.model}
                    </p>
                    <p className="text-sm text-gray-600">
                      Placa: {vehicle.plate}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Órdenes recientes */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Órdenes Recientes ({customer._count.serviceOrders})</span>
            </h3>
            {customer.serviceOrders.length === 0 ? (
              <p className="text-sm text-gray-500">
                No hay órdenes de servicio
              </p>
            ) : (
              <div className="space-y-2">
                {customer.serviceOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-3 border rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">Orden #{order.orderNumber}</p>
                      <p className="text-sm text-gray-600">
                        {order.vehicle.brand} {order.vehicle.model} -{" "}
                        {order.vehicle.plate}
                      </p>
                    </div>
                    <Badge
                      variant={
                        order.status === "COMPLETADO"
                          ? "default"
                          : order.status === "EN_PROCESO"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Estadísticas */}
          <Separator />
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">
                {customer._count.serviceOrders}
              </p>
              <p className="text-sm text-gray-600">Órdenes Totales</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">
                {customer._count.invoices}
              </p>
              <p className="text-sm text-gray-600">Facturas</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">
                {customer.vehicles.length}
              </p>
              <p className="text-sm text-gray-600">Vehículos</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
