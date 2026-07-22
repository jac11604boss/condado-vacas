import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/logout-button";
import { PanelNav } from "@/components/layout/panel-nav";

// Guard de rol: /panel/* solo para RRPP APROBADOS.
// La sesión ya la exige el middleware; aquí validamos rol + estado.
export default async function RrppPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) redirect("/login?next=/panel");
  if (user.role !== "ADMIN") {
    if (user.role !== "RRPP") redirect("/rrpp/solicitar");
    if (user.rrppProfile?.status === "PENDING") redirect("/rrpp/pendiente");
    if (user.rrppProfile?.status !== "APPROVED") redirect("/");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/5">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="font-display text-xl tracking-wide">
            CONDADO <span className="text-brand">+VACAS</span>
            <span className="ml-2 rounded bg-party/20 px-2 py-0.5 font-sans text-xs text-party">
              RRPP
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted-foreground sm:block">
              {user.name}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">
        <PanelNav />
        {children}
      </main>
    </div>
  );
}
