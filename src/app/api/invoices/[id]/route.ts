import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// GET - Obtener una factura específica
export async function GET(
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

    if (!currentUser || !["ADMIN", "ASESOR"].includes(currentUser.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        serviceOrder: {
          include: {
            vehicle: true,
            partRequests: {
              include: {
                part: true,
              },
            },
          },
        },
        payments: {
          include: {
            user: true,
          },
          orderBy: { createdAt: "desc" },
        },
        user: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Factura no encontrada" },
        { status: 404 },
      );
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Error al obtener factura:", error);
    return NextResponse.json(
      { error: "Error al obtener factura" },
      { status: 500 },
    );
  }
}
