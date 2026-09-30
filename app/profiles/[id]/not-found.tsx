import Link from "next/link";

export default function ProfileNotFound() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold tracking-[0.16em] text-teal">الملف</p>
      <h1 className="mt-2 font-serif text-4xl text-ink">الملف غير موجود</h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-muted">
        هذا المعرّف غير موجود في قاعدة البيانات.
      </p>
      <Link href="/search" className="mt-6 inline-block text-sm font-semibold text-teal">
        العودة إلى البحث
      </Link>
    </main>
  );
}
