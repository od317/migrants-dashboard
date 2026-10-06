"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="contents lg:block">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="site-navigation"
        onClick={() => setIsOpen((open) => !open)}
        className="justify-self-end text-sm font-semibold text-teal underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal lg:hidden"
      >
        القائمة
      </button>
      <nav
        id="site-navigation"
        className={`${isOpen ? "grid" : "hidden"} col-span-2 grid-cols-2 gap-x-4 gap-y-2 border-t border-line pt-3 lg:flex lg:items-center lg:gap-x-4 lg:gap-y-2 lg:border-0 lg:pt-0`}
      >
        {LINKS.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              onClick={() => setIsOpen(false)}
              className={`border-b-2 pb-0.5 text-sm font-semibold transition-colors duration-200 ${
                active
                  ? "border-teal text-ink"
                  : "border-transparent text-teal hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
