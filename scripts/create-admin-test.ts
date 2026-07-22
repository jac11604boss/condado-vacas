import "dotenv/config";
import { config } from "dotenv";
config({ path: ".env.local", override: true });
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  const { data, error } = await admin.auth.admin.createUser({
    email: "admin.test@demo.gal",
    password: "TestPassword123!",
    email_confirm: true,
    user_metadata: { name: "Admin Test" },
  });
  if (error && !error.message.includes("already been registered")) throw error;
  const authId = data?.user?.id ?? (await admin.auth.admin.listUsers()).data.users.find(u => u.email === "admin.test@demo.gal")!.id;

  await prisma.user.upsert({
    where: { supabaseId: authId },
    update: { role: "ADMIN" },
    create: { supabaseId: authId, email: "admin.test@demo.gal", name: "Admin Test", role: "ADMIN" },
  });
  console.log("✅ admin.test@demo.gal / TestPassword123! con role ADMIN");
}
main().finally(() => prisma.$disconnect());
