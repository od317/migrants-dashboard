"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) {
    return (
      <div className="flex min-h-screen flex-col bg-[#121417] text-zinc-100">
        <header className="sticky top-0 z-20 border-b border-amber-900/70 bg-[#1b2433]">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <Link href="/admin/submissions" className="flex items-center gap-3 rounded-md">
              <span className="grid size-9 shrink-0 place-items-center rounded-md bg-amber-700 text-sm font-semibold text-amber-50">
                ب
              </span>
              <span>
                <span className="block text-sm font-semibold tracking-tight text-zinc-50">مساحة الباحثين</span>
                <span className="block text-xs text-zinc-400">مراجعة بلاغات العائلات ومطابقتها مع الحوادث</span>
              </span>
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-amber-700/80 bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-200">
                وضع الباحثين
              </span>
              <Link href="/" className="text-sm font-semibold text-sky-300">
                العودة إلى المرصد
              </Link>
            </div>
          </div>
        </header>
        <div className="flex-1">{children}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
