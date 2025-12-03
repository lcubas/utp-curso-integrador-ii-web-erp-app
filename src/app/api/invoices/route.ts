import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { invoiceSchema } from "@/lib/validations/invoice";
import { generateInvoiceNumber } from "@/lib/utils";

// GET - Listar todas las facturas
export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get("customerId");

    const invoices = await prisma.invoice.findMany({
      where: customerId ? { customerId } : {},
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
        payments: true,
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Error al obtener facturas:", error);
    return NextResponse.json(
      { error: "Error al obtener facturas" },
      { status: 500 },
    );
  }
}

// POST - Crear nueva factura
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
    const validatedData = invoiceSchema.parse(body);

    // Verificar que la orden existe y está completada
    const serviceOrder = await prisma.serviceOrder.findUnique({
      where: { id: validatedData.serviceOrderId },
      include: {
        invoice: true,
      },
    });

    if (!serviceOrder) {
      return NextResponse.json(
        { error: "Orden de servicio no encontrada" },
        { status: 404 },
      );
    }

    if (serviceOrder.invoice) {
      return NextResponse.json(
        { error: "Esta orden ya tiene una factura generada" },
        { status: 400 },
      );
    }

    // Generar número de factura único
    let invoiceNumber: string;
    let isUnique = false;

    while (!isUnique) {
      invoiceNumber = generateInvoiceNumber();
      const existing = await prisma.invoice.findUnique({
        where: { invoiceNumber },
      });
      if (!existing) {
        isUnique = true;
      }
    }

    // Crear factura
    const newInvoice = await prisma.invoice.create({
      data: {
        invoiceNumber: invoiceNumber!,
        serviceOrderId: validatedData.serviceOrderId,
        customerId: serviceOrder.customerId,
        userId: currentUser.id,
        dni: validatedData.dni,
        businessName: validatedData.businessName,
        subtotal: validatedData.subtotal,
        igv: validatedData.igv,
        total: validatedData.total,
      },
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
        payments: true,
      },
    });

    return NextResponse.json(newInvoice, { status: 201 });
  } catch (error: any) {
    console.error("Error al crear factura:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Error al crear factura" },
      { status: 500 },
    );
  }
}
