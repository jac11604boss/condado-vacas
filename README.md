# 🚌 CONDADO +VACAS

**El "Uber para eventos en autobús" de Galicia.** Los RRPP habilitan buses a fiestas y eventos, comparten su enlace y ganan comisión por cada plaza. Los clientes compran su plaza online, reciben su QR y suben al bus sin preocuparse del coche.

![Stack](https://img.shields.io/badge/Next.js_14-App_Router-black) ![TS](https://img.shields.io/badge/TypeScript-5-blue) ![DB](https://img.shields.io/badge/Supabase-Postgres-green) ![Payments](https://img.shields.io/badge/Stripe-Checkout+Connect-purple)

---

## ✨ Funcionalidades (MVP)

- **Visitante**: landing, catálogo de eventos con bus (estilo póster), página de evento con SEO/OG/JSON-LD
- **Cliente**: registro (email/Google), compra con Stripe Checkout, QR de embarque, mis reservas
- **RRPP**: solicitud + aprobación, calendario completo (mes/lista/mapa), habilitar bus (solo elige salida), enlace personalizado `?rrpp=&salida=`, ventas en tiempo real, ganancias, eventos propios
- **Admin**: dashboard con KPIs y gráficos, gestión de eventos (precio/comisión/mínimo), confirmar bus (emails a pasajeros + lista al conductor), reembolsos masivos, aprobación de RRPP, pagos/transfers, check-in QR, scraping de la Agenda Cultural

## 🧱 Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Estilos | Tailwind CSS v4 + shadcn/ui (Base UI) + Framer Motion |
| DB/Auth/Storage | Supabase (Postgres + Auth) + Prisma 7 (driver adapter) |
| Pagos | Stripe Checkout + Stripe Connect (payouts RRPP) |
| Emails | Resend (HTML inline templates) |
| Mapas | Mapbox GL (vista mapa del calendario RRPP) |
| Scraping | Cheerio (one-off, re-ejecutable) |
| Deploy | Vercel |

## 🚀 Instalación local

```bash
# 1. Clonar e instalar
npm install

# 2. Configurar entorno
cp .env.example .env.local   # rellenar Supabase, Stripe, etc.
cp .env.example .env         # solo DATABASE_URL y DIRECT_URL (Prisma CLI)

# 3. Base de datos
npm run db:migrate           # crea las tablas
npm run db:seed              # datos demo (admin, RRPP, 15 eventos gallegos)
npx tsx scripts/scrape-agenda.ts   # (opcional) 250+ eventos reales de turismo.gal

# 4. Arrancar
npm run dev                  # http://localhost:3000
```

## 🔑 Variables de entorno

Ver [`.env.example`](./.env.example). Imprescindibles para el MVP:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL` (pooler 6543) / `DIRECT_URL` (pooler 5432 — el host directo de Supabase es IPv6-only)
- `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (+ `STRIPE_WEBHOOK_SECRET` con `stripe listen`)
- `QR_SECRET` (firma HMAC de los QR)
- Opcionales: `RESEND_API_KEY` (sin ella los emails se loguean en consola), `NEXT_PUBLIC_MAPBOX_TOKEN` (vista mapa), Twilio (Fase 11)

## 📜 Comandos

```bash
npm run dev          # desarrollo
npm run build        # build producción
npm run lint         # eslint
npm run db:generate  # regenerar Prisma Client
npm run db:migrate   # prisma migrate dev
npm run db:seed      # seed datos demo
npm run db:studio    # Prisma Studio
ANALYZE=true npm run build   # análisis del bundle
npx tsx scripts/scrape-agenda.ts [--dry]  # scraping Agenda Cultural
npx tsx scripts/verify-db.ts              # comprobar la DB
npx tsx scripts/create-admin-test.ts      # crear admin real de pruebas
```

## 🗂️ Estructura

```
app/
├── (public)/          # landing, eventos, evento/[slug], login, registro, rrpp/*
├── (cliente)/mi-cuenta/   # reservas + QR
├── (rrpp)/panel/      # dashboard, calendario, habilitar, mis-viajes, ganancias
├── (admin)/admin/     # dashboard, eventos, viajes, rrpp, pagos, checkin
└── api/               # REST: events, trips, bookings, checkin, admin/*, webhooks/*
components/            # ui (shadcn), events, trips, booking, admin, layout, landing
lib/                   # prisma, supabase, stripe, resend, qr, bookings, commissions, validators
prisma/                # schema, migraciones, seed
scripts/               # scrape-agenda, verify-db, create-admin-test
```

## 👤 Cuentas de prueba

| Rol | Email | Password | Notas |
|---|---|---|---|
| Admin | `admin.test@demo.gal` | `TestPassword123!` | creada con `scripts/create-admin-test.ts` |
| RRPP aprobada | `rrpp.test@demo.gal` | `TestPassword123!` | @xiana-pineiro |
| RRPP pendiente | `brais.vidal@demo.gal` | — | solo DB (sin Auth), para probar aprobación |
| Cliente | `cliente.test@demo.gal` | `TestPassword123!` | con reservas de prueba |

Tarjeta Stripe test: `4242 4242 4242 4242` · cualquier fecha futura · cualquier CVC.

## 🧪 Testing E2E

Ver [`docs/TESTING.md`](./docs/TESTING.md) — los 4 flujos completos documentados paso a paso.

## ☁️ Deploy en Vercel

1. **Importar repo** en Vercel (framework: Next.js, auto-detectado)
2. **Build command** ya configurado en `vercel.json`: `npx prisma generate && next build`
3. **Variables de entorno**: copiar todas las de `.env.example` (Production + Preview):
   - `DATABASE_URL` → usar el **pooler** (6543), imprescindible en serverless
   - `NEXT_PUBLIC_APP_URL` → `https://tu-dominio.gal`
4. **Supabase** → Authentication → URL Configuration: Site URL = dominio prod + redirect `https://tu-dominio.gal/api/auth/callback`
5. **Stripe** → Developers → Webhooks: endpoint `https://tu-dominio.gal/api/webhooks/stripe` (eventos: `checkout.session.completed`, `charge.refunded`) → copiar secret a `STRIPE_WEBHOOK_SECRET`
6. **Preview deployments**: cada PR genera una preview automática

## 🔮 Fase 11 (post-MVP)

- Stripe Connect Express onboarding automático para RRPP
- Payouts automáticos post-evento (cron)
- Escáner QR con cámara (check-in) + PWA
- Scraping programado (Vercel Cron)
- SMS con Twilio (`ENABLE_SMS`)
- Multi-idioma (gl/es), analytics avanzados, programa de referidos

## 🤝 Contribuir

1. Lee [`AGENTS.md`](./AGENTS.md) — convenciones del proyecto (Tailwind v4, Base UI sin `asChild`, dark-first)
2. Rama por feature → PR contra `main`
3. `npm run build` debe pasar antes de merge
