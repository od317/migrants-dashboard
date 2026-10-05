import { cache } from "react";
import { apiBase } from "@/lib/incidents";
import type { VitalStatus } from "@/lib/status";

export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number | null };

export type ProfileSummary = {
  id: string;
  canonicalName: string | null;
  knownNames: string[];
  resolvedStatus: VitalStatus;
  resolvedLocation: string | null;
  resolvedBirthYear: number | null;
  profileStatus: string;
  hasConflict: boolean;
  linkedSourceCount: number;
  linkedOrganizationCount: number;
  confidenceAverage: number | null;
};

export type ProfileSearchPage = {
  total: number;
  limit: number;
  offset: number;
  data: ProfileSummary[];
};

export type ProfileSearchParams = {
  name?: string;
  governorate?: string;
  yearOfBirth?: number;
  status?: VitalStatus | "";
  hasConflict?: boolean;
  limit?: number;
  offset?: number;
};

export type TimelineRecord = {
  linkageId: string;
  confidenceScore: number;
  conflictFlag: boolean;
  rawRecord: {
    id: string;
    extractedName: string | null;
    vitalStatus: VitalStatus;
    location: string | null;
    eventDate: string | null;
    reportedAt: string | null;
    ingestedAt: string;
  };
  organization: {
    id: string;
    name: string;
    acronym: string | null;
    reliabilityScore: number;
    url: string | null;
  };
  source: {
    sourceFileId: string;
    originalFilename: string;
    organizationName: string;
    acronym: string | null;
    reliabilityScore: number;
  };
};

export type ContradictionEntry = {
  org: string;
  status: VitalStatus;
  date: string | null;
};

export type ProfileDetail = {
  id: string;
  canonicalName: string | null;
  knownNames: string[];
  resolvedStatus: VitalStatus;
  resolvedLocation: string | null;
  resolvedBirthYear: number | null;
  hasConflict: boolean;
  timeline: { year: string | null; records: TimelineRecord[] }[];
  contradictions: {
    masterId: string;
    conflictDetected: boolean;
    contradictions: ContradictionEntry[];
  } | null;
};

export type SourceReport = {
  id: string;
  originalFilename: string;
  publisher: string;
  acronym: string | null;
  mandate: string | null;
  reliabilityScore: number;
  recordCount: number;
  ingestionStatus: string;
  format: string;
  adapter: string | null;
};

const SERVER_ERROR = "تعذر الاتصال بالخادم";

export { SERVER_ERROR };

export async function getJson<T>(path: string): Promise<ApiResult<T>> {
  const url = `${apiBase()}${path}`;
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      console.error(`API ${response.status}: ${url}`);
      return { ok: false, status: response.status };
    }
    return { ok: true, data: (await response.json()) as T };
  } catch (error) {
    console.error(`API unreachable: ${url}`, error);
    return { ok: false, status: null };
  }
}

export const getReports = cache(async function getReports(): Promise<ApiResult<SourceReport[]>> {
  const result = await getJson<SourceReport[]>("/api/reports");
  if (!result.ok) return result;
  return { ok: true, data: Array.isArray(result.data) ? result.data : [] };
});

export const searchProfiles = cache(async function searchProfiles(
  params: ProfileSearchParams,
): Promise<ApiResult<ProfileSearchPage>> {
  const query = new URLSearchParams();
  if (params.name) query.set("name", params.name);
  if (params.governorate) query.set("governorate", params.governorate);
  if (params.yearOfBirth != null) query.set("yearOfBirth", String(params.yearOfBirth));
  if (params.status) query.set("status", params.status);
  if (params.hasConflict) query.set("hasConflict", "true");
  query.set("limit", String(params.limit ?? 100));
  if (params.offset) query.set("offset", String(params.offset));
  const result = await getJson<ProfileSearchPage>(`/api/profiles/search?${query.toString()}`);
  if (!result.ok) return result;
  return {
    ok: true,
    data: {
      total: result.data.total ?? 0,
      limit: result.data.limit ?? params.limit ?? 100,
      offset: result.data.offset ?? params.offset ?? 0,
      data: Array.isArray(result.data.data) ? result.data.data : [],
    },
  };
});

export const getProfileById = cache(async function getProfileById(
  id: string,
): Promise<ApiResult<ProfileDetail>> {
  return getJson<ProfileDetail>(`/api/profiles/${encodeURIComponent(id)}`);
});

export type SubmissionStatus = "PENDING_REVIEW" | "UNDER_INVESTIGATION" | "MATCH_FOUND" | "ARCHIVED";

export type AdminSubmission = {
  id: string;
  missingPersonName: string;
  dateOfLoss: string | null;
  lastKnownLocation: string | null;
  status: SubmissionStatus;
  createdAt: string;
  reporterName: string;
  reporterContact: string;
  relationship: string | null;
  approximateAge: number | null;
  smugglerDetails: string | null;
  physicalMarks: string | null;
};

export type IncidentSuggestion = {
  incidentId: string;
  date: string | null;
  location: string | null;
  casualties: number | null;
  confidence: number;
  reason: string;
};

async function adminRequest<T>(apiKey: string, path: string, init?: RequestInit): Promise<ApiResult<T>> {
  const url = `${apiBase()}${path}`;
  try {
    const response = await fetch(url, {
      ...init,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "x-api-key": apiKey,
        ...(init?.headers ?? {}),
      },
    });
    if (!response.ok) {
      console.error(`API ${response.status}: ${url}`);
      return { ok: false, status: response.status };
    }
    return { ok: true, data: (await response.json()) as T };
  } catch (error) {
    console.error(`API unreachable: ${url}`, error);
    return { ok: false, status: null };
  }
}

export async function listAdminSubmissions(apiKey: string): Promise<ApiResult<AdminSubmission[]>> {
  const result = await adminRequest<AdminSubmission[]>(apiKey, "/api/submissions");
  if (!result.ok) return result;
  return { ok: true, data: Array.isArray(result.data) ? result.data : [] };
}

export async function getSubmissionSuggestions(
  apiKey: string,
  id: string,
): Promise<ApiResult<{ suggestions: IncidentSuggestion[] }>> {
  const result = await adminRequest<{ suggestions: IncidentSuggestion[] }>(
    apiKey,
    `/api/submissions/${encodeURIComponent(id)}/suggestions`,
  );
  if (!result.ok) return result;
  return {
    ok: true,
    data: { suggestions: Array.isArray(result.data.suggestions) ? result.data.suggestions : [] },
  };
}

export async function updateAdminSubmissionStatus(
  apiKey: string,
  id: string,
  status: SubmissionStatus,
): Promise<ApiResult<AdminSubmission>> {
  return adminRequest<AdminSubmission>(apiKey, `/api/submissions/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}
