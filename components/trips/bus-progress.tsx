import { cn } from "@/lib/utils";

interface BusProgressProps {
  sold: number;
  min: number;
  capacity: number;
  className?: string;
}

// Barra de progreso: plazas vendidas vs mínimo para confirmar y capacidad total.
export function BusProgress({ sold, min, capacity, className }: BusProgressProps) {
  const pctCapacity = Math.min(100, Math.round((sold / capacity) * 100));
  const reachedMin = sold >= min;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex justify-between text-xs">
        <span className={reachedMin ? "font-semibold text-forest" : "text-muted-foreground"}>
          {reachedMin ? "✅ Mínimo alcanzado" : `${sold}/${min} para confirmar`}
        </span>
        <span className="text-muted-foreground">
          {sold}/{capacity} plazas
        </span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-forest to-brand transition-all"
          style={{ width: `${pctCapacity}%` }}
        />
        {/* Marca del mínimo */}
        <div
          className="absolute top-0 h-full w-0.5 bg-white/50"
          style={{ left: `${Math.min(100, (min / capacity) * 100)}%` }}
        />
      </div>
    </div>
  );
}
