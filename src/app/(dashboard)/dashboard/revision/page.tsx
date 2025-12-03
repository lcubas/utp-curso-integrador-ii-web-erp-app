"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ClipboardList, Plus, Trash2, AlertCircle } from "lucide-react";
import { revisionSchema, RevisionFormData } from "@/lib/validations/reception";
import {
  Customer,
  Part,
  ServiceOrder,
  Vehicle,
} from "@/app/generated/prisma/client";

interface ServiceOrderWithDetails extends ServiceOrder {
  customer: Customer;
  vehicle: Vehicle;
}

export default function RevisionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get("orderId");

  const [orders, setOrders] = useState<ServiceOrderWithDetails[]>([]);
  const [selectedOrder, setSelectedOrder] =
    useState<ServiceOrderWithDetails | null>(null);
  const [parts, setParts] = useState<Part[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RevisionFormData>({
    resolver: zodResolver(revisionSchema) as Resolver<RevisionFormData>,
    defaultValues: {
      serviceOrderId: orderIdParam || "",
      diagnosis: "",
      cost: 0,
      partRequests: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "partRequests",
  });

  // Cargar órdenes y repuestos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, partsRes] = await Promise.all([
          fetch("/api/service-orders?status=EN_PROCESO"),
          fetch("/api/parts"),
        ]);

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData);

          // Si hay orderId en URL, seleccionar esa orden
          if (orderIdParam) {
            const order = ordersData.find((o: any) => o.id === orderIdParam);
            if (order) {
              setSelectedOrder(order);
              form.setValue("serviceOrderId", order.id);
            }
          }
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
  }, [orderIdParam, form]);

  const handleOrderChange = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    setSelectedOrder(order || null);
    form.setValue("serviceOrderId", orderId);
  };

  const onSubmit = async (data: RevisionFormData) => {
    setIsLoading(true);

    try {
      // Actualizar diagnóstico y costo
      const updateResponse = await fetch(
        `/api/service-orders/${data.serviceOrderId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            diagnosis: data.diagnosis,
            cost: data.cost,
          }),
        },
      );

      if (!updateResponse.ok) {
        throw new Error("Error al actualizar orden");
      }

      // Agregar repuestos si hay
      if (data.partRequests && data.partRequests.length > 0) {
        const partsResponse = await fetch(
          `/api/service-orders/${data.serviceOrderId}/add-parts`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ partRequests: data.partRequests }),
          },
        );

        if (!partsResponse.ok) {
          throw new Error("Error al agregar repuestos");
        }
      }

      alert("Revisión registrada exitosamente");
      router.push("/dashboard/service-orders");
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message || "Error al registrar la revisión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="bg-purple-100 p-3 rounded-lg">
          <ClipboardList className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Registrar Revisión
          </h1>
          <p className="text-gray-600 mt-1">
            Registra el diagnóstico y repuestos necesarios
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Seleccionar Orden */}
          <Card>
            <CardHeader>
              <CardTitle>Seleccionar Orden de Servicio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="serviceOrderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Orden de Servicio *</FormLabel>
                    <Select
                      onValueChange={handleOrderChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar orden" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {orders.map((order) => (
                          <SelectItem key={order.id} value={order.id}>
                            #{order.orderNumber} - {order.customer.name} (
                            {order.vehicle.brand} {order.vehicle.model} -{" "}
                            {order.vehicle.plate})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedOrder && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-blue-700 font-medium">Cliente</p>
                      <p className="text-blue-900">
                        {selectedOrder.customer.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-700 font-medium">Teléfono</p>
                      <p className="text-blue-900">
                        {selectedOrder.customer.phone || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-700 font-medium">Vehículo</p>
                      <p className="text-blue-900">
                        {selectedOrder.vehicle.brand}{" "}
                        {selectedOrder.vehicle.model}
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-700 font-medium">Placa</p>
                      <p className="text-blue-900">
                        {selectedOrder.vehicle.plate}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Diagnóstico */}
          <Card>
            <CardHeader>
              <CardTitle>Diagnóstico del Vehículo</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="diagnosis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Descripción Detallada del Diagnóstico *
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe el estado del vehículo, problemas encontrados, trabajos a realizar..."
                        rows={6}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Repuestos Necesarios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Repuestos Necesarios</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ partId: "", quantity: 1 })}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Repuesto
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p>No hay repuestos agregados</p>
                  <p className="text-sm mt-1">
                    Agrega los repuestos necesarios para esta reparación
                  </p>
                </div>
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

          {/* Costo de la Reparación */}
          <Card>
            <CardHeader>
              <CardTitle>Costo de la Reparación</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Costo de Mano de Obra (S/.) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="690.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Botones */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar Revisión"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
