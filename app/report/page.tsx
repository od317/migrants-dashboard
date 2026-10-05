import type { Metadata } from "next";
import { MissingReportForm } from "@/components/missing-report-form";

export const metadata: Metadata = {
  title: "بوابة الإبلاغ الآمن عن المفقودين",
  description: "بلاغ عائلي مشفّر عن شخص مفقود، يطّلع عليه فريق البحث فقط.",
};

export default function ReportPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <MissingReportForm />
    </main>
  );
}
