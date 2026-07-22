import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const events = await prisma.event.findMany({
    where: { isActive: true, startDate: { gte: new Date() } },
    select: { slug: true, updatedAt: true },
    orderBy: { startDate: "asc" },
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/eventos`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/login`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/registro`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/rrpp/solicitar`, changeFrequency: "monthly", priority: 0.6 },
  ];

  const eventRoutes: MetadataRoute.Sitemap = events.map((e) => ({
    url: `${baseUrl}/evento/${e.slug}`,
    lastModified: e.updatedAt,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [...staticRoutes, ...eventRoutes];
}
