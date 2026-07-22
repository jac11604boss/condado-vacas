"use client";

import { useMemo, useState } from "react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { CalendarEvent } from "@/hooks/use-events";
import { MapPin } from "lucide-react";

// Vista mapa: pins geolocalizados en Galicia (solo eventos con coords).
export function CalendarMap({ events }: { events: CalendarEvent[] }) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const [selected, setSelected] = useState<CalendarEvent | null>(null);

  const located = useMemo(
    () => events.filter((e) => e.lat != null && e.lng != null),
    [events]
  );

  if (!token) {
    return (
      <div className="glass rounded-xl p-12 text-center">
        <MapPin className="mx-auto size-10 text-muted-foreground" />
        <p className="mt-4 font-display text-xl tracking-wide">MAPA NO DISPONIBLE</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Configura NEXT_PUBLIC_MAPBOX_TOKEN en .env.local para activar la vista
          de mapa.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10">
      <Map
        mapboxAccessToken={token}
        initialViewState={{ longitude: -8.2, latitude: 42.75, zoom: 7.2 }}
        style={{ width: "100%", height: 560 }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
      >
        <NavigationControl position="top-right" />
        {located.map((e) => (
          <Marker
            key={e.id}
            longitude={e.lng!}
            latitude={e.lat!}
            anchor="bottom"
            onClick={(ev) => {
              ev.originalEvent.stopPropagation();
              setSelected(e);
            }}
          >
            <div
              className={`size-4 cursor-pointer rounded-full border-2 border-white shadow-lg ${
                e.enabledByMe ? "bg-forest" : "bg-brand"
              }`}
            />
          </Marker>
        ))}

        {selected && (
          <Popup
            longitude={selected.lng!}
            latitude={selected.lat!}
            anchor="top"
            onClose={() => setSelected(null)}
            closeButton
          >
            <div className="max-w-56 p-1">
              <p className="font-semibold text-slate-900">{selected.title}</p>
              <p className="mt-1 text-xs text-slate-600">
                {format(new Date(selected.startDate), "d MMM yyyy", { locale: es })} ·{" "}
                {selected.municipality}
              </p>
              <a
                href={`/panel/habilitar/${selected.id}`}
                className="mt-2 inline-block rounded bg-orange-500 px-2 py-1 text-xs font-semibold text-white"
              >
                Habilitar bus
              </a>
            </div>
          </Popup>
        )}
      </Map>

      <p className="bg-white/5 px-4 py-2 text-xs text-muted-foreground">
        {located.length} de {events.length} eventos geolocalizados ·{" "}
        <span className="text-forest">●</span> habilitados por ti ·{" "}
        <span className="text-brand">●</span> disponibles
      </p>
    </div>
  );
}
