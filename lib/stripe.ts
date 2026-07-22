import Stripe from "stripe";

// Singleton Stripe (server-side only).
// Lazy: no instanciar en module load (el build de Vercel recolecta page data
// sin env vars y el constructor de Stripe lanzaría error).
const globalForStripe = globalThis as unknown as { stripe?: Stripe };

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY no configurado");
  }
  if (!globalForStripe.stripe) {
    globalForStripe.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return globalForStripe.stripe;
}
