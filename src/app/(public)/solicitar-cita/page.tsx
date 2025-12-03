"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, CheckCircle2, Mail } from "lucide-react";
import {
  appointmentSchema,
  AppointmentFormData,
} from "@/lib/validations/appointment";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";

export default function SolicitarCitaPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      email: "",
      phone: "",
      name: "",
      description: "",
      date: "",
    },
  });

  const onSubmit = async (data: AppointmentFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al solicitar cita");
      }

      setShowSuccess(true);
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message || "Error al solicitar la cita");
    } finally {
      setIsLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardContent className="pt-12 pb-12">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="bg-green-100 p-6 rounded-full">
                  <CheckCircle2 className="w-16 h-16 text-green-600" />
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-gray-900">
                  ¡Solicitud Enviada!
                </h2>
                <p className="text-lg text-gray-600">
                  Hemos enviado un correo a{" "}
                  <strong>{form.getValues("email")}</strong>
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left space-y-3">
                <div className="flex items-start space-x-3">
                  <Mail className="w-6 h-6 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Importante:</p>
                    <p className="text-blue-800 text-sm mt-1">
                      Revisa tu correo y haz clic en el enlace de confirmación
                      para completar tu reserva.
                    </p>
                    <p className="text-blue-700 text-sm mt-2">
                      El enlace es válido por 48 horas.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-4 pt-4">
                <Link href="/">
                  <Button variant="outline">Volver al Inicio</Button>
                </Link>
                <Button
                  onClick={() => {
                    setShowSuccess(false);
                    form.reset();
                  }}
                >
                  Nueva Solicitud
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-orange-600">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/">
              <h1 className="text-5xl font-bold text-white mb-3 cursor-pointer hover:text-orange-100 transition-colors">
                PESANORT
              </h1>
            </Link>
            <p className="text-white/90 text-xl">Taller Automotriz</p>
          </div>

          {/* Form Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                Solicitar Cita
              </CardTitle>
              <p className="text-center text-gray-600 mt-2">
                Completa el formulario y te contactaremos pronto
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Información Personal */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2">
                      Información de Contacto
                    </h3>

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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Correo Electrónico *</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="juan@ejemplo.com"
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
                            <FormLabel>Celular *</FormLabel>
                            <FormControl>
                              <Input placeholder="999888777" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Fecha */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2">
                      Fecha Preferida
                    </h3>

                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Selecciona una Fecha *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground",
                                  )}
                                >
                                  {field.value ? (
                                    format(new Date(field.value), "PPP", {
                                      locale: es,
                                    })
                                  ) : (
                                    <span>Selecciona una fecha</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={
                                  field.value
                                    ? new Date(field.value)
                                    : undefined
                                }
                                onSelect={(date) => {
                                  if (date) {
                                    field.onChange(
                                      date.toISOString().split("T")[0],
                                    );
                                  }
                                }}
                                disabled={(date) =>
                                  date <
                                  new Date(new Date().setHours(0, 0, 0, 0))
                                }
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Descripción */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2">
                      Describe el Problema
                    </h3>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Problemas del Vehículo *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe los problemas o servicios que necesitas para tu vehículo..."
                              rows={5}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Botones */}
                  <div className="flex justify-end space-x-4 pt-4">
                    <Link href="/">
                      <Button type="button" variant="outline">
                        Cancelar
                      </Button>
                    </Link>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      {isLoading ? "Enviando..." : "Solicitar Cita"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
