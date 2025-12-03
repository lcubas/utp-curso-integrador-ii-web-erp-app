import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { resend } from '@/lib/resend';
import { getServiceOrderStatusEmail } from '@/lib/email-templates';

// POST - Cambiar estado de la orden y notificar al cliente
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser || !['ADMIN', 'ASESOR'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { status } = body;

    if (!['EN_PROCESO', 'PAUSADO', 'COMPLETADO'].includes(status)) {
      return NextResponse.json(
        { error: 'Estado inválido' },
        { status: 400 }
      );
    }

    // Actualizar estado
    const updatedOrder = await prisma.serviceOrder.update({
      where: { id: params.id },
      data: { status },
      include: {
        customer: true,
        vehicle: true,
      },
    });

    // Enviar email al cliente si tiene email
    if (updatedOrder.customer.email) {
      try {
        const emailData = getServiceOrderStatusEmail({
          customerName: updatedOrder.customer.name,
          orderNumber: updatedOrder.orderNumber,
          vehicleBrand: updatedOrder.vehicle.brand,
          vehicleModel: updatedOrder.vehicle.model,
          vehiclePlate: updatedOrder.vehicle.plate,
          status: updatedOrder.status,
        });

        await resend.emails.send({
          from: 'PESANORT <onboarding@resend.dev>', // Cambiar por tu dominio verificado
          to: updatedOrder.customer.email,
          subject: emailData.subject,
          html: emailData.html,
        });
      } catch (emailError) {
        console.error('Error al enviar email:', emailError);
        // No fallar la request si el email falla
      }
    }

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    console.error('Error al cambiar estado:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Error al cambiar estado' },
      { status: 500 }
    );
  }
}