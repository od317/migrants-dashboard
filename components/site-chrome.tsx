import Link from "next/link";
import { SiteNav } from "@/components/site-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 px-4 py-3 sm:px-6 lg:flex lg:justify-between">
        <Link href="/" className="flex min-w-0 items-center gap-3 rounded-md">
          <span className="grid size-9 shrink-0 place-items-center rounded-md bg-teal text-sm font-semibold text-white">
            ق
          </span>
          <span>
            <span className="block text-sm font-semibold tracking-tight text-ink">
              مركز التحليلات والتقارير الموثقة
            </span>
            <span className="hidden text-xs text-muted sm:block">
              المرصد الموحد لبيانات الهجرة والنزاع
            </span>
          </span>
        </Link>
        <SiteNav />
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <p className="mx-auto max-w-7xl px-4 py-4 text-xs leading-5 text-muted sm:px-6">
        أعداد الحوادث والتقارير وملفات الأفراد تُقرأ من واجهة المرصد.
      </p>
    </footer>
  );
}
