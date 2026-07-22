import { Landing } from "@/components/landing/landing";
import { getEnabledTrips } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featuredTrips, user] = await Promise.all([
    getEnabledTrips(8),
    getCurrentUser(),
  ]);

  const session = user
    ? {
        name: user.name,
        href:
          user.role === "ADMIN"
            ? "/admin"
            : user.role === "RRPP" && user.rrppProfile?.status === "APPROVED"
              ? "/panel"
              : user.role === "RRPP"
                ? "/rrpp/pendiente"
                : "/mi-cuenta",
      }
    : null;

  return <Landing trips={featuredTrips} session={session} />;
}
