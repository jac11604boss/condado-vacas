"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bus,
  CalendarDays,
  Ticket,
  MapPin,
  Share2,
  Euro,
  Sparkles,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EventGrid } from "@/components/events/event-grid";
import { cn } from "@/lib/utils";
import type { TripCard } from "@/types";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const steps = [
  {
    icon: CalendarDays,
    title: "Elige tu evento",
    description:
      "Romerías, festivales y fiestas de toda Galicia. Encuentra el que te mola y mira desde dónde sale el bus.",
    color: "text-forest",
  },
  {
    icon: Ticket,
    title: "Compra tu plaza",
    description:
      "Paga online en un clic y recibe tu QR al momento. Si el bus no se confirma, te devolvemos el dinero.",
    color: "text-brand",
  },
  {
    icon: Bus,
    title: "Sube y disfruta",
    description:
      "Nada de conducir ni de buscar aparcamiento. Vas con tu gente, conoces gente nueva y vuelves seguro.",
    color: "text-party",
  },
];

const rrppPerks = [
  {
    icon: Share2,
    text: "Tu enlace personalizado para Instagram, TikTok y WhatsApp",
  },
  { icon: Euro, text: "Comisión por cada plaza vendida, cobro automático" },
  { icon: Sparkles, text: "Tú traes la gente, nosotros ponemos el bus" },
];

export function Landing({ trips }: { trips: TripCard[] }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      {/* Navbar */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="font-display text-2xl tracking-wide">
            CONDADO <span className="text-brand">+VACAS</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/eventos"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "hidden sm:inline-flex"
              )}
            >
              Eventos
            </Link>
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "outline" }), "border-white/15")}
            >
              Entrar
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-[92vh] items-center justify-center px-4 pt-16">
        {/* Glows decorativos */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-party/20 blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-brand/15 blur-[100px]" />
          <div className="absolute right-1/4 top-1/2 h-72 w-72 rounded-full bg-forest/15 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.5 }}
          >
            <Badge
              variant="outline"
              className="mb-6 border-white/15 px-4 py-1.5 text-sm text-muted-foreground"
            >
              <MapPin className="mr-1.5 size-3.5 text-forest" />
              Galicia · Fiestas · Bus compartido
            </Badge>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-6xl leading-[0.95] tracking-wide sm:text-7xl md:text-8xl"
          >
            A LA FIESTA <span className="text-brand">EN BUS</span>.
            <br />
            SIN COCHE. <span className="text-party">SIN LÍOS.</span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
          >
            Tu RRPP favorito organiza el viaje, tú solo compras tu plaza y
            subes. Rapa das Bestas, Arde Lucus, festivales y romerías:{" "}
            <span className="font-accent text-xl text-foreground">
              nosotros conducimos, tú disfrutas.
            </span>
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/eventos"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 px-8 text-base font-semibold"
              )}
            >
              Ver próximos eventos
            </Link>
            <Link
              href="/rrpp/solicitar"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-12 border-white/15 px-8 text-base"
              )}
            >
              Gana dinero como RRPP
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="mx-auto max-w-6xl px-4 py-24">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="text-center font-display text-4xl tracking-wide sm:text-5xl"
        >
          ¿CÓMO <span className="text-brand">FUNCIONA</span>?
        </motion.h2>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="glass rounded-2xl p-8"
            >
              <div className="flex items-center gap-4">
                <span className="font-display text-5xl text-white/10">
                  0{i + 1}
                </span>
                <step.icon className={`size-8 ${step.color}`} />
              </div>
              <h3 className="mt-4 font-display text-2xl tracking-wide">
                {step.title.toUpperCase()}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Próximos eventos con bus */}
      {trips.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="flex items-end justify-between"
          >
            <div>
              <h2 className="font-display text-4xl tracking-wide sm:text-5xl">
                PRÓXIMOS <span className="text-brand">BUSES</span>
              </h2>
              <p className="mt-2 text-muted-foreground">
                Eventos con bus habilitado ahora mismo.
              </p>
            </div>
            <Link
              href="/eventos"
              className="hidden font-semibold text-brand hover:underline sm:block"
            >
              Ver todos →
            </Link>
          </motion.div>
          <div className="mt-10">
            <EventGrid trips={trips} />
          </div>
        </section>
      )}

      {/* Sección RRPP */}
      <section className="relative px-4 py-24">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-party/10 to-transparent" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-4 bg-party/20 text-party hover:bg-party/30">
              Para RRPP
            </Badge>
            <h2 className="font-display text-4xl leading-tight tracking-wide sm:text-5xl">
              ¿MUEVES GENTE? <br />
              <span className="text-party">GANA DINERO.</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Si tienes comunidad en Instagram o TikTok, habilita un bus para el
              evento que quieras, comparte tu enlace y cobra comisión por cada
              plaza. Sin gestionar pagos, sin hablar con la empresa de buses,
              sin dolores de cabeza.
            </p>
            <Link
              href="/rrpp/solicitar"
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-8 h-12 bg-party px-8 text-base font-semibold hover:bg-party/80"
              )}
            >
              Solicitar acceso RRPP
            </Link>
          </motion.div>

          <div className="space-y-4">
            {rrppPerks.map((perk, i) => (
              <motion.div
                key={perk.text}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeUp}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="glass flex items-center gap-4 rounded-xl p-5"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-party/20">
                  <perk.icon className="size-5 text-party" />
                </div>
                <p className="text-sm font-medium">{perk.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-4 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="font-display text-xl tracking-wide">
            CONDADO <span className="text-brand">+VACAS</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Hecho en Galicia · De la festa a tu casa, sin volante.
          </p>
        </div>
      </footer>
    </div>
  );
}
