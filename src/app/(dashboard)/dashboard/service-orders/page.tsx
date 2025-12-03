"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { ServiceOrderTable } from "@/components/service-orders/service-order-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { ServiceOrderWithRelations } from "@/types";
import { toast } from "sonner";

export default function ServiceOrdersPage() {
  const [orders, setOrders] = useState<ServiceOrderWithRelations[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<
    ServiceOrderWithRelations[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [userRole, setUserRole] = useState("");

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/service-orders");

      if (!response.ok) {
        throw new Error("Error al obtener órdenes");
      }

      const data = await response.json();
      setOrders(data);
      setFilteredOrders(data);

      // Obtener rol del usuario actual (simplificado, debería venir del contexto)
      const userResponse = await fetch("/api/users");
      if (userResponse.ok) {
        const users = await userResponse.json();
        if (users.length > 0) {
          setUserRole(users[0].role);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar las órdenes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let filtered = orders;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filtrar por tab
    if (activeTab !== "all") {
      filtered = filtered.filter((order) => order.status === activeTab);
    }

    setFilteredOrders(filtered);
  }, [searchTerm, orders, activeTab]);

  const enProcesoCount = orders.filter((o) => o.status === "EN_PROCESO").length;
  const pausadoCount = orders.filter((o) => o.status === "PAUSADO").length;
  const completadoCount = orders.filter(
    (o) => o.status === "COMPLETADO",
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Órdenes de Servicio
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona las órdenes de servicio del taller
          </p>
        </div>
        {["ADMIN", "ASESOR"].includes(userRole) && (
          <Link href="/dashboard/quotes">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Orden
            </Button>
          </Link>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="all">Todas ({orders.length})</TabsTrigger>
              <TabsTrigger value="EN_PROCESO">
                En Proceso ({enProcesoCount})
              </TabsTrigger>
              <TabsTrigger value="PAUSADO">
                Pausadas ({pausadoCount})
              </TabsTrigger>
              <TabsTrigger value="COMPLETADO">
                Completadas ({completadoCount})
              </TabsTrigger>
            </TabsList>

            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Buscar por número, cliente o placa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                Cargando órdenes...
              </div>
            ) : (
              <ServiceOrderTable
                orders={filteredOrders}
                onUpdate={fetchOrders}
                userRole={userRole}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
