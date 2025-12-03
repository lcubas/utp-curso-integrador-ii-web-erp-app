"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adjustStockSchema, AdjustStockData } from "@/lib/validations/part";
import { Plus, Minus } from "lucide-react";
import { Part } from "@/app/generated/prisma/client";

interface AdjustStockDialogProps {
  part: Part;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdjustStockDialog({
  part,
  onClose,
  onSuccess,
}: AdjustStockDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AdjustStockData>({
    resolver: zodResolver(adjustStockSchema) as Resolver<AdjustStockData, any>,
    defaultValues: {
      quantity: 1,
      type: "ADD",
    },
  });

  const onSubmit = async (data: AdjustStockData) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/parts/${part.id}/adjust-stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al ajustar stock");
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message || "Error al ajustar el stock");
    } finally {
      setIsLoading(false);
    }
  };

  const watchType = form.watch("type");

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajustar Stock</DialogTitle>
          <DialogDescription>
            Modifica el stock del repuesto: {part.name}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Código:</span>
            <span className="font-mono font-medium">{part.code}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Stock Actual:</span>
            <span className="font-bold text-lg">{part.stock}</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Ajuste</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ADD">
                        <div className="flex items-center space-x-2">
                          <Plus className="w-4 h-4 text-green-600" />
                          <span>Agregar Stock</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="SUBTRACT">
                        <div className="flex items-center space-x-2">
                          <Minus className="w-4 h-4 text-red-600" />
                          <span>Reducir Stock</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Nuevo stock será:</p>
              <p className="text-2xl font-bold text-blue-600">
                {watchType === "ADD"
                  ? part.stock + (form.watch("quantity") || 0)
                  : part.stock - (form.watch("quantity") || 0)}
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Ajustando..." : "Ajustar Stock"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
