"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Search, AlertTriangle } from "lucide-react";
import { PartTable } from "@/components/parts/part-table";
import { PartFormDialog } from "@/components/parts/part-form-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Part } from "@/app/generated/prisma/client";

interface PartWithCount extends Part {
  _count: {
    partRequests: number;
  };
}

export default function PartsPage() {
  const [parts, setParts] = useState<PartWithCount[]>([]);
  const [filteredParts, setFilteredParts] = useState<PartWithCount[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const fetchParts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/parts");

      if (!response.ok) {
        throw new Error("Error al obtener repuestos");
      }

      const data = await response.json();
      setParts(data);
      setFilteredParts(data);
    } catch (error) {
      console.error("Error:", error);
      alert("Error al cargar los repuestos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchParts();
  }, []);

  useEffect(() => {
    let filtered = parts;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (part) =>
          part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          part.code.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filtrar por tab
    if (activeTab === "low-stock") {
      filtered = filtered.filter((part) => part.stock <= 5);
    } else if (activeTab === "out-of-stock") {
      filtered = filtered.filter((part) => part.stock === 0);
    }

    setFilteredParts(filtered);
  }, [searchTerm, parts, activeTab]);

  const lowStockCount = parts.filter((p) => p.stock <= 5 && p.stock > 0).length;
  const outOfStockCount = parts.filter((p) => p.stock === 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Repuestos
          </h1>
          <p className="text-gray-600 mt-2">
            Administra el inventario de repuestos del taller
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Package className="w-4 h-4 mr-2" />
          Nuevo Repuesto
        </Button>
      </div>

      {/* Alertas de stock */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-900">
              Alertas de Inventario
            </h3>
            <p className="text-sm text-yellow-800 mt-1">
              {outOfStockCount > 0 && (
                <span>{outOfStockCount} repuesto(s) sin stock. </span>
              )}
              {lowStockCount > 0 && (
                <span>{lowStockCount} repuesto(s) con stock bajo.</span>
              )}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="all">Todos ({parts.length})</TabsTrigger>
              <TabsTrigger value="low-stock">
                Stock Bajo ({lowStockCount})
              </TabsTrigger>
              <TabsTrigger value="out-of-stock">
                Sin Stock ({outOfStockCount})
              </TabsTrigger>
            </TabsList>

            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Buscar por código o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <TabsContent value="all">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                Cargando repuestos...
              </div>
            ) : (
              <PartTable parts={filteredParts} onUpdate={fetchParts} />
            )}
          </TabsContent>

          <TabsContent value="low-stock">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                Cargando repuestos...
              </div>
            ) : (
              <PartTable parts={filteredParts} onUpdate={fetchParts} />
            )}
          </TabsContent>

          <TabsContent value="out-of-stock">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                Cargando repuestos...
              </div>
            ) : (
              <PartTable parts={filteredParts} onUpdate={fetchParts} />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {showCreateDialog && (
        <PartFormDialog
          onClose={() => setShowCreateDialog(false)}
          onSuccess={() => {
            setShowCreateDialog(false);
            fetchParts();
          }}
        />
      )}
    </div>
  );
}
