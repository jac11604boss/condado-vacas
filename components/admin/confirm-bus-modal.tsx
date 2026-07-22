"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { confirmBusSchema, type ConfirmBusInput } from "@/lib/validators/admin";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ConfirmBusModalProps {
  tripId: string;
  busId: string;
  busNumber: number;
  open: boolean;
  onClose: () => void;
}

// Modal: confirmar bus con empresa, conductor, punto y horarios.
export function ConfirmBusModal({ tripId, busId, busNumber, open, onClose }: ConfirmBusModalProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ConfirmBusInput>({
    resolver: zodResolver(confirmBusSchema),
    defaultValues: { busId },
  });
  register("busId", { value: busId });

  // Geocoding Mapbox (opcional, si hay token)
  async function geocode(q: string) {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || q.length < 4) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${token}&country=es&proximity=-8.4,42.8&limit=4&language=es`
      );
      const data = await res.json();
      setSuggestions(data.features?.map((f: { place_name: string }) => f.place_name) ?? []);
    } catch {
      setSuggestions([]);
    }
  }

  async function onSubmit(values: ConfirmBusInput) {
    setError(null);
    const res = await fetch(`/api/admin/trips/${tripId}/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "No se pudo confirmar el bus");
      return;
    }
    toast.success(
      `Bus #${busNumber} confirmado · ${data.emailsSent} emails a pasajeros${data.driverEmailSent ? " + lista al conductor" : ""}`
    );
    onClose();
    router.refresh();
  }

  const err = (name: string) =>
    (errors as Record<string, { message?: string }>)[name]?.message;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-wide">
            CONFIRMAR BUS #{busNumber}
          </DialogTitle>
          <DialogDescription>
            Se notificará a todos los pasajeros y al conductor.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative">
            <Label htmlFor="meetingPoint">Punto de encuentro exacto *</Label>
            <Input
              id="meetingPoint"
              placeholder="Estación de autobuses, Vigo"
              {...register("meetingPoint", {
                onChange: (e) => geocode(e.target.value),
              })}
            />
            {suggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border border-white/15 bg-popover p-1 shadow-lg">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="block w-full rounded px-2 py-1.5 text-left text-xs hover:bg-white/10"
                    onClick={() => {
                      setValue("meetingPoint", s);
                      setSuggestions([]);
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {err("meetingPoint") && <p className="text-sm text-destructive">{err("meetingPoint")}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="departureTime">Hora de salida *</Label>
              <Input id="departureTime" type="datetime-local" {...register("departureTime")} />
              {err("departureTime") && <p className="text-sm text-destructive">{err("departureTime")}</p>}
            </div>
            <div>
              <Label htmlFor="returnTime">Hora de regreso</Label>
              <Input id="returnTime" type="datetime-local" {...register("returnTime")} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="busCompany">Empresa de bus *</Label>
              <Input id="busCompany" placeholder="Autocares Vázquez" {...register("busCompany")} />
              {err("busCompany") && <p className="text-sm text-destructive">{err("busCompany")}</p>}
            </div>
            <div>
              <Label htmlFor="busPlate">Matrícula</Label>
              <Input id="busPlate" placeholder="1234 ABC" {...register("busPlate")} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="driverName">Nombre conductor *</Label>
              <Input id="driverName" placeholder="Manuel Perez" {...register("driverName")} />
              {err("driverName") && <p className="text-sm text-destructive">{err("driverName")}</p>}
            </div>
            <div>
              <Label htmlFor="driverPhone">Teléfono conductor *</Label>
              <Input id="driverPhone" placeholder="600 123 456" {...register("driverPhone")} />
              {err("driverPhone") && <p className="text-sm text-destructive">{err("driverPhone")}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="driverEmail">Email conductor (recibe la lista de pasajeros)</Label>
            <Input id="driverEmail" type="email" placeholder="conductor@empresa.com" {...register("driverEmail")} />
            {err("driverEmail") && <p className="text-sm text-destructive">{err("driverEmail")}</p>}
          </div>

          <div>
            <Label htmlFor="routeNotes">Notas de ruta (opcional)</Label>
            <Input id="routeNotes" placeholder="Parada intermedia en…" {...register("routeNotes")} />
          </div>

          {error && (
            <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Confirmando…" : `Confirmar bus #${busNumber} y notificar`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
