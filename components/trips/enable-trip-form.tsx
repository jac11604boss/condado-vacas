"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { enableTripSchema, type EnableTripInput } from "@/lib/validators/trip";
import { ShareLinkCard } from "./share-link-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, PartyPopper } from "lucide-react";

// Formulario para habilitar un bus: solo elige ciudad/pueblo de salida.
export function EnableTripForm({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EnableTripInput>({ resolver: standardSchemaResolver(enableTripSchema) });
  register("eventId", { value: eventId });

  async function onSubmit(values: EnableTripInput) {
    const res = await fetch("/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, originCity: values.originCity }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "No se pudo habilitar el bus");
      return;
    }
    setShareUrl(data.shareUrl);
    toast.success("¡Bus habilitado! Comparte tu enlace");
  }

  if (shareUrl) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-forest/20">
          <PartyPopper className="size-7 text-forest" />
        </div>
        <h3 className="font-display text-2xl tracking-wide">¡BUS HABILITADO!</h3>
        <p className="text-sm text-muted-foreground">
          Este es tu enlace personalizado. Compártelo en Instagram, TikTok y
          WhatsApp — cada plaza vendida cuenta para ti.
        </p>
        <ShareLinkCard url={shareUrl} />
        <Button variant="outline" className="w-full" onClick={() => router.push("/panel/mis-viajes")}>
          Ver mis viajes
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="originCity">¿Desde qué ciudad/pueblo sale tu bus?</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="originCity"
            placeholder="Mondariz, Vigo, Ourense…"
            className="pl-9"
            {...register("originCity")}
          />
        </div>
        {errors.originCity && (
          <p className="text-sm text-destructive">{errors.originCity.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Del resto nos ocupamos nosotros: precio, horarios, ruta y empresa de
          bus.
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Habilitando…" : "Habilitar bus y obtener mi enlace"}
      </Button>
    </form>
  );
}
