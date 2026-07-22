import { getEnabledTrips } from "@/lib/data";
import { EventGrid } from "@/components/events/event-grid";

export const metadata = { title: "Eventos con bus" };

// Datos en tiempo real: no prerenderizar en build
export const dynamic = "force-dynamic";

export default async function EventosPage() {
  const trips = await getEnabledTrips();

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-16">
      <h1 className="font-display text-4xl tracking-wide sm:text-5xl">
        EVENTOS CON <span className="text-brand">BUS</span>
      </h1>
      <p className="mt-2 text-muted-foreground">
        Compra tu plaza, sube al bus y olvídate del coche.
      </p>

      {trips.length === 0 ? (
        <div className="glass mt-16 rounded-2xl p-16 text-center">
          <p className="font-display text-3xl tracking-wide">
            AÚN NO HAY BUSES HABILITADOS
          </p>
          <p className="mt-2 text-muted-foreground">
            Los RRPP están calentando motores. Vuelve pronto 🚌
          </p>
        </div>
      ) : (
        <div className="mt-10">
          <EventGrid trips={trips} />
        </div>
      )}
    </main>
  );
}
