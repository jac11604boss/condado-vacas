"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarDays,
  Bus,
  PlusCircle,
  Euro,
} from "lucide-react";

const links = [
  { href: "/panel", label: "Panel", icon: LayoutDashboard },
  { href: "/panel/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/panel/mis-viajes", label: "Mis viajes", icon: Bus },
  { href: "/panel/eventos/nuevo", label: "Crear evento", icon: PlusCircle },
  { href: "/panel/ganancias", label: "Ganancias", icon: Euro },
];

export function PanelNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-8 flex flex-wrap gap-2">
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-brand text-white"
                : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
            )}
          >
            <link.icon className="size-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
