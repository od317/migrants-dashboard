import { EmptyResults, ServerError } from "@/components/api-state";
import { ProfileCard } from "@/components/profile-card";
import { searchProfiles } from "@/lib/api";
import { birthYearQuery, hasActiveFilters, readFilters } from "@/lib/search";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = readFilters({
    get(name) {
      const value = params[name];
      return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
    },
  });
  const result = await searchProfiles({
    name: filters.name.trim() || undefined,
    governorate: filters.governorate || undefined,
    yearOfBirth: birthYearQuery(filters.birthYear),
    status: filters.status,
    hasConflict: filters.conflictsOnly || undefined,
    limit: 100,
  });
  const filtering = hasActiveFilters(filters);
  const total = result.ok ? result.data.total : 0;
  const profiles = result.ok ? result.data.data : [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6">
      <p className="text-sm text-muted" aria-live="polite">
        {result.ok
          ? filtering
            ? `${total.toLocaleString("en-US")} سجلات مطابقة`
            : `${total.toLocaleString("en-US")} سجلات`
          : "تعذر الاتصال بالخادم"}
      </p>

      {!result.ok ? (
        <div className="mt-4">
          <ServerError />
        </div>
      ) : profiles.length > 0 ? (
        <>
          <ul className="mt-4 grid list-none gap-4 lg:grid-cols-2">
            {profiles.map((profile) => (
              <li key={profile.id}>
                <ProfileCard profile={profile} />
              </li>
            ))}
          </ul>
          {total > profiles.length ? (
            <p className="mt-4 text-sm text-muted">
              يُعرض {profiles.length.toLocaleString("en-US")} من {total.toLocaleString("en-US")}.
            </p>
          ) : null}
        </>
      ) : (
        <div className="mt-4">
          <EmptyResults />
        </div>
      )}
    </div>
  );
}
