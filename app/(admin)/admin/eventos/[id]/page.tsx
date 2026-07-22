"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface EventData {
  id: string;
  title: string;
  description: string | null;
  category: string;
  startDate: string;
  endDate: string | null;
  location: string;
  municipality: string;
  province: string;
  imageUrl: string | null;
  isActive: boolean;
  pricePerSeat: number | null;
  rrppCommissionPct: number;
  minSeats: number;
  busCapacity: number;
}

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminEventoEditPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  useEffect(() => {
    fetch(`/api/events/${params.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.event) {
          setEvent(data.event);
          reset({
            title: data.event.title,
            description: data.event.description ?? "",
            category: data.event.category,
            startDate: toLocalInput(data.event.startDate),
            endDate: toLocalInput(data.event.endDate),
            location: data.event.location,
            municipality: data.event.municipality,
            province: data.event.province,
            imageUrl: data.event.imageUrl ?? "",
            pricePerSeat: data.event.pricePerSeat ?? "",
            rrppCommissionPct: data.event.rrppCommissionPct,
            minSeats: data.event.minSeats,
            busCapacity: data.event.busCapacity,
          });
        }
        setLoading(false);
      });
  }, [params.id, reset]);

  async function onSubmit(values: Record<string, string>) {
    const body = {
      title: values.title,
      description: values.description || null,
      category: values.category,
      startDate: values.startDate,
      endDate: values.endDate || null,
      location: values.location,
      municipality: values.municipality,
      province: values.province,
      imageUrl: values.imageUrl || null,
      pricePerSeat: values.pricePerSeat ? parseFloat(values.pricePerSeat) : null,
      rrppCommissionPct: parseFloat(values.rrppCommissionPct),
      minSeats: parseInt(values.minSeats, 10),
      busCapacity: parseInt(values.busCapacity, 10),
    };

    const res = await fetch(`/api/admin/events/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Error guardando");
      return;
    }
    toast.success("Evento actualizado");
    router.push("/admin/eventos");
    router.refresh();
  }

  if (loading) {
    return <Skeleton className="h-96 rounded-2xl" />;
  }

  if (!event) {
    return <p className="py-16 text-center text-muted-foreground">Evento no encontrado</p>;
  }

  const selectClass =
    "mt-1 h-10 w-full rounded-md border border-white/15 bg-background px-3 text-sm";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/admin/eventos" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Volver a eventos
      </Link>

      <h1 className="font-display text-3xl tracking-wide">
        EDITAR <span className="text-brand">EVENTO</span>
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="glass space-y-6 rounded-2xl p-6">
        {/* Info básica */}
        <div className="space-y-4">
          <h2 className="font-display text-lg tracking-wide text-muted-foreground">INFORMACIÓN</h2>
          <div>
            <Label>Título</Label>
            <Input className="mt-1" {...register("title", { required: true })} />
          </div>
          <div>
            <Label>Descripción</Label>
            <textarea rows={3} className="mt-1 w-full rounded-md border border-white/15 bg-background px-3 py-2 text-sm" {...register("description")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Categoría</Label>
              <Input className="mt-1" {...register("category")} />
            </div>
            <div>
              <Label>Imagen (URL)</Label>
              <Input className="mt-1" {...register("imageUrl")} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Inicio</Label>
              <Input type="datetime-local" className="mt-1" {...register("startDate")} />
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
              <Label>Municipio</Label>
              <Input className="mt-1" {...register("municipality")} />
            </div>
            <div>
              <Label>Provincia</Label>
              <select className={selectClass} {...register("province")}>
                {["A Coruña", "Lugo", "Ourense", "Pontevedra"].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Config económica */}
        <div className="space-y-4 border-t border-white/10 pt-6">
          <h2 className="font-display text-lg tracking-wide text-brand">CONFIGURACIÓN ECONÓMICA</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label>Precio/plaza (€)</Label>
              <Input type="number" step="0.5" min="0" className="mt-1" {...register("pricePerSeat")} placeholder="30" />
            </div>
            <div>
              <Label>Comisión RRPP (%)</Label>
              <Input type="number" step="1" min="0" max="50" className="mt-1" {...register("rrppCommissionPct")} />
            </div>
            <div>
              <Label>Mínimo plazas</Label>
              <Input type="number" min="5" className="mt-1" {...register("minSeats")} />
            </div>
            <div>
              <Label>Capacidad bus</Label>
              <Input type="number" min="10" className="mt-1" {...register("busCapacity")} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            El precio es por plaza. La comisión es el % que se lleva el RRPP de
            cada plaza vendida. El bus se confirma al alcanzar el mínimo.
          </p>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Guardando…" : "Guardar cambios"}
        </Button>
      </form>
    </div>
  );
}
