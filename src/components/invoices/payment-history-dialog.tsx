"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { History, CreditCard, Banknote, ArrowRightLeft } from "lucide-react";
import { InvoiceWithRelations } from "@/types";

interface PaymentHistoryDialogProps {
  invoice: InvoiceWithRelations;
  onClose: () => void;
}

const paymentMethodIcons = {
  EFECTIVO: Banknote,
  TARJETA: CreditCard,
  TRANSFERENCIA: ArrowRightLeft,
};

const paymentMethodLabels = {
  EFECTIVO: "Efectivo",
  TARJETA: "Tarjeta",
  TRANSFERENCIA: "Transferencia",
};

export function PaymentHistoryDialog({
  invoice,
  onClose,
}: PaymentHistoryDialogProps) {
  const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = invoice.total - totalPaid;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <History className="w-5 h-5 text-blue-600" />
            <span>Historial de Pagos</span>
          </DialogTitle>
          <DialogDescription>
            Factura {invoice.invoiceNumber} - {invoice.customer.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Resumen */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-sm text-blue-700">Total Factura</p>
              <p className="text-xl font-bold text-blue-900">
                S/. {invoice.total.toFixed(2)}
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-sm text-green-700">Total Pagado</p>
              <p className="text-xl font-bold text-green-900">
                S/. {totalPaid.toFixed(2)}
              </p>
            </div>
            <div
              className={`${
                remaining > 0
                  ? "bg-red-50 border-red-200"
                  : "bg-gray-50 border-gray-200"
              } border rounded-lg p-4 text-center`}
            >
              <p
                className={`text-sm ${
                  remaining > 0 ? "text-red-700" : "text-gray-700"
                }`}
              >
                Saldo Pendiente
              </p>
              <p
                className={`text-xl font-bold ${
                  remaining > 0 ? "text-red-900" : "text-gray-900"
                }`}
              >
                S/. {remaining.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Tabla de pagos */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Método de Pago</TableHead>
                  <TableHead className="text-right">Monto (S/.)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.payments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-gray-500 py-8"
                    >
                      No hay pagos registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  invoice.payments.map((payment) => {
                    const Icon =
                      paymentMethodIcons[
                        payment.paymentMethod as keyof typeof paymentMethodIcons
                      ];

                    return (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {new Date(payment.createdAt).toLocaleDateString(
                            "es-PE",
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(payment.createdAt).toLocaleTimeString(
                            "es-PE",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </TableCell>
                        <TableCell>{payment.user.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Icon className="w-4 h-4 text-gray-600" />
                            <span>
                              {
                                paymentMethodLabels[
                                  payment.paymentMethod as keyof typeof paymentMethodLabels
                                ]
                              }
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          S/. {payment.amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Estado del pago */}
          <div className="flex justify-center pt-2">
            {remaining === 0 ? (
              <Badge
                variant="default"
                className="px-6 py-2 text-base bg-green-600"
              >
                ✓ Factura Pagada Completamente
              </Badge>
            ) : totalPaid > 0 ? (
              <Badge
                variant="secondary"
                className="px-6 py-2 text-base bg-yellow-100 text-yellow-800"
              >
                Pago Parcial - Pendiente S/. {remaining.toFixed(2)}
              </Badge>
            ) : (
              <Badge variant="destructive" className="px-6 py-2 text-base">
                Sin Pagos Registrados
              </Badge>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
