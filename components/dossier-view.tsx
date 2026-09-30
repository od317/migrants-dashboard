"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { StatusBadge } from "@/components/badges";
import { governorateLabel } from "@/lib/constants";
import { confidenceBand, formatRecordDate, reliabilityPercent, sourceCountLabel } from "@/lib/format";
import { statusLabel } from "@/lib/status";
import type { ContradictionEntry, ProfileDetail, TimelineRecord } from "@/lib/api";

type TimedRecord = TimelineRecord & { year: number | null };

export function DossierView({ profile }: { profile: ProfileDetail }) {
  const events = useMemo(() => flattenTimeline(profile), [profile]);
  const organizations = useMemo(() => uniqueOrganizations(events), [events]);
  const years = useMemo(
    () =>
      [...new Set(events.map((event) => event.year).filter((year): year is number => year !== null))].sort(
        (left, right) => left - right,
      ),
    [events],
  );
  const [year, setYear] = useState<number | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [scrollNonce, setScrollNonce] = useState(0);
  const pendingScroll = useRef<string | null>(null);

  const visibleEvents = events.filter((event) => {
    if (organizationId && event.organization.id !== organizationId) return false;
    if (year !== null && event.year !== year) return false;
    return true;
  });
  const names = displayNames(profile);
  const confidence = averageConfidence(events);
  const contradictions = profile.hasConflict ? (profile.contradictions?.contradictions ?? []) : [];

  useEffect(() => {
    const eventId = pendingScroll.current;
    if (!eventId) return;
    pendingScroll.current = null;
    const node = document.getElementById(`event-${eventId}`);
    if (!node) return;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    node.scrollIntoView({ behavior, block: "center" });
  }, [year, organizationId, activeEventId, scrollNonce]);

  function revealClaim(claim: ContradictionEntry) {
    const match = events.find(
      (event) =>
        (event.organization.name === claim.org || event.organization.acronym === claim.org) &&
        event.rawRecord.vitalStatus === claim.status,
    );
    if (!match) return;
    pendingScroll.current = match.rawRecord.id;
    setYear(null);
    setOrganizationId(null);
    setActiveEventId(match.rawRecord.id);
    setScrollNonce((nonce) => nonce + 1);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Link href="/search" className="text-sm font-semibold text-teal">
        العودة إلى البحث
      </Link>

      <header className="mt-5 rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-7">
        <p className="text-xs font-semibold tracking-[0.16em] text-teal">المعلومات المجمّعة الموثقة</p>
        {names.arabic ? (
          <p lang="ar" dir="rtl" className="mt-4 w-fit font-arabic text-3xl leading-snug text-ink sm:text-4xl">
            {names.arabic}
          </p>
        ) : null}
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="font-serif text-4xl tracking-tight text-ink sm:text-5xl">{names.primary}</h1>
          <StatusBadge status={profile.resolvedStatus} />
        </div>
        {names.known.length > 0 ? (
          <p className="mt-3 text-sm text-muted">أسماء معروفة: {names.known.join(" · ")}</p>
        ) : null}
        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Fact
            label="الموقع"
            value={profile.resolvedLocation ? governorateLabel(profile.resolvedLocation) : "غير محدد"}
          />
          <Fact label="سنة الميلاد" value={profile.resolvedBirthYear ? String(profile.resolvedBirthYear) : "غير محددة"} numeric />
          <Fact label="عدد المصادر" value={sourceCountLabel(events.length)} />
          <ConfidenceScore score={confidence} />
        </dl>
      </header>

      {profile.hasConflict ? (
        <section className="mt-6 rounded-2xl border border-warn/30 bg-warn-soft p-5 sm:p-6" aria-label="تناقض المصادر">
          <h2 className="font-serif text-2xl text-warn">تعارض بين المصادر</h2>
          <p className="mt-1 text-sm leading-6 text-ink">
            السجلات المرتبطة بهذا الملف تتعارض في الحالة المبلّغ عنها.
          </p>
          {contradictions.length > 0 ? (
            <div
              className={`mt-5 grid gap-4 ${contradictions.length === 2 ? "lg:grid-cols-2" : "md:grid-cols-2"}`}
            >
              {contradictions.map((claim) => (
                <article key={`${claim.org}-${claim.status}-${claim.date ?? "none"}`} className="rounded-xl border border-warn/25 bg-surface p-4">
                  <p className="text-sm font-semibold text-ink">{claim.org}</p>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div>
                      <dt className="text-xs text-muted">الحالة</dt>
                      <dd className="mt-1">
                        <StatusBadge status={claim.status} />
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted">التاريخ</dt>
                      <dd className="mt-1 font-medium text-ink">
                        {claim.date ? formatRecordDate(claim.date) : "بدون تاريخ"}
                      </dd>
                    </div>
                  </dl>
                  <button
                    type="button"
                    onClick={() => revealClaim(claim)}
                    className="mt-4 text-sm font-semibold text-teal"
                  >
                    إظهار على الخط الزمني
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-ink">وُجد تعارض، لكن تفاصيل الادعاءات غير متاحة في هذا الرد.</p>
          )}
        </section>
      ) : null}

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-labelledby="timeline-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="timeline-heading" className="font-serif text-3xl tracking-tight text-ink">
                الخط الزمني
              </h2>
              <p className="mt-1 text-sm text-muted">
                السجلات الخام مرتبة زمنيًا. يُعرض {visibleEvents.length} من {events.length}.
              </p>
            </div>
            {year !== null || organizationId ? (
              <button
                type="button"
                onClick={() => {
                  setYear(null);
                  setOrganizationId(null);
                }}
                className="text-sm font-semibold text-teal"
              >
                مسح تصفية الخط الزمني
              </button>
            ) : null}
          </div>

          {years.length > 0 ? (
            <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1" role="group" aria-label="تصفية الخط الزمني حسب السنة">
              <YearButton pressed={year === null} onClick={() => setYear(null)} label="كل السنوات" />
              {years.map((timelineYear) => (
                <YearButton
                  key={timelineYear}
                  pressed={year === timelineYear}
                  onClick={() => setYear(timelineYear)}
                  label={String(timelineYear)}
                />
              ))}
            </div>
          ) : null}

          {visibleEvents.length > 0 ? (
            <ol className="mt-6 list-none border-s border-line ps-6">
              {visibleEvents.map((event) => {
                const active = activeEventId === event.rawRecord.id;
                const cited = event.conflictFlag;
                const when = event.rawRecord.eventDate ?? event.rawRecord.reportedAt ?? event.rawRecord.ingestedAt;
                return (
                  <li key={event.linkageId} id={`event-${event.rawRecord.id}`} className="relative scroll-mt-28 pb-6 last:pb-0">
                    <span
                      className={`absolute -start-[1.95rem] top-1.5 size-3 rounded-full ring-4 ring-paper ${
                        cited ? "bg-warn" : "bg-teal"
                      }`}
                      aria-hidden
                    />
                    <article
                      className={`rounded-xl border bg-surface p-4 shadow-sm ${
                        active ? "border-teal ring-2 ring-teal/30" : cited ? "border-warn/40" : "border-line"
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <time dateTime={when} className="font-serif text-lg text-ink">
                          {formatRecordDate(when)}
                        </time>
                        <StatusBadge status={event.rawRecord.vitalStatus} />
                        {cited ? <span className="text-xs font-semibold text-warn">مذكور في التناقض</span> : null}
                      </div>
                      <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                        <div>
                          <dt className="text-xs tracking-wide text-muted">الحالة</dt>
                          <dd className="mt-1 font-medium text-ink">{statusLabel(event.rawRecord.vitalStatus)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs tracking-wide text-muted">الموقع</dt>
                          <dd className="mt-1 font-medium text-ink">
                            {event.rawRecord.location ? governorateLabel(event.rawRecord.location) : "غير محدد"}
                          </dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-xs tracking-wide text-muted">الجهة المصدر</dt>
                          <dd className="mt-1 font-medium text-ink">
                            {event.organization.acronym ?? event.organization.name}
                            <span className="font-normal text-muted"> · {event.organization.name}</span>
                          </dd>
                        </div>
                      </dl>
                      {event.rawRecord.extractedName ? (
                        <p className="mt-3 text-sm text-muted">الاسم المستخرج: {event.rawRecord.extractedName}</p>
                      ) : null}
                      <div className="mt-3 border-t border-line pt-3">
                        <p className="text-xs tracking-wide text-muted">ملف المصدر</p>
                        <Link
                          href={`/records/${event.source.sourceFileId}`}
                          className="mt-1 inline-block text-sm font-semibold text-teal underline-offset-4 hover:underline"
                        >
                          {event.source.originalFilename}
                        </Link>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="mt-6 rounded-xl border border-dashed border-line bg-surface px-4 py-8 text-sm text-muted">
              لا توجد نتائج مطابقة
            </p>
          )}
        </section>

        <section
          aria-labelledby="sources-heading"
          className="rounded-2xl border border-line bg-surface p-5 shadow-sm lg:sticky lg:top-24"
        >
          <h2 id="sources-heading" className="font-serif text-2xl tracking-tight text-ink">
            الجهات المصدر
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted">اختر جهة لتصفية الخط الزمني.</p>
          {organizations.length > 0 ? (
            <ul className="mt-4 list-none space-y-3">
              {organizations.map((organization) => {
                const selected = organizationId === organization.id;
                const percent = reliabilityPercent(organization.reliabilityScore);
                return (
                  <li key={organization.id}>
                    <div
                      className={`rounded-xl border p-3 ${
                        selected ? "border-teal bg-teal-soft ring-2 ring-teal/20" : "border-line bg-paper"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setOrganizationId(selected ? null : organization.id)}
                        aria-pressed={selected}
                        className="w-full text-start"
                      >
                        <p className="font-semibold text-ink">{organization.acronym ?? organization.name}</p>
                        <p className="text-xs leading-5 text-muted">{organization.name}</p>
                      </button>
                      <div className="mt-3">
                        <div className="flex items-baseline justify-between gap-3">
                          <p className="text-xs tracking-wide text-muted">نسبة الموثوقية</p>
                          <p className="text-sm font-semibold tabular-nums text-ink">{percent}%</p>
                        </div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden>
                          <div
                            className={`h-full rounded-full ${percent < 70 ? "bg-warn" : "bg-teal"}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                      {organization.url ? (
                        <a
                          href={organization.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-block text-sm font-semibold text-teal underline-offset-4 hover:underline"
                        >
                          المصدر الأصلي
                        </a>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted">لا توجد جهات مرتبطة بهذا الملف.</p>
          )}
        </section>
      </div>
    </div>
  );
}

function flattenTimeline(profile: ProfileDetail): TimedRecord[] {
  return (profile.timeline ?? []).flatMap((group) =>
    (group.records ?? []).map((record) => ({
      ...record,
      year: group.year && /^\d{4}$/.test(group.year) ? Number(group.year) : null,
    })),
  );
}

function uniqueOrganizations(events: TimelineRecord[]): TimelineRecord["organization"][] {
  const seen = new Map<string, TimelineRecord["organization"]>();
  for (const event of events) seen.set(event.organization.id, event.organization);
  return [...seen.values()];
}

function averageConfidence(events: TimelineRecord[]): number | null {
  if (events.length === 0) return null;
  const total = events.reduce((sum, event) => sum + event.confidenceScore, 0);
  return reliabilityPercent(total / events.length);
}

function displayNames(profile: ProfileDetail): { arabic: string | null; primary: string; known: string[] } {
  const names = [...new Set([profile.canonicalName, ...(profile.knownNames ?? [])].filter((name): name is string => Boolean(name?.trim())).map((name) => name.trim()))];
  const arabic = names.find((name) => /[\u0600-\u06FF]/.test(name)) ?? null;
  const latin = names.find((name) => !/[\u0600-\u06FF]/.test(name)) ?? null;
  const primary = latin ?? arabic ?? "بدون اسم";
  return {
    arabic: arabic && arabic !== primary ? arabic : null,
    primary,
    known: names.filter((name) => name !== primary && name !== arabic),
  };
}

function Fact({ label, value, numeric = false }: { label: string; value: string; numeric?: boolean }) {
  return (
    <div className="rounded-xl bg-paper px-4 py-3">
      <dt className="text-xs tracking-wide text-muted">{label}</dt>
      <dd className={`mt-1 font-medium text-ink ${numeric ? "tabular-nums" : ""}`}>{value}</dd>
    </div>
  );
}

function ConfidenceScore({ score }: { score: number | null }) {
  if (score === null) {
    return (
      <div className="rounded-xl bg-paper px-4 py-3">
        <dt className="text-xs tracking-wide text-muted">درجة الثقة</dt>
        <dd className="mt-1 text-sm text-muted">غير متاحة</dd>
      </div>
    );
  }
  return (
    <div className="rounded-xl bg-paper px-4 py-3">
      <dt className="text-xs tracking-wide text-muted">درجة الثقة</dt>
      <dd className="mt-1 flex items-baseline gap-2">
        <span className="font-serif text-3xl tabular-nums leading-none text-ink">{score}</span>
        <span className="text-sm text-muted">{confidenceBand(score)}</span>
      </dd>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden>
        <div className={`h-full rounded-full ${score < 60 ? "bg-warn" : "bg-teal"}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function YearButton({ label, pressed, onClick }: { label: string; pressed: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`shrink-0 rounded-md px-2 py-1 text-xs font-semibold tabular-nums ${
        pressed ? "bg-teal text-white" : "bg-surface text-ink ring-1 ring-inset ring-line hover:ring-teal/40"
      }`}
    >
      {label}
    </button>
  );
}
