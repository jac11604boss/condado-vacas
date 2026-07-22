import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/logout-button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const metadata = { title: "Mi cuenta" };

const roleLabels: Record<string, string> = {
  CLIENT: "Cliente",
  RRPP: "RRPP",
  ADMIN: "Admin",
};

export default async function MiCuentaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/mi-cuenta");

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-16">
      <div className="glass rounded-2xl p-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-3xl tracking-wide">
              {user.name ?? "Mi cuenta"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
          </div>
          <Badge className="bg-brand/20 text-brand">{roleLabels[user.role]}</Badge>
        </div>

        <Separator className="my-6" />

        <dl className="space-y-3 text-sm">
          {user.phone && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Teléfono</dt>
              <dd>{user.phone}</dd>
            </div>
          )}
          {user.rrppProfile && (
            <>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Código RRPP</dt>
                <dd className="font-mono">{user.rrppProfile.code}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Estado RRPP</dt>
                <dd>{user.rrppProfile.status}</dd>
              </div>
            </>
          )}
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Miembro desde</dt>
            <dd>{user.createdAt.toLocaleDateString("es-ES")}</dd>
          </div>
        </dl>

        <Separator className="my-6" />

        <div className="flex items-center justify-between">
          <Link
            href="/mi-cuenta/reservas"
            className="text-sm font-semibold text-brand hover:underline"
          >
            Ver mis reservas →
          </Link>
          <LogoutButton />
        </div>
      </div>
    </main>
  );
}
