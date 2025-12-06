"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import {
  DollarSign,
  Loader2,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

export function PaymentsAnalysis() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/analytics/payments-analysis");
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
        <CardContent className="flex justify-center items-center h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const pieData = [
    { name: "Pagadas", value: data.summary.paidInvoices, color: "#10b981" },
    {
      name: "Pago Parcial",
      value: data.summary.partialInvoices,
      color: "#f59e0b",
    },
    {
      name: "Pendientes",
      value: data.summary.pendingInvoices,
      color: "#ef4444",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          <span>Análisis de Pagos</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          {/* Gráfico de torta */}
          <div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Métricas */}
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-sm font-medium text-green-900">
                  Total Cobrado
                </p>
              </div>
              <p className="text-2xl font-bold text-green-700">
                S/. {data.summary.totalCollected.toFixed(2)}
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <p className="text-sm font-medium text-red-900">
                  Total Pendiente
                </p>
              </div>
              <p className="text-2xl font-bold text-red-700">
                S/. {data.summary.totalPending.toFixed(2)}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <p className="text-sm font-medium text-blue-900">
                  Tasa de Cobro
                </p>
              </div>
              <p className="text-2xl font-bold text-blue-700">
                {data.summary.collectionRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Métodos de Pago */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-semibold mb-3">
            Distribución por Método de Pago
          </h4>
          <div className="grid grid-cols-3 gap-4">
            {data.paymentsByMethod.map((method: any) => (
              <div key={method.method} className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">{method.method}</p>
                <p className="text-lg font-bold">{method.count} pagos</p>
                <p className="text-sm text-green-600">
                  S/. {method.total.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
