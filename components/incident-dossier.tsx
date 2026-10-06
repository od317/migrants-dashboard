import Link from "next/link";
import { ReliabilityPill } from "@/components/incident-badges";
import { IncidentContributionForm } from "@/components/incident-contribution-form";
import { IncidentPointMapLoader } from "@/components/incident-point-map-loader";
import { formatRecordDate } from "@/lib/format";
import {
  apiBase,
  incidentPdfUrl,
  reportingBodyLabel,
  type EvidenceType,
  type IncidentClaim,
  type IncidentDossier,
  type IncidentEvidenceItem,
} from "@/lib/incidents";

const EVIDENCE_LABELS: Record<EvidenceType, string> = {
  LEAK: "تسريب صحفي",
  SURVIVOR_TESTIMONY: "شهادة ناجٍ",
  INVESTIGATIVE_REPORT: "تحقيق استقصائي",
  OFFICIAL_STATEMENT: "وثيقة",
  SATELLITE_IMAGERY: "صور أقمار صناعية",
};

const DISAGREEMENT_LABELS = {
  reportedDead: "الوفيات المؤكدة",
  reportedMissing: "المفقودون",
  reportedSurvivors: "الناجون",
  reportedDate: "التاريخ",
} as const;

export function IncidentDossierView({ dossier }: { dossier: IncidentDossier }) {
  const primary = dossier.claims[0];
  const point = mapPoint(dossier.latitude, dossier.longitude);
  const demographics = recordedDemographics(dossier.demographics);
  const code = dossier.sourceRecordId ?? dossier.id;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Link href="/incidents" className="text-sm font-semibold text-sky-300">
        العودة إلى سجل الحوادث
      </Link>

      <header className="mt-5 rounded-2xl border border-zinc-700 bg-zinc-900/80 p-5 sm:p-7">
        <p className="text-xs font-semibold tracking-[0.16em] text-zinc-400">ملف الحادثة</p>
        <h1 className="mt-2 font-serif text-3xl tracking-tight text-zinc-50 sm:text-4xl">{code}</h1>
        <p className="mt-2 font-mono text-xs text-zinc-500">{dossier.id}</p>
        <a
          href={incidentPdfUrl(dossier.id)}
          download={`${dossier.id}.pdf`}
          className="mt-4 inline-flex rounded-lg border border-zinc-600 px-3 py-1.5 text-sm font-semibold text-sky-300 underline-offset-4 hover:bg-zinc-800 hover:underline"
        >
          تنزيل ملف PDF
        </a>
        {dossier.location ? <p className="mt-3 text-sm leading-6 text-zinc-300">{dossier.location}</p> : null}
        {dossier.causeOfDeath ? (
          <p className="mt-1 text-sm text-zinc-400">السبب المسجّل: {dossier.causeOfDeath}</p>
        ) : null}

        <dl className="mt-5 flex flex-wrap gap-3">
          <Fact label="التاريخ" value={dossier.date ? formatRecordDate(dossier.date) : "غير معروف"} />
          <Fact label="المنطقة" value={dossier.region ?? "غير مسجّلة"} />
          <div className="rounded-full border border-zinc-600 px-3 py-1 text-sm text-zinc-100">
            <span className="text-zinc-400">المسار </span>
            {dossier.route ?? "غير معروف"}
          </div>
        </dl>

        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
          <div>
            <p className="text-xs font-semibold text-zinc-400">الإحداثيات</p>
            {point ? (
              <>
                <p className="mt-1 font-mono text-sm tabular-nums text-zinc-100" dir="ltr">
                  {point.lat.toLocaleString("en-US", { maximumFractionDigits: 5 })},{" "}
                  {point.lng.toLocaleString("en-US", { maximumFractionDigits: 5 })}
                </p>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${point.lat}&mlon=${point.lng}#map=10/${point.lat}/${point.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm font-semibold text-sky-300 underline-offset-4 hover:underline"
                >
                  فتح الإحداثيات على الخريطة
                </a>
              </>
            ) : (
              <p className="mt-1 text-sm text-zinc-400">لا تتوفر إحداثيات لهذا السجل.</p>
            )}
          </div>
          {point ? <IncidentPointMapLoader lat={point.lat} lng={point.lng} /> : null}
        </div>
      </header>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="الوفيات المؤكدة" value={countLabel(primary?.reportedDead)} />
        <Metric label="المفقودون المقدَّرون" value={countLabel(primary?.reportedMissing)} />
        <Metric label="إجمالي الضحايا" value={countLabel(dossier.totalCasualties)} />
        <Metric label="الناجون" value={countLabel(primary?.reportedSurvivors)} />
      </section>

      {demographics.length > 0 ? (
        <section className="mt-4 grid gap-3 sm:grid-cols-3">
          {demographics.map((item) => (
            <Metric key={item.label} label={item.label} value={countLabel(item.value)} />
          ))}
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="font-serif text-2xl text-zinc-50">روايات المصادر والتوثيق المتقاطع</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          كل بطاقة تعرض ما سجّله مصدر واحد عن هذه الحادثة، بما في ذلك الأرقام والرواية والرابط الأصلي.
        </p>
        {dossier.contradictions.detected ? (
          <div className="mt-4 rounded-xl border border-amber-800 bg-amber-950/80 px-4 py-3 text-sm text-amber-100" role="alert">
            <p className="font-semibold">أرقام المصادر متعارضة</p>
            <ul className="mt-2 space-y-1">
              {dossier.contradictions.disagreements.map((item) => (
                <li key={item.field}>
                  {DISAGREEMENT_LABELS[item.field]}:{" "}
                  {item.values
                    .map((value) => `${reportingBodyLabel(value.organizationName)} ${formatDisagreement(item.field, value.value)}`)
                    .join(" · ")}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {dossier.claims.map((claim) => (
            <ClaimCard key={claim.id} claim={claim} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl text-zinc-50">الوثائق، التسريبات، وشهادات الناجين</h2>
        {dossier.evidence.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-zinc-700 px-4 py-8 text-center text-sm text-zinc-400">
            لا توجد وثائق أو شهادات مرفقة بعد.
          </p>
        ) : (
          <ul className="mt-4 grid gap-4">
            {dossier.evidence.map((item) => (
              <li key={item.id}>
                <EvidenceCard item={item} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <IncidentContributionForm incidentId={dossier.id} />
    </div>
  );
}

function ClaimCard({ claim }: { claim: IncidentClaim }) {
  const score = claim.sourceQuality ?? claim.organization.reliabilityScore;
  const name = reportingBodyLabel(claim.organization.name);
  return (
    <article className="rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-base font-semibold text-zinc-50">{name}</h3>
        {claim.organization.acronym ? (
          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">{claim.organization.acronym}</span>
        ) : null}
        <ReliabilityPill score={credibilityFraction(score)} />
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
        <Count label="وفيات" value={claim.reportedDead} />
        <Count label="مفقودون" value={claim.reportedMissing} />
        <Count label="ناجون" value={claim.reportedSurvivors} />
      </dl>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-300">{claim.summary}</p>
      {claim.sourceUrl ? (
        <a
          href={claim.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex rounded-lg border border-zinc-600 px-3 py-1.5 text-sm font-semibold text-sky-300"
        >
          التقرير الأصلي
        </a>
      ) : (
        <p className="mt-4 text-sm text-zinc-500">لا يوجد رابط للأرشيف</p>
      )}
    </article>
  );
}

function EvidenceCard({ item }: { item: IncidentEvidenceItem }) {
  const href = attachmentHref(item.fileUrl);
  return (
    <article className="rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-950">
          {EVIDENCE_LABELS[item.type] ?? item.type}
        </span>
        {item.isVerified ? (
          <span className="rounded-full bg-emerald-950 px-2.5 py-0.5 text-xs font-semibold text-emerald-200">تم التدقيق</span>
        ) : (
          <span className="rounded-full bg-amber-950 px-2.5 py-0.5 text-xs font-semibold text-amber-100">بانتظار المراجعة</span>
        )}
      </div>
      <h3 className="mt-3 text-lg font-semibold text-zinc-50">{item.title}</h3>
      <p className="mt-1 text-xs text-zinc-400">
        <time dateTime={item.createdAt}>{formatRecordDate(item.createdAt)}</time>
        {item.submittedBy ? <span> · {item.submittedBy}</span> : null}
      </p>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-300">{item.description}</p>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex rounded-lg border border-zinc-600 px-3 py-1.5 text-sm font-semibold text-sky-300"
        >
          عرض المرفق
        </a>
      ) : null}
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-zinc-700 px-3 py-1 text-sm">
      <span className="text-zinc-400">{label} </span>
      <span className="text-zinc-100">{value}</span>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-xl border border-zinc-700 bg-zinc-900/80 px-4 py-4">
      <p className="text-xs font-semibold text-zinc-400">{label}</p>
      <p className="mt-2 font-serif text-3xl tabular-nums text-zinc-50">{value}</p>
    </article>
  );
}

function Count({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-lg bg-zinc-950 px-2 py-2">
      <dt className="text-xs text-zinc-500">{label}</dt>
      <dd className="mt-1 tabular-nums text-zinc-100">{countLabel(value)}</dd>
    </div>
  );
}

function credibilityFraction(score: number): number {
  if (!Number.isFinite(score)) return 0;
  if (score > 1 && score <= 5) return score / 5;
  if (score > 5) return Math.min(score, 100) / 100;
  return score;
}

function countLabel(value: number | null | undefined): string {
  if (value == null) return "غير مسجّل";
  return value.toLocaleString("en-US");
}

function formatDisagreement(field: keyof typeof DISAGREEMENT_LABELS, value: number | string | null): string {
  if (value == null) return "غير مسجّل";
  if (field === "reportedDate" && typeof value === "string") return formatRecordDate(value);
  if (typeof value === "number") return value.toLocaleString("en-US");
  return value;
}

function recordedDemographics(demographics: IncidentDossier["demographics"]) {
  return [
    { label: "رجال", value: demographics.men },
    { label: "نساء", value: demographics.women },
    { label: "أطفال", value: demographics.children },
  ].filter((item): item is { label: string; value: number } => item.value != null);
}

function mapPoint(lat: number | null, lng: number | null): { lat: number; lng: number } | null {
  if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

function attachmentHref(fileUrl: string | null): string | null {
  if (!fileUrl) return null;
  if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) return fileUrl;
  if (fileUrl.startsWith("/")) return `${apiBase()}${fileUrl}`;
  return fileUrl;
}
