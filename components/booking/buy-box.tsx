"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Minus, Plus, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BuyBoxProps {
  tripId: string;
  pricePerSeat: number;
  seatsLeft: number;
  isAuthenticated: boolean;
  loginNextUrl: string;
}

// Selector de plazas + botón de compra.
// POST /api/bookings se implementa en la Fase 7 (Stripe Checkout).
export function BuyBox({
  tripId,
  pricePerSeat,
  seatsLeft,
  isAuthenticated,
  loginNextUrl,
}: BuyBoxProps) {
  const router = useRouter();
  const [seats, setSeats] = useState(1);
  const [loading, setLoading] = useState(false);

  const maxSeats = Math.min(10, seatsLeft);
  const total = (seats * pricePerSeat).toFixed(2);

  async function buy() {
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId, seats }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "No se pudo iniciar la compra");
        return;
      }
      // Stripe Checkout
      window.location.href = data.url;
    } catch {
      toast.error("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <Button className="w-full" onClick={() => router.push(loginNextUrl)}>
        <Ticket className="size-4" />
        Entra para comprar tu plaza
      </Button>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Plazas</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSeats((s) => Math.max(1, s - 1))}
            disabled={seats <= 1}
            className={cn(
              "flex size-8 items-center justify-center rounded-full border border-white/15 transition-colors",
              seats <= 1 ? "opacity-30" : "hover:bg-white/10"
            )}
          >
            <Minus className="size-4" />
          </button>
          <span className="w-8 text-center font-display text-2xl">{seats}</span>
          <button
            type="button"
            onClick={() => setSeats((s) => Math.min(maxSeats, s + 1))}
            disabled={seats >= maxSeats}
            className={cn(
              "flex size-8 items-center justify-center rounded-full border border-white/15 transition-colors",
              seats >= maxSeats ? "opacity-30" : "hover:bg-white/10"
            )}
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/10 pt-4">
        <span className="text-sm text-muted-foreground">Total</span>
        <span className="font-display text-3xl text-brand">{total}€</span>
      </div>

      <Button
        className="w-full"
        onClick={buy}
        disabled={loading || seatsLeft <= 0}
      >
        <Ticket className="size-4" />
        {seatsLeft <= 0
          ? "Bus completo"
          : loading
            ? "Preparando pago…"
            : `Comprar ${seats > 1 ? `${seats} plazas` : "plaza"}`}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Si el bus no alcanza el mínimo, te devolvemos el 100% automáticamente.
      </p>
    </div>
  );
}
