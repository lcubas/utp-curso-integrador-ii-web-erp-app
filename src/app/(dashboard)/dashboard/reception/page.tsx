"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, CheckCircle } from "lucide-react";
import { CustomerSearch } from "@/components/reception/customer-search";
import { VehicleSelector } from "@/components/reception/vehicle-selector";
import { Customer } from "@/app/generated/prisma/client";
import { toast } from "sonner";

export default function ReceptionPage() {
  const router = useRouter();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedCustomer || !selectedVehicleId) {
      toast.warning("Debe seleccionar un cliente y un vehículo");
      return;
    }

    setIsLoading(true);

    try {
      // Crear orden de servicio básica
      const response = await fetch("/api/service-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          vehicleId: selectedVehicleId,
          diagnosis: "Recepción inicial - Pendiente de revisión",
          cost: 0,
          partRequests: [],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al registrar recepción");
      }

      const newOrder = await response.json();
      toast.success(
        `Recepción registrada exitosamente. Orden #${newOrder.orderNumber}`,
      );

      // Redireccionar a la página de revisión
      router.push(`/dashboard/revision?orderId=${newOrder.id}`);
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message || "Error al registrar la recepción");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="bg-blue-100 p-3 rounded-lg">
          <Wrench className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Registrar Recepción
          </h1>
          <p className="text-gray-600 mt-1">
            Registra la entrada de un vehículo al taller
          </p>
        </div>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Cliente */}
        <Card>
          <CardHeader>
            <CardTitle>1. Buscar o Registrar Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerSearch
              onSelectCustomer={setSelectedCustomer}
              selectedCustomerId={selectedCustomer?.id}
            />
          </CardContent>
        </Card>

        {/* Vehículo */}
        {selectedCustomer && (
          <Card>
            <CardHeader>
              <CardTitle>2. Seleccionar Vehículo del Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <VehicleSelector
                customerId={selectedCustomer.id}
                onSelectVehicle={setSelectedVehicleId}
                selectedVehicleId={selectedVehicleId}
              />
            </CardContent>
          </Card>
        )}

        {/* Botón de guardar */}
        {selectedCustomer && selectedVehicleId && (
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Listo para registrar
                    </p>
                    <p className="text-sm text-gray-600">
                      Cliente y vehículo seleccionados correctamente
                    </p>
                  </div>
                </div>
                <Button
                  size="lg"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? "Guardando..." : "Guardar Recepción"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
