import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// GET - Órdenes del mecánico (mes actual)
export async function GET(_: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser || currentUser.role !== "MECANICO") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );

    const orders = await prisma.serviceOrder.findMany({
      where: {
        userId: currentUser.id,
        createdAt: { gte: startOfMonth },
      },
      include: {
        partRequests: {
          include: {
            part: true,
          },
        },
      },
    });

    const totalOrders = orders.length;
    const completedOrders = orders.filter(
      (o) => o.status === "COMPLETADO",
    ).length;
    const inProgressOrders = orders.filter(
      (o) => o.status === "EN_PROCESO",
    ).length;
    const pausedOrders = orders.filter((o) => o.status === "PAUSADO").length;

    const totalRevenue = orders.reduce((sum, o) => sum + (o.cost || 0), 0);

    const completionRate =
      totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

    // Repuestos más solicitados por este mecánico
    const partTotals = orders.reduce((acc: any, order) => {
      order.partRequests.forEach((pr) => {
        if (!acc[pr.partId]) {
          acc[pr.partId] = {
            name: pr.part.name,
            code: pr.part.code,
            quantity: 0,
          };
        }
        acc[pr.partId].quantity += pr.quantity;
      });
      return acc;
    }, {});

    const topParts = Object.values(partTotals)
      .sort((a: any, b: any) => b.quantity - a.quantity)
      .slice(0, 10);

    return NextResponse.json({
      summary: {
        totalOrders,
        completedOrders,
        inProgressOrders,
        pausedOrders,
        totalRevenue,
        completionRate,
      },
      topParts,
    });
  } catch (error) {
    console.error("Error al obtener órdenes del mecánico:", error);
    return NextResponse.json(
      { error: "Error al obtener órdenes" },
      { status: 500 },
    );
  }
}
