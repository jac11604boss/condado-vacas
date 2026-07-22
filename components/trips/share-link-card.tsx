"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy, Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Tarjeta con el enlace personalizado del RRPP + botones para compartir.
export function ShareLinkCard({ url, compact = false }: { url: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Enlace copiado");
    setTimeout(() => setCopied(false), 2000);
  }

  const text = encodeURIComponent("¡Vente a esta fiesta en bus conmigo! 🚌🎉");
  const encodedUrl = encodeURIComponent(url);

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div className="flex items-center gap-2 rounded-lg border border-white/15 bg-black/30 p-2">
        <p className="flex-1 truncate px-2 font-mono text-xs text-muted-foreground">
          {url}
        </p>
        <Button size="sm" variant="secondary" onClick={copy}>
          {copied ? <Check className="size-4 text-forest" /> : <Copy className="size-4" />}
          {copied ? "Copiado" : "Copiar"}
        </Button>
      </div>

      {!compact && (
        <div className="flex flex-wrap gap-2">
          <a
            href={`https://wa.me/?text=${text}%20${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-forest/20 px-3 text-xs font-semibold text-forest hover:bg-forest/30"
          >
            <Share2 className="size-3.5" /> WhatsApp
          </a>
          <a
            href={`https://t.me/share/url?url=${encodedUrl}&text=${text}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-sky-500/20 px-3 text-xs font-semibold text-sky-400 hover:bg-sky-500/30"
          >
            <Share2 className="size-3.5" /> Telegram
          </a>
          <button
            onClick={copy}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-party/20 px-3 text-xs font-semibold text-party hover:bg-party/30"
          >
            <Share2 className="size-3.5" /> Instagram (copiar)
          </button>
        </div>
      )}
    </div>
  );
}
