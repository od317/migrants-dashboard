"use client";

import Link from "next/link";
import { useEffect, useId, useState, type FormEvent } from "react";
import {
  getSubmissionSuggestions,
  listAdminSubmissions,
  updateAdminSubmissionStatus,
  type AdminSubmission,
  type IncidentSuggestion,
  type SubmissionStatus,
} from "@/lib/api";
import { formatRecordDate } from "@/lib/format";

const SESSION_KEY = "migrants-researcher-key";

const STATUS_LABEL: Record<SubmissionStatus, string> = {
  PENDING_REVIEW: "قيد المراجعة",
  UNDER_INVESTIGATION: "قيد البحث",
  MATCH_FOUND: "تطابق مؤكد",
  ARCHIVED: "مؤرشف",
};

const STATUS_CLASS: Record<SubmissionStatus, string> = {
  PENDING_REVIEW: "border-amber-700/80 bg-amber-500/15 text-amber-100",
  UNDER_INVESTIGATION: "border-sky-700/80 bg-sky-500/15 text-sky-100",
  MATCH_FOUND: "border-emerald-700/80 bg-emerald-500/15 text-emerald-100",
  ARCHIVED: "border-zinc-600 bg-zinc-800 text-zinc-300",
};

const FILTERS: { id: SubmissionStatus | "ALL"; label: string }[] = [
  { id: "PENDING_REVIEW", label: "قيد المراجعة" },
  { id: "UNDER_INVESTIGATION", label: "قيد البحث" },
  { id: "MATCH_FOUND", label: "تطابق مؤكد" },
  { id: "ARCHIVED", label: "مؤرشف" },
  { id: "ALL", label: "الكل" },
];

const ACTIONS: { status: SubmissionStatus; label: string }[] = [
  { status: "MATCH_FOUND", label: "تأكيد التطابق" },
  { status: "ARCHIVED", label: "حفظ في الأرشيف" },
  { status: "UNDER_INVESTIGATION", label: "قيد البحث" },
];

