"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Wrench,
  Loader2,
  CheckCircle,
  Clock,
  PauseCircle,
  TrendingUp,
} from "lucide-react";

export function MechanicSummary() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/analytics/mechanic-orders");
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando...</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wrench className="w-5 h-5 text-blue-600" />
          <span>Mis Órdenes del Mes</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Wrench className="w-5 h-5 text-blue-600" />
              <p className="text-sm font-medium text-blue-900">Total</p>
            </div>
            <p className="text-3xl font-bold text-blue-700">
              {data.summary.totalOrders}
            </p>
            <p className="text-xs text-blue-600 mt-1">órdenes</p>
          </div>

          {/* Completadas */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm font-medium text-green-900">Completadas</p>
            </div>
            <p className="text-3xl font-bold text-green-700">
              {data.summary.completedOrders}
            </p>
            <p className="text-xs text-green-600 mt-1">órdenes</p>
          </div>

          {/* En Proceso */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <p className="text-sm font-medium text-yellow-900">En Proceso</p>
            </div>
            <p className="text-3xl font-bold text-yellow-700">
              {data.summary.inProgressOrders}
            </p>
            <p className="text-xs text-yellow-600 mt-1">órdenes</p>
          </div>

          {/* Pausadas */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <PauseCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm font-medium text-red-900">Pausadas</p>
            </div>
            <p className="text-3xl font-bold text-red-700">
              {data.summary.pausedOrders}
            </p>
            <p className="text-xs text-red-600 mt-1">órdenes</p>
          </div>
        </div>

        {/* Métricas adicionales */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <p className="text-sm font-medium text-purple-900">
                Tasa de Completitud
              </p>
            </div>
            <p className="text-3xl font-bold text-purple-700">
              {data.summary.completionRate.toFixed(1)}%
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <p className="text-sm font-medium text-green-900">
                Ingresos Generados
              </p>
            </div>
            <p className="text-3xl font-bold text-green-700">
              S/. {data.summary.totalRevenue.toFixed(2)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
