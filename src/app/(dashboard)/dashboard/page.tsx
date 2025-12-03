import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    redirect("/sign-in");
  }

  // Métricas básicas según rol
  const stats = await getStatsForRole(user.role);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Bienvenido de nuevo, {user.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

async function getStatsForRole(role: string) {
  switch (role) {
    case "ADMIN":
      const [totalUsers, totalOrders, totalCustomers] = await Promise.all([
        prisma.user.count(),
        prisma.serviceOrder.count(),
        prisma.customer.count(),
      ]);
      return [
        { label: "Total Usuarios", value: totalUsers },
        { label: "Total Órdenes", value: totalOrders },
        { label: "Total Clientes", value: totalCustomers },
      ];

    case "ASESOR":
      const [pendingOrders, confirmedAppointments, totalInvoices] =
        await Promise.all([
          prisma.serviceOrder.count({ where: { status: "EN_PROCESO" } }),
          prisma.appointment.count({ where: { status: "CONFIRMADA" } }),
          prisma.invoice.count(),
        ]);
      return [
        { label: "Órdenes Pendientes", value: pendingOrders },
        { label: "Citas Confirmadas", value: confirmedAppointments },
        { label: "Facturas Generadas", value: totalInvoices },
      ];

    case "MECANICO":
      const [assignedOrders, pendingReviews] = await Promise.all([
        prisma.serviceOrder.count({ where: { status: "EN_PROCESO" } }),
        prisma.serviceOrder.count({
          where: {
            status: "EN_PROCESO",
            diagnosis: null,
          },
        }),
      ]);
      return [
        { label: "Órdenes Asignadas", value: assignedOrders },
        { label: "Revisiones Pendientes", value: pendingReviews },
        { label: "En Proceso", value: assignedOrders },
      ];

    default:
      return [];
  }
}
