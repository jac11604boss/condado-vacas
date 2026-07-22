import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { z } from "zod";

const payoutSchema = z.object({
  rrppId: z.string().min(1),
  amount: z.number().positive(),
  tripId: z.string().optional(),
});

// POST /api/admin/payouts — transferencia de comisión a RRPP (Stripe Connect)
// En modo test usa STRIPE_TEST_ACCOUNT_ID si el RRPP no tiene stripeAccountId.
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const parsed = payoutSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const { rrppId, amount, tripId } = parsed.data;

  const rrpp = await prisma.rrppProfile.findUnique({ where: { id: rrppId } });
  if (!rrpp) {
    return NextResponse.json({ error: "RRPP no encontrado" }, { status: 404 });
  }

  const destination =
    rrpp.stripeAccountId ?? process.env.STRIPE_TEST_ACCOUNT_ID;
  if (!destination) {
    return NextResponse.json(
      { error: "El RRPP no tiene cuenta Connect configurada" },
      { status: 409 }
    );
  }

  try {
    const transfer = await getStripe().transfers.create({
      amount: Math.round(amount * 100),
      currency: "eur",
      destination,
      metadata: { rrppId, tripId: tripId ?? "" },
    });

    const payout = await prisma.payout.create({
      data: {
        rrppId,
        tripId,
        amount,
        stripeTransferId: transfer.id,
        status: "PAID",
      },
    });

    return NextResponse.json({
      ok: true,
      payoutId: payout.id,
      transferId: transfer.id,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error en la transferencia";
    await prisma.payout.create({
      data: { rrppId, tripId, amount, status: "FAILED" },
    });
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
