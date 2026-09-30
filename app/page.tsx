import type { Metadata } from "next";
import Link from "next/link";
import { IncidentMapLoader } from "@/components/incident-map-loader";
import { ReportCatalogue } from "@/components/report-catalogue";
import { ServerError } from "@/components/api-state";
import { getReports } from "@/lib/api";
import { getIncidentStats, getIncidents, getSourceOrganizations } from "@/lib/incidents";
import { presentReport } from "@/lib/reports";

export const metadata: Metadata = {
  title: "مركز التحليلات والتقارير الموثقة",
  description: "المرصد الموحد لبيانات الهجرة والنزاع السوري من 2011 إلى 2026.",
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [stats, sources, preview, reports] = await Promise.all([
    getIncidentStats(),
    getSourceOrganizations(),
    getIncidents({ limit: 100, offset: 0 }),
    getReports(),
  ]);
  const deadlyRoute =
    [...stats.routes].sort((left, right) => right.casualties - left.casualties)[0]?.route ??
    stats.topRoute;
  const maxCasualties = Math.max(...stats.routes.map((route) => route.casualties), 1);

  return (
    <main>
      <section className="border-b border-line bg-teal text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-xs font-semibold tracking-[0.16em] text-white/75">
            مركز التحليلات والتقارير الموثقة
          </p>
          <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight sm:text-5xl">
            المرصد الموحد لبيانات الهجرة والنزاع السوري (2011 - 2026)
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-white/85">
            منظومة مركزية لتوحيد وتدقيق البيانات الصادرة عن المنظمات الدولية والمحلية لتتبع حركة
            المهاجرين، أحداث النزاع، وتحديد مصير المفقودين.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/incidents"
              className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-teal transition-colors duration-200 hover:bg-teal-soft"
            >
              استعراض خريطة الحوادث
            </Link>
            <Link
              href="/records"
              className="rounded-lg border border-white/40 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/10"
            >
              سجل التقارير والملفات
            </Link>
            <Link
              href="/search"
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white/90 underline-offset-4 transition-colors duration-200 hover:text-white hover:underline"
            >
              البحث عن أفراد
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi label="إجمالي الحوادث المسجلة" value={stats.totalIncidents.toLocaleString("en-US")} />
          <Kpi
            label="إجمالي الضحايا والمفقودين"
            value={stats.totalDeadAndMissing.toLocaleString("en-US")}
          />
          <Kpi label="المنظمات والجهات الموثقة" value={sources.length.toLocaleString("en-US")} />
          <Kpi label="المسارات الأكثر خطورة" value={deadlyRoute} text />
        </section>

        <section className="mt-8 rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6">
          <h2 className="text-2xl font-semibold text-ink">توزيع الضحايا حسب مسارات الهجرة</h2>
          {stats.routes.length === 0 ? (
            <p className="mt-4 text-sm text-muted">لا تتوفر بيانات مسارات من واجهة الحوادث.</p>
          ) : (
            <ul className="mt-5 space-y-4">
              {stats.routes.map((route) => (
                <li key={route.route}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-medium text-ink">{route.route}</span>
                    <span className="tabular-nums text-muted">
                      {route.casualties.toLocaleString("en-US")} وفيات ومفقودون
                      <span> · {route.incidents} حوادث</span>
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-paper">
                    <div
                      className="h-full rounded-full bg-teal transition-[width] duration-500"
                      style={{ width: `${(route.casualties / maxCasualties) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-ink">سجل التقارير والبيانات المعتمدة</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted">
            الملفات المستوردة في قاعدة البيانات، مع عدد السجلات الحي لكل ملف.
          </p>
          <div className="mt-5">
            {reports.ok ? (
              <ReportCatalogue reports={reports.data.map(presentReport)} />
            ) : (
              <ServerError />
            )}
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-3 px-5 py-4">
            <div>
              <h2 className="text-2xl font-semibold text-ink">بؤر جغرافية</h2>
              <p className="mt-1 text-sm text-muted">
                معاينة لأول {preview.items.length.toLocaleString("en-US")} سجلًا على الخريطة.
              </p>
            </div>
            <Link
              href="/incidents"
              className="text-sm font-semibold text-teal transition-colors duration-200 hover:text-ink"
            >
              فتح الخريطة التفاعلية
            </Link>
          </div>
          <div className="px-5 pb-5">
            {preview.items.length > 0 ? (
              <IncidentMapLoader incidents={preview.items} className="h-72" />
            ) : (
              <div className="grid h-72 place-items-center rounded-xl border border-dashed border-line bg-paper text-sm text-muted">
                الخريطة غير متاحة حتى تتصل واجهة الحوادث.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Kpi({ label, value, text = false }: { label: string; value: string; text?: boolean }) {
  return (
    <article className="rounded-2xl border border-line bg-surface px-4 py-4 shadow-sm">
      <p className="text-xs font-semibold text-muted">{label}</p>
      <p className={`mt-2 text-ink ${text ? "text-2xl leading-snug" : "text-4xl tabular-nums"}`}>
        {value}
      </p>
    </article>
  );
}
