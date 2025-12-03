import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { vehicleSchema } from "@/lib/validations/vehicle";

// GET - Listar vehículos (filtrar por cliente si se proporciona)
export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get("customerId");

    const vehicles = await prisma.vehicle.findMany({
      where: customerId ? { customerId } : {},
      include: {
        customer: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(vehicles);
  } catch (error) {
    console.error("Error al obtener vehículos:", error);
    return NextResponse.json(
      { error: "Error al obtener vehículos" },
      { status: 500 },
    );
  }
}

// POST - Crear nuevo vehículo
export async function POST(request: NextRequest) {
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
    const validatedData = vehicleSchema.parse(body);

    // Verificar que la placa no exista
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { plate: validatedData.plate.toUpperCase() },
    });

    if (existingVehicle) {
      return NextResponse.json(
        { error: "Ya existe un vehículo con esa placa" },
        { status: 400 },
      );
    }

    const newVehicle = await prisma.vehicle.create({
      data: {
        customerId: validatedData.customerId,
        brand: validatedData.brand,
        model: validatedData.model,
        plate: validatedData.plate.toUpperCase(),
      },
      include: {
        customer: true,
      },
    });

    return NextResponse.json(newVehicle, { status: 201 });
  } catch (error: any) {
    console.error("Error al crear vehículo:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Error al crear vehículo" },
      { status: 500 },
    );
  }
}
