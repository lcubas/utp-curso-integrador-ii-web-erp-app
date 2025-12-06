import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// GET - Obtener ingresos mensuales (últimos 12 meses)
export async function GET(_: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Obtener últimos 12 meses
    const months = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(date);
    }

    // Obtener pagos agrupados por mes
    const revenueData = await Promise.all(
      months.map(async (month) => {
        const nextMonth = new Date(
          month.getFullYear(),
          month.getMonth() + 1,
          1,
        );

        const payments = await prisma.payment.findMany({
          where: {
            createdAt: {
              gte: month,
              lt: nextMonth,
            },
          },
        });

        const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
        const paymentCount = payments.length;

        return {
          month: month.toLocaleDateString("es-PE", {
            month: "short",
            year: "numeric",
          }),
          revenue: totalRevenue,
          count: paymentCount,
        };
      }),
    );

    return NextResponse.json(revenueData);
  } catch (error) {
    console.error("Error al obtener ingresos:", error);
    return NextResponse.json(
      { error: "Error al obtener ingresos" },
      { status: 500 },
    );
  }
}
