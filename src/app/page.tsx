import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Calendar, LogIn } from "lucide-react";

export default async function HomePage() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-orange-600">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-white">PESANORT</h1>
          {userId && (
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="secondary">Dashboard</Button>
              </Link>
              <UserButton />
            </div>
          )}
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 text-white">
            <h2 className="text-5xl font-bold mb-4">
              Sistema de Gestión de Taller
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Gestión completa de órdenes de servicio, inventario y facturación
            </p>

            <div className="flex justify-center space-x-4">
              {!userId ? (
                <>
                  <Link href="/sign-in">
                    <Button
                      size="lg"
                      variant="secondary"
                      className="text-lg px-8"
                    >
                      <LogIn className="w-5 h-5 mr-2" />
                      Ingresar al Sistema
                    </Button>
                  </Link>
                  <Link href="/solicitar-cita">
                    <Button
                      size="lg"
                      className="text-lg px-8 bg-white text-orange-600 hover:bg-gray-100"
                    >
                      <Calendar className="w-5 h-5 mr-2" />
                      Solicitar Cita
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="text-lg px-8"
                  >
                    Ir al Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-xl font-bold mb-2">Gestión de Órdenes</h3>
              <p className="text-white/80">
                Control completo de órdenes de servicio y estados
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-xl font-bold mb-2">Inventario</h3>
              <p className="text-white/80">
                Administra repuestos y controla el stock
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-xl font-bold mb-2">Facturación</h3>
              <p className="text-white/80">
                Genera facturas y registra pagos fácilmente
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
