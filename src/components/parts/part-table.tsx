"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus, Minus, AlertTriangle } from "lucide-react";
import { PartFormDialog } from "./part-form-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Part } from "@/app/generated/prisma/client";
import { AdjustStockDialog } from "./adjust-stock-dialog";
import { toast } from "sonner";

interface PartWithCount extends Part {
  _count: {
    partRequests: number;
  };
}

interface PartTableProps {
  parts: PartWithCount[];
  onUpdate: () => void;
}

export function PartTable({ parts, onUpdate }: PartTableProps) {
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [adjustingStock, setAdjustingStock] = useState<Part | null>(null);
  const [deletingPart, setDeletingPart] = useState<string | null>(null);

  const handleDelete = async (partId: string) => {
    try {
      const response = await fetch(`/api/parts/${partId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar repuesto");
      }

      onUpdate();
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Error al eliminar el repuesto");
    } finally {
      setDeletingPart(null);
    }
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">Sin Stock</Badge>;
    } else if (stock <= 5) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          Stock Bajo
        </Badge>
      );
    } else {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          Disponible
        </Badge>
      );
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-orange-50">
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="text-center">Stock</TableHead>
              <TableHead className="text-right">Precio (S/.)</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-center">Solicitudes</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500">
                  No hay repuestos registrados
                </TableCell>
              </TableRow>
            ) : (
              parts.map((part) => (
                <TableRow
                  key={part.id}
                  className={
                    part.stock === 0
                      ? "bg-red-50"
                      : part.stock <= 5
                        ? "bg-yellow-50"
                        : ""
                  }
                >
                  <TableCell className="font-mono font-medium">
                    {part.code}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {part.stock === 0 && (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      )}
                      <span>{part.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`font-bold ${
                        part.stock === 0
                          ? "text-red-600"
                          : part.stock <= 5
                            ? "text-yellow-600"
                            : "text-green-600"
                      }`}
                    >
                      {part.stock}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    S/. {part.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center">
                    {getStockBadge(part.stock)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{part._count.partRequests}</Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAdjustingStock(part)}
                      title="Ajustar stock"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingPart(part)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeletingPart(part.id)}
                      disabled={part._count.partRequests > 0}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editingPart && (
        <PartFormDialog
          part={editingPart}
          onClose={() => setEditingPart(null)}
          onSuccess={() => {
            setEditingPart(null);
            onUpdate();
          }}
        />
      )}

      {adjustingStock && (
        <AdjustStockDialog
          part={adjustingStock}
          onClose={() => setAdjustingStock(null)}
          onSuccess={() => {
            setAdjustingStock(null);
            onUpdate();
          }}
        />
      )}

      <AlertDialog
        open={!!deletingPart}
        onOpenChange={() => setDeletingPart(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El repuesto será eliminado
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingPart && handleDelete(deletingPart)}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
