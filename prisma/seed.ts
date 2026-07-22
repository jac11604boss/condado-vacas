// CONDADO +VACAS — Seed de datos demo
// Ejecutar: npx prisma db seed
// Idempotente (upserts por slug/email).

import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

// ------------------------------------------------------------------
// Eventos reales de fiestas gallegas (ediciones futuras)
// ------------------------------------------------------------------
const events = [
  {
    slug: "festa-do-albarino-2026",
    title: "Festa do Albariño 2026",
    description:
      "La fiesta del vino por excelencia de Galicia. Catas, conciertos y fuegos artificiales en la capital del Albariño.",
    category: "fiesta-tradicional",
    startDate: new Date("2026-08-01T12:00:00+02:00"),
    endDate: new Date("2026-08-05T23:59:00+02:00"),
    location: "Pazo de Fefiñáns y casco histórico",
    municipality: "Cambados",
    province: "Pontevedra",
    lat: 42.5125,
    lng: -8.8116,
    pricePerSeat: 25,
    sourceUrl: "https://www.turismo.gal/axenda-cultural",
  },
  {
    slug: "romaria-vikinga-catoira-2026",
    title: "Romaría Vikinga de Catoira 2026",
    description:
      "Desembarco vikingo con drakkars, batalla por las Torres de Oeste y verbena. Fiesta de Interés Turístico Internacional.",
    category: "romeria",
    startDate: new Date("2026-08-02T11:00:00+02:00"),
    location: "Torres de Oeste",
    municipality: "Catoira",
    province: "Pontevedra",
    lat: 42.6667,
    lng: -8.7167,
    pricePerSeat: 20,
    sourceUrl: "https://www.turismo.gal/axenda-cultural",
  },
  {
    slug: "o-marisquino-2026",
    title: "O Marisquiño 2026",
    description:
      "El mayor festival de cultura urbana del sur de Europa: skate, BMX, breakdance, graffiti y conciertos frente al mar.",
    category: "festival",
    startDate: new Date("2026-08-07T16:00:00+02:00"),
    endDate: new Date("2026-08-09T23:59:00+02:00"),
    location: "Puerto de Vigo",
    municipality: "Vigo",
    province: "Pontevedra",
    lat: 42.2397,
    lng: -8.7236,
    pricePerSeat: 30,
    sourceUrl: "https://www.turismo.gal/axenda-cultural",
  },
  {
    slug: "festa-do-pulpo-o-carballino-2026",
    title: "Festa do Pulpo do Carballiño 2026",
    description:
      "Miles de raciones de pulpo á feira, orquestas y la fiesta gastronómica más multitudinaria de Galicia.",
    category: "fiesta-tradicional",
    startDate: new Date("2026-08-09T10:00:00+02:00"),
    location: "Parque do Penedo",
    municipality: "O Carballiño",
    province: "Ourense",
    lat: 42.4319,
    lng: -8.0786,
    pricePerSeat: 20,
    sourceUrl: "https://www.turismo.gal/axenda-cultural",
  },
  {
    slug: "festa-da-dorna-2026",
    title: "Festa da Dorna 2026",
    description:
      "Procesión marítima, concurso de dornas y gran sardiñada en el puerto más pesquero de Europa.",
    category: "romeria",
    startDate: new Date("2026-08-24T12:00:00+02:00"),
    location: "Puerto de Ribeira",
    municipality: "Ribeira",
    province: "A Coruña",
    lat: 42.5556,
    lng: -8.9906,
    pricePerSeat: 25,
    sourceUrl: "https://www.turismo.gal/axenda-cultural",
  },
  {
    slug: "festa-da-istoria-ribadavia-2026",
    title: "Festa da Istoria de Ribadavia 2026",
    description:
      "Viaje en el tiempo a la Edad Media: judería, mercado medieval, torneos y la moneda propia de la villa.",
    category: "fiesta-tradicional",
    startDate: new Date("2026-08-29T11:00:00+02:00"),
    endDate: new Date("2026-08-30T23:59:00+02:00"),
    location: "Casco histórico",
    municipality: "Ribadavia",
    province: "Ourense",
    lat: 42.2833,
    lng: -8.1333,
    pricePerSeat: 20,
    sourceUrl: "https://www.turismo.gal/axenda-cultural",
  },
  {
    slug: "feira-franca-pontevedra-2026",
    title: "Feira Franca de Pontevedra 2026",
    description:
      "Pontevedra vuelve al siglo XVI: mercado medieval, justas, halconería y música tradicional en todo el casco antiguo.",
    category: "fiesta-tradicional",
    startDate: new Date("2026-09-05T10:00:00+02:00"),
    endDate: new Date("2026-09-06T23:59:00+02:00"),
    location: "Casco histórico de Pontevedra",
    municipality: "Pontevedra",
    province: "Pontevedra",
    lat: 42.431,
    lng: -8.6444,
    pricePerSeat: 15,
    sourceUrl: "https://www.turismo.gal/axenda-cultural",
  },
  {
    slug: "san-froilan-lugo-2026",
    title: "San Froilán de Lugo 2026",
    description:
      "Las fiestas patronales de Lugo: o Polbo, atracciones, conciertos y la muralla romana como escenario.",
    category: "fiesta-tradicional",
    startDate: new Date("2026-10-04T12:00:00+02:00"),
    endDate: new Date("2026-10-12T23:59:00+02:00"),
    location: "Centro de Lugo",
    municipality: "Lugo",
    province: "Lugo",
    lat: 43.0097,
    lng: -7.556,
    pricePerSeat: 30,
    sourceUrl: "https://www.turismo.gal/axenda-cultural",
  },
  {
    slug: "rapa-das-bestas-sabucedo-2027",
    title: "Rapa das Bestas de Sabucedo 2027",
    description:
      "La lucha cuerpo a cuerpo con los caballos salvajes más famosa del mundo. Curro, aloitaores y tradición pura.",
    category: "fiesta-tradicional",
    startDate: new Date("2027-07-03T09:00:00+02:00"),
    endDate: new Date("2027-07-06T23:59:00+02:00"),
    location: "Curro de Sabucedo",
    municipality: "A Estrada",
    province: "Pontevedra",
    lat: 42.6986,
    lng: -8.3447,
    pricePerSeat: 35,
    minSeats: 30,
    sourceUrl: "https://www.turismo.gal/axenda-cultural",
  },
  {
    slug: "arde-lucus-2027",
    title: "Arde Lucus 2027",
    description:
      "Lugo se convierte en Lucus Augusti: legiones romanas, gladiadores, mercados y la muralla ardiendo en espectáculo.",
    category: "fiesta-tradicional",
    startDate: new Date("2027-06-25T12:00:00+02:00"),
    endDate: new Date("2027-06-27T23:59:00+02:00"),
    location: "Muralla de Lugo y centro histórico",
    municipality: "Lugo",
    province: "Lugo",
    lat: 43.0097,
    lng: -7.556,
    pricePerSeat: 35,
    sourceUrl: "https://www.turismo.gal/axenda-cultural",
  },
  {
    slug: "festival-ortigueira-2027",
    title: "Festival de Ortigueira 2027",
    description:
      "El gran festival celta de Galicia: gaitas, folk internacional y acampada libre en la playa de Morouzos.",
    category: "festival",
    startDate: new Date("2027-07-15T18:00:00+02:00"),
    endDate: new Date("2027-07-18T23:59:00+02:00"),
    location: "Recinto del festival, Ortigueira",
    municipality: "Ortigueira",
    province: "A Coruña",
    lat: 43.6833,
    lng: -7.85,
    pricePerSeat: 45,
    minSeats: 30,
    sourceUrl: "https://www.turismo.gal/axenda-cultural",
  },
  {
    slug: "entroido-verin-2027",
    title: "Entroido de Verín 2027",
    description:
      "Los cigarróns y sus látigos toman las calles en el carnaval más antiguo y auténtico de Galicia.",
    category: "fiesta-tradicional",
    startDate: new Date("2027-02-13T11:00:00+01:00"),
    endDate: new Date("2027-02-16T23:59:00+01:00"),
    location: "Calles de Verín",
    municipality: "Verín",
    province: "Ourense",
    lat: 41.9414,
    lng: -7.4386,
    pricePerSeat: 40,
    sourceUrl: "https://www.turismo.gal/axenda-cultural",
  },
  {
    slug: "curro-valga-2026",
    title: "Curro de Valga 2026",
    description:
      "Rapa das bestas en el Monte Xiabre: tradición, caballos salvajes y romería con orquesta hasta el amanecer.",
    category: "romeria",
    startDate: new Date("2026-08-15T09:00:00+02:00"),
    endDate: new Date("2026-08-17T23:59:00+02:00"),
    location: "Monte Xiabre",
    municipality: "Valga",
    province: "Pontevedra",
    lat: 42.7,
    lng: -8.6333,
    pricePerSeat: 20,
    sourceUrl: "https://www.turismo.gal/axenda-cultural",
  },
  {
    slug: "festa-da-filloa-pobra-brollon-2027",
    title: "Festa da Filloa da Pobra do Brollón 2027",
    description:
      "La filloa rellena de carne o de crema es la protagonista de esta fiesta gastronómica con música y artesanía.",
    category: "fiesta-tradicional",
    startDate: new Date("2027-03-14T12:00:00+01:00"),
    location: "Recinto ferial",
    municipality: "A Pobra do Brollón",
    province: "Lugo",
    lat: 42.55,
    lng: -7.3833,
    pricePerSeat: 25,
    sourceUrl: "https://www.turismo.gal/axenda-cultural",
  },
  {
    slug: "son-estrella-sinsal-2026",
    title: "SON Estrella Galicia Sinsal 2026",
    description:
      "Festival secreto en la isla de San Simón: cartel sorpresa, aforo reducido y naturaleza en estado puro.",
    category: "festival",
    startDate: new Date("2026-08-21T17:00:00+02:00"),
    endDate: new Date("2026-08-23T23:59:00+02:00"),
    location: "Isla de San Simón (embarque en Cesantes)",
    municipality: "Redondela",
    province: "Pontevedra",
    lat: 42.31,
    lng: -8.6069,
    pricePerSeat: 25,
    sourceUrl: "https://www.turismo.gal/axenda-cultural",
  },
];

