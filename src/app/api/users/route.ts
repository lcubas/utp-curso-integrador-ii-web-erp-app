import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { userSchema } from "@/lib/validations/user";
import { clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// GET - Listar todos los usuarios
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que el usuario sea ADMIN
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return NextResponse.json(
      { error: "Error al obtener usuarios" },
      { status: 500 },
    );
  }
}

// POST - Crear nuevo usuario
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que el usuario sea ADMIN
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = userSchema.parse(body);

    // Crear usuario en Clerk primero
    const client = await clerkClient();
    const clerkUser = await client.users.createUser({
      emailAddress: [validatedData.email],
      firstName: validatedData.name.split(" ")[0],
      lastName: validatedData.name.split(" ").slice(1).join(" ") || "",
      password: "TempPassword123!", // Contraseña temporal
    });

    // Crear usuario en BD
    const newUser = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email: validatedData.email,
        name: validatedData.name,
        role: validatedData.role,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    console.error("Error al crear usuario:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Error al crear usuario" },
      { status: 500 },
    );
  }
}
