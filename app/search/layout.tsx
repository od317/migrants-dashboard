import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchWorkspace } from "@/components/search-workspace";

export const metadata: Metadata = {
  title: "البحث عن المفقودين",
  description: "البحث في السجلات المجمّعة بالاسم والمحافظة وسنة الميلاد والحالة.",
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense
        fallback={
          <div className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6">
            <div className="h-10 w-72 animate-pulse rounded bg-line" />
            <div className="mt-6 h-40 animate-pulse rounded-2xl border border-line bg-surface" />
          </div>
        }
      >
        <SearchWorkspace />
      </Suspense>
      {children}
    </>
  );
}
