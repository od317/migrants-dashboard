import type { Metadata } from "next";
import Link from "next/link";
import { ServerError } from "@/components/api-state";
import { ReportCatalogue } from "@/components/report-catalogue";
import { getReports } from "@/lib/api";
import { presentReport } from "@/lib/reports";

export const metadata: Metadata = {
  title: "الملفات والمصادر",
  description: "التقارير المعتمدة في المرصد الموحد لبيانات الهجرة والنزاع.",
};

export const dynamic = "force-dynamic";

export default async function RecordsPage() {
  const reports = await getReports();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold tracking-[0.16em] text-teal">الملفات والمصادر</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-ink">سجل التقارير والملفات</h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
        الملفات المستوردة إلى قاعدة البيانات، مع عدد السجلات الحي لكل مصدر.
      </p>
      <div className="mt-8">
        {reports.ok ? <ReportCatalogue reports={reports.data.map(presentReport)} /> : <ServerError />}
      </div>
      <p className="mt-8 text-sm text-muted">
        <Link href="/" className="font-semibold text-teal">
          العودة إلى لوحة التحليلات
        </Link>
      </p>
    </main>
  );
}
