"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display text-4xl tracking-wide">
        ALGO SE HA <span className="text-destructive">ROMPIDO</span>
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Ha ocurrido un error inesperado. Puedes reintentar o volver al inicio.
      </p>
      <div className="mt-8 flex gap-3">
        <Button onClick={reset}>Reintentar</Button>
        <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "border-white/15")}>
          Ir al inicio
        </Link>
      </div>
    </main>
  );
}
