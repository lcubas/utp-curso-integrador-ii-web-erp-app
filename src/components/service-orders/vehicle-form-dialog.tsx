"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { vehicleSchema, VehicleFormData } from "@/lib/validations/vehicle";

interface VehicleFormDialogProps {
  customerId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function VehicleFormDialog({
  customerId,
  onClose,
  onSuccess,
}: VehicleFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      customerId,
      brand: "",
      model: "",
      plate: "",
    },
  });

  const onSubmit = async (data: VehicleFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al registrar vehículo");
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message || "Error al registrar el vehículo");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Vehículo</DialogTitle>
          <DialogDescription>
            Completa los datos del vehículo del cliente
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marca del Vehículo *</FormLabel>
                  <FormControl>
                    <Input placeholder="Toyota, Nissan, Ford..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelo *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Corolla, Versa, Territory..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="plate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Placa *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ABC-123"
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Registrando..." : "Registrar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
