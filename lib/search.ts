import { isGovernorate } from "@/lib/constants";
import { isVitalStatus, type VitalStatus } from "@/lib/status";

export interface ProfileFilters {
  name: string;
  governorate: string;
  birthYear: string;
  status: VitalStatus | "";
  conflictsOnly: boolean;
}

type ParamSource = {
  get(name: string): string | null;
};

export function readFilters(params: ParamSource): ProfileFilters {
  const status = params.get("status") ?? "";
  const governorate = params.get("governorate") ?? "";

  return {
    name: params.get("q") ?? params.get("name") ?? "",
    governorate: isGovernorate(governorate) ? governorate : "",
    birthYear: (params.get("year") ?? params.get("yearOfBirth") ?? "").replace(/\D/g, "").slice(0, 4),
    status: isVitalStatus(status) ? status : "",
    conflictsOnly: params.get("conflicts") === "1" || params.get("hasConflict") === "true",
  };
}

export function writeFilters(filters: ProfileFilters): string {
  const params = new URLSearchParams();
  if (filters.name) params.set("q", filters.name);
  if (filters.governorate) params.set("governorate", filters.governorate);
  if (filters.birthYear) params.set("year", filters.birthYear);
  if (filters.status) params.set("status", filters.status);
  if (filters.conflictsOnly) params.set("conflicts", "1");
  return params.toString();
}

export function hasActiveFilters(filters: ProfileFilters): boolean {
  return Boolean(
    filters.name || filters.governorate || filters.birthYear || filters.status || filters.conflictsOnly,
  );
}

export function birthYearQuery(value: string): number | undefined {
  if (!/^\d{4}$/.test(value)) return undefined;
  const year = Number(value);
  if (year < 1850 || year > 2100) return undefined;
  return year;
}
