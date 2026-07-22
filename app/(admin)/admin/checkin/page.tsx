"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScanLine, CheckCircle2, XCircle } from "lucide-react";

interface CheckinResult {
  ok?: boolean;
  passenger?: string;
  seats?: number;
  event?: string;
  busNumber?: number;
  error?: string;
}

// Check-in manual del conductor: pega/escanea el QR (token) y valida.
export default function AdminCheckinPage() {
  const [token, setToken] = useState("");
  const [result, setResult] = useState<CheckinResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function checkin(e?: React.FormEvent) {
    e?.preventDefault();
    if (!token.trim()) return;
    setLoading(true);
    setResult(null);
    const res = await fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qrToken: token.trim() }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
    if (res.ok) {
      toast.success(`${data.passenger} embarcado ✅`);
      setToken("");
    } else {
      toast.error(data.error ?? "QR no válido");
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="text-center">
        <h1 className="font-display text-3xl tracking-wide">
          CHECK-IN <span className="text-brand">EMBARQUE</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Escanea o pega el código QR del pasajero. (Escáner con cámara: Fase 2)
        </p>
      </div>

      <form onSubmit={checkin} className="glass space-y-4 rounded-2xl p-6">
        <div>
          <Label htmlFor="token">Código QR del pasajero</Label>
          <Input
            id="token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Pega aquí el token QR…"
            className="mt-1 font-mono text-xs"
            autoFocus
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading || !token.trim()}>
          <ScanLine className="size-4" />
          {loading ? "Validando…" : "Validar y embarcar"}
        </Button>
      </form>

      {result && (
        <div
          className={`glass rounded-2xl p-6 text-center ${
            result.ok ? "ring-2 ring-forest" : "ring-2 ring-destructive"
          }`}
        >
          {result.ok ? (
            <>
              <CheckCircle2 className="mx-auto size-12 text-forest" />
              <p className="mt-3 font-display text-2xl tracking-wide">
                {result.passenger}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {result.event} · Bus #{result.busNumber} · {result.seats} plaza(s)
              </p>
            </>
          ) : (
            <>
              <XCircle className="mx-auto size-12 text-destructive" />
              <p className="mt-3 font-semibold text-destructive">{result.error}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
