import type { SourceReport } from "@/lib/api";
import { reliabilityPercent } from "@/lib/format";

export type DisplayReport = {
  id: string;
  title: string;
  publisher: string;
  dataType: string;
  reliability: string;
  statuses: string[];
  formats: string[];
  href: string;
  summary: string;
  recordCount: number;
};

const FORMAT_LABELS: Record<string, string> = {
  EXCEL: "XLSX",
  CSV: "CSV",
  PDF: "PDF",
  JSON: "JSON",
  OTHER: "OTHER",
};

export function presentReport(report: SourceReport): DisplayReport {
  const kind = datasetKind(report);
  const count = report.recordCount.toLocaleString("en-US");
  return {
    id: report.id,
    title: report.originalFilename,
    publisher: report.acronym ? `${report.publisher} (${report.acronym})` : report.publisher,
    dataType: dataTypeLabel(kind, report.mandate),
    reliability: `${reliabilityPercent(report.reliabilityScore)}%`,
    statuses: ingestionBadges(report.ingestionStatus, report.recordCount),
    formats: [FORMAT_LABELS[report.format] ?? report.format],
    href: kind === "iom" ? "/incidents" : `/records/${report.id}`,
    summary: `${count} سجلًا مستوردًا من ${report.publisher}.`,
    recordCount: report.recordCount,
  };
}

function datasetKind(report: SourceReport): "iom" | "hdx" | "other" {
  const adapter = report.adapter ?? "";
  const haystack = `${report.originalFilename} ${report.acronym ?? ""}`.toLowerCase();
  if (adapter.includes("Iom") || report.acronym === "IOM" || haystack.includes("missing_migrant")) {
    return "iom";
  }
  if (
    adapter.includes("Hdx") ||
    report.acronym === "HDX" ||
    haystack.includes("acled") ||
    haystack.includes("hdx")
  ) {
    return "hdx";
  }
  return "other";
}

function dataTypeLabel(kind: "iom" | "hdx" | "other", mandate: string | null): string {
  if (kind === "iom") return "حوادث غرق وحدود";
  if (kind === "hdx") return "أحداث نزاع وقصف داخلي";
  return mandate?.trim() || "سجلات مصدرية";
}

function ingestionBadges(status: string, recordCount: number): string[] {
  if (status === "COMPLETED") {
    return recordCount > 0 ? ["مكتمل التدقيق", "بيانات حية"] : ["مكتمل التدقيق"];
  }
  if (status === "FAILED") return ["تعذر الاستيراد"];
  if (status === "PROCESSING") return ["قيد المعالجة"];
  return ["بانتظار الاستيراد"];
}
