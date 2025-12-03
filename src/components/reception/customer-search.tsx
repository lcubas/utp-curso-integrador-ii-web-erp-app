"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, UserPlus } from "lucide-react";
import { CustomerFormDialog } from "@/components/customers/customer-form-dialog";
import { Customer } from "@/app/generated/prisma/client";

interface CustomerSearchProps {
  onSelectCustomer: (customer: Customer) => void;
  selectedCustomerId?: string;
}

export function CustomerSearch({
  onSelectCustomer,
  selectedCustomerId,
}: CustomerSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch("/api/customers");
        if (response.ok) {
          const data = await response.json();
          setCustomers(data);
        }
      } catch (error) {
        console.error("Error al cargar clientes:", error);
      }
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      setIsSearching(true);
      const filtered = customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredCustomers(filtered);
      setIsSearching(false);
    } else {
      setFilteredCustomers([]);
    }
  }, [searchTerm, customers]);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  return (
    <>
      <div className="space-y-4">
        {selectedCustomer ? (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">
                    Cliente Seleccionado
                  </p>
                  <p className="text-lg font-bold text-green-900">
                    {selectedCustomer.name}
                  </p>
                  <p className="text-sm text-green-600">
                    {selectedCustomer.phone && `Tel: ${selectedCustomer.phone}`}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectCustomer(null as any)}
                >
                  Cambiar
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Buscar cliente por nombre, teléfono o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(true)}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Nuevo Cliente
              </Button>
            </div>

            {searchTerm.length >= 2 && (
              <div className="border rounded-lg max-h-64 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-500">
                    Buscando...
                  </div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No se encontraron clientes
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredCustomers.map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => onSelectCustomer(customer)}
                        className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-gray-600">
                          {customer.phone && `Tel: ${customer.phone}`}
                          {customer.email && ` • ${customer.email}`}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {showCreateDialog && (
        <CustomerFormDialog
          onClose={() => setShowCreateDialog(false)}
          onSuccess={async () => {
            setShowCreateDialog(false);
            // Recargar clientes
            const response = await fetch("/api/customers");
            if (response.ok) {
              const data = await response.json();
              setCustomers(data);
            }
          }}
        />
      )}
    </>
  );
}
