"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TopCustomersChart() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/analytics/top-customers?period=${period}`,
        );
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
  }, [period]);

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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span>Top 10 Clientes por Facturación</span>
            </CardTitle>
            <CardDescription>Clientes que más ingresos generan</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant={period === "all" ? "default" : "outline"}
              onClick={() => setPeriod("all")}
            >
              Todo
            </Button>
            <Button
              size="sm"
              variant={period === "year" ? "default" : "outline"}
              onClick={() => setPeriod("year")}
            >
              Año
            </Button>
            <Button
              size="sm"
              variant={period === "month" ? "default" : "outline"}
              onClick={() => setPeriod("month")}
            >
              Mes
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={150} />
            <Tooltip
              formatter={(value: number) => [
                `S/. ${value.toFixed(2)}`,
                "Total Facturado",
              ]}
            />
            <Legend />
            <Bar dataKey="total" fill="#8b5cf6" name="Total Facturado" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
