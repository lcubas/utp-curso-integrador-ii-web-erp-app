import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { adjustStockSchema } from "@/lib/validations/part";

// POST - Ajustar stock del repuesto
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();
    const { id: partId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser || !["ADMIN", "ASESOR"].includes(currentUser.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = adjustStockSchema.parse(body);

    const part = await prisma.part.findUnique({
      where: { id: partId },
    });

    if (!part) {
      return NextResponse.json(
        { error: "Repuesto no encontrado" },
        { status: 404 },
      );
    }

    // Calcular nuevo stock
    let newStock = part.stock;
    if (validatedData.type === "ADD") {
      newStock += validatedData.quantity;
    } else {
      newStock -= validatedData.quantity;
      if (newStock < 0) {
        return NextResponse.json(
          { error: "El stock no puede ser negativo" },
          { status: 400 },
        );
      }
    }

    // Actualizar stock
    const updatedPart = await prisma.part.update({
      where: { id: partId },
      data: { stock: newStock },
    });

    return NextResponse.json(updatedPart);
  } catch (error: any) {
    console.error("Error al ajustar stock:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Error al ajustar stock" },
      { status: 500 },
    );
  }
}
