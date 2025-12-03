import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { updatePartSchema } from "@/lib/validations/part";

// GET - Obtener un repuesto específico
export async function GET(
  _: NextRequest,
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

    const part = await prisma.part.findUnique({
      where: { id: partId },
      include: {
        partRequests: {
          include: {
            serviceOrder: {
              include: {
                customer: true,
                vehicle: true,
              },
            },
          },
          orderBy: { serviceOrder: { createdAt: "desc" } },
          take: 10,
        },
      },
    });

    if (!part) {
      return NextResponse.json(
        { error: "Repuesto no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(part);
  } catch (error) {
    console.error("Error al obtener repuesto:", error);
    return NextResponse.json(
      { error: "Error al obtener repuesto" },
      { status: 500 },
    );
  }
}

// PATCH - Actualizar repuesto
export async function PATCH(
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
    const validatedData = updatePartSchema.parse(body);

    // Si se actualiza el código, verificar que no exista
    if (validatedData.code) {
      const existingPart = await prisma.part.findUnique({
        where: { code: validatedData.code },
      });

      if (existingPart && existingPart.id !== partId) {
        return NextResponse.json(
          { error: "Ya existe un repuesto con ese código" },
          { status: 400 },
        );
      }
    }

    const updatedPart = await prisma.part.update({
      where: { id: partId },
      data: validatedData,
    });

    return NextResponse.json(updatedPart);
  } catch (error: any) {
    console.error("Error al actualizar repuesto:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 },
      );
    }

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Repuesto no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "Error al actualizar repuesto" },
      { status: 500 },
    );
  }
}

// DELETE - Eliminar repuesto
export async function DELETE(
  _: NextRequest,
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

    // Verificar si el repuesto tiene solicitudes asociadas
    const part = await prisma.part.findUnique({
      where: { id: partId },
      include: {
        _count: {
          select: {
            partRequests: true,
          },
        },
      },
    });

    if (part && part._count.partRequests > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar un repuesto con solicitudes asociadas" },
        { status: 400 },
      );
    }

    await prisma.part.delete({
      where: { id: partId },
    });

    return NextResponse.json({ message: "Repuesto eliminado exitosamente" });
  } catch (error: any) {
    console.error("Error al eliminar repuesto:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Repuesto no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "Error al eliminar repuesto" },
      { status: 500 },
    );
  }
}
