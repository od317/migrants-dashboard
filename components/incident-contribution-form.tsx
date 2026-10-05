"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { apiBase } from "@/lib/incidents";

const CONTRIBUTION_TYPES = [
  { value: "LEAK", label: "تسريب" },
  { value: "SURVIVOR_TESTIMONY", label: "شهادة" },
  { value: "INVESTIGATIVE_REPORT", label: "رابط تحقيق" },
  { value: "OFFICIAL_STATEMENT", label: "وثيقة" },
] as const;

const MAX_BYTES = 15 * 1024 * 1024;

const fieldClass =
  "w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-400";

export function IncidentContributionForm({ incidentId }: { incidentId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get("file");
    if (file instanceof File && file.size === 0) data.delete("file");
    if (file instanceof File && file.size > MAX_BYTES) {
      setError("حجم المرفق يتجاوز 15 ميغابايت.");
      return;
    }
    const link = String(data.get("fileUrl") ?? "").trim();
    if (!link) data.delete("fileUrl");
    const contributor = String(data.get("submittedBy") ?? "").trim();
    if (!contributor) data.delete("submittedBy");

    setPending(true);
    setError(null);
    try {
      const response = await fetch(`${apiBase()}/api/incidents/${incidentId}/evidence`, {
        method: "POST",
        body: data,
      });
      if (!response.ok) {
        setError(await failureMessage(response));
        return;
      }
      form.reset();
      setOpen(false);
      setToast(true);
      router.refresh();
      window.setTimeout(() => setToast(false), 6000);
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="mt-8">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-950"
      >
        إضافة معلومة، وثيقة، أو شهادة جديدة
      </button>

      {open ? (
        <form onSubmit={onSubmit} className="mt-4 rounded-xl border border-zinc-700 bg-zinc-900/80 p-5">
          <h2 className="font-serif text-2xl text-zinc-50">إضافة معلومة، وثيقة، أو شهادة جديدة</h2>
          <div className="mt-4 grid gap-4">
            <label className="block text-sm">
              <span className="mb-1.5 block font-semibold text-zinc-200">نوع المساهمة</span>
              <select name="type" required className={fieldClass} defaultValue="LEAK">
                {CONTRIBUTION_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-semibold text-zinc-200">عنوان الوثيقة/المعلومة</span>
              <input name="title" required maxLength={200} className={fieldClass} />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-semibold text-zinc-200">الاسم أو الصفة (اختياري)</span>
              <input name="submittedBy" maxLength={200} className={fieldClass} />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-semibold text-zinc-200">التفاصيل</span>
              <textarea name="description" required rows={5} maxLength={20000} className={fieldClass} />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-semibold text-zinc-200">رابط</span>
              <input name="fileUrl" type="url" inputMode="url" maxLength={2000} className={fieldClass} placeholder="https://" />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-semibold text-zinc-200">ملف مرفق</span>
              <input
                name="file"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.csv,.xlsx,.txt,.doc,.docx"
                className="block w-full text-sm text-zinc-300 file:ms-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-zinc-950"
              />
            </label>
          </div>
          {error ? (
            <p className="mt-4 rounded-lg bg-red-950 px-3 py-2 text-sm text-red-200" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="mt-5 rounded-lg border border-zinc-500 px-4 py-2 text-sm font-semibold text-zinc-50 disabled:opacity-60"
          >
            {pending ? "جارٍ الإرسال" : "إرسال المساهمة"}
          </button>
        </form>
      ) : null}

      {toast ? (
        <p
          role="status"
          className="fixed bottom-4 start-4 z-40 max-w-sm rounded-xl border border-emerald-800 bg-emerald-950 px-4 py-3 text-sm font-medium text-emerald-100 shadow-lg"
        >
          تم تسجيل مساهمتك بنجاح، ستتم مراجعتها وتدقيقها في المنظومة.
        </p>
      ) : null}
    </section>
  );
}

async function failureMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { message?: unknown };
    const message = Array.isArray(payload.message) ? String(payload.message[0]) : String(payload.message ?? "");
    if (/15 MB/i.test(message)) return "حجم المرفق يتجاوز 15 ميغابايت.";
    if (/pdf, image/i.test(message)) return "صيغة المرفق غير مدعومة.";
    if (response.status === 404) return "هذا السجل لم يعد موجودًا.";
  } catch {
    return "تعذر الاتصال بالخادم";
  }
  return "تعذر تسجيل المساهمة. تحقق من الحقول ثم أعد المحاولة.";
}
