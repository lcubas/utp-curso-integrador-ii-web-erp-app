import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// GET - Obtener top 10 clientes por facturación
export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get("period") || "all"; // all, year, month

    let dateFilter = {};
    if (period === "year") {
      const startOfYear = new Date(new Date().getFullYear(), 0, 1);
      dateFilter = { createdAt: { gte: startOfYear } };
    } else if (period === "month") {
      const startOfMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1,
      );
      dateFilter = { createdAt: { gte: startOfMonth } };
    }

    const invoices = await prisma.invoice.findMany({
      where: dateFilter,
      include: {
        customer: true,
      },
    });

    // Agrupar por cliente
    const customerTotals = invoices.reduce((acc: any, invoice) => {
      const customerId = invoice.customerId;
      if (!acc[customerId]) {
        acc[customerId] = {
          id: customerId,
          name: invoice.customer.name,
          total: 0,
          invoiceCount: 0,
        };
      }
      acc[customerId].total += invoice.total;
      acc[customerId].invoiceCount += 1;
      return acc;
    }, {});

    // Convertir a array y ordenar
    const topCustomers = Object.values(customerTotals)
      .sort((a: any, b: any) => b.total - a.total)
      .slice(0, 10);

    return NextResponse.json(topCustomers);
  } catch (error) {
    console.error("Error al obtener top clientes:", error);
    return NextResponse.json(
      { error: "Error al obtener top clientes" },
      { status: 500 },
    );
  }
}
