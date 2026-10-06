import type { Metadata } from "next";
import Link from "next/link";
import { CasualtyBadge, ReliabilityPill } from "@/components/incident-badges";
import { IncidentFilters } from "@/components/incident-filters";
import { IncidentMapLoader } from "@/components/incident-map-loader";
import { formatRecordDate } from "@/lib/format";
import {
  getIncidentFacets,
  getIncidentMap,
  getIncidentStats,
  getIncidents,
  getSourceOrganizations,
  incidentQueryString,
  incidentPdfUrl,
  INCIDENT_YEARS,
  normalizeLimit,
  normalizeOffset,
  type EvidenceType,
  type IncidentFacets,
  type IncidentQuery,
  type IncidentSort,
} from "@/lib/incidents";

export const metadata: Metadata = {
  title: "حوادث الهجرة",
  description: "إجمالي الحوادث وضحايا المسارات والخريطة وسجل المصادر.",
};

export const dynamic = "force-dynamic";

type SearchParams = {
  route?: string;
  year?: string;
  sourceOrg?: string;
  search?: string;
  causeOfDeath?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  minCasualties?: string;
  maxCasualties?: string;
  hasEvidence?: string;
  evidenceType?: string;
  sort?: string;
  limit?: string;
  offset?: string;
};

const EVIDENCE_TYPES: EvidenceType[] = [
  "LEAK",
  "SURVIVOR_TESTIMONY",
  "INVESTIGATIVE_REPORT",
  "OFFICIAL_STATEMENT",
  "SATELLITE_IMAGERY",
];

function readFilters(params: SearchParams): IncidentQuery {
  const year = params.year && /^\d{4}$/.test(params.year) ? params.year : undefined;
  return {
    route: params.route?.trim() || undefined,
    year,
    sourceOrg: params.sourceOrg?.trim() || undefined,
    search: params.search?.trim() || undefined,
    causeOfDeath: params.causeOfDeath?.trim() || undefined,
    status: params.status?.trim() || undefined,
    dateFrom: parseDate(params.dateFrom),
    dateTo: parseDate(params.dateTo),
    minCasualties: parseNonnegativeNumber(params.minCasualties),
    maxCasualties: parseNonnegativeNumber(params.maxCasualties),
    hasEvidence:
      params.hasEvidence === "true" ? true : params.hasEvidence === "false" ? false : undefined,
    evidenceType: isEvidenceType(params.evidenceType) ? params.evidenceType : undefined,
    sort: parseSort(params.sort),
    limit: normalizeLimit(params.limit),
    offset: normalizeOffset(params.offset),
  };
}

function hrefFor(filters: IncidentQuery, offset: number): string {
  const query = incidentQueryString({ ...filters, offset });
  return query ? `/incidents?${query}` : "/incidents";
}

function parseDate(value: string | undefined): string | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== value
    ? undefined
    : value;
}

