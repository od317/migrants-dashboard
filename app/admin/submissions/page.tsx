import type { Metadata } from "next";
import { SubmissionWorkspace } from "@/components/submission-workspace";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "مساحة عمل الباحثين - مراجعة البلاغات",
  description: "مراجعة بلاغات العائلات ومقارنتها مع الحوادث الموثقة. للباحثين المعتمدين فقط.",
};

export default function AdminSubmissionsPage() {
  return (
    <main>
      <SubmissionWorkspace />
    </main>
  );
}
