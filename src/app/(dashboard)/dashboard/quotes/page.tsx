"use client";

import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { ServiceOrderForm } from "@/components/service-orders/service-order-form";
import { toast } from "sonner";

export default function QuotesPage() {
  const router = useRouter();

  const handleSuccess = (orderId: string) => {
    toast.success("Cotización creada exitosamente");
    router.push(`/dashboard/service-orders`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="bg-orange-100 p-3 rounded-lg">
          <FileText className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Cotización - Orden de Servicio
          </h1>
          <p className="text-gray-600 mt-1">
            Genera una nueva cotización para el cliente
          </p>
        </div>
      </div>

      <ServiceOrderForm onSuccess={handleSuccess} />
    </div>
  );
}
