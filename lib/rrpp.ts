import { prisma } from "@/lib/prisma";

/** "María Lopes" → "maria-lopes" (sin acentos, minúsculas, guiones) */
function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Genera un código público único para el RRPP a partir de su nombre.
 * Si está ocupado, añade sufijo numérico: maria-lopes-2, maria-lopes-3…
 */
export async function generateRrppCode(name: string) {
  const base = slugify(name) || "rrpp";
  let code = base;
  let i = 2;
  while (await prisma.rrppProfile.findUnique({ where: { code } })) {
    code = `${base}-${i}`;
    i++;
  }
  return code;
}
