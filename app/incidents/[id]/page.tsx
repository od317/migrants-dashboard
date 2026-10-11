import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IncidentDossierView } from "@/components/incident-dossier";
import { getIncidentDossier } from "@/lib/incidents";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const result = await getIncidentDossier(id);
  if (!result.ok) {
    return { title: result.status === 404 || result.status === 400 ? "الحادثة غير موجودة" : "تعذر الاتصال بالخادم" };
  }
  return {
    title: result.data.sourceRecordId ?? "ملف الحادثة",
    description: "تفاصيل الحادثة وروايات المصادر والوثائق المرفقة.",
  };
}

export default async function IncidentDossierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getIncidentDossier(id);
  if (!result.ok) {
    if (result.status === 404 || result.status === 400) notFound();
    return (
      <main className="min-h-full w-full bg-[#121417] px-4 py-16 text-zinc-100 sm:px-6">
        <h1 className="font-serif text-3xl">تعذر الاتصال بالخادم</h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-zinc-400">
          تعذّر جلب ملف الحادثة. تأكد أن خادم المرصد يعمل ثم أعد المحاولة.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-full w-full bg-[#121417] text-zinc-100">
      <IncidentDossierView dossier={result.data} />
    </main>
  );
}
