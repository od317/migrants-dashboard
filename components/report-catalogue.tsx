import Link from "next/link";
import type { DisplayReport } from "@/lib/reports";

export function ReportCatalogue({ reports }: { reports: DisplayReport[] }) {
  if (reports.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-line bg-surface px-6 py-10 text-sm text-muted">
        لا توجد تقارير مستوردة.
      </p>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {reports.map((report) => (
        <article
          key={report.id}
          id={report.id}
          className="flex scroll-mt-28 flex-col rounded-2xl border border-line bg-surface p-5 shadow-sm transition-shadow duration-200 hover:shadow-md"
        >
          <div className="flex flex-wrap items-center gap-2">
            {report.statuses.map((status) => (
              <StatusBadge key={status} status={status} />
            ))}
            {report.formats.map((format) => (
              <FormatBadge key={format} format={format} />
            ))}
          </div>
          <h3 className="mt-4 text-lg font-semibold leading-8 text-ink">{report.title}</h3>
          <dl className="mt-4 space-y-2 text-sm">
            <Row label="جهة الإصدار" value={report.publisher} />
            <Row label="نوع البيانات" value={report.dataType} />
            <Row label="الموثوقية" value={report.reliability} />
            <Row label="عدد السجلات" value={report.recordCount.toLocaleString("en-US")} />
          </dl>
          <p className="mt-4 text-sm leading-6 text-muted">{report.summary}</p>
          <Link
            href={report.href}
            className="mt-5 inline-flex w-fit rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal/90"
          >
            عرض التفاصيل والتحليلات
          </Link>
        </article>
      ))}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap gap-x-2">
      <dt className="text-muted">{label}:</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const live = status === "بيانات حية";
  const failed = status === "تعذر الاستيراد";
  const tone = live
    ? "bg-emerald-100 text-emerald-900 ring-emerald-800/15"
    : failed
      ? "bg-red-100 text-red-900 ring-red-800/15"
      : "bg-teal-soft text-teal ring-teal/20";
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${tone}`}>
      {status}
    </span>
  );
}

function FormatBadge({ format }: { format: string }) {
  return (
    <span className="rounded-full bg-paper px-2.5 py-1 font-mono text-xs font-semibold text-ink ring-1 ring-inset ring-line">
      {format}
    </span>
  );
}
