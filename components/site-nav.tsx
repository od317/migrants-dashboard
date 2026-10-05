"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "لوحة التحليلات والتقارير" },
  { href: "/incidents", label: "خريطة الحوادث والمسارات" },
  { href: "/records", label: "الملفات والمصادر" },
  { href: "/upload", label: "رفع الملفات والبيانات" },
  { href: "/search", label: "البحث الفردي" },
  { href: "/report", label: "الإبلاغ عن مفقود" },
] as const;

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {LINKS.map((link) => {
        const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`border-b-2 pb-0.5 text-sm font-semibold transition-colors duration-200 ${
              active ? "border-teal text-ink" : "border-transparent text-teal hover:text-ink"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
