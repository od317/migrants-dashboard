import Link from "next/link";

export default function IncidentNotFound() {
  return (
    <main className="min-h-full bg-[#121417] px-4 py-16 text-zinc-100 sm:px-6">
      <p className="text-xs font-semibold tracking-[0.16em] text-zinc-400">ملف الحادثة</p>
      <h1 className="mt-2 font-serif text-4xl">الحادثة غير موجودة</h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-zinc-400">هذا المعرّف غير موجود في سجل الحوادث.</p>
      <Link href="/incidents" className="mt-6 inline-block text-sm font-semibold text-sky-300">
        العودة إلى سجل الحوادث
      </Link>
    </main>
  );
}
