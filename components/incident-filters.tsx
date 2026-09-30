"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { INCIDENT_LIMITS, INCIDENT_YEARS } from "@/lib/incidents";

type Filters = {
  search: string;
  route: string;
  year: string;
  sourceOrg: string;
  limit: number;
};

export function IncidentFilters({
  filters,
  routes,
  sources,
}: {
  filters: Filters;
  routes: string[];
  sources: { name: string; acronym: string | null }[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState(filters.search);

  function push(next: Filters) {
    const params = new URLSearchParams();
    if (next.search) params.set("search", next.search);
    if (next.route) params.set("route", next.route);
    if (next.year) params.set("year", next.year);
    if (next.sourceOrg) params.set("sourceOrg", next.sourceOrg);
    params.set("limit", String(next.limit));
    const query = params.toString();
    router.push(query ? `/incidents?${query}` : "/incidents");
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    push({ ...filters, search });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-3 rounded-xl border border-zinc-700 bg-zinc-900/80 p-4 md:grid-cols-2 xl:grid-cols-5"
    >
      <label className="block xl:col-span-2">
        <span className="mb-1.5 block text-xs font-semibold tracking-wide text-zinc-400">
          البحث
        </span>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="البحث حسب الموقع أو المدينة..."
          className="w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-300"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-400">
          طريق الهجرة
        </span>
        <select
          value={filters.route}
          onChange={(event) => push({ ...filters, search, route: event.target.value })}
          className="w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
        >
          <option value="">كل المسارات</option>
          {routes.map((route) => (
            <option key={route} value={route}>
              {route}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-400">
          السنة
        </span>
        <select
          value={filters.year}
          onChange={(event) => push({ ...filters, search, year: event.target.value })}
          className="w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
        >
          <option value="">كل السنوات</option>
          {INCIDENT_YEARS.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-400">
          الجهة الموثقة
        </span>
        <select
          value={filters.sourceOrg}
          onChange={(event) => push({ ...filters, search, sourceOrg: event.target.value })}
          className="w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
        >
          <option value="">كل الجهات</option>
          {sources.map((source) => (
            <option key={source.name} value={source.name}>
              {source.acronym ?? source.name}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-end gap-2 md:col-span-2 xl:col-span-5">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-400">
            عدد الصفوف
          </span>
          <select
            value={filters.limit}
            onChange={(event) =>
              push({ ...filters, search, limit: Number(event.target.value) })
            }
            className="rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          >
            {INCIDENT_LIMITS.map((limit) => (
              <option key={limit} value={limit}>
                {limit} صفًا
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-950"
        >
          بحث
        </button>
      </div>
    </form>
  );
}
