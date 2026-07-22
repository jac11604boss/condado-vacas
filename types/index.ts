// Tipos planos compartidos (serializables RSC → client components)

export interface TripCard {
  tripId: string;
  rrppCode: string;
  originCity: string;
  event: {
    slug: string;
    title: string;
    category: string;
    startDate: string; // ISO
    endDate: string | null;
    municipality: string;
    province: string;
    imageUrl: string | null;
    pricePerSeat: number | null;
    minSeats: number;
  };
  soldSeats: number;
  capacity: number;
}

export interface EventDetail {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  category: string;
  startDate: string;
  endDate: string | null;
  location: string;
  municipality: string;
  province: string;
  pricePerSeat: number | null;
  minSeats: number;
  busCapacity: number;
  trips: {
    tripId: string;
    rrppCode: string;
    rrppName: string | null;
    originCity: string;
    soldSeats: number;
    capacity: number;
    busStatus: string;
  }[];
}
