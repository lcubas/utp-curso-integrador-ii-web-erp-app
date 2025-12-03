import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { getLowStockAlertEmail } from "@/lib/email-templates";

// POST - Despachar repuestos de la orden
export async function POST(
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

    const body = await request.json();
    const { partRequestIds } = body; // Array de IDs de solicitudes a despachar

    if (!Array.isArray(partRequestIds) || partRequestIds.length === 0) {
      return NextResponse.json(
        { error: "Debe proporcionar solicitudes a despachar" },
        { status: 400 },
      );
    }

    const lowStockParts: Array<{ name: string; code: string; stock: number }> =
      [];
    const insufficientStockParts: string[] = [];

    // Procesar cada solicitud de repuesto
    for (const requestId of partRequestIds) {
      const partRequest = await prisma.partRequest.findUnique({
        where: { id: requestId },
        include: { part: true },
      });

      if (!partRequest) continue;

      // Verificar stock suficiente
      if (partRequest.part.stock < partRequest.quantity) {
        insufficientStockParts.push(
          `${partRequest.part.name} (requiere ${partRequest.quantity}, disponible ${partRequest.part.stock})`,
        );
        continue;
      }

      // Reducir stock
      const updatedPart = await prisma.part.update({
        where: { id: partRequest.partId },
        data: {
          stock: {
            decrement: partRequest.quantity,
          },
        },
      });

      // Marcar como despachado
      await prisma.partRequest.update({
        where: { id: requestId },
        data: { dispatched: true },
      });

      // Verificar si el stock quedó bajo (≤ 5)
      if (updatedPart.stock <= 5) {
        lowStockParts.push({
          name: updatedPart.name,
          code: updatedPart.code,
          stock: updatedPart.stock,
        });
      }
    }

    // Si hay repuestos con stock insuficiente, retornar error
    if (insufficientStockParts.length > 0) {
      return NextResponse.json(
        {
          error: "Stock insuficiente",
          details: insufficientStockParts,
        },
        { status: 400 },
      );
    }

    // Enviar alertas de stock bajo
    for (const part of lowStockParts) {
      try {
        const emailData = getLowStockAlertEmail(
          part.name,
          part.code,
          part.stock,
        );

        // Obtener email del admin o asesor para notificar
        const adminUser = await prisma.user.findFirst({
          where: { role: "ADMIN", isActive: true },
        });

        if (adminUser?.email) {
          await resend.emails.send({
            from: "PESANORT <onboarding@resend.dev>",
            to: adminUser.email,
            subject: emailData.subject,
            html: emailData.html,
          });
        }
      } catch (emailError) {
        console.error("Error al enviar alerta de stock:", emailError);
      }
    }

    return NextResponse.json({
      message: "Repuestos despachados exitosamente",
      lowStockAlerts: lowStockParts.length,
    });
  } catch (error: any) {
    console.error("Error al despachar repuestos:", error);
    return NextResponse.json(
      { error: "Error al despachar repuestos" },
      { status: 500 },
    );
  }
}
