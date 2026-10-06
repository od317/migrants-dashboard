import Link from "next/link";
import {
  INCIDENT_LIMITS,
  type IncidentFacetOption,
  type IncidentFacets,
  type IncidentQuery,
} from "@/lib/incidents";

type Filters = {
  search: string;
  route: string;
  year: string;
  sourceOrg: string;
  causeOfDeath: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  minCasualties: number | undefined;
  maxCasualties: number | undefined;
  hasEvidence: boolean | undefined;
  evidenceType: string;
  sort: string;
  limit: number;
};

const EVIDENCE_TYPES = [
  ["LEAK", "تسريب صحفي"],
  ["SURVIVOR_TESTIMONY", "شهادة ناجٍ"],
  ["INVESTIGATIVE_REPORT", "تحقيق استقصائي"],
  ["OFFICIAL_STATEMENT", "وثيقة رسمية"],
  ["SATELLITE_IMAGERY", "صور أقمار صناعية"],
] as const;

export function IncidentFilters({
  filters,
  facets,
}: {
  filters: Filters;
  facets: IncidentFacets;
}) {
  return (
    <form
      action="/incidents"
      method="get"
      className="grid gap-3 rounded-xl border border-zinc-700 bg-zinc-900/80 p-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      <label className="block xl:col-span-2">
        <span className="mb-1.5 block text-xs font-semibold tracking-wide text-zinc-400">
          البحث
        </span>
        <input
          name="search"
          defaultValue={filters.search}
          placeholder="البحث حسب الموقع أو المدينة..."
          className="w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-300"
        />
      </label>

      <FacetSelect name="route" label="طريق الهجرة" value={filters.route} emptyLabel="كل المسارات" options={facets.routes} />
      <FacetSelect name="year" label="السنة" value={filters.year} emptyLabel="كل السنوات" options={facets.years} />
      <FacetSelect
        name="sourceOrg"
        label="الجهة الموثقة"
        value={filters.sourceOrg}
        emptyLabel="كل الجهات"
        options={facets.sourceOrgs}
      />
      <FacetSelect
        name="causeOfDeath"
        label="السبب المسجّل"
        value={filters.causeOfDeath}
        emptyLabel="كل الأسباب"
        options={facets.causes}
      />
      <FacetSelect
        name="status"
        label="حالة الحادثة"
        value={filters.status}
        emptyLabel="كل الحالات"
        options={facets.statuses}
      />

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-zinc-400">من تاريخ</span>
        <input
          type="date"
          name="dateFrom"
          defaultValue={filters.dateFrom}
          className="w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-zinc-400">إلى تاريخ</span>
        <input
          type="date"
          name="dateTo"
          defaultValue={filters.dateTo}
          className="w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-zinc-400">أقل عدد ضحايا</span>
        <input
          type="number"
          name="minCasualties"
          min="0"
          step="1"
          defaultValue={filters.minCasualties}
          className="w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-zinc-400">أكثر عدد ضحايا</span>
        <input
          type="number"
          name="maxCasualties"
          min="0"
          step="1"
          defaultValue={filters.maxCasualties}
          className="w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-zinc-400">ترتيب النتائج</span>
        <select
          name="sort"
          defaultValue={filters.sort}
          className="w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
        >
          <option value="">الترتيب الافتراضي</option>
          <option value="date_asc">الأقدم أولًا</option>
          <option value="casualties_desc">الأكثر ضحايا أولًا</option>
          <option value="casualties_asc">الأقل ضحايا أولًا</option>
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-zinc-400">نوع الدليل</span>
        <select
          name="evidenceType"
          defaultValue={filters.evidenceType}
          className="w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
        >
          <option value="">كل أنواع الأدلة</option>
          {EVIDENCE_TYPES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-end">
        <label className="flex min-h-10 items-center gap-2 text-sm font-medium text-zinc-200">
          <input
            type="checkbox"
            name="hasEvidence"
            value="true"
            defaultChecked={filters.hasEvidence === true}
            className="size-4 accent-zinc-100"
          />
          يتضمن أدلة
        </label>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-zinc-400">عدد الصفوف</span>
        <select
          name="limit"
          defaultValue={filters.limit}
          className="w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
        >
          {INCIDENT_LIMITS.map((limit) => (
            <option key={limit} value={limit}>
              {limit} صفًا
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-end gap-3 sm:col-span-2 xl:col-span-4">
        <button
          type="submit"
          className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-950"
        >
          تطبيق المرشحات
        </button>
        <Link href="/incidents" className="text-sm font-semibold text-zinc-300 underline-offset-4 hover:underline">
          مسح الكل
        </Link>
      </div>
    </form>
  );
}

function FacetSelect({
  name,
  label,
  value,
  emptyLabel,
  options,
}: {
  name: keyof IncidentQuery;
  label: string;
  value: string;
  emptyLabel: string;
  options: IncidentFacetOption[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-zinc-400">{label}</span>
      <select
        name={name}
        defaultValue={value}
        className="w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
      >
        <option value="">{emptyLabel}</option>
        {value && !options.some((option) => option.value === value) ? (
          <option value={value}>{value}</option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.value} ({option.count.toLocaleString("en-US")})
          </option>
        ))}
      </select>
    </label>
  );
}