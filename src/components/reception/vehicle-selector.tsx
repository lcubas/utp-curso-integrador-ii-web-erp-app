"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Car } from "lucide-react";
import { VehicleFormDialog } from "@/components/service-orders/vehicle-form-dialog";
import { Label } from "@/components/ui/label";
import { Vehicle } from "@/app/generated/prisma/client";

interface VehicleSelectorProps {
  customerId: string;
  onSelectVehicle: (vehicleId: string) => void;
  selectedVehicleId?: string;
}

export function VehicleSelector({
  customerId,
  onSelectVehicle,
  selectedVehicleId,
}: VehicleSelectorProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVehicles = async () => {
    if (!customerId) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/vehicles?customerId=${customerId}`);
      if (response.ok) {
        const data = await response.json();
        setVehicles(data);
      }
    } catch (error) {
      console.error("Error al cargar vehículos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [customerId]);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  return (
    <>
      <div className="space-y-4">
        {selectedVehicle ? (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Car className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-700 font-medium">
                      Vehículo Seleccionado
                    </p>
                    <p className="text-lg font-bold text-blue-900">
                      {selectedVehicle.brand} {selectedVehicle.model}
                    </p>
                    <p className="text-sm text-blue-600">
                      Placa: {selectedVehicle.plate}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectVehicle("")}
                >
                  Cambiar
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-2">
              <Label>Seleccionar Vehículo</Label>
              {isLoading ? (
                <p className="text-sm text-gray-500">Cargando vehículos...</p>
              ) : vehicles.length === 0 ? (
                <div className="text-center p-8 border-2 border-dashed rounded-lg">
                  <Car className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-3">
                    Este cliente no tiene vehículos registrados
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateDialog(true)}
                  >
                    <Car className="w-4 h-4 mr-2" />
                    Registrar Vehículo
                  </Button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Select
                    value={selectedVehicleId}
                    onValueChange={onSelectVehicle}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Seleccionar vehículo" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.brand} {vehicle.model} - {vehicle.plate}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateDialog(true)}
                  >
                    <Car className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {showCreateDialog && (
        <VehicleFormDialog
          customerId={customerId}
          onClose={() => setShowCreateDialog(false)}
          onSuccess={() => {
            setShowCreateDialog(false);
            fetchVehicles();
          }}
        />
      )}
    </>
  );
}
