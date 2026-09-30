export default function SearchLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6" aria-busy="true">
      <div className="h-4 w-28 animate-pulse rounded bg-line" />
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="h-52 animate-pulse rounded-xl border border-line bg-surface" />
        <div className="h-52 animate-pulse rounded-xl border border-line bg-surface" />
      </div>
      <p className="sr-only">جارٍ البحث في السجلات</p>
    </div>
  );
}
