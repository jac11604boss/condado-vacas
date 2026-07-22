"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { rrppApplySchema, type RrppApplyInput } from "@/lib/validators/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RrppApplyForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RrppApplyInput>({ resolver: standardSchemaResolver(rrppApplySchema) });

  async function onSubmit(values: RrppApplyInput) {
    setError(null);
    const res = await fetch("/api/rrpp/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "No se pudo enviar la solicitud");
      return;
    }
    router.push("/rrpp/pendiente");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="instagram">Instagram *</Label>
        <Input id="instagram" placeholder="@tuusuario" {...register("instagram")} />
        {errors.instagram && (
          <p className="text-sm text-destructive">{errors.instagram.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="tiktok">TikTok (opcional)</Label>
        <Input id="tiktok" placeholder="@tuusuario" {...register("tiktok")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="city">Tu ciudad / pueblo base</Label>
        <Input id="city" placeholder="Mondariz" {...register("city")} />
        {errors.city && (
          <p className="text-sm text-destructive">{errors.city.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Cuéntanos quién eres (opcional)</Label>
        <Input id="bio" placeholder="Muevo a la gente de mi zona desde 2020…" {...register("bio")} />
        {errors.bio && (
          <p className="text-sm text-destructive">{errors.bio.message}</p>
        )}
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full bg-party hover:bg-party/80" disabled={isSubmitting}>
        {isSubmitting ? "Enviando…" : "Enviar solicitud"}
      </Button>
    </form>
  );
}
