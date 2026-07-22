import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { getCurrentUser } from "@/lib/auth";

const execAsync = promisify(exec);

// POST /api/admin/scrape — ejecuta el scraper de la Agenda Cultural
// (script one-off re-ejecutable; upsert por nid)
export async function POST() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const { stdout, stderr } = await execAsync(
      "npx tsx scripts/scrape-agenda.ts",
      { cwd: process.cwd(), timeout: 300_000 }
    );

    // Extraer resumen del output
    const total = stdout.match(/Total eventos únicos: (\d+)/)?.[1];
    const db = stdout.match(/DB: (\d+) creados, (\d+) actualizados/);

    return NextResponse.json({
      ok: true,
      total: total ? parseInt(total, 10) : null,
      created: db ? parseInt(db[1], 10) : null,
      updated: db ? parseInt(db[2], 10) : null,
      log: stdout.slice(-500),
      stderr: stderr.slice(-300),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error ejecutando scraper";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
