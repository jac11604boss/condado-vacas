"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X, Ban } from "lucide-react";

interface AdminRrpp {
  id: string;
  code: string;
  status: string;
  name: string | null;
  email: string;
  instagram: string | null;
  tiktok: string | null;
  city: string | null;
  tripsCount: number;
  soldSeats: number;
  earnings: number;
  paidOut: number;
}

const statusBadge: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pendiente", className: "bg-amber-500/20 text-amber-400" },
  APPROVED: { label: "Aprobado", className: "bg-forest/20 text-forest" },
  REJECTED: { label: "Rechazado", className: "bg-destructive/20 text-destructive" },
  DISABLED: { label: "Desactivado", className: "bg-white/10 text-muted-foreground" },
};

export default function AdminRrppPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ rrpps: AdminRrpp[] }>({
    queryKey: ["admin-rrpp"],
    queryFn: async () => {
      const res = await fetch("/api/admin/rrpp");
      return res.json();
    },
  });

  async function setStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/rrpp/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success(`RRPP ${status === "APPROVED" ? "aprobado ✅" : status === "REJECTED" ? "rechazado" : "desactivado"}`);
      queryClient.invalidateQueries({ queryKey: ["admin-rrpp"] });
    } else {
      toast.error("Error actualizando");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl tracking-wide">
        GESTIÓN <span className="text-party">RRPP</span>
      </h1>

      <div className="glass overflow-hidden rounded-xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>RRPP</TableHead>
              <TableHead>Redes</TableHead>
              <TableHead>Ciudad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Viajes</TableHead>
              <TableHead className="text-right">Plazas</TableHead>
              <TableHead className="text-right">Ganado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={8}><Skeleton className="h-6 w-full" /></TableCell>
                </TableRow>
              ))
            ) : (
              data?.rrpps.map((r) => {
                const st = statusBadge[r.status];
                return (
                  <TableRow key={r.id}>
                    <TableCell>
                      <p className="font-medium">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.email} · @{r.code}</p>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {r.instagram && <p>IG {r.instagram}</p>}
                      {r.tiktok && <p>TT {r.tiktok}</p>}
                    </TableCell>
                    <TableCell>{r.city}</TableCell>
                    <TableCell>
                      <Badge className={st.className}>{st.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{r.tripsCount}</TableCell>
                    <TableCell className="text-right">{r.soldSeats}</TableCell>
                    <TableCell className="text-right text-brand">{r.earnings.toFixed(2)}€</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {r.status !== "APPROVED" && (
                          <Button variant="ghost" size="icon-sm" title="Aprobar" onClick={() => setStatus(r.id, "APPROVED")}>
                            <Check className="size-4 text-forest" />
                          </Button>
                        )}
                        {r.status === "PENDING" && (
                          <Button variant="ghost" size="icon-sm" title="Rechazar" onClick={() => setStatus(r.id, "REJECTED")}>
                            <X className="size-4 text-destructive" />
                          </Button>
                        )}
                        {r.status === "APPROVED" && (
                          <Button variant="ghost" size="icon-sm" title="Desactivar" onClick={() => setStatus(r.id, "DISABLED")}>
                            <Ban className="size-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
