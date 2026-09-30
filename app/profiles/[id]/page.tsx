import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServerError } from "@/components/api-state";
import { DossierView } from "@/components/dossier-view";
import { getProfileById } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const result = await getProfileById(id);
  if (!result.ok) return { title: result.status === 404 || result.status === 400 ? "الملف غير موجود" : "تعذر الاتصال بالخادم" };
  return {
    title: result.data.canonicalName ?? "ملف مجمّع",
    description: "سجل مجمّع من المصادر المرتبطة في قاعدة البيانات.",
  };
}

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getProfileById(id);
  if (!result.ok) {
    if (result.status === 404 || result.status === 400) notFound();
    return (
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <ServerError />
      </main>
    );
  }

  return (
    <main>
      <DossierView profile={result.data} />
    </main>
  );
}
