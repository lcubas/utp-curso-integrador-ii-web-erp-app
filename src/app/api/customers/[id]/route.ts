import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { updateCustomerSchema } from "@/lib/validations/customer";

// GET - Obtener un cliente específico
export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();
    const { id: customerId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser || !["ADMIN", "ASESOR"].includes(currentUser.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        vehicles: true,
        serviceOrders: {
          include: {
            vehicle: true,
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        _count: {
          select: {
            serviceOrders: true,
            invoices: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error("Error al obtener cliente:", error);
    return NextResponse.json(
      { error: "Error al obtener cliente" },
      { status: 500 },
    );
  }
}

// PATCH - Actualizar cliente
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();
    const { id: customerId } = await params;

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
    const validatedData = updateCustomerSchema.parse(body);

    const updatedCustomer = await prisma.customer.update({
      where: { id: customerId },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.email !== undefined && {
          email: validatedData.email || null,
        }),
        ...(validatedData.phone !== undefined && {
          phone: validatedData.phone || null,
        }),
        ...(validatedData.address !== undefined && {
          address: validatedData.address || null,
        }),
      },
    });

    return NextResponse.json(updatedCustomer);
  } catch (error: any) {
    console.error("Error al actualizar cliente:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 },
      );
    }

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "Error al actualizar cliente" },
      { status: 500 },
    );
  }
}

// DELETE - Eliminar cliente
export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();
    const { id: customerId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser || !["ADMIN", "ASESOR"].includes(currentUser.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Verificar si el cliente tiene órdenes de servicio
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        _count: {
          select: {
            serviceOrders: true,
          },
        },
      },
    });

    if (customer && customer._count.serviceOrders > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar un cliente con órdenes de servicio" },
        { status: 400 },
      );
    }

    await prisma.customer.delete({
      where: { id: customerId },
    });

    return NextResponse.json({ message: "Cliente eliminado exitosamente" });
  } catch (error: any) {
    console.error("Error al eliminar cliente:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "Error al eliminar cliente" },
      { status: 500 },
    );
  }
}
