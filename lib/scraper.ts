// Lógica del scraping de la Agenda Cultural de Turismo de Galicia.
// Compartida entre el CLI (scripts/scrape-agenda.ts) y la API admin
// (/api/admin/scrape) — sin child_process, compatible con serverless.

import * as cheerio from "cheerio";
import type { Prisma, PrismaClient } from "@/lib/generated/prisma/client";

const BASE = "https://www.turismo.gal";
const LIST_URL = `${BASE}/axenda-cultural?langId=gl_ES`;
const AJAX_URL = (page: number) =>
  `${BASE}/axenda-cultural/-/ajax?langId=gl_ES&ajax=true&filtro=&numPagina=${page}`;
const MAX_PAGES = 15;

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
};

const MESES: Record<string, number> = {
  xaneiro: 0, febreiro: 1, marzo: 2, abril: 3, maio: 4, xuño: 5,
  xullo: 6, agosto: 7, setembro: 8, outubro: 9, novembro: 10, decembro: 11,
  xan: 0, feb: 1, mar: 2, abr: 3, mai: 4, xuñ: 5,
  xul: 6, ago: 7, set: 8, out: 9, nov: 10, dec: 11,
};

function mapCategoria(ribbon: string): string {
  const r = ribbon.toLowerCase();
  if (r.includes("festa") || r.includes("romería") || r.includes("entroido")) return "fiesta-tradicional";
  if (r.includes("música") || r.includes("concerto") || r.includes("festival")) return "concierto";
  if (r.includes("deporte")) return "deporte";
  if (r.includes("feira")) return "feria";
  if (r.includes("espectáculo") || r.includes("teatro")) return "espectaculo";
  if (r.includes("exposición") || r.includes("mostra")) return "exposicion";
  return "fiesta-tradicional";
}

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function parseDates(raw: string, now: Date): { start: Date; end: Date | null } | null {
  const cleaned = raw.replace(/\s+/g, " ").replace(/de /g, "").trim();
  const parts = cleaned.split("/").map((p) => p.trim()).filter(Boolean);
  const re = /^(\d{1,2})\s+([a-zñáéíóú]+)\.?(\d{4})?$/i;
  const TWO_DAYS = 2 * 86400000;

  const parse = (s: string): { date: Date; hasYear: boolean } | null => {
    const m = s.match(re);
    if (!m) return null;
    const day = parseInt(m[1], 10);
    const month = MESES[m[2].toLowerCase().replace(/\.$/, "")];
    if (month === undefined) return null;
    const year = m[3] ? parseInt(m[3], 10) : now.getFullYear();
    return { date: new Date(Date.UTC(year, month, day, 10, 0, 0)), hasYear: !!m[3] };
  };

  const rollYear = (d: Date) =>
    new Date(Date.UTC(d.getUTCFullYear() + 1, d.getUTCMonth(), d.getUTCDate(), 10, 0, 0));

  const p0 = parse(parts[0]);
  if (!p0) return null;
  const p1 = parts[1] ? parse(parts[1]) : null;

  let start = p0.date;
  let end = p1?.date ?? null;

  if (!p0.hasYear) {
    if (end && end.getTime() >= now.getTime() - TWO_DAYS) {
      // en curso
    } else if (end && start.getTime() < now.getTime() - TWO_DAYS) {
      start = rollYear(start);
      end = rollYear(end);
    } else if (!end && start.getTime() < now.getTime() - TWO_DAYS) {
      start = rollYear(start);
    }
  }

  return { start, end };
}

export interface ScrapedEvent {
  nid: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  category: string;
  startDate: Date;
  endDate: Date | null;
  municipality: string;
  province: string;
  sourceUrl: string;
  isActive: boolean;
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
  return res.text();
}

function extractProvinceMap(html: string): Map<string, string> {
  const map = new Map<string, string>();
  const match = html.match(/var data_municipios=(\{[\s\S]*?\});/);
  if (!match) return map;
  try {
    const data = new Function(`return ${match[1]}`)() as Record<string, string[]>;
    for (const [province, municipalities] of Object.entries(data)) {
      for (const m of municipalities) map.set(m.toLowerCase(), province);
    }
  } catch {
    // mapa parcial
  }
  return map;
}

