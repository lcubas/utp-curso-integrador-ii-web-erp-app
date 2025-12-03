"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ConfirmarCitaPage() {
  const params = useParams();
  const token = params.token as string;

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const confirmAppointment = async () => {
      try {
        const response = await fetch(`/api/appointments/confirm/${token}`, {
          method: "POST",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al confirmar cita");
        }

        setStatus("success");
      } catch (error: any) {
        console.error("Error:", error);
        setStatus("error");
        setErrorMessage(error.message || "Error al confirmar la cita");
      }
    };

    if (token) {
      confirmAppointment();
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="pt-12 pb-12">
          {status === "loading" && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="bg-blue-100 p-6 rounded-full">
                  <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
                </div>
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-gray-900">
                  Confirmando tu Cita...
                </h2>
                <p className="text-lg text-gray-600">
                  Por favor espera un momento
                </p>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="bg-green-100 p-6 rounded-full">
                  <CheckCircle2 className="w-16 h-16 text-green-600" />
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-gray-900">
                  ¡Cita Confirmada!
                </h2>
                <p className="text-lg text-gray-600">
                  Tu cita ha sido confirmada exitosamente
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-left space-y-3">
                <h3 className="font-semibold text-green-900">¿Qué sigue?</h3>
                <ul className="space-y-2 text-green-800">
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Nuestro equipo revisará tu solicitud</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>
                      Te contactaremos por teléfono o email para confirmar la
                      hora exacta
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Recibirás un recordatorio antes de tu cita</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4">
                <Link href="/">
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    Volver al Inicio
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="bg-red-100 p-6 rounded-full">
                  <XCircle className="w-16 h-16 text-red-600" />
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-gray-900">
                  Error al Confirmar
                </h2>
                <p className="text-lg text-gray-600">{errorMessage}</p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-left space-y-3">
                <h3 className="font-semibold text-red-900">Posibles causas:</h3>
                <ul className="space-y-2 text-red-800 text-sm">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>El enlace ha expirado (válido por 48 horas)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>La cita ya fue confirmada anteriormente</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>La cita fue cancelada</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>El enlace es inválido</span>
                  </li>
                </ul>
              </div>

              <div className="flex justify-center space-x-4 pt-4">
                <Link href="/">
                  <Button variant="outline">Volver al Inicio</Button>
                </Link>
                <Link href="/solicitar-cita">
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    Nueva Solicitud
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
