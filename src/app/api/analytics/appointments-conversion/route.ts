import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// GET - Tasa de conversión de citas
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

    const appointments = await prisma.appointment.findMany();

    const totalAppointments = appointments.length;
    const pendingAppointments = appointments.filter(
      (a) => a.status === "PENDIENTE",
    ).length;
    const confirmedAppointments = appointments.filter(
      (a) => a.status === "CONFIRMADA",
    ).length;
    const canceledAppointments = appointments.filter(
      (a) => a.status === "CANCELADA",
    ).length;

    const conversionRate =
      totalAppointments > 0
        ? (confirmedAppointments / totalAppointments) * 100
        : 0;

    const cancellationRate =
      totalAppointments > 0
        ? (canceledAppointments / totalAppointments) * 100
        : 0;

    return NextResponse.json({
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      canceledAppointments,
      conversionRate,
      cancellationRate,
    });
  } catch (error) {
    console.error("Error al obtener conversión de citas:", error);
    return NextResponse.json(
      { error: "Error al obtener conversión de citas" },
      { status: 500 },
    );
  }
}
