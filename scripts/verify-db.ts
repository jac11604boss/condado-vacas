import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
async function main() {
  const buses = await prisma.bus.findMany({
    where: { trip: { originCity: "redondela" } },
    include: { bookings: { select: { seats: true, status: true } } },
    orderBy: { number: "asc" },
  });
  console.log("BUSES (Redondela → Rapa):");
  for (const b of buses) {
    const paid = b.bookings.filter(x => x.status === "PAID").reduce((a, x) => a + x.seats, 0);
    const pending = b.bookings.filter(x => x.status === "PENDING").reduce((a, x) => a + x.seats, 0);
    console.log(` Bus #${b.number}: ${b.status} · cap ${b.capacity} · PAID ${paid} · PENDING ${pending}`);
  }
  const sample = await prisma.booking.findFirst({ where: { status: "PAID" }, select: { qrToken: true } });
  console.log("qrToken ejemplo:", sample?.qrToken.slice(0, 40) + "…");
}
main().finally(() => prisma.$disconnect());
