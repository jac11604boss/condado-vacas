# CONDADO +VACAS — Guía para agentes

Plataforma "Uber para eventos en autobús" en Galicia. MVP: Next.js 14 (App Router) + TypeScript + Tailwind v4 + shadcn/ui + Prisma + Supabase + Stripe.

## Comandos

```bash
npm run dev          # desarrollo
npm run build        # build de producción (verificación obligatoria tras cambios)
npm run lint         # eslint
npm run db:generate  # regenerar Prisma Client
npm run db:migrate   # prisma migrate dev
npm run db:seed      # seed datos demo
npm run db:studio    # Prisma Studio
```

## Estructura (sin directorio src/)

- `app/` — rutas App Router. Grupos por rol: `(public)`, `(cliente)`, `(rrpp)`, `(admin)`. APIs en `app/api/`.
- `components/ui/` — shadcn/ui (estilo base-nova, primitivos **Base UI**, NO Radix).
- `components/` — componentes de dominio por carpeta (events, trips, booking, admin, landing).
- `lib/` — prisma, supabase, stripe, resend, qr, validators (Zod), utils.
- `hooks/`, `stores/`, `types/` — React Query hooks, Zustand stores, tipos.
- `prisma/` — schema, migraciones, seed.
- `scripts/` — scraping one-off (Cheerio; Playwright solo si falla).
- `emails/` — plantillas React Email.

## Convenciones importantes

- **Tailwind v4** (CSS-first, SIN `tailwind.config.ts`). Tema en `app/globals.css` (`@theme inline`).
- **shadcn CLI moderno** (`npx shadcn@latest add <componente>`). Los componentes usan **Base UI**:
  - `Button` NO tiene `asChild`. Para enlaces con estilo de botón usa:
    `import { buttonVariants } from "@/components/ui/button"` + `<Link className={cn(buttonVariants({...}))}>`.
- **Dark mode por defecto**: `<html className="dark">`. Paleta:
  - `brand` #FF6B35 (CTAs) · `forest` #2E8B57 (Galicia) · `party` #9B59B6 (fiesta) · fondo #0F172A.
  - Utilidad `.glass` para cards glassmorphism.
- **Fuentes** (next/font, variables CSS): Inter `--font-inter` (body, `font-sans`), Bebas Neue `--font-bebas` (títulos, `font-display`), Pacifico `--font-pacifico` (acentos, `font-accent`).
- **Idioma de UI: español**. Comentarios y copy en español.
- **Enlace RRPP**: `/evento/[slug]?rrpp=CODE&salida=CIUDAD` (parámetros separados).
- **Zod** valida todos los bodies de API. **Server Components** para páginas públicas, React Query para datos vivos, Zustand solo para estado UI.
- **Zod v4 + RHF**: usar `standardSchemaResolver` de `@hookform/resolvers/standard-schema` (NO `zodResolver`, incompatible con Zod v4 — fallaba todo con "Invalid input").
- Variables de entorno documentadas en `.env.example` — mantenerlo actualizado al añadir integraciones.

## Prisma 7 (importante)

- Cliente generado en `lib/generated/prisma` (gitignored). Importar con `@/lib/generated/prisma/client`.
- Runtime con **driver adapter**: `lib/prisma.ts` usa `PrismaPg` + `DATABASE_URL` (pooled).
- CLI (migraciones/seed) lee `DIRECT_URL` (conexión directa) desde `prisma.config.ts` → `.env`.
- Singleton en `lib/prisma.ts` — usar siempre `import { prisma } from "@/lib/prisma"`.

## Plan de implementación

Ver fases en el plan aprobado. Estado actual: **MVP DESPLEGADO EN PRODUCCIÓN** 🚀
- Repo: https://github.com/jac11604boss/condado-vacas
- Prod: https://condado-vacas.vercel.app (verificado: páginas, DB, OG dinámica 200 image/png, APIs, sitemap)
- Deploy: `npx vercel --prod` (CLI con token) o push a main si se conecta la integración GitHub.
- Env vars prod: 15 configuradas vía `vercel env add` (sensitive).
- `lib/stripe.ts` es LAZY (`getStripe()`) — necesario para el build de Vercel.
- Pendiente manual: Supabase Site URL/redirects + Stripe webhook endpoint → `STRIPE_WEBHOOK_SECRET`.

**Nota OG image:** la OG dinámica falla en dev Windows por el `+` en la ruta del proyecto (bug conocido de @vercel/og al cargar la fuente: `ERR_INVALID_URL`). En Vercel (Linux) funciona — verificar tras deploy. Si se quiere probar en local, copiar el proyecto a una ruta sin caracteres especiales.

**Nota emails:** sin `RESEND_API_KEY` los emails se loguean en consola (`📧 [email desactivado]`) en vez de fallar. **Webhook local:** usar `stripe listen --forward-to localhost:3000/api/webhooks/stripe` y poner el `whsec_` en `STRIPE_WEBHOOK_SECRET` (sin secret, parsea sin verificar — solo dev).

**Nota Auth:** el check de ROL no va en el middleware (edge, sin Prisma) sino en `app/(rrpp)/panel/layout.tsx` y `app/(admin)/admin/layout.tsx` vía `getCurrentUser()` de `lib/auth.ts`. El middleware solo exige sesión y refresca cookies.

**Nota conexión DB:** el host directo `db.*.supabase.co` es IPv6-only → usar siempre el **pooler** `aws-0-eu-west-1.pooler.supabase.com` (6543 transaction = DATABASE_URL, 5432 session = DIRECT_URL).
