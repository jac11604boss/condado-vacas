import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/logout-button";
import { AdminNav } from "@/components/layout/admin-nav";

// Guard de rol: /admin/* solo para ADMIN.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) redirect("/login?next=/admin");
  if (user.role !== "ADMIN") redirect("/");

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/5">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="font-display text-xl tracking-wide">
            CONDADO <span className="text-brand">+VACAS</span>
            <span className="ml-2 rounded bg-brand/20 px-2 py-0.5 font-sans text-xs text-brand">
              ADMIN
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted-foreground sm:block">
              {user.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">
        <AdminNav />
        {children}
      </main>
    </div>
  );
}
