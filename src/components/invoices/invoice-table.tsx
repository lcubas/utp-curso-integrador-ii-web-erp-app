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
import { Eye, Plus, History } from "lucide-react";
import { InvoiceDetailsDialog } from "./invoice-details-dialog";
import { PaymentHistoryDialog } from "./payment-history-dialog";
import { PaymentDialog } from "./payment-dialog";
import { InvoiceWithRelations } from "@/types";

interface InvoiceTableProps {
  invoices: InvoiceWithRelations[];
  onUpdate: () => void;
}

export function InvoiceTable({ invoices, onUpdate }: InvoiceTableProps) {
  const [viewingInvoice, setViewingInvoice] = useState<string | null>(null);
  const [payingInvoice, setPayingInvoice] =
    useState<InvoiceWithRelations | null>(null);
  const [viewingHistory, setViewingHistory] =
    useState<InvoiceWithRelations | null>(null);

  const getPaymentStatus = (invoice: InvoiceWithRelations) => {
    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);

    if (totalPaid === 0) {
      return { label: "Pendiente", variant: "destructive" as const };
    } else if (totalPaid < invoice.total) {
      return { label: "Parcial", variant: "secondary" as const };
    } else {
      return { label: "Pagado", variant: "default" as const };
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-orange-50">
              <TableHead>Nro. Factura</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>DNI/RUC</TableHead>
              <TableHead className="text-right">Total (S/.)</TableHead>
              <TableHead className="text-right">Pagado (S/.)</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500">
                  No hay facturas registradas
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => {
                const totalPaid = invoice.payments.reduce(
                  (sum, p) => sum + p.amount,
                  0,
                );
                const status = getPaymentStatus(invoice);

                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono font-bold">
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell>{invoice.customer.name}</TableCell>
                    <TableCell className="font-mono">{invoice.dni}</TableCell>
                    <TableCell className="text-right font-medium">
                      S/. {invoice.total.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      S/. {totalPaid.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setViewingInvoice(invoice.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setViewingHistory(invoice)}
                      >
                        <History className="w-4 h-4" />
                      </Button>
                      {totalPaid < invoice.total && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => setPayingInvoice(invoice)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {viewingInvoice && (
        <InvoiceDetailsDialog
          invoiceId={viewingInvoice}
          onClose={() => setViewingInvoice(null)}
        />
      )}

      {payingInvoice && (
        <PaymentDialog
          invoice={payingInvoice}
          onClose={() => setPayingInvoice(null)}
          onSuccess={() => {
            setPayingInvoice(null);
            onUpdate();
          }}
        />
      )}

      {viewingHistory && (
        <PaymentHistoryDialog
          invoice={viewingHistory}
          onClose={() => setViewingHistory(null)}
        />
      )}
    </>
  );
}
