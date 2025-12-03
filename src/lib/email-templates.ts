interface ServiceOrderEmailData {
  customerName: string;
  orderNumber: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehiclePlate: string;
  status: string;
}

interface AppointmentConfirmedNotificationData {
  customerName: string;
  email: string;
  phone: string;
  date: string;
  description: string;
}

interface AppointmentConfirmationData {
  customerName: string;
  email: string;
  phone: string;
  date: string;
  description: string;
  confirmationUrl: string;
}

export function getServiceOrderStatusEmail(data: ServiceOrderEmailData) {
  const statusMessages = {
    EN_PROCESO: {
      subject: "Su vehículo está en proceso",
      message:
        "Hemos comenzado a trabajar en su vehículo. Le mantendremos informado del progreso.",
      color: "#3b82f6",
    },
    PAUSADO: {
      subject: "Su orden de servicio ha sido pausada",
      message:
        "Hemos pausado temporalmente el trabajo en su vehículo. Nos pondremos en contacto con usted para coordinar los siguientes pasos.",
      color: "#f59e0b",
    },
    COMPLETADO: {
      subject: "Su vehículo está listo",
      message:
        "¡Buenas noticias! Hemos completado el servicio de su vehículo. Ya puede pasar a recogerlo.",
      color: "#10b981",
    },
  };

  const statusInfo = statusMessages[data.status as keyof typeof statusMessages];

  return {
    subject: `PESANORT - ${statusInfo.subject}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${statusInfo.subject}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #fb923c 0%, #f97316 100%); padding: 40px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">PESANORT</h1>
                      <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 14px;">Sistema de Gestión de Taller</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">
                        Hola ${data.customerName},
                      </h2>
                      
                      <div style="background-color: ${statusInfo.color}15; border-left: 4px solid ${statusInfo.color}; padding: 20px; margin: 20px 0; border-radius: 4px;">
                        <p style="margin: 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                          ${statusInfo.message}
                        </p>
                      </div>
                      
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 12px; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #6b7280; font-size: 14px;">
                            Orden de Servicio
                          </td>
                          <td style="padding: 12px; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-size: 14px;">
                            #${data.orderNumber}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px; background-color: #ffffff; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #6b7280; font-size: 14px;">
                            Vehículo
                          </td>
                          <td style="padding: 12px; background-color: #ffffff; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-size: 14px;">
                            ${data.vehicleBrand} ${data.vehicleModel}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #6b7280; font-size: 14px;">
                            Placa
                          </td>
                          <td style="padding: 12px; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-size: 14px;">
                            ${data.vehiclePlate}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px; background-color: #ffffff; font-weight: bold; color: #6b7280; font-size: 14px;">
                            Estado
                          </td>
                          <td style="padding: 12px; background-color: #ffffff;">
                            <span style="display: inline-block; padding: 6px 12px; background-color: ${statusInfo.color}; color: #ffffff; border-radius: 4px; font-size: 12px; font-weight: bold;">
                              ${data.status.replace("_", " ")}
                            </span>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 30px 0 10px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                        Si tiene alguna pregunta, no dude en contactarnos.
                      </p>
                      
                      <p style="margin: 10px 0 0 0; color: #1f2937; font-size: 14px; font-weight: bold;">
                        Equipo PESANORT
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; color: #6b7280; font-size: 12px;">
                        © ${new Date().getFullYear()} PESANORT - Taller Automotriz
                      </p>
                      <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">
                        Este es un correo automático, por favor no responder.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };
}

export function getLowStockAlertEmail(
  partName: string,
  partCode: string,
  currentStock: number,
) {
  return {
    subject: "PESANORT - Alerta de Stock Bajo",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Alerta de Stock Bajo</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                  <tr>
                    <td style="background-color: #fef3c7; padding: 30px; border-left: 4px solid #f59e0b;">
                      <h2 style="margin: 0 0 15px 0; color: #92400e;">⚠️ Alerta de Stock Bajo</h2>
                      <p style="margin: 0; color: #78350f; font-size: 16px;">
                        El repuesto <strong>${partName}</strong> (${partCode}) tiene stock bajo.
                      </p>
                      <p style="margin: 15px 0 0 0; color: #78350f; font-size: 14px;">
                        Stock actual: <strong>${currentStock} unidad(es)</strong>
                      </p>
                      <p style="margin: 15px 0 0 0; color: #78350f; font-size: 14px;">
                        Se recomienda reabastecer el inventario.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };
}

export function getAppointmentConfirmationEmail(
  data: AppointmentConfirmationData,
) {
  return {
    subject: "PESANORT - Confirma tu cita",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmar Cita</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #fb923c 0%, #f97316 100%); padding: 40px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">PESANORT</h1>
                      <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 14px;">Taller Automotriz</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">
                        Hola ${data.customerName},
                      </h2>
                      
                      <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                        Gracias por contactarnos. Hemos recibido tu solicitud de cita para revisar tu vehículo.
                      </p>

                      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 4px;">
                        <p style="margin: 0; color: #92400e; font-size: 16px; font-weight: bold;">
                          ⚠️ Importante: Debes confirmar tu cita
                        </p>
                        <p style="margin: 10px 0 0 0; color: #92400e; font-size: 14px;">
                          Para completar tu reserva, haz clic en el botón de abajo.
                        </p>
                      </div>
                      
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 12px; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #6b7280; font-size: 14px;">
                            Fecha Solicitada
                          </td>
                          <td style="padding: 12px; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-size: 14px;">
                            ${data.date}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px; background-color: #ffffff; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #6b7280; font-size: 14px;">
                            Email
                          </td>
                          <td style="padding: 12px; background-color: #ffffff; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-size: 14px;">
                            ${data.email}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #6b7280; font-size: 14px;">
                            Teléfono
                          </td>
                          <td style="padding: 12px; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-size: 14px;">
                            ${data.phone}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px; background-color: #ffffff; font-weight: bold; color: #6b7280; font-size: 14px; vertical-align: top;">
                            Problema Reportado
                          </td>
                          <td style="padding: 12px; background-color: #ffffff; color: #1f2937; font-size: 14px;">
                            ${data.description}
                          </td>
                        </tr>
                      </table>

                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${data.confirmationUrl}" style="display: inline-block; background-color: #f97316; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">
                          Confirmar Mi Cita
                        </a>
                      </div>

                      <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                        <strong>Nota:</strong> Este enlace es válido por 48 horas. Si no confirmas tu cita en ese tiempo, deberás realizar una nueva solicitud.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; color: #6b7280; font-size: 12px;">
                        © ${new Date().getFullYear()} PESANORT - Taller Automotriz
                      </p>
                      <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">
                        Este es un correo automático, por favor no responder.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };
}

export function getAppointmentConfirmedNotificationEmail(
  data: AppointmentConfirmedNotificationData,
) {
  return {
    subject: "PESANORT - Nueva cita confirmada",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Nueva Cita Confirmada</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                  <tr>
                    <td style="background-color: #dcfce7; padding: 30px; border-left: 4px solid #10b981;">
                      <h2 style="margin: 0 0 15px 0; color: #065f46;">✓ Nueva Cita Confirmada</h2>
                      <p style="margin: 0; color: #065f46; font-size: 16px;">
                        Un cliente ha confirmado su cita en el sistema.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 30px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                        <tr>
                          <td style="padding: 10px; background-color: #f9fafb; font-weight: bold;">Cliente</td>
                          <td style="padding: 10px; background-color: #f9fafb;">${data.customerName}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px; font-weight: bold;">Email</td>
                          <td style="padding: 10px;">${data.email}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px; background-color: #f9fafb; font-weight: bold;">Teléfono</td>
                          <td style="padding: 10px; background-color: #f9fafb;">${data.phone}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px; font-weight: bold;">Fecha</td>
                          <td style="padding: 10px;">${data.date}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px; background-color: #f9fafb; font-weight: bold; vertical-align: top;">Problema</td>
                          <td style="padding: 10px; background-color: #f9fafb;">${data.description}</td>
                        </tr>
                      </table>
                      <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
                        Puedes gestionar esta cita desde el panel de administración.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };
}
