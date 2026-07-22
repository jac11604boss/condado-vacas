"use client";

import { useQuery } from "@tanstack/react-query";

export interface CalendarEvent {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  category: string;
  startDate: string;
  endDate: string | null;
  municipality: string;
  province: string;
  lat: number | null;
  lng: number | null;
  pricePerSeat: number | null;
  source: "SCRAPED" | "CUSTOM";
  enabledByMe: boolean;
  enabledCount: number;
}

interface Filters {
  province?: string | null;
  category?: string | null;
}

export function useEvents(filters: Filters = {}) {
  return useQuery<{ events: CalendarEvent[] }>({
    queryKey: ["calendar-events", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.province) params.set("province", filters.province);
      if (filters.category) params.set("category", filters.category);
      const res = await fetch(`/api/events?${params.toString()}`);
      if (!res.ok) throw new Error("Error cargando eventos");
      return res.json();
    },
  });
}

export interface MyTrip {
  tripId: string;
  status: string;
  originCity: string;
  shareUrl: string;
  event: {
    slug: string;
    title: string;
    imageUrl: string | null;
    startDate: string;
    municipality: string;
    pricePerSeat: number | null;
    minSeats: number;
  };
  soldSeats: number;
  earnings: number;
  buses: {
    id: string;
    number: number;
    capacity: number;
    status: string;
    soldSeats: number;
  }[];
}

export function useMyTrips() {
  return useQuery<{ trips: MyTrip[] }>({
    queryKey: ["my-trips"],
    queryFn: async () => {
      const res = await fetch("/api/trips?mine=true");
      if (!res.ok) throw new Error("Error cargando viajes");
      return res.json();
    },
    refetchInterval: 15_000, // plazas en "tiempo real"
  });
}
