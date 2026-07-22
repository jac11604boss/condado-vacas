import { Landing } from "@/components/landing/landing";
import { getEnabledTrips } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featuredTrips = await getEnabledTrips(8);
  return <Landing trips={featuredTrips} />;
}
