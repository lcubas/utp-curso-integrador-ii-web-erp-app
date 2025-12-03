import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { serviceOrderSchema } from "@/lib/validations/service-order";
import { generateOrderNumber } from "@/lib/utils";

// GET - Listar órdenes de servicio
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const customerId = searchParams.get("customerId");

    let whereClause: any = {};

    if (status) {
      whereClause.status = status;
    }

    if (customerId) {
      whereClause.customerId = customerId;
    }

    const serviceOrders = await prisma.serviceOrder.findMany({
      where: whereClause,
      include: {
        customer: true,
        vehicle: true,
        user: true,
        partRequests: {
          include: {
            part: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(serviceOrders);
  } catch (error) {
    console.error("Error al obtener órdenes:", error);
    return NextResponse.json(
      { error: "Error al obtener órdenes" },
      { status: 500 },
    );
  }
}

// POST - Crear nueva orden de servicio
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

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
    const validatedData = serviceOrderSchema.parse(body);

    // Generar número de orden único
    let orderNumber: string;
    let isUnique = false;

    while (!isUnique) {
      orderNumber = generateOrderNumber();
      const existing = await prisma.serviceOrder.findUnique({
        where: { orderNumber },
      });
      if (!existing) {
        isUnique = true;
      }
    }

    // Crear orden de servicio con solicitudes de repuestos
    const newServiceOrder = await prisma.serviceOrder.create({
      data: {
        orderNumber: orderNumber!,
        customerId: validatedData.customerId,
        vehicleId: validatedData.vehicleId,
        userId: currentUser.id,
        diagnosis: validatedData.diagnosis || null,
        cost: validatedData.cost || 0,
        partRequests: validatedData.partRequests
          ? {
              create: validatedData.partRequests.map((pr) => ({
                partId: pr.partId,
                quantity: pr.quantity,
                reason: pr.reason || null,
              })),
            }
          : undefined,
      },
      include: {
        customer: true,
        vehicle: true,
        user: true,
        partRequests: {
          include: {
            part: true,
          },
        },
      },
    });

    return NextResponse.json(newServiceOrder, { status: 201 });
  } catch (error: any) {
    console.error("Error al crear orden:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Error al crear orden" },
      { status: 500 },
    );
  }
}
