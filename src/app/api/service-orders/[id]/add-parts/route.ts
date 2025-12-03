import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// POST - Agregar repuestos a una orden existente
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (
      !currentUser ||
      !["ADMIN", "ASESOR", "MECANICO"].includes(currentUser.role)
    ) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const { partRequests } = body;

    if (!Array.isArray(partRequests) || partRequests.length === 0) {
      return NextResponse.json(
        { error: "Debe proporcionar al menos un repuesto" },
        { status: 400 },
      );
    }

    // Verificar que la orden existe
    const order = await prisma.serviceOrder.findUnique({
      where: { id: params.id },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 },
      );
    }

    // Agregar repuestos
    const createdPartRequests = await Promise.all(
      partRequests.map((pr: any) =>
        prisma.partRequest.create({
          data: {
            serviceOrderId: params.id,
            partId: pr.partId,
            quantity: pr.quantity,
            reason: pr.reason || null,
          },
          include: {
            part: true,
          },
        }),
      ),
    );

    return NextResponse.json(createdPartRequests);
  } catch (error: any) {
    console.error("Error al agregar repuestos:", error);
    return NextResponse.json(
      { error: "Error al agregar repuestos" },
      { status: 500 },
    );
  }
}
