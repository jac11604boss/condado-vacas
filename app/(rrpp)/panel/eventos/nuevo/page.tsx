"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { toast } from "sonner";
import { createEventSchema, type CreateEventInput } from "@/lib/validators/trip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  { value: "fiesta-privada", label: "Fiesta privada / despedida" },
  { value: "fiesta-tradicional", label: "Fiesta tradicional" },
  { value: "romeria", label: "Romería" },
  { value: "festival", label: "Festival" },
  { value: "concierto", label: "Concierto" },
  { value: "deporte", label: "Deporte" },
  { value: "feria", label: "Feria" },
  { value: "espectaculo", label: "Espectáculo" },
];

const PROVINCES = ["A Coruña", "Lugo", "Ourense", "Pontevedra"];

export default function NuevoEventoPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateEventInput>({
    resolver: standardSchemaResolver(createEventSchema),
    defaultValues: { category: "fiesta-privada", province: "Pontevedra" },
  });

  async function onSubmit(values: CreateEventInput) {
    setServerError(null);
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) {
      setServerError(data.error ?? "No se pudo crear el evento");
      return;
    }
    toast.success("Evento creado. Ahora habilita tu bus.");
    router.push(`/panel/habilitar/${data.eventId}`);
  }

  const inputClass = "mt-1";
  const selectClass =
    "mt-1 h-10 w-full rounded-md border border-white/15 bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/panel/calendario"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Volver al calendario
      </Link>

      <div>
        <h1 className="font-display text-3xl tracking-wide">
          CREAR <span className="text-party">EVENTO PROPIO</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Despedidas, fiestas privadas, conciertos… El equipo fijará el precio
          y confirmará el bus cuando llegue al mínimo.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="glass space-y-4 rounded-2xl p-6">
        <div>
          <Label htmlFor="title">Nombre del evento *</Label>
          <Input id="title" className={inputClass} placeholder="Despedida de Ana — Baiona nocturna" {...register("title")} />
          {errors.title && <p className="mt-1 text-sm text-destructive">{errors.title.message}</p>}
        </div>

        <div>
          <Label htmlFor="description">Descripción</Label>
          <textarea
            id="description"
            rows={3}
            className="mt-1 w-full rounded-md border border-white/15 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            placeholder="Qué plan tenéis, a quién va dirigido…"
            {...register("description")}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="category">Tipo *</Label>
            <select id="category" className={selectClass} {...register("category")}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="imageUrl">URL de imagen (opcional)</Label>
            <Input id="imageUrl" className={inputClass} placeholder="https://…" {...register("imageUrl")} />
            {errors.imageUrl && <p className="mt-1 text-sm text-destructive">{errors.imageUrl.message}</p>}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="startDate">Fecha de inicio *</Label>
            <Input id="startDate" type="datetime-local" className={inputClass} {...register("startDate")} />
            {errors.startDate && <p className="mt-1 text-sm text-destructive">{errors.startDate.message}</p>}
          </div>
          <div>
            <Label htmlFor="endDate">Fecha de fin (opcional)</Label>
            <Input id="endDate" type="datetime-local" className={inputClass} {...register("endDate")} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="municipality">Municipio *</Label>
            <Input id="municipality" className={inputClass} placeholder="Baiona" {...register("municipality")} />
            {errors.municipality && <p className="mt-1 text-sm text-destructive">{errors.municipality.message}</p>}
          </div>
          <div>
            <Label htmlFor="province">Provincia *</Label>
            <select id="province" className={selectClass} {...register("province")}>
              {PROVINCES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="location">Lugar exacto (opcional)</Label>
          <Input id="location" className={inputClass} placeholder="Puerto deportivo de Baiona" {...register("location")} />
        </div>

        {serverError && (
          <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{serverError}</p>
        )}

        <Button type="submit" className="w-full bg-party hover:bg-party/80" disabled={isSubmitting}>
          {isSubmitting ? "Creando…" : "Crear evento y habilitar bus"}
        </Button>
      </form>
    </div>
  );
}
