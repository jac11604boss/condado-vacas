import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-16">
      <Skeleton className="h-12 w-64 rounded-lg" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[2/3] rounded-2xl" />
        ))}
      </div>
    </main>
  );
}