export function SubmissionWorkspace() {
  const keyFieldId = useId();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [draftKey, setDraftKey] = useState("");
  const [reports, setReports] = useState<AdminSubmission[]>([]);
  const [filter, setFilter] = useState<SubmissionStatus | "ALL">("PENDING_REVIEW");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AdminSubmission | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) setApiKey(stored);
  }, []);

  useEffect(() => {
    if (!apiKey) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    listAdminSubmissions(apiKey).then((result) => {
      if (cancelled) return;
      setLoading(false);
      if (!result.ok) {
        setError(failureText(result.status));
        if (result.status === 401) {
          sessionStorage.removeItem(SESSION_KEY);
          setApiKey(null);
        }
        return;
      }
      setReports(result.data);
    });
    return () => {
      cancelled = true;
    };
  }, [apiKey]);

  const visible = reports.filter((report) => filter === "ALL" || report.status === filter);

  function unlock(event: FormEvent) {
    event.preventDefault();
    const next = draftKey.trim();
    if (!next) return;
    sessionStorage.setItem(SESSION_KEY, next);
    setApiKey(next);
    setDraftKey("");
  }

  function lock() {
    sessionStorage.removeItem(SESSION_KEY);
    setApiKey(null);
    setReports([]);
    setSelected(null);
    setError(null);
  }

  function applyUpdate(updated: AdminSubmission) {
    setReports((current) => current.map((report) => (report.id === updated.id ? updated : report)));
    setSelected(updated);
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-amber-200/90">منطقة آمنة</p>
          <h1 className="mt-2 font-serif text-3xl tracking-tight text-zinc-50 sm:text-4xl">
            مساحة عمل الباحثين - مراجعة البلاغات
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
            بلاغات العائلات تُعرض هنا لفريق البحث فقط، لمقارنتها مع الحوادث الموثقة. لا تظهر هذه الصفحة في بوابة العائلات.
          </p>
        </div>
        {apiKey ? (
          <button
            type="button"
            onClick={lock}
            className="rounded-lg border border-zinc-600 px-3 py-2 text-sm font-semibold text-zinc-200"
          >
            إنهاء الجلسة
          </button>
        ) : null}
      </header>

      {!apiKey ? (
        <form
          onSubmit={unlock}
          action="javascript:void(0)"
          className="mt-8 max-w-xl rounded-2xl border border-zinc-700 bg-zinc-900/80 p-5"
        >
          <label htmlFor={keyFieldId} className="block text-sm font-semibold text-zinc-100">
            مفتاح الباحثين
          </label>
          <p className="mt-1 text-sm leading-6 text-zinc-400">أدخل مفتاح فريق البحث لفتح قائمة البلاغات.</p>
          <input
            id={keyFieldId}
            type="password"
            autoComplete="off"
            value={draftKey}
            onChange={(event) => setDraftKey(event.target.value)}
            className="mt-4 w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-600"
            dir="ltr"
          />
          {error ? (
            <p className="mt-3 text-sm text-amber-200" role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" className="mt-4 rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-amber-50">
            دخول مساحة الباحثين
          </button>
        </form>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="تصفية البلاغات">
            {FILTERS.map((item) => {
              const active = filter === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(item.id)}
                  className={`rounded-full border px-3 py-1 text-sm font-semibold ${
                    active ? "border-amber-600 bg-amber-500/15 text-amber-100" : "border-zinc-700 text-zinc-300"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {error ? (
            <p className="mt-4 text-sm text-amber-200" role="alert">
              {error}
            </p>
          ) : null}

          <div className="mt-4 overflow-x-auto rounded-2xl border border-zinc-700">
            <table className="min-w-full text-right text-sm">
              <thead className="bg-zinc-900 text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">تاريخ الإرسال</th>
                  <th className="px-4 py-3 font-semibold">اسم المُبلغ</th>
                  <th className="px-4 py-3 font-semibold">اسم المفقود</th>
                  <th className="px-4 py-3 font-semibold">تاريخ فقدان الاتصال</th>
                  <th className="px-4 py-3 font-semibold">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-zinc-400">
                      جارٍ تحميل البلاغات…
                    </td>
                  </tr>
                ) : visible.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-zinc-400">
                      لا توجد بلاغات في هذا التصنيف.
                    </td>
                  </tr>
                ) : (
                  visible.map((report) => (
                    <tr key={report.id} className="border-t border-zinc-800 bg-zinc-950/40">
                      <td className="px-4 py-3 text-zinc-300">{formatRecordDate(report.createdAt)}</td>
                      <td className="px-4 py-3">{report.reporterName}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setSelected(report)}
                          className="font-semibold text-sky-300 underline-offset-4 hover:underline"
                        >
                          {report.missingPersonName}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-zinc-300">
                        {report.dateOfLoss ? formatRecordDate(report.dateOfLoss) : "غير مذكور"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={report.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {selected && apiKey ? (
        <ReviewDialog
          apiKey={apiKey}
          report={selected}
          onClose={() => setSelected(null)}
          onUpdated={applyUpdate}
        />
      ) : null}
    </div>
  );
}

function ReviewDialog({
  apiKey,
  report,
  onClose,
  onUpdated,
}: {
  apiKey: string;
  report: AdminSubmission;
  onClose: () => void;
  onUpdated: (report: AdminSubmission) => void;
}) {
  const titleId = useId();
  const [suggestions, setSuggestions] = useState<IncidentSuggestion[] | null>(null);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [saving, setSaving] = useState<SubmissionStatus | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setSuggestions(null);
    setSuggestionError(null);
    getSubmissionSuggestions(apiKey, report.id).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setSuggestionError(result.status === null ? "تعذر الاتصال بالخادم" : "تعذر تحميل اقتراحات الحوادث.");
        setSuggestions([]);
        return;
      }
      setSuggestions(result.data.suggestions);
    });
    return () => {
      cancelled = true;
    };
  }, [apiKey, report.id]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function changeStatus(status: SubmissionStatus) {
    setSaving(status);
    setActionError(null);
    const result = await updateAdminSubmissionStatus(apiKey, report.id, status);
    setSaving(null);
    if (!result.ok) {
      setActionError(result.status === null ? "تعذر الاتصال بالخادم" : "تعذر تحديث حالة البلاغ.");
      return;
    }
    onUpdated(result.data);
  }

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-black/75 p-4 sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="mx-auto my-4 w-full max-w-6xl rounded-2xl border border-zinc-700 bg-[#161a1f] p-4 shadow-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-amber-200/90">مراجعة بلاغ</p>
            <h2 id={titleId} className="mt-1 font-serif text-2xl text-zinc-50">
              {report.missingPersonName}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-zinc-600 px-3 py-1.5 text-sm text-zinc-200">
            إغلاق
          </button>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-4">
            <h3 className="font-serif text-xl text-zinc-50">بيانات العائلة</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <Fact label="اسم المُبلغ" value={report.reporterName} />
              <Fact label="صلة القرابة" value={report.relationship || "غير مذكورة"} />
              <Fact label="رقم التواصل" value={report.reporterContact} ltr />
              <Fact label="اسم المفقود" value={report.missingPersonName} />
              <Fact
                label="العمر التقريبي"
                value={report.approximateAge == null ? "غير مذكور" : report.approximateAge.toLocaleString("en-US")}
              />
              <Fact label="علامات جسدية مميزة" value={report.physicalMarks || "غير مذكورة"} />
              <Fact label="نقطة الانطلاق" value={report.lastKnownLocation || "غير مذكورة"} />
              <Fact label="تاريخ فقدان الاتصال" value={report.dateOfLoss ? formatRecordDate(report.dateOfLoss) : "غير مذكور"} />
              <Fact label="اسم أو رقم المهرب" value={report.smugglerDetails || "غير مذكور"} />
            </dl>
            <div className="mt-5">
              <p className="text-xs font-semibold text-zinc-400">تحديث حالة البلاغ</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {ACTIONS.map((action) => (
                  <button
                    key={action.status}
                    type="button"
                    disabled={saving != null || report.status === action.status}
                    onClick={() => changeStatus(action.status)}
                    className="rounded-lg border border-zinc-600 px-3 py-2 text-sm font-semibold text-zinc-100 disabled:opacity-50"
                  >
                    {saving === action.status ? "جارٍ الحفظ" : action.label}
                  </button>
                ))}
              </div>
              <div className="mt-3">
                <StatusBadge status={report.status} />
              </div>
              {actionError ? (
                <p className="mt-3 text-sm text-amber-200" role="alert">
                  {actionError}
                </p>
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-700 bg-zinc-950/50 p-4">
            <h3 className="font-serif text-xl text-zinc-50">حوادث محتملة</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              اقتراحات النظام تقارن تاريخ الفقد ونقطة الانطلاق مع الحوادث الموثقة.
            </p>
            {suggestions == null ? <p className="mt-4 text-sm text-zinc-400">جارٍ البحث في سجل الحوادث…</p> : null}
            {suggestionError ? (
              <p className="mt-4 text-sm text-amber-200" role="alert">
                {suggestionError}
              </p>
            ) : null}
            {suggestions && suggestions.length === 0 && !suggestionError ? (
              <p className="mt-4 text-sm text-zinc-400">لا توجد حوادث قريبة من تاريخ الفقد أو نقطة الانطلاق.</p>
            ) : null}
            <ul className="mt-4 space-y-3">
              {suggestions?.map((suggestion) => (
                <li key={suggestion.incidentId} className="rounded-xl border border-zinc-700 bg-zinc-900 p-4">
                  <p className="text-sm font-semibold text-amber-100">{suggestion.reason}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    مؤشر التطابق {Math.round(suggestion.confidence * 100).toLocaleString("en-US")}%
                  </p>
                  <dl className="mt-3 space-y-2 text-sm">
                    <Fact label="تاريخ الحادثة" value={suggestion.date ? formatRecordDate(suggestion.date) : "غير معروف"} />
                    <Fact label="الموقع" value={suggestion.location || "غير مسجّل"} />
                    <Fact
                      label="الضحايا"
                      value={suggestion.casualties == null ? "غير مسجّل" : suggestion.casualties.toLocaleString("en-US")}
                    />
                  </dl>
                  <Link
                    href={`/incidents/${suggestion.incidentId}`}
                    className="mt-3 inline-block text-sm font-semibold text-sky-300"
                  >
                    عرض ملف الحادثة
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: SubmissionStatus }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLASS[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

function Fact({ label, value, ltr = false }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-zinc-500">{label}</dt>
      <dd className={`mt-0.5 whitespace-pre-wrap text-zinc-100 ${ltr ? "text-left" : ""}`} dir={ltr ? "ltr" : undefined}>
        {value}
      </dd>
    </div>
  );
}

function failureText(status: number | null): string {
  if (status === 401) return "مفتاح الباحثين غير مقبول. أدخل المفتاح المعتمد لفريق البحث.";
  if (status == null) return "تعذر الاتصال بالخادم";
  return "تعذر تحميل البلاغات.";
}
