import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// GET - Obtener estado de órdenes
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

    const statusCounts = await prisma.serviceOrder.groupBy({
      by: ["status"],
      _count: true,
    });

    const data = statusCounts.map((item) => ({
      status: item.status,
      count: item._count,
      label:
        item.status === "EN_PROCESO"
          ? "En Proceso"
          : item.status === "PAUSADO"
            ? "Pausado"
            : "Completado",
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error al obtener estados:", error);
    return NextResponse.json(
      { error: "Error al obtener estados" },
      { status: 500 },
    );
  }
}
