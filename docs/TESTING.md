# 🧪 Testing E2E — Flujos completos

Tarjeta Stripe test: **4242 4242 4242 4242** · fecha futura · CVC cualquiera.
Para recibir el webhook en local: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
(la página `/reservar/confirmacion` marca el pago como fallback si el webhook no llega).

---

## A. RRPP: registro → habilitar → compartir

1. `/registro` → tab **"Soy RRPP"** → completar (instagram obligatorio)
2. Redirige a `/rrpp/pendiente` — estado PENDING
3. Como admin (`/admin/rrpp`) → **Aprobar**
4. Login como RRPP → `/panel/calendario` → elegir evento (vista mes/lista/mapa, filtros por provincia/tipo)
5. **"Habilitar bus"** → elegir ciudad de salida (ej: `Mondariz`)
6. Obtener enlace: `/evento/[slug]?rrpp=CODE&salida=CIUDAD` → compartir (botones WhatsApp/Telegram/copiar)
7. Ver ventas en tiempo real en `/panel/mis-viajes` (polling 15s) y ganancias en `/panel/ganancias`

✅ Verificación: trip creado con Bus #1; enlace público muestra el bus seleccionado.

## B. Cliente: compra → pago → QR

1. Abrir el enlace del RRPP → página del evento con el bus seleccionado
2. **"Comprar plaza"** → si no hay sesión, login/registro (vuelve al enlace)
3. Selector de plazas (1-10) → **Stripe Checkout** → pagar con 4242…
4. Redirect a `/reservar/confirmacion` → "¡Plaza reservada!"
5. Email: *"Reserva confirmada"* (o log en consola sin RESEND_API_KEY)
6. `/mi-cuenta/reservas/[id]` → **QR de embarque** + estado "Pagada · pendiente de confirmar bus"

✅ Verificación: booking PAID; contador del bus sube; si se llena → Bus FULL + se abre el siguiente automáticamente + email "¡Bus lleno!" al RRPP.

## C. Admin: confirmar bus → notificaciones → check-in

1. `/admin/viajes` → el viaje muestra progreso ≥ mínimo → **Gestionar**
2. **"Confirmar bus"** → rellenar: punto de encuentro, horas, empresa, matrícula, conductor, email conductor
3. Resultado: Bus CONFIRMED + Trip CONFIRMED
4. Emails: cada pasajero recibe punto/hora/conductor · el conductor recibe la **lista de pasajeros**
5. Cliente ve en su reserva: punto de encuentro, hora, conductor + QR
6. Día del evento: `/admin/checkin` → pegar token QR → **"Validar y embarcar"** → CHECKED_IN
7. Segundo intento con el mismo QR → error "Este pasajero YA embarcó"

✅ Verificación: solo se puede confirmar si plazas ≥ mínimo (si no, botón deshabilitado + API 409).

## D. Admin: reembolso masivo

1. `/admin/viajes/[id]` → zona de riesgo → **"Reembolso masivo"**
2. Modal muestra nº pasajeros y total → confirmar
3. Stripe refund por cada booking PAID → bookings REFUNDED
4. Email de reembolso a cada pasajero ("devolvemos el 100%")
5. Viaje → CANCELLED

✅ Verificación: `charge.refunded` también actualiza el booking vía webhook.
