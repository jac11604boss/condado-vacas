import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchAgendaEvents, syncAgendaEventsToDb } from "@/lib/scraper";

// Scraping completo: ~15 páginas en paralelo + sync por lote (cabe en 60s)
export const maxDuration = 60;

// POST /api/admin/scrape — ejecuta el scraper de la Agenda Cultural
// (re-ejecutable; upsert por nid: crea nuevos y actualiza existentes)
export async function POST() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const events = await fetchAgendaEvents();
    const result = await syncAgendaEventsToDb(prisma, events);

    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error ejecutando scraper";
    console.error("Error en /api/admin/scrape:", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
