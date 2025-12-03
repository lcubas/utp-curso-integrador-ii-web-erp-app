import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { updateServiceOrderSchema } from '@/lib/validations/service-order';

// GET - Obtener una orden específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const serviceOrder = await prisma.serviceOrder.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        vehicle: true,
        user: true,
        partRequests: {
          include: {
            part: true,
          },
        },
        invoice: true,
      },
    });

    if (!serviceOrder) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(serviceOrder);
  } catch (error) {
    console.error('Error al obtener orden:', error);
    return NextResponse.json(
      { error: 'Error al obtener orden' },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar orden
export async function PATCH(
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
    const validatedData = updateServiceOrderSchema.parse(body);

    const updatedOrder = await prisma.serviceOrder.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        customer: true,
        vehicle: true,
        partRequests: {
          include: {
            part: true,
          },
        },
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    console.error('Error al actualizar orden:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Error al actualizar orden' },
      { status: 500 }
    );
  }
}