// ------------------------------------------------------------------
// Usuarios demo
// ------------------------------------------------------------------
const adminUser = {
  supabaseId: "demo-admin-supabase-id",
  email: "admin@condado.gal",
  name: "Admin Condado",
  role: "ADMIN" as const,
};

const rrppUser = {
  supabaseId: "demo-maria-supabase-id",
  email: "maria.lopes@demo.gal",
  name: "María Lopes",
  role: "RRPP" as const,
};

const rrppPendingUser = {
  supabaseId: "demo-brais-supabase-id",
  email: "brais.vidal@demo.gal",
  name: "Brais Vidal",
  role: "RRPP" as const,
};

async function main() {
  console.log("🌱 Sembrando datos demo...");

  // 1. Admin
  const admin = await prisma.user.upsert({
    where: { email: adminUser.email },
    update: { role: "ADMIN" },
    create: adminUser,
  });
  console.log(`✅ Admin: ${admin.email}`);

  // 2. RRPP aprobada (María Lopes)
  const maria = await prisma.user.upsert({
    where: { email: rrppUser.email },
    update: { role: "RRPP" },
    create: rrppUser,
  });
  const mariaProfile = await prisma.rrppProfile.upsert({
    where: { code: "maria-lopes" },
    update: {},
    create: {
      userId: maria.id,
      code: "maria-lopes",
      status: "APPROVED",
      instagram: "@marialopes_gz",
      tiktok: "@marialopesgz",
      city: "Mondariz",
      bio: "RRPP de Mondariz. Si hay festa, ahí estoy 🎉",
      approvedAt: new Date(),
    },
  });
  console.log(`✅ RRPP aprobada: ${mariaProfile.code}`);

  // 3. RRPP pendiente (Brais, para probar aprobación admin)
  const brais = await prisma.user.upsert({
    where: { email: rrppPendingUser.email },
    update: {},
    create: rrppPendingUser,
  });
  await prisma.rrppProfile.upsert({
    where: { code: "brais-vidal" },
    update: {},
    create: {
      userId: brais.id,
      code: "brais-vidal",
      status: "PENDING",
      instagram: "@braisvidal",
      city: "Ourense",
    },
  });
  console.log(`✅ RRPP pendiente: brais-vidal`);

  // 4. Eventos
  for (const e of events) {
    await prisma.event.upsert({
      where: { slug: e.slug },
      update: { title: e.title },
      create: { ...e, minSeats: e.minSeats ?? 25 },
    });
  }
  console.log(`✅ ${events.length} eventos insertados`);

  // 5. Evento CUSTOM de ejemplo (creado por María)
  const customEvent = await prisma.event.upsert({
    where: { slug: "despedida-ana-baiona" },
    update: {},
    create: {
      slug: "despedida-ana-baiona",
      title: "Despedida de Ana — Baiona nocturna",
      description:
        "Despedida de soltera privada: cena en Baiona, fiesta y vuelta segura en bus. Solo grupo de Ana.",
      category: "fiesta-privada",
      startDate: new Date("2026-09-12T20:00:00+02:00"),
      location: "Puerto deportivo de Baiona",
      municipality: "Baiona",
      province: "Pontevedra",
      lat: 42.1167,
      lng: -8.85,
      source: "CUSTOM",
      createdById: maria.id,
      pricePerSeat: 18,
      minSeats: 20,
    },
  });
  console.log(`✅ Evento custom: ${customEvent.slug}`);

  // 6. Trips habilitados por María (con su Bus #1)
  const tripsSeed = [
    { eventSlug: "rapa-das-bestas-sabucedo-2027", originCity: "mondariz", lat: 42.2333, lng: -8.4667 },
    { eventSlug: "festa-do-albarino-2026", originCity: "vigo", lat: 42.2328, lng: -8.7226 },
  ];

  for (const t of tripsSeed) {
    const event = await prisma.event.findUnique({ where: { slug: t.eventSlug } });
    if (!event) continue;

    const trip = await prisma.trip.upsert({
      where: {
        eventId_rrppId_originCity: {
          eventId: event.id,
          rrppId: mariaProfile.id,
          originCity: t.originCity,
        },
      },
      update: {},
      create: {
        eventId: event.id,
        rrppId: mariaProfile.id,
        originCity: t.originCity,
        originLat: t.lat,
        originLng: t.lng,
      },
    });

    const busCount = await prisma.bus.count({ where: { tripId: trip.id } });
    if (busCount === 0) {
      await prisma.bus.create({
        data: {
          tripId: trip.id,
          number: 1,
          capacity: event.busCapacity,
        },
      });
    }
    console.log(`✅ Trip: ${event.slug} desde ${t.originCity} (+ Bus #1)`);
  }

  console.log("🎉 Seed completado");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