function parseNonnegativeNumber(value: string | undefined): number | undefined {
  if (!value?.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function parseSort(value: string | undefined): IncidentSort | undefined {
  return value === "date_asc" || value === "casualties_desc" || value === "casualties_asc"
    ? value
    : undefined;
}

function isEvidenceType(value: string | undefined): value is EvidenceType {
  return value != null && EVIDENCE_TYPES.includes(value as EvidenceType);
}

function buildFilterFacets(facets: IncidentFacets, sources: Awaited<ReturnType<typeof getSourceOrganizations>>, routes: Awaited<ReturnType<typeof getIncidentStats>>["routes"]): IncidentFacets {
  return {
    routes: facets.routes.length
      ? facets.routes
      : routes.map((route) => ({ value: route.route, count: route.incidents })),
    causes: facets.causes,
    statuses: facets.statuses.length
      ? facets.statuses
      : [
          { value: "DECEASED_OR_MISSING", count: 0 },
          { value: "FATALITY_EVENT", count: 0 },
        ],
    years: facets.years.length
      ? facets.years
      : INCIDENT_YEARS.map((year) => ({ value: String(year), count: 0 })),
    sourceOrgs: facets.sourceOrgs.length
      ? facets.sourceOrgs
      : sources.map((source) => ({ value: source.name, count: source.rawRecordCount })),
  };
}

export default async function IncidentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const filters = readFilters(await searchParams);
  const { stats, page, mapped, sources, facets } = await loadIncidents(filters);
  const filterFacets = buildFilterFacets(facets, sources, stats.routes);
  const limit = page.limit;
    const start = page.total === 0 ? 0 : page.offset + 1;
    const end = Math.min(page.offset + page.items.length, page.total);
    const previousOffset = Math.max(0, page.offset - limit);
    const nextOffset = page.offset + limit < page.total ? page.offset + limit : null;
    const maxCasualties = Math.max(...stats.routes.map((route) => route.casualties), 1);

    return (
      <main className="min-h-full bg-[#121417] text-zinc-100">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
          <p className="text-xs font-semibold tracking-[0.16em] text-zinc-400">
            حوادث الهجرة والمصادر
          </p>
          <h1 className="mt-2 font-serif text-4xl tracking-tight text-zinc-50">
            سجل الحوادث
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
            الأعداد وضحايا المسارات والجهات التي وثّقت كل سجل. الأرقام تُحمّل من واجهة الحوادث.
          </p>

          <section className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="إجمالي الحوادث الموثقة" value={stats.totalIncidents.toLocaleString("en-US")} />
            <Metric
              label="إجمالي الضحايا والمفقودين"
              value={stats.totalDeadAndMissing.toLocaleString("en-US")}
            />
            <Metric label="أكثر المسارات خطورة" value={stats.topRoute} text />
            <Metric label="أبرز الجهات الراصدة" value={stats.topReportingBody} text />
          </section>

          <section className="mt-6 rounded-xl border border-zinc-700 bg-zinc-900/70 p-5">
            <h2 className="font-serif text-2xl text-zinc-50">الضحايا حسب المسار</h2>
            <ul className="mt-4 space-y-3">
              {stats.routes.map((route) => (
                <li key={route.route}>
                  <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                    <span className="text-zinc-200">{route.route}</span>
                    <span className="tabular-nums text-zinc-400">
                      {route.casualties.toLocaleString("en-US")} وفيات ومفقودون
                      <span className="text-zinc-500"> · {route.incidents} حوادث</span>
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-zinc-300"
                      style={{ width: `${(route.casualties / maxCasualties) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6">
            <h2 className="font-serif text-2xl text-zinc-50">خريطة الحوادث</h2>
            <p className="mt-1 text-sm text-zinc-400">
              {mapped.length.toLocaleString("en-US")}{" "}
              {mapped.length === 1 ? "سجل يطابق" : "سجلات تطابق"} عوامل التصفية الحالية.
              لون العلامة يتبع عدد الوفيات والمفقودين.
            </p>
            <div className="mt-3">
              <IncidentMapLoader incidents={mapped} />
            </div>
          </section>

          <section className="mt-8">
            <h2 className="font-serif text-2xl text-zinc-50">سجل الحوادث التفصيلي</h2>
            <div className="mt-3">
              <IncidentFilters
                filters={{
                  search: filters.search ?? "",
                  route: filters.route ?? "",
                  year: filters.year ?? "",
                  sourceOrg: filters.sourceOrg ?? "",
                  causeOfDeath: filters.causeOfDeath ?? "",
                  status: filters.status ?? "",
                  dateFrom: filters.dateFrom ?? "",
                  dateTo: filters.dateTo ?? "",
                  minCasualties: filters.minCasualties,
                  maxCasualties: filters.maxCasualties,
                  hasEvidence: filters.hasEvidence,
                  evidenceType: filters.evidenceType ?? "",
                  sort: filters.sort ?? "",
                  limit,
                }}
                facets={filterFacets}
              />
            </div>

            <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-700">
              <table className="min-w-220 w-full border-collapse text-start text-sm">
                <thead className="bg-zinc-900 text-xs tracking-wide text-zinc-400">
                  <tr>
                    <th className="px-3 py-3 font-semibold">التاريخ</th>
                    <th className="px-3 py-3 font-semibold">مسار الهجرة</th>
                    <th className="px-3 py-3 font-semibold">الموقع</th>
                    <th className="px-3 py-3 font-semibold">عدد الضحايا</th>
                    <th className="px-3 py-3 font-semibold">المصدر والتوثيق</th>
                    <th className="px-3 py-3 font-semibold">الرابط الأصلي</th>
                  </tr>
                </thead>
                <tbody>
                  {page.items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-10 text-center text-zinc-400">
                        لم يتم العثور على حوادث مطابقة للبحث.
                      </td>
                    </tr>
                  ) : (
                    page.items.map((incident) => (
                      <tr key={incident.id} className="border-t border-zinc-800">
                        <td className="px-3 py-3 whitespace-nowrap text-zinc-200">
                          <Link
                            href={`/incidents/${incident.id}`}
                            className="font-semibold text-sky-300 underline-offset-4 hover:underline"
                          >
                            {incident.date ? (
                              <time dateTime={incident.date}>{formatRecordDate(incident.date)}</time>
                            ) : (
                              "ملف الحادثة"
                            )}
                          </Link>
                          <a
                            href={incidentPdfUrl(incident.id)}
                            download={`${incident.id}.pdf`}
                            aria-label={`تنزيل PDF للحادثة ${incident.id}`}
                            className="mt-1 inline-flex font-semibold text-sky-300 underline-offset-4 hover:underline"
                          >
                            تنزيل PDF
                          </a>
                        </td>
                        <td className="px-3 py-3 text-zinc-200">{incident.migrationRoute ?? "غير معروف"}</td>
                        <td className="px-3 py-3 text-zinc-300">{incident.location ?? "غير معروف"}</td>
                        <td className="px-3 py-3">
                          <CasualtyBadge count={incident.deadAndMissing} />
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-zinc-100">
                              {incident.sourceOrgAcronym ?? incident.sourceOrg}
                            </span>
                            <ReliabilityPill score={incident.reliabilityScore} />
                          </div>
                          {incident.sourceOrgAcronym ? (
                            <p className="mt-1 text-xs text-zinc-500">{incident.sourceOrg}</p>
                          ) : null}
                        </td>
                        <td className="px-3 py-3">
                          {incident.sourceUrl ? (
                            <a
                              href={incident.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-sky-300 underline-offset-4 hover:underline"
                            >
                              الرابط الأصلي
                            </a>
                          ) : (
                            <span className="text-zinc-500">لا يوجد رابط</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-400">
              <p>
                عرض {start.toLocaleString("en-US")}–{end.toLocaleString("en-US")} من{" "}
                {page.total.toLocaleString("en-US")}
              </p>
              <div className="flex gap-2">
                {page.offset > 0 ? (
                  <Link
                    href={hrefFor(filters, previousOffset)}
                    className="rounded-lg border border-zinc-600 px-3 py-1.5 font-semibold text-zinc-100"
                  >
                    السابق
                  </Link>
                ) : (
                  <span className="rounded-lg border border-zinc-800 px-3 py-1.5 text-zinc-600">
                    السابق
                  </span>
                )}
                {nextOffset !== null ? (
                  <Link
                    href={hrefFor(filters, nextOffset)}
                    className="rounded-lg border border-zinc-600 px-3 py-1.5 font-semibold text-zinc-100"
                  >
                    التالي
                  </Link>
                ) : (
                  <span className="rounded-lg border border-zinc-800 px-3 py-1.5 text-zinc-600">
                    التالي
                  </span>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    );
}

async function loadIncidents(filters: IncidentQuery) {
  const [stats, page, mapped, sources, facets] = await Promise.all([
    getIncidentStats(),
    getIncidents(filters),
    getIncidentMap(filters),
    getSourceOrganizations(),
    getIncidentFacets(),
  ]);
  return { stats, page, mapped, sources, facets };
}

function Metric({ label, value, text = false }: { label: string; value: string; text?: boolean }) {
  return (
    <article className="rounded-xl border border-zinc-700 bg-zinc-900/80 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{label}</p>
      <p className={`mt-2 text-zinc-50 ${text ? "font-serif text-2xl leading-tight" : "font-serif text-4xl tabular-nums"}`}>
        {value}
      </p>
    </article>
  );
}
