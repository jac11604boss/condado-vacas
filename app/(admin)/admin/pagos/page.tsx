"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Transaction {
  id: string;
  date: string;
  type: "INGRESO_CLIENTE" | "PAGO_RRPP";
  who: string;
  concept: string;
  amount: number;
  status: string;
}

interface RrppOption {
  id: string;
  code: string;
  name: string | null;
  earnings: number;
  paidOut: number;
}

export default function AdminPagosPage() {
  const queryClient = useQueryClient();
  const [typeFilter, setTypeFilter] = useState("");
  const [payoutRrpp, setPayoutRrpp] = useState<RrppOption | null>(null);
  const [amount, setAmount] = useState("");
  const [paying, setPaying] = useState(false);

  const { data, isLoading } = useQuery<{ transactions: Transaction[] }>({
    queryKey: ["admin-payments", typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (typeFilter) params.set("type", typeFilter);
      const res = await fetch(`/api/admin/payments?${params}`);
      return res.json();
    },
  });

  const { data: rrppData } = useQuery<{ rrpps: RrppOption[] }>({
    queryKey: ["admin-rrpp"],
    queryFn: async () => {
      const res = await fetch("/api/admin/rrpp");
      return res.json();
    },
  });

  const pendingPayouts = (rrppData?.rrpps ?? []).filter(
    (r) => r.earnings - r.paidOut > 0
  );

  async function payRrpp() {
    if (!payoutRrpp || !amount) return;
    setPaying(true);
    const res = await fetch("/api/admin/payouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rrppId: payoutRrpp.id, amount: parseFloat(amount) }),
    });
    const data = await res.json();
    setPaying(false);
    if (!res.ok) {
      toast.error(data.error ?? "Error en la transferencia");
      return;
    }
    toast.success(`Transferidos ${amount}€ a @${payoutRrpp.code} (${data.transferId})`);
    setPayoutRrpp(null);
    setAmount("");
    queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
    queryClient.invalidateQueries({ queryKey: ["admin-rrpp"] });
  }

  const typeBadge = (t: string) =>
    t === "INGRESO_CLIENTE"
      ? "bg-forest/20 text-forest"
      : "bg-party/20 text-party";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl tracking-wide">
          <span className="text-brand">PAGOS</span> Y TRANSACCIONES
        </h1>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-9 rounded-lg border border-white/15 bg-background px-3 text-sm"
        >
          <option value="">Todos los tipos</option>
          <option value="INGRESO_CLIENTE">Cobros clientes</option>
          <option value="PAGO_RRPP">Pagos a RRPP</option>
        </select>
      </div>

      {/* Pendientes de pagar */}
      {pendingPayouts.length > 0 && (
        <div className="glass rounded-xl p-5">
          <h2 className="mb-3 text-sm font-semibold">Comisiones pendientes de pagar</h2>
          <div className="flex flex-wrap gap-2">
            {pendingPayouts.map((r) => (
              <Button
                key={r.id}
                variant="outline"
                size="sm"
                onClick={() => {
                  setPayoutRrpp(r);
                  setAmount((r.earnings - r.paidOut).toFixed(2));
                }}
              >
                @{r.code}: {(r.earnings - r.paidOut).toFixed(2)}€
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="glass overflow-hidden rounded-xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Quién</TableHead>
              <TableHead>Concepto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Importe</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}><Skeleton className="h-6 w-full" /></TableCell>
                </TableRow>
              ))
            ) : data?.transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  Sin transacciones
                </TableCell>
              </TableRow>
            ) : (
              data?.transactions.map((t) => (
                <TableRow key={`${t.type}-${t.id}`}>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(t.date), "d MMM yy HH:mm", { locale: es })}
                  </TableCell>
                  <TableCell>
                    <Badge className={typeBadge(t.type)}>
                      {t.type === "INGRESO_CLIENTE" ? "Cobro" : "Pago RRPP"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{t.who}</TableCell>
                  <TableCell className="max-w-56 truncate text-muted-foreground">{t.concept}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-white/15 text-xs">
                      {t.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-brand">
                    {t.amount.toFixed(2)}€
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal pagar RRPP */}
      <Dialog open={!!payoutRrpp} onOpenChange={() => setPayoutRrpp(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-xl tracking-wide">
              PAGAR A @{payoutRrpp?.code}
            </DialogTitle>
            <DialogDescription>
              Transferencia Stripe Connect (modo test usa la cuenta de prueba).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Importe (€)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.5"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={payRrpp} disabled={paying || !amount}>
              {paying ? "Transfiriendo…" : `Transferir ${amount || "0"}€`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
