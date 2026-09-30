import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ServerError } from "@/components/api-state";
import { getReports } from "@/lib/api";
import { presentReport } from "@/lib/reports";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ file: string }>;
}): Promise<Metadata> {
  const { file } = await params;
  const result = await getReports();
  if (!result.ok) return { title: "تعذر الاتصال بالخادم" };
  const report = result.data.find((item) => item.id === file);
  return { title: report?.originalFilename ?? "ملف المصدر غير موجود" };
}

export default async function SourceFilePage({ params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const result = await getReports();
  if (!result.ok) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <ServerError />
      </main>
    );
  }

  const source = result.data.find((item) => item.id === file);
  if (!source) notFound();
  const report = presentReport(source);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <Link href="/records" className="text-sm font-semibold text-teal">
        العودة إلى سجل التقارير
      </Link>
      <p className="mt-5 text-xs font-semibold tracking-[0.16em] text-teal">ملف المصدر الأصلي</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight text-ink">{report.title}</h1>
      <dl className="mt-6 grid gap-4 rounded-2xl border border-line bg-surface p-5 sm:grid-cols-2">
        <div>
          <dt className="text-xs tracking-wide text-muted">جهة الإصدار</dt>
          <dd className="mt-1 font-medium text-ink">{report.publisher}</dd>
        </div>
        <div>
          <dt className="text-xs tracking-wide text-muted">نوع البيانات</dt>
          <dd className="mt-1 font-medium text-ink">{report.dataType}</dd>
        </div>
        <div>
          <dt className="text-xs tracking-wide text-muted">عدد السجلات</dt>
          <dd className="mt-1 font-medium tabular-nums text-ink">{report.recordCount.toLocaleString("en-US")}</dd>
        </div>
        <div>
          <dt className="text-xs tracking-wide text-muted">الصيغة</dt>
          <dd className="mt-1 font-medium text-ink">{report.formats.join(" · ")}</dd>
        </div>
        <div>
          <dt className="text-xs tracking-wide text-muted">الموثوقية</dt>
          <dd className="mt-1 font-medium text-ink">{report.reliability}</dd>
        </div>
        <div>
          <dt className="text-xs tracking-wide text-muted">حالة الاستيراد</dt>
          <dd className="mt-1 font-medium text-ink">{report.statuses.join(" · ")}</dd>
        </div>
      </dl>
    </main>
  );
}
