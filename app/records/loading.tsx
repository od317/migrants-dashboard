export default function RecordsLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <div className="h-4 w-40 animate-pulse rounded bg-line" />
      <div className="mt-3 h-10 w-80 max-w-full animate-pulse rounded bg-line" />
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-2xl border border-line bg-surface" />
        <div className="h-64 animate-pulse rounded-2xl border border-line bg-surface" />
      </div>
    </main>
  );
}
