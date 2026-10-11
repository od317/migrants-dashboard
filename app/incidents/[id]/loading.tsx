export default function IncidentDossierLoading() {
  return (
    <main className="min-h-full bg-[#121417] px-4 py-10 text-zinc-100 sm:px-6 sm:py-16">
      <div className="mx-auto w-full max-w-6xl">
        <div className="h-4 w-36 animate-pulse rounded bg-zinc-800" />
        <div className="mt-5 rounded-2xl border border-zinc-700 bg-zinc-900/80 p-5 sm:p-7">
          <div className="h-3 w-24 animate-pulse rounded bg-zinc-800" />
          <div className="mt-3 h-8 w-full max-w-md animate-pulse rounded bg-zinc-800" />
          <div className="mt-3 h-3 w-2/3 max-w-sm animate-pulse rounded bg-zinc-800" />
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="h-20 animate-pulse rounded-xl bg-zinc-800/80" />
            <div className="h-20 animate-pulse rounded-xl bg-zinc-800/80" />
            <div className="hidden h-20 animate-pulse rounded-xl bg-zinc-800/80 sm:block" />
            <div className="hidden h-20 animate-pulse rounded-xl bg-zinc-800/80 xl:block" />
          </div>
        </div>
        <p className="mt-6 text-sm text-zinc-400">جارٍ تحميل ملف الحادثة…</p>
      </div>
    </main>
  );
}
