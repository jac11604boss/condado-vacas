import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { RrppApplyForm } from "@/components/auth/rrpp-apply-form";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Solicitar acceso RRPP" };

export default async function RrppSolicitarPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/rrpp/solicitar");

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="glass w-full max-w-md rounded-2xl p-8">
        <Link href="/" className="font-display text-2xl tracking-wide">
          CONDADO <span className="text-brand">+VACAS</span>
        </Link>

        {user.rrppProfile ? (
          <div className="mt-8 space-y-4">
            <Badge className="bg-party/20 text-party">
              {user.rrppProfile.status === "APPROVED"
                ? "Ya eres RRPP aprobado"
                : user.rrppProfile.status === "PENDING"
                  ? "Solicitud en revisión"
                  : "Solicitud rechazada"}
            </Badge>
            <p className="text-sm text-muted-foreground">
              {user.rrppProfile.status === "APPROVED" ? (
                <>
                  Tu código es <strong className="text-foreground">{user.rrppProfile.code}</strong>.{" "}
                  <Link href="/panel" className="text-brand hover:underline">
                    Ir a tu panel →
                  </Link>
                </>
              ) : user.rrppProfile.status === "PENDING" ? (
                "Estamos revisando tu solicitud. Te avisaremos por email."
              ) : (
                "Contacta con nosotros si crees que es un error."
              )}
            </p>
          </div>
        ) : (
          <>
            <h1 className="mt-6 font-display text-3xl tracking-wide">
              CONVIÉRTETE EN <span className="text-party">RRPP</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Habilita buses a eventos, comparte tu enlace y cobra comisión por
              cada plaza. Revisamos cada solicitud manualmente.
            </p>
            <div className="mt-8">
              <RrppApplyForm />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
