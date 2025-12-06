"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Loader2,
  TrendingUp,
  TrendingDown,
  Clock,
} from "lucide-react";

export function AppointmentsConversion() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/analytics/appointments-conversion");
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
          <Calendar className="w-5 h-5 text-blue-600" />
          <span>Conversión de Citas</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          {/* KPIs principales */}
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-green-900">
                  Tasa de Conversión
                </p>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-4xl font-bold text-green-700">
                {data.conversionRate.toFixed(1)}%
              </p>
              <p className="text-xs text-green-600 mt-2">
                {data.confirmedAppointments} de {data.totalAppointments} citas
                confirmadas
              </p>
            </div>

            <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-red-900">
                  Tasa de Cancelación
                </p>
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-4xl font-bold text-red-700">
                {data.cancellationRate.toFixed(1)}%
              </p>
              <p className="text-xs text-red-600 mt-2">
                {data.canceledAppointments} citas canceladas
              </p>
            </div>
          </div>

          {/* Desglose */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium">
                  Total de Solicitudes
                </span>
              </div>
              <span className="text-2xl font-bold">
                {data.totalAppointments}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium">Pendientes</span>
              </div>
              <span className="text-xl font-bold text-yellow-700">
                {data.pendingAppointments}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Confirmadas</span>
              </div>
              <span className="text-xl font-bold text-green-700">
                {data.confirmedAppointments}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium">Canceladas</span>
              </div>
              <span className="text-xl font-bold text-red-700">
                {data.canceledAppointments}
              </span>
            </div>
          </div>
        </div>

        {/* Recomendación */}
        {data.conversionRate < 50 && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-900">
              <strong>⚠️ Recomendación:</strong> La tasa de conversión es baja.
              Considera mejorar el seguimiento a citas pendientes o simplificar
              el proceso de confirmación.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
