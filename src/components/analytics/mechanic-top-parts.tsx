"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function MechanicTopParts() {
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

  if (!data || data.topParts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-orange-600" />
            <span>Repuestos Más Solicitados</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">
            No hay datos de repuestos solicitados este mes
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package className="w-5 h-5 text-orange-600" />
          <span>Repuestos Más Solicitados</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.topParts.map((part: any, index: number) => (
            <div
              key={part.name}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full">
                  <span className="text-sm font-bold text-orange-600">
                    {index + 1}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{part.name}</p>
                  <p className="text-sm text-gray-500">Código: {part.code}</p>
                </div>
              </div>
              <Badge variant="default" className="text-lg px-4 py-2">
                {part.quantity} unidades
              </Badge>
            </div>
          ))}
        </div>

        {data.topParts.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            No hay repuestos solicitados en este período
          </p>
        )}
      </CardContent>
    </Card>
  );
}
