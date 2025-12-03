"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { InvoiceTable } from "@/components/invoices/invoice-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { InvoiceWithRelations } from "@/types";
import { toast } from "sonner";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceWithRelations[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<
    InvoiceWithRelations[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/invoices");

      if (!response.ok) {
        throw new Error("Error al obtener facturas");
      }

      const data = await response.json();
      setInvoices(data);
      setFilteredInvoices(data);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar las facturas");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    let filtered = invoices;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (invoice) =>
          invoice.invoiceNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          invoice.customer.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          invoice.dni?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filtrar por tab (estado de pago)
    if (activeTab !== "all") {
      filtered = filtered.filter((invoice) => {
        const totalPaid = invoice.payments.reduce(
          (sum, p) => sum + p.amount,
          0,
        );

        if (activeTab === "paid") {
          return totalPaid >= invoice.total;
        } else if (activeTab === "partial") {
          return totalPaid > 0 && totalPaid < invoice.total;
        } else if (activeTab === "pending") {
          return totalPaid === 0;
        }
        return true;
      });
    }

    setFilteredInvoices(filtered);
  }, [searchTerm, invoices, activeTab]);

  const paidCount = invoices.filter((i) => {
    const totalPaid = i.payments.reduce((sum, p) => sum + p.amount, 0);
    return totalPaid >= i.total;
  }).length;

  const partialCount = invoices.filter((i) => {
    const totalPaid = i.payments.reduce((sum, p) => sum + p.amount, 0);
    return totalPaid > 0 && totalPaid < i.total;
  }).length;

  const pendingCount = invoices.filter((i) => {
    const totalPaid = i.payments.reduce((sum, p) => sum + p.amount, 0);
    return totalPaid === 0;
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Facturas
          </h1>
          <p className="text-gray-600 mt-2">Genera facturas y registra pagos</p>
        </div>
        <Link href="/dashboard/invoices/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Factura
          </Button>
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="all">Todas ({invoices.length})</TabsTrigger>
              <TabsTrigger value="pending">
                Pendientes ({pendingCount})
              </TabsTrigger>
              <TabsTrigger value="partial">
                Pago Parcial ({partialCount})
              </TabsTrigger>
              <TabsTrigger value="paid">Pagadas ({paidCount})</TabsTrigger>
            </TabsList>

            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Buscar por número, cliente o DNI/RUC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                Cargando facturas...
              </div>
            ) : (
              <InvoiceTable
                invoices={filteredInvoices}
                onUpdate={fetchInvoices}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
