import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
async function main() {
  const users = await prisma.user.findMany({
    select: { email: true, role: true, rrppProfile: { select: { code: true, status: true } } },
    orderBy: { createdAt: "asc" },
  });
  console.table(users.map(u => ({ email: u.email, role: u.role, rrpp: u.rrppProfile?.code ?? "-", status: u.rrppProfile?.status ?? "-" })));
}
main().finally(() => prisma.$disconnect());
