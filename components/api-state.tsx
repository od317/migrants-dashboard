export function ServerError({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-xl border border-dashed border-line bg-surface px-6 py-12 text-center ${className}`}>
      <h2 className="font-serif text-2xl text-ink">تعذر الاتصال بالخادم</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
        تعذّر جلب البيانات من واجهة المرصد. تأكد أن الخادم يعمل ثم أعد المحاولة.
      </p>
    </div>
  );
}

export function EmptyResults() {
  return (
    <div className="rounded-xl border border-dashed border-line bg-surface px-6 py-12 text-center">
      <h2 className="font-serif text-2xl text-ink">لا توجد نتائج مطابقة</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
        جرّب إملاءً آخر أو محافظة مختلفة، أو امسح سنة الميلاد والحالة.
      </p>
    </div>
  );
}
