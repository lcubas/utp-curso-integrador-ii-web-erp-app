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
  partSchema,
  updatePartSchema,
  PartFormData,
  UpdatePartFormData,
} from "@/lib/validations/part";
import { Part } from "@/app/generated/prisma/client";
import { toast } from "sonner";

interface PartFormDialogProps {
  part?: Part;
  onClose: () => void;
  onSuccess: () => void;
}

export function PartFormDialog({
  part,
  onClose,
  onSuccess,
}: PartFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!part;

  const form = useForm<PartFormData | UpdatePartFormData>({
    resolver: zodResolver(
      isEditing ? updatePartSchema : partSchema,
    ) as unknown as Resolver<PartFormData | UpdatePartFormData>,
    defaultValues: isEditing
      ? {
          code: part.code,
          name: part.name,
          stock: part.stock,
          price: part.price,
        }
      : {
          code: "",
          name: "",
          stock: 0,
          price: 0,
        },
  });

  const onSubmit = async (data: PartFormData | UpdatePartFormData) => {
    setIsLoading(true);

    try {
      const url = isEditing ? `/api/parts/${part.id}` : "/api/parts";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al guardar repuesto");
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Error al guardar el repuesto");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Actualizar Repuesto" : "Registrar Nuevo Repuesto"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los datos del repuesto"
              : "Completa los datos para registrar un nuevo repuesto"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código *</FormLabel>
                  <FormControl>
                    <Input placeholder="REP-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre *</FormLabel>
                  <FormControl>
                    <Input placeholder="Disco de freno delantero" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Inicial *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio (S/.) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="255.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Guardando..."
                  : isEditing
                    ? "Actualizar"
                    : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
