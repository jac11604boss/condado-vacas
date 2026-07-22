// CONDADO +VACAS — Scraping one-off de la Agenda Cultural de Turismo de Galicia
// Fuente: https://www.turismo.gal/axenda-cultural (HTML server-side + AJAX paginado)
// Uso: npx tsx scripts/scrape-agenda.ts [--dry]
// NOTA: ejecutar UNA VEZ para poblar la DB. Mantenimiento posterior: manual por admin.

import "dotenv/config";
import * as cheerio from "cheerio";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL }),
});

const BASE = "https://www.turismo.gal";
const LIST_URL = `${BASE}/axenda-cultural?langId=gl_ES`;
const AJAX_URL = (page: number) =>
  `${BASE}/axenda-cultural/-/ajax?langId=gl_ES&ajax=true&filtro=&numPagina=${page}`;
const MAX_PAGES = 15; // seguridad
const DRY_RUN = process.argv.includes("--dry");

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
};

// Meses en gallego (completo y abreviado)
const MESES: Record<string, number> = {
  xaneiro: 0, febreiro: 1, marzo: 2, abril: 3, maio: 4, xuño: 5,
  xullo: 6, agosto: 7, setembro: 8, outubro: 9, novembro: 10, decembro: 11,
  xan: 0, feb: 1, mar: 2, abr: 3, mai: 4, xuñ: 5,
  xul: 6, ago: 7, set: 8, out: 9, nov: 10, dec: 11,
};

// Categoría del ribbon → categoría interna
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

// "24 xul" | "24 de xullo / 31 de xullo" | "24 xul / 2 ago"
function parseDates(raw: string, now: Date): { start: Date; end: Date | null } | null {
  const cleaned = raw.replace(/\s+/g, " ").replace(/de /g, "").trim();
  const parts = cleaned.split("/").map((p) => p.trim()).filter(Boolean);
  const re = /^(\d{1,2})\s+([a-zñáéíóú]+)\.?(\d{4})?$/i;
  const TWO_DAYS = 2 * 86400000;

  const parse = (s: string): { date: Date; hasYear: boolean } | null => {
    const m = s.match(re);
    if (!m) return null;
    const day = parseInt(m[1], 10);
    const monthKey = m[2].toLowerCase().replace(/\.$/, "");
    const month = MESES[monthKey];
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

  // Inferencia de año (la agenda no muestra año):
  // - Rango en curso (fin aún no pasó) → mantener año actual aunque el inicio pasara
  // - Todo pasado → año que viene
  if (!p0.hasYear) {
    if (end && end.getTime() >= now.getTime() - TWO_DAYS) {
      // en curso: no hacer nada
    } else if (end && start.getTime() < now.getTime() - TWO_DAYS) {
      start = rollYear(start);
      end = rollYear(end);
    } else if (!end && start.getTime() < now.getTime() - TWO_DAYS) {
      start = rollYear(start);
    }
  }

  return { start, end };
}

interface ScrapedEvent {
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

// Extrae el mapa provincia → municipios del JS embebido en la página principal
function extractProvinceMap(html: string): Map<string, string> {
  const map = new Map<string, string>();
  const match = html.match(/var data_municipios=(\{[\s\S]*?\});/);
  if (!match) return map;
  try {
    // Es un objeto literal JS (claves sin comillas, coma final), no JSON estricto
    const data = new Function(`return ${match[1]}`)() as Record<string, string[]>;
    for (const [province, municipalities] of Object.entries(data)) {
      for (const m of municipalities) map.set(m.toLowerCase(), province);
    }
  } catch {
    console.warn("⚠️  No se pudo parsear data_municipios");
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

async function main() {
  const now = new Date();
  console.log("🕷️  Scrapeando Agenda Cultural de Turismo de Galicia…\n");

  // Página 1 (incluye el mapa de provincias)
  const page1 = await fetchHtml(LIST_URL);
  const provinceMap = extractProvinceMap(page1);
  console.log(`🗺️  Mapa provincia-municipio: ${provinceMap.size} municipios`);

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
  console.log(`📄 Página 1: ${all.length} eventos`);

  // Páginas 2..N vía AJAX hasta que no haya items
  for (let page = 2; page <= MAX_PAGES; page++) {
    const html = await fetchHtml(AJAX_URL(page));
    const events = parseCards(html, provinceMap, now);
    if (events.length === 0) {
      console.log(`📄 Página ${page}: vacía → fin de la paginación`);
      break;
    }
    const before = all.length;
    pushNew(events);
    console.log(`📄 Página ${page}: +${all.length - before} nuevos (${events.length} en página)`);
    await new Promise((r) => setTimeout(r, 800)); // cortesía
  }

  console.log(`\n🎯 Total eventos únicos: ${all.length}`);

  if (DRY_RUN) {
    console.log("\n--dry: no se escribe en DB. Muestra de 5:");
    for (const e of all.slice(0, 5)) {
      console.log(
        ` • ${e.title} | ${e.municipality} (${e.province}) | ${e.startDate.toISOString().slice(0, 10)} | ${e.category}`
      );
    }
    return;
  }

  // Upsert en DB (slug único; si colisiona con otro nid, añade sufijo)
  let created = 0;
  let updated = 0;
  for (const e of all) {
    const baseSlug = slugify(e.title);
    let slug = baseSlug;

    const existingBySlug = await prisma.event.findUnique({ where: { slug } });
    if (existingBySlug && existingBySlug.sourceUrl && !existingBySlug.sourceUrl.includes(`nid=${e.nid}`)) {
      slug = `${baseSlug}-${e.nid}`;
    }

    const existingBySource = await prisma.event.findFirst({
      where: { sourceUrl: { contains: `nid=${e.nid}` } },
    });

    const data = {
      slug: existingBySource?.slug ?? slug,
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

    if (existingBySource) {
      await prisma.event.update({ where: { id: existingBySource.id }, data });
      updated++;
    } else {
      await prisma.event.upsert({
        where: { slug: data.slug },
        update: data,
        create: data,
      });
      created++;
    }
  }

  console.log(`\n✅ DB: ${created} creados, ${updated} actualizados`);
  console.log("🎉 Scraping completado");
}

main()
  .catch((e) => {
    console.error("❌ Error en scraping:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
