"use client";

import { useRouter } from "next/navigation";
import { Receipt } from "lucide-react";
import { InvoiceForm } from "@/components/invoices/invoice-form";

export default function NewInvoicePage() {
  const router = useRouter();

  const handleSuccess = (invoiceId: string) => {
    alert("Factura generada exitosamente");
    router.push("/dashboard/invoices");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="bg-green-100 p-3 rounded-lg">
          <Receipt className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Generar Nueva Factura
          </h1>
          <p className="text-gray-600 mt-1">
            Crea una factura a partir de una orden de servicio completada
          </p>
        </div>
      </div>

      <InvoiceForm onSuccess={handleSuccess} />
    </div>
  );
}
