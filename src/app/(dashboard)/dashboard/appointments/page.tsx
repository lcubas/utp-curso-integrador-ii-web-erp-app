"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { AppointmentTable } from "@/components/appointments/appointment-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppointmentWithRelations } from "@/types";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>(
    [],
  );
  const [filteredAppointments, setFilteredAppointments] = useState<
    AppointmentWithRelations[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/appointments");

      if (!response.ok) {
        throw new Error("Error al obtener citas");
      }

      const data = await response.json();
      setAppointments(data);
      setFilteredAppointments(data);
    } catch (error) {
      console.error("Error:", error);
      alert("Error al cargar las citas");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    let filtered = appointments;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (appointment) =>
          appointment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appointment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appointment.phone.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filtrar por tab
    if (activeTab !== "all") {
      filtered = filtered.filter(
        (appointment) => appointment.status === activeTab,
      );
    }

    setFilteredAppointments(filtered);
  }, [searchTerm, appointments, activeTab]);

  const pendingCount = appointments.filter(
    (a) => a.status === "PENDIENTE",
  ).length;
  const confirmedCount = appointments.filter(
    (a) => a.status === "CONFIRMADA",
  ).length;
  const canceledCount = appointments.filter(
    (a) => a.status === "CANCELADA",
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Solicitudes de Cita
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona las citas solicitadas por los clientes
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="all">
                Todas ({appointments.length})
              </TabsTrigger>
              <TabsTrigger value="PENDIENTE">
                Pendientes ({pendingCount})
              </TabsTrigger>
              <TabsTrigger value="CONFIRMADA">
                Confirmadas ({confirmedCount})
              </TabsTrigger>
              <TabsTrigger value="CANCELADA">
                Canceladas ({canceledCount})
              </TabsTrigger>
            </TabsList>

            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Buscar por nombre, email o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                Cargando citas...
              </div>
            ) : (
              <AppointmentTable appointments={filteredAppointments} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
