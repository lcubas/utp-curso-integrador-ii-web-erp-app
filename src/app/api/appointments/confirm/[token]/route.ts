import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { getAppointmentConfirmedNotificationEmail } from "@/lib/email-templates";

// POST - Confirmar cita con token
export async function POST(
  _: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    // Buscar cita con el token
    const { token } = await params;
    const appointment = await prisma.appointment.findUnique({
      where: { token: token },
      include: {
        customer: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Cita no encontrada o token inválido" },
        { status: 404 },
      );
    }

    if (appointment.status === "CONFIRMADA") {
      return NextResponse.json(
        { error: "Esta cita ya ha sido confirmada" },
        { status: 400 },
      );
    }

    if (appointment.status === "CANCELADA") {
      return NextResponse.json(
        { error: "Esta cita ha sido cancelada" },
        { status: 400 },
      );
    }

    // Verificar que el token no haya expirado (48 horas)
    const createdAt = new Date(appointment.createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    if (hoursDiff > 48) {
      return NextResponse.json(
        {
          error:
            "El enlace de confirmación ha expirado. Por favor, solicita una nueva cita.",
        },
        { status: 400 },
      );
    }

    // Confirmar cita
    const confirmedAppointment = await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: "CONFIRMADA" },
    });

    // Enviar notificación al asesor/admin
    try {
      const adminUser = await prisma.user.findFirst({
        where: {
          role: { in: ["ADMIN", "ASESOR"] },
          isActive: true,
        },
      });

      if (adminUser?.email) {
        const emailData = getAppointmentConfirmedNotificationEmail({
          customerName: appointment.name,
          email: appointment.email,
          phone: appointment.phone,
          date: new Date(appointment.date).toLocaleDateString("es-PE", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          description: appointment.description,
        });

        await resend.emails.send({
          from: "PESANORT <onboarding@resend.dev>",
          to: adminUser.email,
          subject: emailData.subject,
          html: emailData.html,
        });
      }
    } catch (emailError) {
      console.error("Error al enviar notificación:", emailError);
    }

    return NextResponse.json(confirmedAppointment);
  } catch (error: any) {
    console.error("Error al confirmar cita:", error);
    return NextResponse.json(
      { error: "Error al confirmar cita" },
      { status: 500 },
    );
  }
}
