"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Car } from "lucide-react";
import {
  serviceOrderSchema,
  ServiceOrderFormData,
} from "@/lib/validations/service-order";
import { Customer, Part, Vehicle } from "@/app/generated/prisma/client";
import { VehicleFormDialog } from "./vehicle-form-dialog";

interface ServiceOrderFormProps {
  onSuccess: (orderId: string) => void;
}

export function ServiceOrderForm({ onSuccess }: ServiceOrderFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [showVehicleDialog, setShowVehicleDialog] = useState(false);

  const form = useForm<ServiceOrderFormData>({
    resolver: zodResolver(
      serviceOrderSchema,
    ) as unknown as Resolver<ServiceOrderFormData>,
    defaultValues: {
      customerId: "",
      vehicleId: "",
      diagnosis: "",
      cost: 0,
      partRequests: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "partRequests",
  });

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersRes, partsRes] = await Promise.all([
          fetch("/api/customers"),
          fetch("/api/parts"),
        ]);

        if (customersRes.ok) {
          const customersData = await customersRes.json();
          setCustomers(customersData);
        }

        if (partsRes.ok) {
          const partsData = await partsRes.json();
          setParts(partsData);
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };

    fetchData();
  }, []);

  // Cargar vehículos cuando se selecciona un cliente
  useEffect(() => {
    if (selectedCustomerId) {
      const fetchVehicles = async () => {
        try {
          const response = await fetch(
            `/api/vehicles?customerId=${selectedCustomerId}`,
          );
          if (response.ok) {
            const data = await response.json();
            setVehicles(data);
          }
        } catch (error) {
          console.error("Error al cargar vehículos:", error);
        }
      };

      fetchVehicles();
    } else {
      setVehicles([]);
      form.setValue("vehicleId", "");
    }
  }, [selectedCustomerId, form]);

  const onSubmit = async (data: ServiceOrderFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/service-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear orden");
      }

      const newOrder = await response.json();
      onSuccess(newOrder.id);
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message || "Error al crear la orden");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomerId(customerId);
    form.setValue("customerId", customerId);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Cliente */}
          <Card>
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seleccionar Cliente *</FormLabel>
                    <Select
                      onValueChange={handleCustomerChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}{" "}
                            {customer.phone && `- ${customer.phone}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Vehículo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Vehículo</span>
                {selectedCustomerId && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowVehicleDialog(true)}
                  >
                    <Car className="w-4 h-4 mr-2" />
                    Registrar Vehículo
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="vehicleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seleccionar Vehículo *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!selectedCustomerId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar vehículo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.brand} {vehicle.model} - {vehicle.plate}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!selectedCustomerId && (
                <p className="text-sm text-gray-500">
                  Seleccione primero un cliente para ver sus vehículos
                </p>
              )}
            </CardContent>
          </Card>

          {/* Diagnóstico */}
          <Card>
            <CardHeader>
              <CardTitle>Diagnóstico</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="diagnosis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción del Diagnóstico</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe el problema o servicio a realizar..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Repuestos Requeridos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Repuestos Requeridos</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({ partId: "", quantity: 1, reason: "" })
                  }
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Repuesto
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No hay repuestos agregados
                </p>
              ) : (
                fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-start space-x-4 p-4 border rounded-lg"
                  >
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`partRequests.${index}.partId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Repuesto</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {parts.map((part) => (
                                  <SelectItem key={part.id} value={part.id}>
                                    {part.name} ({part.code}) - Stock:{" "}
                                    {part.stock}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`partRequests.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cantidad</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="mt-8"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Costo de Mano de Obra */}
          <Card>
            <CardHeader>
              <CardTitle>Costo de Mano de Obra</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Costo (S/.)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar Cotización"}
            </Button>
          </div>
        </form>
      </Form>

      {showVehicleDialog && selectedCustomerId && (
        <VehicleFormDialog
          customerId={selectedCustomerId}
          onClose={() => setShowVehicleDialog(false)}
          onSuccess={async () => {
            setShowVehicleDialog(false);
            // Recargar vehículos
            const response = await fetch(
              `/api/vehicles?customerId=${selectedCustomerId}`,
            );
            if (response.ok) {
              const data = await response.json();
              setVehicles(data);
            }
          }}
        />
      )}
    </>
  );
}
