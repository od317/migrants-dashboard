export default function ProfileLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6" aria-busy="true">
      <div className="h-4 w-28 animate-pulse rounded bg-line" />
      <div className="mt-6 h-56 animate-pulse rounded-2xl border border-line bg-surface" />
      <div className="mt-6 h-40 animate-pulse rounded-2xl border border-line bg-surface" />
      <div className="mt-6 h-72 animate-pulse rounded-2xl border border-line bg-surface" />
      <p className="sr-only">جارٍ تحميل الملف</p>
    </main>
  );
}
