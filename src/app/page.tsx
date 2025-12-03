import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-orange-600 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-2xl">
        <h1 className="text-6xl font-bold text-white">PESANORT</h1>
        <p className="text-xl text-white/90">
          Sistema de Gestión de Taller Automotriz
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/sign-in">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              Iniciar Sesión
            </Button>
          </Link>
          <Link href="/solicitar-cita">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto bg-white/10 text-white border-white hover:bg-white hover:text-orange-600"
            >
              Solicitar Cita
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
