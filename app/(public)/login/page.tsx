import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { GoogleButton } from "@/components/auth/google-button";
import { Separator } from "@/components/ui/separator";

export const metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="glass w-full max-w-md rounded-2xl p-8">
        <Link href="/" className="font-display text-2xl tracking-wide">
          CONDADO <span className="text-brand">+VACAS</span>
        </Link>
        <h1 className="mt-6 font-display text-3xl tracking-wide">ENTRA</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tu plaza al mejor plan te está esperando.
        </p>

        <div className="mt-8">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>

        <div className="my-6 flex items-center gap-4">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">O TAMBIÉN</span>
          <Separator className="flex-1" />
        </div>

        <GoogleButton />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿No tienes cuenta?{" "}
          <Link href="/registro" className="font-semibold text-brand hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </main>
  );
}
