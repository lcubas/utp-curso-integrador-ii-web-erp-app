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
import { Textarea } from "@/components/ui/textarea";
import {
  customerSchema,
  updateCustomerSchema,
  CustomerFormData,
  UpdateCustomerFormData,
} from "@/lib/validations/customer";
import { Customer } from "@/app/generated/prisma/client";
import { toast } from "sonner";

interface CustomerFormDialogProps {
  customer?: Customer;
  onClose: () => void;
  onSuccess: () => void;
}

export function CustomerFormDialog({
  customer,
  onClose,
  onSuccess,
}: CustomerFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!customer;

  const form = useForm<CustomerFormData | UpdateCustomerFormData>({
    resolver: zodResolver(isEditing ? updateCustomerSchema : customerSchema),
    defaultValues: isEditing
      ? {
          name: customer.name,
          email: customer.email || "",
          phone: customer.phone || "",
          address: customer.address || "",
        }
      : {
          name: "",
          email: "",
          phone: "",
          address: "",
        },
  });

  const onSubmit = async (data: CustomerFormData | UpdateCustomerFormData) => {
    setIsLoading(true);

    try {
      const url = isEditing
        ? `/api/customers/${customer.id}`
        : "/api/customers";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al guardar cliente");
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Error al guardar el cliente");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Actualizar Cliente" : "Registrar Nuevo Cliente"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los datos del cliente"
              : "Completa los datos para registrar un nuevo cliente"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo *</FormLabel>
                  <FormControl>
                    <Input placeholder="Juan Pérez García" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="juan@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="999999999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Av. Principal 123, Distrito, Ciudad"
                      rows={3}
                      {...field}
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
