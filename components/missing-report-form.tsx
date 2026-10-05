"use client";

import { useState, type ReactNode } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { apiBase } from "@/lib/incidents";

const DEPARTURE_POINTS = ["زوارة", "طبرق", "تركيا", "أخرى"] as const;

const PHONE_PATTERN = /^([^\s@]+@[^\s@]+\.[^\s@]+|\+?[0-9][0-9\s().-]{6,})$/;

type DeparturePoint = (typeof DEPARTURE_POINTS)[number];

type ReportForm = {
  reporterName: string;
  relationship: string;
  reporterContact: string;
  missingPersonName: string;
  approximateAge: number;
  physicalMarks: string;
  departurePoint: DeparturePoint | "";
  otherDeparture: string;
  dateOfLoss: string;
  smugglerDetails: string;
};

const fieldClass =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink shadow-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/30";

export function MissingReportForm() {
  const [done, setDone] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReportForm>({
    defaultValues: {
      reporterName: "",
      relationship: "",
      reporterContact: "",
      missingPersonName: "",
      physicalMarks: "",
      departurePoint: "",
      otherDeparture: "",
      dateOfLoss: "",
      smugglerDetails: "",
    },
  });
  const departurePoint = watch("departurePoint");

  const onSubmit: SubmitHandler<ReportForm> = async (values) => {
    setSubmitError(null);
    const lastKnownLocation =
      values.departurePoint === "أخرى" ? values.otherDeparture.trim() : values.departurePoint;
    const smuggler = values.smugglerDetails.trim();
    try {
      const response = await fetch(`${apiBase()}/api/submissions/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reporterName: values.reporterName.trim(),
          relationship: values.relationship.trim(),
          reporterContact: values.reporterContact.trim(),
          missingPersonName: values.missingPersonName.trim(),
          approximateAge: values.approximateAge,
          physicalMarks: values.physicalMarks.trim(),
          lastKnownLocation,
          dateOfLoss: values.dateOfLoss,
          ...(smuggler ? { smugglerDetails: smuggler } : {}),
        }),
      });
      if (!response.ok) {
        setSubmitError(await failureMessage(response));
        return;
      }
      setDone(true);
    } catch {
      setSubmitError("تعذر الاتصال بالخادم");
    }
  };

  return (
    <>
      <p className="text-xs font-semibold tracking-[0.16em] text-teal">بلاغ عائلي</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-ink">بوابة الإبلاغ الآمن عن المفقودين</h1>
      <p className="mt-3 text-sm leading-7 text-muted">
        جميع البيانات المدخلة هنا مشفرة بالكامل ولا تظهر للعموم. يتم استخدامها حصراً من قبل فريق البحث لمطابقتها مع
        سجلات الحوادث والمستشفيات.
      </p>
      <p className="mt-4 rounded-xl border border-warn/30 bg-warn-soft px-4 py-3 text-sm leading-7 text-warn" role="note">
        تحذير: لا تقم بمشاركة بياناتك البنكية أو دفع أي مبالغ مالية لأي جهة تدعي معرفة مكان المفقود عبر وسائل التواصل
        الاجتماعي.
      </p>

      {done ? (
        <section
          role="status"
          className="mt-8 rounded-2xl border border-line bg-surface px-6 py-10 text-center shadow-sm"
        >
          <p className="text-xs font-semibold tracking-[0.16em] text-teal">تم الاستلام</p>
          <h2 className="mt-3 text-2xl font-semibold text-ink">تم استلام البلاغ بأمان</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted">
            تم استلام البلاغ بأمان. سيقوم فريقنا بمقاطعة البيانات مع سجلات الحوادث الموثقة والتواصل معك في حال وجود تطابق.
          </p>
        </section>
      ) : (
        <form
          className="mt-8 space-y-8 rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <fieldset className="space-y-4">
            <legend className="text-lg font-semibold text-ink">بيانات المُبلغ</legend>
            <Field label="الاسم" error={errors.reporterName?.message}>
              <input
                className={fieldClass}
                autoComplete="name"
                aria-invalid={errors.reporterName ? true : undefined}
                {...register("reporterName", {
                  required: "أدخل الاسم.",
                  maxLength: { value: 200, message: "الاسم أطول من المسموح." },
                })}
              />
            </Field>
            <Field label="صلة القرابة" error={errors.relationship?.message}>
              <input
                className={fieldClass}
                aria-invalid={errors.relationship ? true : undefined}
                {...register("relationship", {
                  required: "أدخل صلة القرابة.",
                  maxLength: { value: 100, message: "صلة القرابة أطول من المسموح." },
                })}
              />
            </Field>
            <Field label="رقم التواصل (WhatsApp/Phone)" error={errors.reporterContact?.message}>
              <input
                className={`${fieldClass} text-left`}
                dir="ltr"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+218912345678"
                aria-invalid={errors.reporterContact ? true : undefined}
                {...register("reporterContact", {
                  required: "أدخل رقم التواصل.",
                  maxLength: { value: 200, message: "رقم التواصل أطول من المسموح." },
                  pattern: { value: PHONE_PATTERN, message: "أدخل رقم هاتف أو واتساب صالحًا." },
                })}
              />
            </Field>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-lg font-semibold text-ink">بيانات المفقود</legend>
            <Field label="الاسم الكامل" error={errors.missingPersonName?.message}>
              <input
                className={fieldClass}
                aria-invalid={errors.missingPersonName ? true : undefined}
                {...register("missingPersonName", {
                  required: "أدخل الاسم الكامل.",
                  maxLength: { value: 200, message: "الاسم أطول من المسموح." },
                })}
              />
            </Field>
            <Field label="العمر التقريبي" error={errors.approximateAge?.message}>
              <input
                className={`${fieldClass} text-left`}
                dir="ltr"
                type="number"
                inputMode="numeric"
                min={0}
                max={120}
                aria-invalid={errors.approximateAge ? true : undefined}
                {...register("approximateAge", {
                  required: "أدخل العمر التقريبي.",
                  valueAsNumber: true,
                  validate: (value) =>
                    Number.isInteger(value) && value >= 0 && value <= 120 ? true : "أدخل عمرًا بين 0 و 120.",
                })}
              />
            </Field>
            <Field label="علامات جسدية مميزة (ندبات، وشوم)" error={errors.physicalMarks?.message}>
              <textarea
                className={fieldClass}
                rows={4}
                aria-invalid={errors.physicalMarks ? true : undefined}
                {...register("physicalMarks", {
                  required: "صف العلامات المميزة، أو اكتب «لا توجد».",
                  maxLength: { value: 5000, message: "النص أطول من المسموح." },
                })}
              />
            </Field>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-lg font-semibold text-ink">تفاصيل الرحلة</legend>
            <Field label="نقطة الانطلاق" error={errors.departurePoint?.message}>
              <select
                className={fieldClass}
                aria-invalid={errors.departurePoint ? true : undefined}
                {...register("departurePoint", { required: "اختر نقطة الانطلاق." })}
              >
                <option value="">اختر</option>
                {DEPARTURE_POINTS.map((point) => (
                  <option key={point} value={point}>
                    {point}
                  </option>
                ))}
              </select>
            </Field>
            {departurePoint === "أخرى" ? (
              <Field label="حدد نقطة الانطلاق" error={errors.otherDeparture?.message}>
                <input
                  className={fieldClass}
                  aria-invalid={errors.otherDeparture ? true : undefined}
                  {...register("otherDeparture", {
                    validate: (value) =>
                      departurePoint !== "أخرى" || value.trim().length > 0 ? true : "اكتب نقطة الانطلاق.",
                    maxLength: { value: 300, message: "النص أطول من المسموح." },
                  })}
                />
              </Field>
            ) : null}
            <Field label="تاريخ فقدان الاتصال" error={errors.dateOfLoss?.message}>
              <input
                className={`${fieldClass} text-left`}
                dir="ltr"
                type="date"
                aria-invalid={errors.dateOfLoss ? true : undefined}
                {...register("dateOfLoss", { required: "أدخل تاريخ فقدان الاتصال." })}
              />
            </Field>
            <Field label="اسم أو رقم المهرب (اختياري)" error={errors.smugglerDetails?.message}>
              <input
                className={fieldClass}
                aria-invalid={errors.smugglerDetails ? true : undefined}
                {...register("smugglerDetails", {
                  maxLength: { value: 5000, message: "النص أطول من المسموح." },
                })}
              />
            </Field>
          </fieldset>

          {submitError ? (
            <p className="rounded-lg bg-warn-soft px-3 py-2 text-sm font-medium text-warn" role="alert">
              {submitError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-teal px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal/90 disabled:opacity-60"
          >
            {isSubmitting ? "جارٍ الإرسال الآمن" : "إرسال البلاغ"}
          </button>
        </form>
      )}
    </>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-sm text-warn">{error}</span> : null}
    </label>
  );
}

async function failureMessage(response: Response): Promise<string> {
  if (response.status === 0) return "تعذر الاتصال بالخادم";
  try {
    const payload = (await response.json()) as { message?: unknown };
    const message = Array.isArray(payload.message) ? String(payload.message[0]) : String(payload.message ?? "");
    if (/phone number|reporterContact/i.test(message)) return "أدخل رقم هاتف أو واتساب صالحًا.";
    if (/age/i.test(message)) return "أدخل عمرًا بين 0 و 120.";
  } catch {
    return "تعذر الاتصال بالخادم";
  }
  return "تعذر إرسال البلاغ. تحقق من الحقول ثم أعد المحاولة.";
}
