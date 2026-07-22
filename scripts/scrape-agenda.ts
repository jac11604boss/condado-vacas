// CLI one-off del scraping de la Agenda Cultural de Turismo de Galicia.
// Uso: npx tsx scripts/scrape-agenda.ts [--dry]
// La lógica vive en lib/scraper.ts (compartida con /api/admin/scrape).

import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { fetchAgendaEvents, syncAgendaEventsToDb } from "../lib/scraper";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL }),
});

const DRY_RUN = process.argv.includes("--dry");

async function main() {
  console.log("🕷️  Scrapeando Agenda Cultural de Turismo de Galicia…\n");
  const events = await fetchAgendaEvents();
  console.log(`🎯 Total eventos únicos: ${events.length}`);

  if (DRY_RUN) {
    console.log("\n--dry: no se escribe en DB. Muestra de 5:");
    for (const e of events.slice(0, 5)) {
      console.log(
        ` • ${e.title} | ${e.municipality} (${e.province}) | ${e.startDate.toISOString().slice(0, 10)} | ${e.category}`
      );
    }
    return;
  }

  const result = await syncAgendaEventsToDb(prisma, events);
  console.log(`\n✅ DB: ${result.created} creados, ${result.updated} actualizados`);
  console.log("🎉 Scraping completado");
}

main()
  .catch((e) => {
    console.error("❌ Error en scraping:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
