"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  registerClientSchema,
  registerRrppSchema,
  type RegisterClientInput,
  type RegisterRrppInput,
} from "@/lib/validators/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Role = "CLIENT" | "RRPP";

export function RegisterForm() {
  const [role, setRole] = useState<Role>("CLIENT");
  const [error, setError] = useState<string | null>(null);

  const schema = role === "CLIENT" ? registerClientSchema : registerRrppSchema;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterClientInput & Partial<RegisterRrppInput>>({
    resolver: standardSchemaResolver(schema),
  });

  function switchRole(next: Role) {
    setRole(next);
    setError(null);
    reset();
  }

  async function onSubmit(
    values: RegisterClientInput & Partial<RegisterRrppInput>
  ) {
    setError(null);
    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { data: { name: values.name, phone: values.phone } },
    });

    if (signUpError || !data.user) {
      setError(
        signUpError?.message.includes("already registered")
          ? "Este email ya está registrado. Prueba a entrar."
          : "No se pudo crear la cuenta. Inténtalo de nuevo."
      );
      return;
    }

    // Crear perfil en la tabla User (+ RrppProfile PENDING si es RRPP)
    const syncRes = await fetch("/api/auth/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: data.user.id,
        name: values.name,
        phone: values.phone,
        role,
        instagram: values.instagram,
        tiktok: values.tiktok,
        city: values.city,
      }),
    });

    if (!syncRes.ok) {
      setError("Cuenta creada pero falló el perfil. Contacta con soporte.");
      return;
    }

    if (!data.session) {
      // Supabase pide confirmar email
      toast.info("Revisa tu email para confirmar la cuenta y luego entra.");
      window.location.href = "/login";
      return;
    }

    // Recarga completa: cookies frescas y destino según rol
    window.location.href = role === "RRPP" ? "/rrpp/pendiente" : "/eventos";
  }

  const fieldError = (name: string) =>
    (errors as Record<string, { message?: string }>)[name]?.message;

  return (
    <div className="space-y-6">
      {/* Tabs Cliente / RRPP */}
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-white/5 p-1">
        {(
          [
            { id: "CLIENT", label: "🎉 Soy Cliente" },
            { id: "RRPP", label: "📣 Soy RRPP" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => switchRole(tab.id)}
            className={cn(
              "rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors",
              role === tab.id
                ? tab.id === "RRPP"
                  ? "bg-party text-white"
                  : "bg-brand text-white"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre y apellidos</Label>
          <Input id="name" placeholder="María Lopes" autoComplete="name" {...register("name")} />
          {fieldError("name") && <p className="text-sm text-destructive">{fieldError("name")}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="tu@email.com" autoComplete="email" {...register("email")} />
          {fieldError("email") && <p className="text-sm text-destructive">{fieldError("email")}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input id="password" type="password" placeholder="Mínimo 8 caracteres" autoComplete="new-password" {...register("password")} />
          {fieldError("password") && <p className="text-sm text-destructive">{fieldError("password")}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" type="tel" placeholder="600 123 456" autoComplete="tel" {...register("phone")} />
          {fieldError("phone") && <p className="text-sm text-destructive">{fieldError("phone")}</p>}
        </div>

        {role === "RRPP" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram *</Label>
              <Input id="instagram" placeholder="@tuusuario" {...register("instagram")} />
              {fieldError("instagram") && <p className="text-sm text-destructive">{fieldError("instagram")}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tiktok">TikTok (opcional)</Label>
              <Input id="tiktok" placeholder="@tuusuario" {...register("tiktok")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Tu ciudad / pueblo base</Label>
              <Input id="city" placeholder="Mondariz" {...register("city")} />
              {fieldError("city") && <p className="text-sm text-destructive">{fieldError("city")}</p>}
            </div>

            <p className="rounded-md bg-party/10 p-3 text-xs text-muted-foreground">
              📣 Las cuentas RRPP se revisan manualmente. Te avisaremos por
              email cuando estés aprobado y puedas habilitar buses.
            </p>
          </>
        )}

        {error && (
          <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <Button
          type="submit"
          className={cn("w-full", role === "RRPP" && "bg-party hover:bg-party/80")}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Creando cuenta…"
            : role === "RRPP"
              ? "Solicitar cuenta RRPP"
              : "Crear cuenta"}
        </Button>
      </form>
    </div>
  );
}
