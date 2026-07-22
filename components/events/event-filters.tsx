"use client";

import { CalendarDays, List, Map } from "lucide-react";
import { useFiltersStore, type CalendarView } from "@/stores/filters-store";
import { cn } from "@/lib/utils";

const PROVINCES = ["A Coruña", "Lugo", "Ourense", "Pontevedra"];
const CATEGORIES = [
  "fiesta-tradicional",
  "romeria",
  "festival",
  "concierto",
  "deporte",
  "feria",
  "espectaculo",
  "fiesta-privada",
];

const VIEWS: { id: CalendarView; label: string; icon: typeof List }[] = [
  { id: "month", label: "Mes", icon: CalendarDays },
  { id: "list", label: "Lista", icon: List },
  { id: "map", label: "Mapa", icon: Map },
];

// Barra de filtros + selector de vista del calendario RRPP.
export function EventFilters() {
  const { view, setView, province, setProvince, category, setCategory, onlyMine, setOnlyMine } =
    useFiltersStore();

  const selectClass =
    "h-9 rounded-lg border border-white/15 bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand";

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Vistas */}
      <div className="flex rounded-lg bg-white/5 p-1">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              view === v.id ? "bg-brand text-white" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <v.icon className="size-4" />
            {v.label}
          </button>
        ))}
      </div>

      {/* Provincia */}
      <select
        value={province ?? ""}
        onChange={(e) => setProvince(e.target.value || null)}
        className={selectClass}
      >
        <option value="">Todas las provincias</option>
        {PROVINCES.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      {/* Categoría */}
      <select
        value={category ?? ""}
        onChange={(e) => setCategory(e.target.value || null)}
        className={selectClass}
      >
        <option value="">Todos los tipos</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {/* Solo míos */}
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={onlyMine}
          onChange={(e) => setOnlyMine(e.target.checked)}
          className="size-4 accent-brand"
        />
        Solo habilitados por mí
      </label>
    </div>
  );
}
