"use client";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="font-serif text-4xl text-ink">تعذر الاتصال بالخادم</h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-muted">
        حدث خطأ أثناء عرض الصفحة. أعد المحاولة بعد التأكد من اتصال واجهة المرصد.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white"
      >
        إعادة المحاولة
      </button>
    </main>
  );
}