function parseCards(html: string, provinceMap: Map<string, string>, now: Date): ScrapedEvent[] {
  const $ = cheerio.load(html);
  const events: ScrapedEvent[] = [];

  $(".list-item").each((_, el) => {
    const $el = $(el);
    const $link = $el.find(".title a").first();
    const href = $link.attr("href") ?? "";
    const nid = href.match(/nid=(\d+)/)?.[1];
    const title = $link.text().trim();
    const dateText = $el.find(".date-txt .txt").first().text();
    const municipality = $el.find(".place").first().text().trim();
    const ribbon = $el.find(".ribbon").first().text().trim();
    const description = $el.find(".description:not(.place)").first().text().trim() || null;
    const imageUrl =
      $el.find("[data-original]").attr("data-original") ??
      $el.find("[data-src]").attr("data-src") ??
      null;

    if (!nid || !title || !municipality) return;
    const dates = parseDates(dateText, now);
    if (!dates) return;

    const province = provinceMap.get(municipality.toLowerCase()) ?? "";
    const endOfEvent = dates.end ?? dates.start;

    events.push({
      nid,
      title: title.replace(/\s+/g, " "),
      description: description?.replace(/\s+/g, " ") ?? null,
      imageUrl,
      category: mapCategoria(ribbon),
      startDate: dates.start,
      endDate: dates.end,
      municipality,
      province,
      sourceUrl: `${BASE}${href}`.replace(/&amp;/g, "&"),
      isActive: endOfEvent.getTime() >= now.getTime() - 86400000,
    });
  });

  return events;
}

/** Descarga y parsea todos los eventos (páginas en paralelo) */
export async function fetchAgendaEvents(): Promise<ScrapedEvent[]> {
  const now = new Date();
  const page1 = await fetchHtml(LIST_URL);
  const provinceMap = extractProvinceMap(page1);

  const all: ScrapedEvent[] = [];
  const seen = new Set<string>();
  const pushNew = (events: ScrapedEvent[]) => {
    for (const e of events) {
      if (!seen.has(e.nid)) {
        seen.add(e.nid);
        all.push(e);
      }
    }
  };

  pushNew(parseCards(page1, provinceMap, now));

  // Páginas 2..MAX en paralelo (lotes de 5 para no saturar)
  for (let batch = 2; batch <= MAX_PAGES; batch += 5) {
    const pages = Array.from(
      { length: Math.min(5, MAX_PAGES - batch + 1) },
      (_, i) => batch + i
    );
    const results = await Promise.all(
      pages.map((p) => fetchHtml(AJAX_URL(p)).catch(() => ""))
    );
    let anyItems = false;
    for (const html of results) {
      const events = parseCards(html, provinceMap, now);
      if (events.length > 0) anyItems = true;
      pushNew(events);
    }
    if (!anyItems) break;
  }

  return all;
}

export interface ScrapeResult {
  total: number;
  created: number;
  updated: number;
}

/**
 * Sincroniza los eventos scrapeados con la DB (optimizado para serverless:
 * 1 lectura + createMany + updates individuales solo a los existentes).
 */
export async function syncAgendaEventsToDb(
  prisma: PrismaClient,
  events: ScrapedEvent[]
): Promise<ScrapeResult> {
  // 1 sola lectura: scraped existentes por nid
  const existing = await prisma.event.findMany({
    where: { source: "SCRAPED", sourceUrl: { contains: "nid=" } },
    select: { id: true, slug: true, sourceUrl: true },
  });

  const byNid = new Map<string, { id: string; slug: string }>();
  const usedSlugs = new Set<string>();
  for (const e of existing) {
    const nid = e.sourceUrl?.match(/nid=(\d+)/)?.[1];
    if (nid) byNid.set(nid, { id: e.id, slug: e.slug });
    usedSlugs.add(e.slug);
  }
  // También evitar colisiones con slugs de eventos CUSTOM
  const customSlugs = await prisma.event.findMany({
    where: { source: "CUSTOM" },
    select: { slug: true },
  });
  for (const c of customSlugs) usedSlugs.add(c.slug);

  const creates: Prisma.EventCreateManyInput[] = [];
  const updates: { id: string; data: Prisma.EventUpdateInput }[] = [];

  for (const e of events) {
    const data = {
      title: e.title,
      description: e.description,
      imageUrl: e.imageUrl,
      category: e.category,
      startDate: e.startDate,
      endDate: e.endDate,
      location: e.municipality,
      municipality: e.municipality,
      province: e.province,
      source: "SCRAPED" as const,
      sourceUrl: e.sourceUrl,
      isActive: e.isActive,
    };

    const existingEvent = byNid.get(e.nid);
    if (existingEvent) {
      updates.push({ id: existingEvent.id, data });
      continue;
    }

    // Slug único para el nuevo evento
    let slug = slugify(e.title);
    if (usedSlugs.has(slug)) slug = `${slug}-${e.nid}`;
    usedSlugs.add(slug);

    creates.push({ ...data, slug });
  }

  if (creates.length > 0) {
    await prisma.event.createMany({ data: creates });
  }
  for (const u of updates) {
    await prisma.event.update({ where: { id: u.id }, data: u.data });
  }

  return { total: events.length, created: creates.length, updated: updates.length };
}
