import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-[10rem] leading-none text-white/5">404</p>
      <h1 className="-mt-16 font-display text-4xl tracking-wide">
        ESTA FIESTA <span className="text-brand">NO EXISTE</span>
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        La página que buscas se fue de romería. Pero hay muchas otras esperándote.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className={cn(buttonVariants())}>
          Ir al inicio
        </Link>
        <Link href="/eventos" className={cn(buttonVariants({ variant: "outline" }), "border-white/15")}>
          Ver eventos
        </Link>
      </div>
    </main>
  );
}
