import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// GET - Obtener repuestos más vendidos
export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get("period") || "all";

    let dateFilter = {};
    if (period === "year") {
      const startOfYear = new Date(new Date().getFullYear(), 0, 1);
      dateFilter = { serviceOrder: { createdAt: { gte: startOfYear } } };
    } else if (period === "month") {
      const startOfMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1,
      );
      dateFilter = { serviceOrder: { createdAt: { gte: startOfMonth } } };
    }

    const partRequests = await prisma.partRequest.findMany({
      where: {
        dispatched: true,
        ...dateFilter,
      },
      include: {
        part: true,
      },
    });

    // Agrupar por repuesto
    const partTotals = partRequests.reduce((acc: any, pr) => {
      const partId = pr.partId;
      if (!acc[partId]) {
        acc[partId] = {
          id: partId,
          name: pr.part.name,
          code: pr.part.code,
          quantity: 0,
          revenue: 0,
        };
      }
      acc[partId].quantity += pr.quantity;
      acc[partId].revenue += pr.part.price * pr.quantity;
      return acc;
    }, {});

    // Convertir a array y ordenar por cantidad
    const topParts = Object.values(partTotals)
      .sort((a: any, b: any) => b.quantity - a.quantity)
      .slice(0, 10);

    return NextResponse.json(topParts);
  } catch (error) {
    console.error("Error al obtener top repuestos:", error);
    return NextResponse.json(
      { error: "Error al obtener top repuestos" },
      { status: 500 },
    );
  }
}
