import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { appointmentSchema } from "@/lib/validations/appointment";
import { getAppointmentConfirmationEmail } from "@/lib/email-templates";
import crypto from "crypto";
import { mailtrap } from "@/lib/mailtrap";

// GET - Listar citas (solo usuarios autenticados)
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
    const status = searchParams.get("status");

    const appointments = await prisma.appointment.findMany({
      where: status ? { status: status as any } : {},
      include: {
        customer: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Error al obtener citas:", error);
    return NextResponse.json(
      { error: "Error al obtener citas" },
      { status: 500 },
    );
  }
}

// POST - Crear nueva cita (público, sin autenticación)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = appointmentSchema.parse(body);

    // Generar token único para confirmación
    const token = crypto.randomBytes(32).toString("hex");

    // Buscar o crear cliente
    let customer = await prisma.customer.findFirst({
      where: { email: validatedData.email },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone,
        },
      });
    }

    // Crear cita
    const newAppointment = await prisma.appointment.create({
      data: {
        customerId: customer.id,
        email: validatedData.email,
        phone: validatedData.phone,
        name: validatedData.name,
        description: validatedData.description,
        date: new Date(validatedData.date),
        token,
        status: "PENDIENTE",
      },
    });

    // Enviar email de confirmación
    try {
      const confirmationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/confirmar-cita/${token}`;
      const emailData = getAppointmentConfirmationEmail({
        customerName: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        date: new Date(validatedData.date).toLocaleDateString("es-PE", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        description: validatedData.description,
        confirmationUrl,
      });

      await mailtrap.send({
        from: {
          name: "PESANORT",
          email: "hello@example.com",
        },
        to: [{ email: validatedData.email }],
        subject: emailData.subject,
        html: emailData.html,
      });
    } catch (emailError) {
      console.error("Error al enviar email:", emailError);
      // No fallar la creación de la cita si el email falla
    }

    return NextResponse.json(newAppointment, { status: 201 });
  } catch (error: any) {
    console.error("Error al crear cita:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "Error al crear cita" }, { status: 500 });
  }
}
