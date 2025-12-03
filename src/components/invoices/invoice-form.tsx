"use client";

import { useState, useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { invoiceSchema, InvoiceFormData } from "@/lib/validations/invoice";
import { Receipt } from "lucide-react";
import {
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

interface InvoiceFormProps {
  onSuccess: (invoiceId: string) => void;
}

export function InvoiceForm({ onSuccess }: InvoiceFormProps) {
  const [orders, setOrders] = useState<ServiceOrderWithDetails[]>([]);
  const [selectedOrder, setSelectedOrder] =
    useState<ServiceOrderWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(
      invoiceSchema,
    ) as unknown as Resolver<InvoiceFormData>,
    defaultValues: {
      serviceOrderId: "",
      dni: "",
      businessName: "",
      subtotal: 0,
      igv: 0,
      total: 0,
    },
  });

  // Cargar órdenes completadas sin factura
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/service-orders?status=COMPLETADO");
        if (response.ok) {
          const data = await response.json();
          // Filtrar solo las que no tienen factura
          const ordersWithoutInvoice = data.filter((o: any) => !o.invoice);
          setOrders(ordersWithoutInvoice);
        }
      } catch (error) {
        console.error("Error al cargar órdenes:", error);
      }
    };

    fetchOrders();
  }, []);

  const handleOrderChange = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      form.setValue("serviceOrderId", orderId);

      // Prellenar con datos del cliente
      form.setValue("businessName", order.customer.name);

      // Calcular totales
      const partsTotal = order.partRequests.reduce(
        (sum, pr) => sum + pr.part.price * pr.quantity,
        0,
      );
      const subtotal = (order.cost || 0) + partsTotal;
      const igv = subtotal * 0.18; // 18% IGV
      const total = subtotal + igv;

      form.setValue("subtotal", parseFloat(subtotal.toFixed(2)));
      form.setValue("igv", parseFloat(igv.toFixed(2)));
      form.setValue("total", parseFloat(total.toFixed(2)));
    }
  };

  const onSubmit = async (data: InvoiceFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al generar factura");
      }

      const newInvoice = await response.json();
      onSuccess(newInvoice.id);
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message || "Error al generar la factura");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Seleccionar Orden */}
        <Card>
          <CardHeader>
            <CardTitle>Seleccionar Orden de Servicio</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="serviceOrderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Orden Completada *</FormLabel>
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
                      {orders.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No hay órdenes completadas sin factura
                        </SelectItem>
                      ) : (
                        orders.map((order) => (
                          <SelectItem key={order.id} value={order.id}>
                            #{order.orderNumber} - {order.customer.name} (
                            {order.vehicle.brand} {order.vehicle.model})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {selectedOrder && (
          <>
            {/* Datos del Cliente */}
            <Card>
              <CardHeader>
                <CardTitle>Datos de Facturación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="dni"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DNI / RUC *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="12345678 o 20123456789"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre / Razón Social *</FormLabel>
                      <FormControl>
                        <Input placeholder="Juan Pérez García" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedOrder.customer.email && (
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">Correo Electrónico</p>
                    <p className="font-medium">
                      {selectedOrder.customer.email}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Desglose de Servicios */}
            <Card>
              <CardHeader>
                <CardTitle>Desglose de Servicios y Repuestos</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-orange-50">
                      <TableHead>Código</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead className="text-center">Cantidad</TableHead>
                      <TableHead className="text-right">
                        Precio Unit. (S/.)
                      </TableHead>
                      <TableHead className="text-right">Total (S/.)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Mano de Obra */}
                    {selectedOrder.cost && selectedOrder.cost > 0 && (
                      <TableRow>
                        <TableCell className="font-mono">MO-001</TableCell>
                        <TableCell className="font-medium">
                          Mano de Obra
                        </TableCell>
                        <TableCell className="text-center">1</TableCell>
                        <TableCell className="text-right">
                          {selectedOrder.cost.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {selectedOrder.cost.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    )}

                    {/* Repuestos */}
                    {selectedOrder.partRequests.map((pr) => (
                      <TableRow key={pr.id}>
                        <TableCell className="font-mono">
                          {pr.part.code}
                        </TableCell>
                        <TableCell>{pr.part.name}</TableCell>
                        <TableCell className="text-center">
                          {pr.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {pr.part.price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {(pr.part.price * pr.quantity).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Totales */}
            <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Receipt className="w-5 h-5 text-orange-600" />
                  <span>Resumen de Facturación</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white rounded">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-lg">
                    S/. {form.watch("subtotal").toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-white rounded">
                  <span className="text-gray-600">IGV (18%)</span>
                  <span className="font-medium text-lg">
                    S/. {form.watch("igv").toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-4 bg-orange-600 text-white rounded-lg">
                  <span className="font-bold text-lg">TOTAL</span>
                  <span className="font-bold text-2xl">
                    S/. {form.watch("total").toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Botones */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Generando..." : "Generar Factura"}
              </Button>
            </div>
          </>
        )}
      </form>
    </Form>
  );
}
