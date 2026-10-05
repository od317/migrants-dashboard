import type { Metadata } from "next";
import { FileUploader } from "@/components/file-uploader";

export const metadata: Metadata = {
  title: "رفع الملفات والبيانات",
  description: "رفع ملفات الهجرة والنزاع بصيغ XLSX وCSV إلى قاعدة المرصد.",
};

export default function UploadPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold tracking-[0.16em] text-teal">الاستيراد</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-ink">رفع الملفات والبيانات</h1>
      <p className="mt-3 text-sm leading-7 text-muted">
        اختر نوع المجموعة، ثم أضف ملفًا. بعد اكتمال الإدخال تظهر السجلات في سجل التقارير وخريطة الحوادث.
      </p>
      <div className="mt-8">
        <FileUploader />
      </div>
    </main>
  );
}
