"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Search } from "lucide-react";
import { CustomerTable } from "@/components/customers/customer-table";
import { CustomerFormDialog } from "@/components/customers/customer-form-dialog";
import { Customer, Vehicle } from "@/app/generated/prisma/client";

interface CustomerWithRelations extends Customer {
  vehicles: Vehicle[];
  _count: {
    serviceOrders: number;
    vehicles: number;
  };
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerWithRelations[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<
    CustomerWithRelations[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/customers");

      if (!response.ok) {
        throw new Error("Error al obtener clientes");
      }

      const data = await response.json();
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (error) {
      console.error("Error:", error);
      alert("Error al cargar los clientes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const filtered = customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Clientes
          </h1>
          <p className="text-gray-600 mt-2">
            Administra los clientes del taller
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Registrar Cliente
        </Button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center space-x-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Buscar clientes por nombre, email o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-gray-500">
            Cargando clientes...
          </div>
        ) : (
          <CustomerTable
            customers={filteredCustomers}
            onUpdate={fetchCustomers}
          />
        )}
      </div>

      {showCreateDialog && (
        <CustomerFormDialog
          onClose={() => setShowCreateDialog(false)}
          onSuccess={() => {
            setShowCreateDialog(false);
            fetchCustomers();
          }}
        />
      )}
    </div>
  );
}
