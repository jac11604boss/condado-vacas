"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const PROVINCES = ["A Coruña", "Lugo", "Ourense", "Pontevedra"];

export default function AdminNuevoEventoPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<Record<string, string>>({
    defaultValues: { category: "fiesta-tradicional", province: "Pontevedra" },
  });

  async function onSubmit(values: Record<string, string>) {
    setError(null);
    const res = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: values.title,
        description: values.description || undefined,
        category: values.category,
        startDate: values.startDate,
        endDate: values.endDate || undefined,
        municipality: values.municipality,
        province: values.province,
        location: values.location || undefined,
        imageUrl: values.imageUrl || undefined,
        pricePerSeat: values.pricePerSeat ? parseFloat(values.pricePerSeat) : undefined,
        rrppCommissionPct: values.rrppCommissionPct ? parseFloat(values.rrppCommissionPct) : undefined,
        minSeats: values.minSeats ? parseInt(values.minSeats, 10) : undefined,
        busCapacity: values.busCapacity ? parseInt(values.busCapacity, 10) : undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Error creando evento");
      return;
    }
    toast.success("Evento creado");
    router.push(`/admin/eventos/${data.eventId}`);
  }

  const selectClass = "mt-1 h-10 w-full rounded-md border border-white/15 bg-background px-3 text-sm";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/admin/eventos" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Volver a eventos
      </Link>

      <h1 className="font-display text-3xl tracking-wide">
        NUEVO <span className="text-brand">EVENTO</span>
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="glass space-y-4 rounded-2xl p-6">
        <div>
          <Label>Título *</Label>
          <Input className="mt-1" {...register("title", { required: true })} />
        </div>
        <div>
          <Label>Descripción</Label>
          <textarea rows={3} className="mt-1 w-full rounded-md border border-white/15 bg-background px-3 py-2 text-sm" {...register("description")} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Categoría *</Label>
            <select className={selectClass} {...register("category")}>
              {["fiesta-tradicional", "romeria", "festival", "concierto", "deporte", "feria", "espectaculo", "fiesta-privada"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Imagen (URL)</Label>
            <Input className="mt-1" {...register("imageUrl")} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Inicio *</Label>
            <Input type="datetime-local" className="mt-1" {...register("startDate", { required: true })} />
          </div>
          <div>
            <Label>Fin</Label>
            <Input type="datetime-local" className="mt-1" {...register("endDate")} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label>Lugar</Label>
            <Input className="mt-1" {...register("location")} />
          </div>
          <div>
            <Label>Municipio *</Label>
            <Input className="mt-1" {...register("municipality", { required: true })} />
          </div>
          <div>
            <Label>Provincia *</Label>
            <select className={selectClass} {...register("province")}>
              {PROVINCES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <Label>Precio/plaza (€)</Label>
            <Input type="number" step="0.5" className="mt-1" {...register("pricePerSeat")} />
          </div>
          <div>
            <Label>Comisión %</Label>
            <Input type="number" className="mt-1" {...register("rrppCommissionPct")} />
          </div>
          <div>
            <Label>Mínimo</Label>
            <Input type="number" className="mt-1" {...register("minSeats")} />
          </div>
          <div>
            <Label>Capacidad</Label>
            <Input type="number" className="mt-1" {...register("busCapacity")} />
          </div>
        </div>

        {error && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creando…" : "Crear evento"}
        </Button>
      </form>
    </div>
  );
}
