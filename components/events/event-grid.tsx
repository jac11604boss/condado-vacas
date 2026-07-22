"use client";

import { motion } from "framer-motion";
import { EventPoster } from "./event-poster";
import type { TripCard } from "@/types";

// Grid responsive de pósters con animación stagger al hacer scroll.
export function EventGrid({ trips }: { trips: TripCard[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {trips.map((trip, i) => (
        <motion.div
          key={trip.tripId}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4, delay: (i % 4) * 0.08 }}
        >
          <EventPoster trip={trip} />
        </motion.div>
      ))}
    </div>
  );
}
