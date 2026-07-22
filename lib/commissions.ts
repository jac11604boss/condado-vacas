// Cálculo del reparto de dinero por plaza vendida.
// Ejemplo: precio 30€ → RRPP 15% = 4.50€ · Condado 20% = 6€ · Bus 65% = 19.50€

export const PLATFORM_PCT = 20;

export function calcRrppEarnings(
  soldSeats: number,
  pricePerSeat: number,
  commissionPct: number
): number {
  return round2(soldSeats * pricePerSeat * (commissionPct / 100));
}

export function calcPlatformShare(pricePerSeat: number): number {
  return round2(pricePerSeat * (PLATFORM_PCT / 100));
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
