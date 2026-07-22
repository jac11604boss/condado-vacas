import { create } from "zustand";

export type CalendarView = "month" | "list" | "map";

interface FiltersState {
  view: CalendarView;
  province: string | null;
  category: string | null;
  onlyMine: boolean; // solo eventos que ya habilité
  month: Date; // mes visible en vista mensual
  setView: (v: CalendarView) => void;
  setProvince: (p: string | null) => void;
  setCategory: (c: string | null) => void;
  setOnlyMine: (v: boolean) => void;
  setMonth: (d: Date) => void;
  reset: () => void;
}

export const useFiltersStore = create<FiltersState>((set) => ({
  view: "month",
  province: null,
  category: null,
  onlyMine: false,
  month: new Date(),
  setView: (view) => set({ view }),
  setProvince: (province) => set({ province }),
  setCategory: (category) => set({ category }),
  setOnlyMine: (onlyMine) => set({ onlyMine }),
  setMonth: (month) => set({ month }),
  reset: () =>
    set({ province: null, category: null, onlyMine: false }),
}));
