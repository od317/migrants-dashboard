"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { GOVERNORATES, governorateLabel } from "@/lib/constants";
import { hasActiveFilters, readFilters, writeFilters, type ProfileFilters } from "@/lib/search";
import { STATUS_FILTERS } from "@/lib/status";

const fieldClass =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink shadow-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/30";

const emptyFilters: ProfileFilters = {
  name: "",
  governorate: "",
  birthYear: "",
  status: "",
  conflictsOnly: false,
};

export function SearchWorkspace() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = useState(() => readFilters(searchParams));
  const filtering = hasActiveFilters(filters);

  function update(partial: Partial<ProfileFilters>) {
    const nextFilters = { ...filters, ...partial };
    setFilters(nextFilters);
    const next = writeFilters(nextFilters);
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6 sm:pt-10">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.16em] text-teal">السجل</p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight text-ink">البحث عن المفقودين</h1>
        <p className="mt-3 text-base leading-7 text-muted">
          ابحث في السجلات المجمّعة بالاسم، ثم ضيّق النتائج حسب المحافظة وسنة الميلاد والحالة.
        </p>
      </div>

      <form
        className="mt-8 rounded-2xl border border-line bg-surface p-4 shadow-sm sm:p-5"
        role="search"
        onSubmit={(event) => event.preventDefault()}
      >
        <label className="block" htmlFor="name-search">
          <span className="mb-1.5 block text-sm font-semibold text-ink">الاسم</span>
          <input
            id="name-search"
            value={filters.name}
            onChange={(event) => update({ name: event.target.value })}
            placeholder="بالعربية أو بالإنجليزية"
            dir="auto"
            autoComplete="off"
            className={`${fieldClass} py-3 text-base`}
          />
        </label>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="block" htmlFor="governorate-filter">
            <span className="mb-1.5 block text-sm font-semibold text-ink">المحافظة</span>
            <select
              id="governorate-filter"
              value={filters.governorate}
              onChange={(event) => update({ governorate: event.target.value })}
              className={fieldClass}
            >
              <option value="">كل المحافظات</option>
              {GOVERNORATES.map((governorate) => (
                <option key={governorate} value={governorate}>
                  {governorateLabel(governorate)}
                </option>
              ))}
            </select>
          </label>

          <label className="block" htmlFor="birth-year-filter">
            <span className="mb-1.5 block text-sm font-semibold text-ink">سنة الميلاد</span>
            <input
              id="birth-year-filter"
              inputMode="numeric"
              value={filters.birthYear}
              onChange={(event) => update({ birthYear: event.target.value.replace(/\D/g, "").slice(0, 4) })}
              placeholder="أي سنة"
              className={fieldClass}
            />
          </label>

          <label className="block" htmlFor="status-filter">
            <span className="mb-1.5 block text-sm font-semibold text-ink">الحالة</span>
            <select
              id="status-filter"
              value={filters.status}
              onChange={(event) => update({ status: event.target.value as ProfileFilters["status"] })}
              className={fieldClass}
            >
              <option value="">كل الحالات</option>
              {STATUS_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end">
            <button
              type="button"
              role="switch"
              aria-checked={filters.conflictsOnly}
              onClick={() => update({ conflictsOnly: !filters.conflictsOnly })}
              className="flex w-full items-center justify-between gap-3 rounded-lg border border-line bg-paper px-3 py-2 text-start"
            >
              <span className="text-sm font-semibold text-ink">إظهار التناقضات فقط</span>
              <span
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  filters.conflictsOnly ? "bg-warn" : "bg-line"
                }`}
              >
                <span
                  className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform ${
                    filters.conflictsOnly
                      ? "translate-x-5 rtl:-translate-x-5"
                      : "translate-x-0.5 rtl:-translate-x-0.5"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </form>

      {filtering ? (
        <div className="mt-4 flex justify-end">
          <button type="button" onClick={() => update(emptyFilters)} className="text-sm font-semibold text-teal">
            مسح عوامل التصفية
          </button>
        </div>
      ) : (
        <div className="mt-4" />
      )}
    </div>
  );
}
