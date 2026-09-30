import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="font-serif text-4xl text-ink">الصفحة غير موجودة</h1>
      <p className="mt-3 text-sm leading-6 text-muted">هذا العنوان غير موجود في لوحة البيانات.</p>
      <Link href="/search" className="mt-6 inline-block text-sm font-semibold text-teal">
        العودة إلى البحث
      </Link>
    </main>
  );
}
