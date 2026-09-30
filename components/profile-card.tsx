import Link from "next/link";
import { ConflictBadge, SourceCountBadge, StatusBadge } from "@/components/badges";
import { governorateLabel } from "@/lib/constants";
import type { ProfileSummary } from "@/lib/api";

export function ProfileCard({ profile }: { profile: ProfileSummary }) {
  const names = displayNames(profile);

  return (
    <Link
      href={`/profiles/${profile.id}`}
      className={`flex h-full flex-col overflow-hidden rounded-xl border bg-surface shadow-sm transition hover:border-teal/40 hover:shadow-md ${
        profile.hasConflict ? "border-warn/40" : "border-line"
      }`}
    >
      {profile.hasConflict ? <ConflictBadge prominent /> : null}
      <div className="flex flex-1 flex-col p-4">
        {names.arabic ? (
          <p lang="ar" dir="rtl" className="font-arabic text-lg leading-relaxed text-ink">
            {names.arabic}
          </p>
        ) : null}
        <h2 className="font-serif text-xl tracking-tight text-ink">{names.primary}</h2>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted">الحالة</span>
          <StatusBadge status={profile.resolvedStatus} />
          {profile.hasConflict ? <ConflictBadge /> : null}
          <SourceCountBadge count={profile.linkedSourceCount} />
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs tracking-wide text-muted">الموقع</dt>
            <dd className="mt-1 font-medium text-ink">
              {profile.resolvedLocation ? governorateLabel(profile.resolvedLocation) : "غير محدد"}
            </dd>
          </div>
          <div>
            <dt className="text-xs tracking-wide text-muted">سنة الميلاد</dt>
            <dd className="mt-1 font-medium tabular-nums text-ink">
              {profile.resolvedBirthYear ?? "غير محددة"}
            </dd>
          </div>
        </dl>
        <div className="mt-5 flex items-center justify-end border-t border-line pt-3 text-sm">
          <span className="font-semibold text-teal">عرض الملف</span>
        </div>
      </div>
    </Link>
  );
}

function displayNames(profile: ProfileSummary): { arabic: string | null; primary: string } {
  const names = uniqueNames(profile.canonicalName, profile.knownNames);
  const arabic = names.find((name) => /[\u0600-\u06FF]/.test(name)) ?? null;
  const latin = names.find((name) => !/[\u0600-\u06FF]/.test(name)) ?? null;
  return { arabic: arabic && arabic !== latin ? arabic : null, primary: latin ?? arabic ?? "بدون اسم" };
}

function uniqueNames(canonical: string | null, known: string[]): string[] {
  const names = [canonical, ...(known ?? [])].filter((name): name is string => Boolean(name?.trim()));
  return [...new Set(names.map((name) => name.trim()))];
}
