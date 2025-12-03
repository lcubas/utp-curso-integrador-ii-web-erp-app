import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { paymentSchema } from "@/lib/validations/invoice";

// GET - Listar todos los pagos
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
    const invoiceId = searchParams.get("invoiceId");

    const payments = await prisma.payment.findMany({
      where: invoiceId ? { invoiceId } : {},
      include: {
        invoice: {
          include: {
            customer: true,
          },
        },
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error al obtener pagos:", error);
    return NextResponse.json(
      { error: "Error al obtener pagos" },
      { status: 500 },
    );
  }
}

// POST - Registrar nuevo pago
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
    const validatedData = paymentSchema.parse(body);

    // Verificar que la factura existe
    const invoice = await prisma.invoice.findUnique({
      where: { id: validatedData.invoiceId },
      include: {
        payments: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Factura no encontrada" },
        { status: 404 },
      );
    }

    // Verificar que no se exceda el total
    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
    const newTotal = totalPaid + validatedData.amount;

    if (newTotal > invoice.total) {
      return NextResponse.json(
        { error: "El monto excede el total de la factura" },
        { status: 400 },
      );
    }

    // Crear pago
    const newPayment = await prisma.payment.create({
      data: {
        invoiceId: validatedData.invoiceId,
        userId: currentUser.id,
        amount: validatedData.amount,
        paymentMethod: validatedData.paymentMethod,
      },
      include: {
        user: true,
        invoice: {
          include: {
            customer: true,
          },
        },
      },
    });

    return NextResponse.json(newPayment, { status: 201 });
  } catch (error: any) {
    console.error("Error al registrar pago:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Error al registrar pago" },
      { status: 500 },
    );
  }
}
