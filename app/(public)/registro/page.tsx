import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata = { title: "Crear cuenta" };

export default function RegistroPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="glass w-full max-w-md rounded-2xl p-8">
        <Link href="/" className="font-display text-2xl tracking-wide">
          CONDADO <span className="text-brand">+VACAS</span>
        </Link>
        <h1 className="mt-6 font-display text-3xl tracking-wide">
          CREA TU CUENTA
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Como cliente para ir de fiesta, o como RRPP para ganar dinero.
        </p>

        <div className="mt-8">
          <RegisterForm />
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-semibold text-brand hover:underline">
            Entra
          </Link>
        </p>
      </div>
    </main>
  );
}
