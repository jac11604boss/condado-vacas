"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TriangleAlert } from "lucide-react";

interface RefundModalProps {
  tripId: string;
  eventTitle: string;
  passengers: number;
  totalAmount: number;
  open: boolean;
  onClose: () => void;
}

// Modal de confirmación de reembolso masivo.
export function RefundModal({ tripId, eventTitle, passengers, totalAmount, open, onClose }: RefundModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function refund() {
    setLoading(true);
    const res = await fetch(`/api/admin/trips/${tripId}/refund`, { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      toast.error(data.error ?? "Error en el reembolso");
      return;
    }
    toast.success(`Reembolsados ${data.refunded} pagos (${data.totalAmount}€)${data.failed ? ` · ${data.failed} fallidos` : ""}`);
    onClose();
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl tracking-wide">
            <TriangleAlert className="size-5 text-destructive" />
            REEMBOLSO MASIVO
          </DialogTitle>
          <DialogDescription>
            {eventTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg bg-destructive/10 p-4 text-sm">
          <p>
            Vas a reembolsar a <strong>{passengers} pasajeros</strong> un total
            de <strong>{totalAmount.toFixed(2)}€</strong>.
          </p>
          <p className="mt-2 text-muted-foreground">
            Se devolverá el 100% a cada cliente vía Stripe, se marcará el viaje
            como cancelado y se notificará por email. Esta acción no se puede
            deshacer.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="destructive" className="flex-1" onClick={refund} disabled={loading}>
            {loading ? "Reembolsando…" : "Sí, reembolsar todo"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
