import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { partSchema } from "@/lib/validations/part";

// GET - Listar todos los repuestos
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que el usuario sea ADMIN o ASESOR
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser || !["ADMIN", "ASESOR"].includes(currentUser.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Obtener parámetros de búsqueda
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const lowStock = searchParams.get("lowStock") === "true";

    let whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ];
    }

    if (lowStock) {
      whereClause.stock = { lte: 5 }; // Stock bajo = 5 o menos
    }

    const parts = await prisma.part.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            partRequests: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(parts);
  } catch (error) {
    console.error("Error al obtener repuestos:", error);
    return NextResponse.json(
      { error: "Error al obtener repuestos" },
      { status: 500 },
    );
  }
}

// POST - Crear nuevo repuesto
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que el usuario sea ADMIN o ASESOR
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser || !["ADMIN", "ASESOR"].includes(currentUser.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = partSchema.parse(body);

    // Verificar que el código no exista
    const existingPart = await prisma.part.findUnique({
      where: { code: validatedData.code },
    });

    if (existingPart) {
      return NextResponse.json(
        { error: "Ya existe un repuesto con ese código" },
        { status: 400 },
      );
    }

    // Crear repuesto
    const newPart = await prisma.part.create({
      data: validatedData,
    });

    return NextResponse.json(newPart, { status: 201 });
  } catch (error: any) {
    console.error("Error al crear repuesto:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Error al crear repuesto" },
      { status: 500 },
    );
  }
}
