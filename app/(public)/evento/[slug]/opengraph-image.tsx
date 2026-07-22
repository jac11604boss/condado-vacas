import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// OG image dinámica por evento: póster con título, fecha y ubicación.
export default async function EventOgImage({
  params,
}: {
  params: { slug: string };
}) {
  const event = await prisma.event.findUnique({
    where: { slug: params.slug },
    select: {
      title: true,
      municipality: true,
      province: true,
      startDate: true,
      imageUrl: true,
    },
  });

  const date = event?.startDate.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          background: "#0F172A",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {event?.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.imageUrl}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.45,
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, #0F172A 15%, rgba(15,23,42,0.3) 70%)",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", padding: 64, position: "relative" }}>
          <span style={{ color: "#FF6B35", fontSize: 28, fontWeight: 700, letterSpacing: 2 }}>
            CONDADO +VACAS · BUS AL EVENTO
          </span>
          <span
            style={{
              color: "white",
              fontSize: event && event.title.length > 40 ? 52 : 68,
              fontWeight: 900,
              lineHeight: 1.05,
              marginTop: 12,
              textTransform: "uppercase",
            }}
          >
            {event?.title ?? "Evento"}
          </span>
          <span style={{ color: "#94A3B8", fontSize: 30, marginTop: 16 }}>
            📅 {date} · 📍 {event?.municipality}, {event?.province}
          </span>
        </div>
      </div>
    ),
    size
  );
}
