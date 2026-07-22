import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Hourglass } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata = { title: "Solicitud en revisión" };

export default function RrppPendientePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="glass w-full max-w-md rounded-2xl p-8 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-party/20">
          <Hourglass className="size-8 text-party" />
        </div>
        <h1 className="mt-6 font-display text-3xl tracking-wide">
          SOLICITUD <span className="text-party">EN REVISIÓN</span>
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Tu solicitud está siendo revisada por nuestro equipo. En cuanto seas
          aprobado te avisaremos por email y podrás empezar a habilitar buses y
          ganar comisiones.
        </p>
        <Link href="/" className={cn(buttonVariants(), "mt-8 w-full")}>
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
