import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Bus, Users, ArrowLeft } from "lucide-react";
import { getEventDetail } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { BuyBox } from "@/components/booking/buy-box";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string };
  searchParams: { rrpp?: string; salida?: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = await getEventDetail(params.slug);
  if (!event) return { title: "Evento no encontrado" };
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return {
    title: event.title,
    description:
      event.description ??
      `Bus a ${event.title} en ${event.municipality}, ${event.province}. Compra tu plaza con Condado +vacas.`,
    alternates: { canonical: `${appUrl}/evento/${event.slug}` },
    openGraph: {
      title: event.title,
      description: event.description ?? undefined,
      type: "website",
      // OG dinámica generada en opengraph-image.tsx
    },
    twitter: { card: "summary_large_image", title: event.title },
  };
}

function formatDateLong(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function EventoPage({ params, searchParams }: Props) {
  const event = await getEventDetail(params.slug);
  if (!event) notFound();

  const user = await getCurrentUser();

  // Resolver enlace ?rrpp=&salida= → trip concreto
  const rrpp = searchParams.rrpp?.toLowerCase();
  const salida = searchParams.salida?.toLowerCase();
  const selectedTrip =
    rrpp && salida
      ? event.trips.find((t) => t.rrppCode === rrpp && t.originCity === salida) ??
        null
      : null;

  const loginNextUrl = `/login?next=${encodeURIComponent(
    `/evento/${event.slug}${rrpp && salida ? `?rrpp=${rrpp}&salida=${salida}` : ""}`
  )}`;

  return (
    <main className="min-h-screen">
      {/* Structured data JSON-LD (schema.org/Event) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Event",
            name: event.title,
            description: event.description ?? undefined,
            startDate: event.startDate,
            endDate: event.endDate ?? undefined,
            image: event.imageUrl ?? undefined,
            location: {
              "@type": "Place",
              name: event.location,
              address: {
                "@type": "PostalAddress",
                addressLocality: event.municipality,
                addressRegion: event.province,
                addressCountry: "ES",
              },
            },
            ...(event.pricePerSeat && {
              offers: {
                "@type": "Offer",
                price: event.pricePerSeat,
                priceCurrency: "EUR",
                availability: "https://schema.org/InStock",
              },
            }),
          }),
        }}
      />
      {/* Hero póster */}
      <section className="relative flex min-h-[60vh] items-end">
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-party/40 via-slate-800 to-forest/30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-black/20" />

        <div className="relative mx-auto w-full max-w-6xl px-4 pb-10 pt-32">
          <Link
            href="/eventos"
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white"
          >
            <ArrowLeft className="size-4" /> Todos los eventos
          </Link>
          <Badge className="mb-3 bg-black/50 text-white backdrop-blur-sm">
            {event.category}
          </Badge>
          <h1 className="max-w-3xl font-display text-5xl leading-[0.95] tracking-wide sm:text-6xl md:text-7xl">
            {event.title.toUpperCase()}
          </h1>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/85">
            <p className="flex items-center gap-2">
              <CalendarDays className="size-4 text-brand" />
              {formatDateLong(event.startDate)}
              {event.endDate && ` — ${formatDateLong(event.endDate)}`}
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="size-4 text-forest" />
              {event.location} · {event.municipality} ({event.province})
            </p>
          </div>
        </div>
      </section>

      {/* Contenido */}
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[1fr_380px]">
        {/* Descripción */}
        <div>
          <h2 className="font-display text-2xl tracking-wide text-muted-foreground">
            SOBRE EL EVENTO
          </h2>
          <p className="mt-4 leading-relaxed text-foreground/90">
            {event.description ?? "Más información próximamente."}
          </p>

          {/* Otros buses habilitados */}
          {event.trips.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-2xl tracking-wide text-muted-foreground">
                BUSES HABILITADOS ({event.trips.length})
              </h2>
              <div className="mt-4 space-y-3">
                {event.trips.map((trip) => {
                  const isSelected = selectedTrip?.tripId === trip.tripId;
                  const pct = Math.min(
                    100,
                    Math.round((trip.soldSeats / event.minSeats) * 100)
                  );
                  return (
                    <Link
                      key={trip.tripId}
                      href={`/evento/${event.slug}?rrpp=${trip.rrppCode}&salida=${trip.originCity}`}
                      className={`glass block rounded-xl p-4 transition-colors ${
                        isSelected ? "ring-2 ring-brand" : "hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Bus className="size-5 text-party" />
                          <div>
                            <p className="font-semibold">
                              Sale de {trip.originCity}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              por @{trip.rrppCode}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-brand">
                            {trip.soldSeats}/{event.minSeats}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            para confirmar
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-forest to-brand transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Caja de compra */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="glass rounded-2xl p-6">
            {selectedTrip ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Bus desde
                    </p>
                    <p className="font-display text-2xl tracking-wide">
                      {selectedTrip.originCity.toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      organizado por @{selectedTrip.rrppCode}
                    </p>
                  </div>
                  {event.pricePerSeat && (
                    <p className="font-display text-4xl text-brand">
                      {event.pricePerSeat.toFixed(0)}€
                    </p>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-lg bg-white/5 p-3 text-sm">
                  <Users className="size-4 text-forest" />
                  <span>
                    <strong>{selectedTrip.soldSeats}</strong> de{" "}
                    <strong>{event.minSeats}</strong> plazas para confirmar el
                    bus
                  </span>
                </div>

                <Separator className="my-5" />

                {event.pricePerSeat ? (
                  <BuyBox
                    tripId={selectedTrip.tripId}
                    pricePerSeat={event.pricePerSeat}
                    seatsLeft={selectedTrip.capacity - selectedTrip.soldSeats}
                    isAuthenticated={!!user}
                    loginNextUrl={loginNextUrl}
                  />
                ) : (
                  <p className="text-center text-sm text-muted-foreground">
                    Precio por confirmar. Vuelve pronto.
                  </p>
                )}
              </>
            ) : (
              <div className="text-center">
                <Bus className="mx-auto size-10 text-party" />
                <p className="mt-3 font-display text-xl tracking-wide">
                  ELIGE TU BUS
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {event.trips.length > 0
                    ? "Selecciona desde qué ciudad quieres salir en la lista de buses habilitados."
                    : "Este evento aún no tiene buses habilitados. ¿Eres RRPP? Habilita el primero."}
                </p>
                {event.trips.length === 0 && (
                  <Link
                    href="/rrpp/solicitar"
                    className="mt-4 inline-block text-sm font-semibold text-brand hover:underline"
                  >
                    Quiero ser RRPP →
                  </Link>
                )}
              </div>
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}
