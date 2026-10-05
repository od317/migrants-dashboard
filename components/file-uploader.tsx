"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { apiBase } from "@/lib/incidents";

const MAX_BYTES = 50 * 1024 * 1024;

const DATASET_OPTIONS = [
  {
    value: "IOM_MISSING_MIGRANTS",
    label: "بيانات المنظمة الدولية للهجرة (IOM Missing Migrants - XLSX/CSV)",
  },
  {
    value: "HDX_CONFLICT",
    label: "بيانات أحداث النزاع (HDX / ACLED Conflict Data - XLSX/CSV)",
  },
  { value: "AUTO_DETECT", label: "ملف مخصص / غير محدد (كشف تلقائي)" },
] as const;

type DatasetType = (typeof DATASET_OPTIONS)[number]["value"];

type UploadResult = {
  recordsProcessed: number;
};

type Success = {
  filename: string;
  committed: number;
};

const fieldClass =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink shadow-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/30";

export function FileUploader() {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelled = useRef(false);
  const [datasetType, setDatasetType] = useState<DatasetType>("IOM_MISSING_MIGRANTS");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [phase, setPhase] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [percent, setPercent] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<Success | null>(null);

  useEffect(() => {
    cancelled.current = false;
    return () => {
      cancelled.current = true;
    };
  }, []);

  function chooseFile(next: File | null) {
    if (!next) {
      setFile(null);
      return;
    }
    const extension = next.name.split(".").pop()?.toLowerCase();
    if (extension !== "xlsx" && extension !== "csv") {
      setFile(null);
      setPhase("error");
      setError("الصيغ المدعومة: XLSX, CSV");
      return;
    }
    if (next.size > MAX_BYTES) {
      setFile(null);
      setPhase("error");
      setError("حجم الملف يتجاوز 50 ميغابايت.");
      return;
    }
    setError(null);
    setPhase("idle");
    setFile(next);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || phase === "uploading" || phase === "processing") return;
    setError(null);
    setSuccess(null);
    setPercent(0);
    setPhase("uploading");
    try {
      const result = await postUpload(file, datasetType, setPercent, () => {
        if (!cancelled.current) setPhase("processing");
      });
      if (cancelled.current) return;
      setSuccess({
        filename: file.name,
        committed: result.recordsProcessed,
      });
      setPhase("success");
    } catch (reason) {
      if (cancelled.current) return;
      setPhase("error");
      setError(reason instanceof Error ? reason.message : "تعذر الاتصال بالخادم");
    }
  }

  const busy = phase === "uploading" || phase === "processing";

  return (
    <>
      <form className="rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6" onSubmit={onSubmit}>
        <label className="block" htmlFor="dataset-type">
          <span className="mb-1.5 block text-sm font-semibold text-ink">نوع مجموعة البيانات</span>
          <select
            id="dataset-type"
            value={datasetType}
            disabled={busy}
            onChange={(event) => setDatasetType(event.target.value as DatasetType)}
            className={fieldClass}
          >
            {DATASET_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div
          className={`mt-5 rounded-2xl border-2 border-dashed px-4 py-10 text-center transition-colors ${
            dragging ? "border-teal bg-teal-soft" : "border-line bg-paper"
          }`}
          onDragEnter={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            chooseFile(event.dataTransfer.files?.[0] ?? null);
          }}
        >
          <p className="text-base font-semibold text-ink">اسحب الملف هنا أو انقر للتصفح</p>
          <p className="mt-2 text-sm text-muted">الصيغ المدعومة: XLSX, CSV</p>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="sr-only"
            disabled={busy}
            onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="mt-4 rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal/90 disabled:opacity-60"
          >
            تصفح الملفات
          </button>
          {file ? <p className="mt-4 text-sm font-medium text-ink">{file.name}</p> : null}
        </div>

        {busy ? (
          <div className="mt-5" aria-live="polite">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-ink">
                {phase === "uploading" ? "جارٍ رفع الملف" : "جارٍ إدخال السجلات"}
              </span>
              <span className="tabular-nums text-muted">{phase === "uploading" ? `${percent}%` : "…"}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-paper">
              <div
                className={`h-full rounded-full bg-teal ${phase === "processing" ? "w-full animate-pulse" : ""}`}
                style={phase === "uploading" ? { width: `${percent}%` } : undefined}
              />
            </div>
          </div>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-lg bg-warn-soft px-3 py-2 text-sm font-medium text-warn" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={!file || busy}
          className="mt-5 rounded-lg bg-teal px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal/90 disabled:opacity-60"
        >
          بدء الاستيراد
        </button>
      </form>

      {success && phase === "success" ? (
        <div className="fixed inset-0 z-30 grid place-items-center bg-ink/40 px-4" role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="upload-success-title"
            className="w-full max-w-lg rounded-2xl border border-line bg-surface p-6 shadow-lg"
          >
            <p className="text-xs font-semibold tracking-[0.16em] text-teal">اكتمل الاستيراد</p>
            <h2 id="upload-success-title" className="mt-2 text-2xl font-semibold text-ink">
              تم اعتماد الملف
            </h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex flex-wrap gap-x-2">
                <dt className="text-muted">اسم الملف:</dt>
                <dd className="font-medium text-ink">{success.filename}</dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="text-muted">السجلات المعتمدة:</dt>
                <dd className="font-medium tabular-nums text-ink">{success.committed.toLocaleString("en-US")}</dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/records" className="rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white">
                عرض سجل التقارير
              </Link>
              <Link
                href="/incidents"
                className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-teal"
              >
                عرض خريطة الحوادث
              </Link>
              <button
                type="button"
                onClick={() => setPhase("idle")}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-muted"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function postUpload(
  file: File,
  datasetType: DatasetType,
  onProgress: (percent: number) => void,
  onUploaded: () => void,
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const body = new FormData();
    body.append("file", file);
    body.append("datasetType", datasetType);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${apiBase()}/api/ingestion/upload`);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.upload.onload = () => {
      onProgress(100);
      onUploaded();
    };
    xhr.onload = () => {
      const payload = readJson(xhr.responseText);
      if (
        xhr.status >= 200 &&
        xhr.status < 300 &&
        payload?.success === true &&
        typeof payload.recordsProcessed === "number"
      ) {
        resolve({ recordsProcessed: payload.recordsProcessed });
        return;
      }
      reject(new Error(arabicFailure(payload, xhr.status)));
    };
    xhr.onerror = () => reject(new Error("تعذر الاتصال بالخادم"));
    xhr.send(body);
  });
}

function readJson(text: string): Record<string, unknown> | null {
  try {
    const value = JSON.parse(text) as unknown;
    return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function arabicFailure(payload: Record<string, unknown> | null, status: number): string {
  const message = typeof payload?.message === "string" ? payload.message : Array.isArray(payload?.message) ? String(payload.message[0]) : "";
  if (status === 0 || !payload) return "تعذر الاتصال بالخادم";
  if (/already uploaded|already been ingested/i.test(message)) return "هذا الملف مرفوع مسبقًا لهذه الجهة.";
  if (/50 MB|25 MB/i.test(message)) return "حجم الملف يتجاوز 50 ميغابايت.";
  if (/csv or xlsx/i.test(message)) return "الصيغ المدعومة: XLSX, CSV";
  if (/must be \.xlsx/i.test(message)) return "ملف المنظمة الدولية للهجرة يجب أن يكون بصيغة XLSX.";
  if (/must be \.csv/i.test(message)) return "ملف أحداث النزاع يجب أن يكون بصيغة CSV.";
  if (/could not detect/i.test(message)) return "تعذر التعرف على نوع الملف. اختر المنظمة الدولية للهجرة أو بيانات النزاع.";
  if (/queue is unavailable/i.test(message)) return "تعذر بدء المعالجة. تأكد أن خادم الاستيراد يعمل.";
  if (message) return message;
  return "تعذر الاتصال بالخادم";
}
