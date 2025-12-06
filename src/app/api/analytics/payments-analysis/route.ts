import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// GET - Análisis de pagos
export async function GET(_: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Obtener todas las facturas con pagos
    const invoices = await prisma.invoice.findMany({
      include: {
        payments: true,
      },
    });

    // Calcular métricas
    const totalInvoices = invoices.length;
    const totalBilled = invoices.reduce((sum, inv) => sum + inv.total, 0);

    const paidInvoices = invoices.filter((inv) => {
      const totalPaid = inv.payments.reduce((sum, p) => sum + p.amount, 0);
      return totalPaid >= inv.total;
    }).length;

    const partialInvoices = invoices.filter((inv) => {
      const totalPaid = inv.payments.reduce((sum, p) => sum + p.amount, 0);
      return totalPaid > 0 && totalPaid < inv.total;
    }).length;

    const pendingInvoices = invoices.filter((inv) => {
      const totalPaid = inv.payments.reduce((sum, p) => sum + p.amount, 0);
      return totalPaid === 0;
    }).length;

    const totalCollected = invoices.reduce((sum, inv) => {
      return sum + inv.payments.reduce((pSum, p) => pSum + p.amount, 0);
    }, 0);

    const totalPending = totalBilled - totalCollected;

    // Pagos por método
    const allPayments = await prisma.payment.findMany();
    const paymentsByMethod = allPayments.reduce((acc: any, payment) => {
      if (!acc[payment.paymentMethod]) {
        acc[payment.paymentMethod] = {
          method: payment.paymentMethod,
          count: 0,
          total: 0,
        };
      }
      acc[payment.paymentMethod].count += 1;
      acc[payment.paymentMethod].total += payment.amount;
      return acc;
    }, {});

    return NextResponse.json({
      summary: {
        totalInvoices,
        totalBilled,
        totalCollected,
        totalPending,
        paidInvoices,
        partialInvoices,
        pendingInvoices,
        collectionRate:
          totalBilled > 0 ? (totalCollected / totalBilled) * 100 : 0,
      },
      paymentsByMethod: Object.values(paymentsByMethod),
    });
  } catch (error) {
    console.error("Error al obtener análisis de pagos:", error);
    return NextResponse.json(
      { error: "Error al obtener análisis de pagos" },
      { status: 500 },
    );
  }
}
