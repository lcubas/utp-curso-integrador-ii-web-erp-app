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
import { ClipboardList, Loader2 } from "lucide-react";

const COLORS = {
  EN_PROCESO: "#3b82f6",
  PAUSADO: "#f59e0b",
  COMPLETADO: "#10b981",
};

export function OrdersStatusChart() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/analytics/orders-status");
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

  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ClipboardList className="w-5 h-5 text-blue-600" />
          <span>Estado de Órdenes</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={(props) =>
                `${(props.payload as any).label ?? props.name}: ${props.value}`
              }
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[entry.status as keyof typeof COLORS]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">Total de Órdenes</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>
      </CardContent>
    </Card>
  );
}
