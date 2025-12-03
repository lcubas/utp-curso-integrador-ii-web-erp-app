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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Receipt, User as UserIcon, Car, Package } from "lucide-react";
import {
  Customer,
  Invoice,
  Part,
  PartRequest,
  Payment,
  ServiceOrder,
  User,
  Vehicle,
} from "@/app/generated/prisma/client";
import { toast } from "sonner";

interface InvoiceWithDetails extends Invoice {
  customer: Customer;
  serviceOrder: ServiceOrder & {
    vehicle: Vehicle;
    partRequests: (PartRequest & { part: Part })[];
  };
  payments: (Payment & { user: User })[];
  user: User;
}

interface InvoiceDetailsDialogProps {
  invoiceId: string;
  onClose: () => void;
}

export function InvoiceDetailsDialog({
  invoiceId,
  onClose,
}: InvoiceDetailsDialogProps) {
  const [invoice, setInvoice] = useState<InvoiceWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await fetch(`/api/invoices/${invoiceId}`);
        if (!response.ok) throw new Error("Error al cargar factura");
        const data = await response.json();
        setInvoice(data);
      } catch (error) {
        console.error("Error:", error);
        toast.error("Error al cargar los detalles de la factura");
        onClose();
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId, onClose]);

  if (isLoading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <div className="text-center py-8">Cargando...</div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!invoice) return null;

  const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = invoice.total - totalPaid;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center space-x-3">
            <Receipt className="w-6 h-6 text-orange-600" />
            <span>Factura {invoice.invoiceNumber}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Encabezado de Factura */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold">PESANORT</h2>
                <p className="mt-1">Sistema de Gestión de Taller</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Fecha de Emisión</p>
                <p className="font-bold">
                  {new Date(invoice.createdAt).toLocaleDateString("es-PE")}
                </p>
              </div>
            </div>
          </div>

          {/* Datos del Cliente */}
          <div className="grid grid-cols-2 gap-6">
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center space-x-2">
                <UserIcon className="w-4 h-4" />
                <span>Cliente</span>
              </h3>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Nombre/Razón Social:</strong> {invoice.businessName}
                </p>
                <p>
                  <strong>DNI/RUC:</strong> {invoice.dni}
                </p>
                {invoice.customer.email && (
                  <p>
                    <strong>Email:</strong> {invoice.customer.email}
                  </p>
                )}
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center space-x-2">
                <Car className="w-4 h-4" />
                <span>Vehículo</span>
              </h3>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Marca:</strong> {invoice.serviceOrder.vehicle.brand}
                </p>
                <p>
                  <strong>Modelo:</strong> {invoice.serviceOrder.vehicle.model}
                </p>
                <p>
                  <strong>Placa:</strong> {invoice.serviceOrder.vehicle.plate}
                </p>
              </div>
            </Card>
          </div>

          <Separator />

          {/* Desglose */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span>Detalle de Servicios y Repuestos</span>
            </h3>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Código</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-center">Cantidad</TableHead>
                  <TableHead className="text-right">P. Unit. (S/.)</TableHead>
                  <TableHead className="text-right">Total (S/.)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.serviceOrder.cost && invoice.serviceOrder.cost > 0 && (
                  <TableRow>
                    <TableCell className="font-mono">MO-001</TableCell>
                    <TableCell>Mano de Obra</TableCell>
                    <TableCell className="text-center">1</TableCell>
                    <TableCell className="text-right">
                      {invoice.serviceOrder.cost.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {invoice.serviceOrder.cost.toFixed(2)}
                    </TableCell>
                  </TableRow>
                )}

                {invoice.serviceOrder.partRequests.map((pr) => (
                  <TableRow key={pr.id}>
                    <TableCell className="font-mono">{pr.part.code}</TableCell>
                    <TableCell>{pr.part.name}</TableCell>
                    <TableCell className="text-center">{pr.quantity}</TableCell>
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
          </div>

          <Separator />

          {/* Totales */}
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span>Subtotal</span>
              <span className="font-medium">
                S/. {invoice.subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span>IGV (18%)</span>
              <span className="font-medium">S/. {invoice.igv.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-orange-100 rounded-lg border-2 border-orange-300">
              <span className="font-bold text-lg">TOTAL A PAGAR</span>
              <span className="font-bold text-2xl text-orange-600">
                S/. {invoice.total.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded border border-green-200">
              <span className="text-green-700">Total Pagado</span>
              <span className="font-medium text-green-700">
                S/. {totalPaid.toFixed(2)}
              </span>
            </div>
            {remaining > 0 && (
              <div className="flex justify-between items-center p-3 bg-red-50 rounded border border-red-200">
                <span className="text-red-700">Saldo Pendiente</span>
                <span className="font-medium text-red-700">
                  S/. {remaining.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`border rounded-lg ${className}`}>{children}</div>;
}
