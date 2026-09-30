export default function HomeLoading() {
  return (
    <main>
      <div className="border-b border-line bg-teal/90">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="h-4 w-48 animate-pulse rounded bg-white/30" />
          <div className="mt-4 h-12 max-w-3xl animate-pulse rounded bg-white/40" />
          <div className="mt-4 h-16 max-w-2xl animate-pulse rounded bg-white/25" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-2xl border border-line bg-surface" />
          ))}
        </div>
        <div className="mt-8 h-64 animate-pulse rounded-2xl border border-line bg-surface" />
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="h-56 animate-pulse rounded-2xl border border-line bg-surface" />
          <div className="h-56 animate-pulse rounded-2xl border border-line bg-surface" />
        </div>
      </div>
    </main>
  );
}
