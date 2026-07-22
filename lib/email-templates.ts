// Plantillas HTML de emails (inline styles, dark theme marca Condado)

const BRAND = "#FF6B35";
const BG = "#0F172A";

function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:24px;">
    <div style="background:${BG};border-radius:16px;overflow:hidden;">
      <div style="padding:24px 32px;border-bottom:1px solid rgba(255,255,255,0.1);">
        <span style="font-size:22px;font-weight:900;letter-spacing:1px;color:#fff;">
          CONDADO <span style="color:${BRAND};">+VACAS</span>
        </span>
      </div>
      <div style="padding:32px;">
        <h1 style="margin:0 0 16px;font-size:24px;color:#fff;">${title}</h1>
        ${body}
      </div>
    </div>
    <p style="text-align:center;font-size:12px;color:#64748b;margin-top:16px;">
      Condado +vacas · De la festa a tu casa, sin volante.
    </p>
  </div>
</body>
</html>`;
}

const p = (text: string) =>
  `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#cbd5e1;">${text}</p>`;

const infoBox = (rows: [string, string][]) =>
  `<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;margin:16px 0;">
    ${rows
      .map(
        ([k, v]) =>
          `<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:14px;">
            <span style="color:#94a3b8;">${k}</span>
            <span style="color:#fff;font-weight:600;">${v}</span>
          </div>`
      )
      .join("")}
  </div>`;

export function bookingConfirmedHtml(data: {
  name: string;
  eventTitle: string;
  eventDate: string;
  originCity: string;
  seats: number;
  total: string;
  bookingUrl: string;
}): string {
  return layout(
    "¡Reserva confirmada! 🎉",
    p(`Hola <strong>${data.name}</strong>, tu plaza está reservada.`) +
      infoBox([
        ["Evento", data.eventTitle],
        ["Fecha", data.eventDate],
        ["Salida", data.originCity],
        ["Plazas", String(data.seats)],
        ["Total pagado", data.total],
      ]) +
      p(
        `<strong style="color:${BRAND};">¿Y ahora qué?</strong> Cuando el bus alcance el mínimo de plazas, lo confirmaremos y te enviaremos otro email con el punto de encuentro exacto, la hora y los datos del conductor.`
      ) +
      p(
        `Si finalmente el bus no se confirma, te devolvemos el <strong>100% automáticamente</strong>.`
      ) +
      `<a href="${data.bookingUrl}" style="display:inline-block;background:${BRAND};color:#fff;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:10px;margin-top:8px;">Ver mi reserva y QR</a>`
  );
}

export function busConfirmedHtml(data: {
  name: string;
  eventTitle: string;
  meetingPoint: string;
  departureTime: string;
  driverName: string;
  driverPhone: string;
  bookingUrl: string;
}): string {
  return layout(
    "¡Tu bus está confirmado! 🚌",
    p(`Hola <strong>${data.name}</strong>, ¡se lió! (en el buen sentido). El bus está confirmado y ya tienes todos los detalles:`) +
      infoBox([
        ["Evento", data.eventTitle],
        ["📍 Punto de encuentro", data.meetingPoint],
        ["🕐 Hora de salida", data.departureTime],
        ["🧑‍✈️ Conductor", data.driverName],
        ["📞 Teléfono", data.driverPhone],
      ]) +
      p(
        `Preséntate <strong>15 minutos antes</strong> con tu QR de embarque (el conductor lo comprobará al subir).`
      ) +
      `<a href="${data.bookingUrl}" style="display:inline-block;background:${BRAND};color:#fff;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:10px;margin-top:8px;">Ver mi QR de embarque</a>`
  );
}

export function refundIssuedHtml(data: {
  name: string;
  eventTitle: string;
  total: string;
}): string {
  return layout(
    "Reembolso procesado 💸",
    p(`Hola <strong>${data.name}</strong>, el bus a <strong>${data.eventTitle}</strong> no alcanzó el mínimo de plazas necesario y no se confirmará.`) +
      infoBox([["Importe devuelto", data.total]]) +
      p(
        `El reembolso ya está procesado y lo verás en tu cuenta en <strong>5-10 días laborables</strong>, según tu banco.`
      ) +
      p(`¡A la próxima va la vencida! 🎉`)
  );
}

export function busFullRrppHtml(data: {
  name: string;
  eventTitle: string;
  originCity: string;
  busNumber: number;
}): string {
  return layout(
    "¡Bus lleno! 🚀",
    p(`Hola <strong>${data.name}</strong>, tu bus #${data.busNumber} a <strong>${data.eventTitle}</strong> desde ${data.originCity} está <strong style="color:${BRAND};">COMPLETO</strong>.`) +
      p(
        `Hemos abierto automáticamente el <strong>bus #${data.busNumber + 1}</strong> con el mismo enlace, así que sigue compartiendo. Vas que chutas 🔥`
      )
  );
}

export function driverPassengerListHtml(data: {
  driverName: string;
  eventTitle: string;
  meetingPoint: string;
  departureTime: string;
  passengers: { name: string; seats: number; qrToken: string }[];
  totalSeats: number;
}): string {
  const rows = data.passengers
    .map(
      (pax, i) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,0.1);color:#fff;">${i + 1}</td>
          <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,0.1);color:#fff;">${pax.name}</td>
          <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,0.1);color:#fff;text-align:center;">${pax.seats}</td>
          <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,0.1);color:#94a3b8;font-family:monospace;font-size:11px;">${pax.qrToken.slice(-12)}</td>
        </tr>`
    )
    .join("");

  return layout(
    `Lista de pasajeros — ${data.eventTitle}`,
    p(`Hola <strong>${data.driverName}</strong>, esta es la lista de pasajeros de tu bus:`) +
      infoBox([
        ["📍 Punto de salida", data.meetingPoint],
        ["🕐 Hora", data.departureTime],
        ["👥 Total plazas", String(data.totalSeats)],
      ]) +
      `<table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead>
          <tr style="color:#94a3b8;text-align:left;">
            <th style="padding:8px;">#</th>
            <th style="padding:8px;">Pasajero</th>
            <th style="padding:8px;text-align:center;">Plazas</th>
            <th style="padding:8px;">Token QR</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>` +
      p(`Al subir, contrasta el QR de cada pasajero con esta lista (nombre + plazas).`)
  );
}
