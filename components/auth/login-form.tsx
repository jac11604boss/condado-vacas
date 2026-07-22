"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginInput } from "@/lib/validators/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const searchParams = useSearchParams();
  const explicitNext = searchParams.get("next");
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: standardSchemaResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword(values);
      if (error) {
        setError("Email o contraseña incorrectos");
        return;
      }

      toast.success("¡Sesión iniciada! Redirigiendo…");

      // Redirección por rol (recarga completa: cookies frescas, sin carrera)
      let target = explicitNext;
      if (!target) {
        try {
          const res = await fetch("/api/auth/me", {
            signal: AbortSignal.timeout(6000),
          });
          const me = await res.json();
          target =
            me.role === "ADMIN"
              ? "/admin"
              : me.role === "RRPP" && me.rrppStatus === "APPROVED"
                ? "/panel"
                : me.role === "RRPP"
                  ? "/rrpp/pendiente"
                  : "/eventos";
        } catch {
          target = "/eventos";
        }
      }
      window.location.href = target;
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="tu@email.com"
          autoComplete="email"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
