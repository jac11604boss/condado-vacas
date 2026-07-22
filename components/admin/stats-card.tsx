import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  accent?: "brand" | "forest" | "party";
  className?: string;
}

const accents = {
  brand: "text-brand",
  forest: "text-forest",
  party: "text-party",
};

export function StatsCard({ icon: Icon, label, value, sub, accent = "brand", className }: StatsCardProps) {
  return (
    <div className={cn("glass rounded-xl p-5", className)}>
      <div className="flex items-center justify-between">
        <Icon className={cn("size-5", accents[accent])} />
        {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
      </div>
      <p className="mt-2 font-display text-3xl">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
