"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CreditCard } from "lucide-react";
import { paymentSchema, PaymentFormData } from "@/lib/validations/invoice";
import { Customer, Invoice, Payment } from "@/app/generated/prisma/client";
import { toast } from "sonner";

interface InvoiceWithPayments extends Invoice {
  customer: Customer;
  payments: Payment[];
}

interface PaymentDialogProps {
  invoice: InvoiceWithPayments;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentDialog({
  invoice,
  onClose,
  onSuccess,
}: PaymentDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = invoice.total - totalPaid;

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(
      paymentSchema,
    ) as unknown as Resolver<PaymentFormData>,
    defaultValues: {
      invoiceId: invoice.id,
      amount: remaining,
      paymentMethod: "EFECTIVO",
    },
  });

  const onSubmit = async (data: PaymentFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al registrar pago");
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Error al registrar el pago");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-green-600" />
            <span>Registrar Pago</span>
          </DialogTitle>
          <DialogDescription>
            Factura {invoice.invoiceNumber} - {invoice.customer.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información de la factura */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-blue-700">Total de la Factura</span>
              <span className="font-bold text-blue-900">
                S/. {invoice.total.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-700">Total Pagado</span>
              <span className="font-bold text-green-700">
                S/. {totalPaid.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-blue-200">
              <span className="font-medium text-blue-900">Saldo Pendiente</span>
              <span className="font-bold text-lg text-orange-600">
                S/. {remaining.toFixed(2)}
              </span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto a Pagar (S/.) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={remaining}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de Pago *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                        <SelectItem value="TARJETA">
                          Tarjeta de Crédito/Débito
                        </SelectItem>
                        <SelectItem value="TRANSFERENCIA">
                          Transferencia Bancaria
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("amount") < remaining && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Pago Parcial</p>
                    <p className="mt-1">
                      Quedará un saldo pendiente de S/.{" "}
                      {(remaining - form.watch("amount")).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Registrando..." : "Registrar Pago"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
