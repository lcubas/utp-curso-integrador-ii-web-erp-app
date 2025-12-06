import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { RevenueChart } from "@/components/analytics/revenue-chart";
import { OrdersStatusChart } from "@/components/analytics/orders-status-chart";
import { TopCustomersChart } from "@/components/analytics/top-customers-chart";
import { TopPartsChart } from "@/components/analytics/top-parts-chart";
import { PaymentsAnalysis } from "@/components/analytics/payments-analysis";
import { AppointmentsConversion } from "@/components/analytics/appointments-conversion";
import { MechanicSummary } from "@/components/analytics/mechanic-summary";
import { MechanicTopParts } from "@/components/analytics/mechanic-top-parts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Wrench,
  Package,
  FileText,
  DollarSign,
  ClipboardList,
  Calendar,
} from "lucide-react";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const currentUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!currentUser) {
    redirect("/sign-in");
  }

  // Obtener métricas generales
  const [
    totalCustomers,
    totalOrders,
    totalParts,
    totalInvoices,
    ordersInProgress,
    lowStockParts,
    pendingAppointments,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.serviceOrder.count(),
    prisma.part.count(),
    prisma.invoice.count(),
    prisma.serviceOrder.count({ where: { status: "EN_PROCESO" } }),
    prisma.part.count({ where: { stock: { lte: 5 } } }),
    prisma.appointment.count({ where: { status: "PENDIENTE" } }),
  ]);

  // Vista para ADMIN
  if (currentUser.role === "ADMIN") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Administrativo
          </h1>
          <p className="text-gray-600 mt-2">
            Resumen general del negocio y métricas clave
          </p>
        </div>

        {/* Métricas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Clientes
              </CardTitle>
              <Users className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCustomers}</div>
              <p className="text-xs text-gray-500 mt-1">Clientes registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Órdenes de Servicio
              </CardTitle>
              <ClipboardList className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-gray-500 mt-1">
                {ordersInProgress} en proceso
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Repuestos
              </CardTitle>
              <Package className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalParts}</div>
              <p className="text-xs text-red-500 mt-1">
                {lowStockParts} con stock bajo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Facturas
              </CardTitle>
              <FileText className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalInvoices}</div>
              <p className="text-xs text-gray-500 mt-1">Total generadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos Principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart />
          <OrdersStatusChart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopCustomersChart />
          <TopPartsChart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PaymentsAnalysis />
          <AppointmentsConversion />
        </div>

        {/* Alertas */}
        {(lowStockParts > 0 || pendingAppointments > 0) && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-yellow-900">
                ⚠️ Alertas Importantes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {lowStockParts > 0 && (
                <p className="text-yellow-800">
                  • <strong>{lowStockParts}</strong> repuesto(s) con stock bajo.
                  <a href="/dashboard/parts" className="underline ml-1">
                    Ver inventario
                  </a>
                </p>
              )}
              {pendingAppointments > 0 && (
                <p className="text-yellow-800">
                  • <strong>{pendingAppointments}</strong> cita(s) pendiente(s)
                  de confirmación.
                  <a href="/dashboard/appointments" className="underline ml-1">
                    Ver citas
                  </a>
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Vista para ASESOR
  if (currentUser.role === "ASESOR") {
    const myOrders = await prisma.serviceOrder.count({
      where: { userId: currentUser.id },
    });

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard del Asesor
          </h1>
          <p className="text-gray-600 mt-2">Bienvenido, {currentUser.name}</p>
        </div>

        {/* Métricas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Mis Órdenes
              </CardTitle>
              <ClipboardList className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Clientes
              </CardTitle>
              <Users className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCustomers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Órdenes en Proceso
              </CardTitle>
              <Wrench className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ordersInProgress}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Citas Pendientes
              </CardTitle>
              <Calendar className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingAppointments}</div>
            </CardContent>
          </Card>
        </div>

        {/* Accesos Rápidos */}
        <Card>
          <CardHeader>
            <CardTitle>Accesos Rápidos</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="/dashboard/quotes"
              className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <FileText className="w-8 h-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium">Nueva Orden</span>
            </a>

            <a
              href="/dashboard/customers"
              className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Users className="w-8 h-8 text-green-600 mb-2" />
              <span className="text-sm font-medium">Clientes</span>
            </a>

            <a
              href="/dashboard/parts"
              className="flex flex-col items-center justify-center p-6 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <Package className="w-8 h-8 text-orange-600 mb-2" />
              <span className="text-sm font-medium">Repuestos</span>
            </a>

            <a
              href="/dashboard/invoices/new"
              className="flex flex-col items-center justify-center p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <DollarSign className="w-8 h-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium">Facturar</span>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Vista para MECÁNICO
  if (currentUser.role === "MECANICO") {
    const myOrders = await prisma.serviceOrder.count({
      where: { userId: currentUser.id },
    });

    const myOrdersInProgress = await prisma.serviceOrder.count({
      where: {
        userId: currentUser.id,
        status: "EN_PROCESO",
      },
    });

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard del Mecánico
          </h1>
          <p className="text-gray-600 mt-2">Bienvenido, {currentUser.name}</p>
        </div>

        {/* Métricas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Mis Órdenes Totales
              </CardTitle>
              <ClipboardList className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                En Proceso
              </CardTitle>
              <Wrench className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myOrdersInProgress}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Repuestos Disponibles
              </CardTitle>
              <Package className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalParts}</div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos del Mecánico */}
        <MechanicSummary />
        <MechanicTopParts />

        {/* Accesos Rápidos */}
        <Card>
          <CardHeader>
            <CardTitle>Accesos Rápidos</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <a
              href="/dashboard/reception"
              className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Wrench className="w-8 h-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium">Registrar Recepción</span>
            </a>

            <a
              href="/dashboard/revision"
              className="flex flex-col items-center justify-center p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <ClipboardList className="w-8 h-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium">Registrar Revisión</span>
            </a>

            <a
              href="/dashboard/service-orders"
              className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <FileText className="w-8 h-8 text-green-600 mb-2" />
              <span className="text-sm font-medium">Ver Órdenes</span>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
