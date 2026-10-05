export type IncidentRecord = {
  id: string;
  date: string | null;
  migrationRoute: string | null;
  location: string | null;
  coordinates: string | null;
  latitude: number | null;
  longitude: number | null;
  causeOfDeath: string | null;
  deadAndMissing: number;
  sourceOrg: string;
  sourceOrgAcronym: string | null;
  reliabilityScore: number;
  sourceUrl: string | null;
};

export type IncidentStats = {
  totalIncidents: number;
  totalDeadAndMissing: number;
  topRoute: string;
  topReportingBody: string;
  routes: { route: string; incidents: number; casualties: number }[];
  sources: {
    name: string;
    reliabilityScore: number;
    incidentCount: number;
    casualties: number;
  }[];
};

export type SourceOrganization = {
  id: string;
  name: string;
  acronym: string | null;
  reliabilityScore: number;
  rawRecordCount: number;
};

export type IncidentList = {
  items: IncidentRecord[];
  total: number;
  limit: number;
  offset: number;
};

export type IncidentQuery = {
  route?: string;
  year?: string;
  sourceOrg?: string;
  search?: string;
  limit?: number;
  offset?: number;
};

const PAGE_LIMITS = [25, 50, 100] as const;
const MAP_PAGE_SIZE = 100;

type ApiIncident = {
  id: string;
  date: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  coordinates: string | null;
  route: string | null;
  causeOfDeath: string | null;
  totalCasualties: number | null;
  sourceUrl: string | null;
  sourceOrg: {
    name: string;
    acronym: string | null;
    reliabilityScore: number;
  };
};

type ApiList = {
  total: number;
  limit: number;
  offset: number;
  data: ApiIncident[];
};

type ApiStats = {
  totalSyrianCasualties: number;
  incidentCount: number;
  byRoute: { route: string; casualties: number; incidents: number }[];
  topSources: {
    name: string;
    reliabilityScore: number;
    incidents: number;
    casualties: number;
  }[];
};

export function apiBase(): string {
  return (
    process.env.NEXT_PUBLIC_MIGRANTS_API_URL ||
    process.env.MIGRANTS_API_URL ||
    "http://127.0.0.1:3010"
  );
}

export function reportingBodyLabel(name: string): string {
  if (/syrian observatory for human rights/i.test(name)) return "SOHR";
  return name;
}

export function parseCoordinates(value: string | null): { lat: number; lng: number } | null {
  if (!value) return null;
  const match = value.trim().match(/^(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)$/);
  if (!match) return null;
  return validPoint(Number(match[1]), Number(match[2]));
}

export function incidentPoint(incident: IncidentRecord): { lat: number; lng: number } | null {
  return (
    validPoint(incident.latitude, incident.longitude) ?? parseCoordinates(incident.coordinates)
  );
}

function validPoint(lat: number | null, lng: number | null): { lat: number; lng: number } | null {
  if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

export function normalizeLimit(value: string | undefined): number {
  const parsed = Number(value);
  return PAGE_LIMITS.includes(parsed as (typeof PAGE_LIMITS)[number]) ? parsed : 25;
}

export function normalizeOffset(value: string | undefined): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) return 0;
  return parsed;
}

function queryString(query: IncidentQuery): string {
  const params = new URLSearchParams();
  if (query.route) params.set("route", query.route);
  if (query.year) params.set("year", query.year);
  if (query.sourceOrg) params.set("sourceOrg", query.sourceOrg);
  if (query.search) params.set("search", query.search);
  if (query.limit) params.set("limit", String(query.limit));
  if (query.offset) params.set("offset", String(query.offset));
  const text = params.toString();
  return text ? `?${text}` : "";
}

const EMPTY_LIST_PAYLOAD = { data: [] as ApiIncident[], total: 0 };

async function getJson<T>(path: string): Promise<T | null> {
  const url = `${apiBase()}${path}`;
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      console.error(`Incidents API ${response.status}: ${url}`);
      return null;
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error(`Incidents API unreachable: ${url}`, error);
    return null;
  }
}

function toRecord(item: ApiIncident): IncidentRecord {
  return {
    id: item.id,
    date: item.date,
    migrationRoute: item.route,
    location: item.location,
    coordinates: item.coordinates,
    latitude: item.latitude,
    longitude: item.longitude,
    causeOfDeath: item.causeOfDeath,
    deadAndMissing: item.totalCasualties ?? 0,
    sourceOrg: item.sourceOrg.name,
    sourceOrgAcronym: item.sourceOrg.acronym,
    reliabilityScore: item.sourceOrg.reliabilityScore,
    sourceUrl: item.sourceUrl,
  };
}

const EMPTY_STATS: IncidentStats = {
  totalIncidents: 0,
  totalDeadAndMissing: 0,
  topRoute: "غير معروف",
  topReportingBody: "غير معروف",
  routes: [],
  sources: [],
};

export async function getIncidentStats(): Promise<IncidentStats> {
  const stats = await getJson<ApiStats>("/api/incidents/stats");
  if (!stats) return EMPTY_STATS;
  const routes = (stats.byRoute ?? []).map((route) => ({
    route: route.route,
    incidents: route.incidents,
    casualties: route.casualties,
  }));
  const busiest = [...routes].sort(
    (left, right) => right.incidents - left.incidents || right.casualties - left.casualties,
  )[0];
  const topSource = [...(stats.topSources ?? [])].sort(
    (left, right) => right.incidents - left.incidents || right.casualties - left.casualties,
  )[0];

  return {
    totalIncidents: stats.incidentCount,
    totalDeadAndMissing: stats.totalSyrianCasualties,
    topRoute: busiest?.route ?? "غير معروف",
    topReportingBody: topSource ? reportingBodyLabel(topSource.name) : "غير معروف",
    routes,
    sources: (stats.topSources ?? []).map((source) => ({
      name: source.name,
      reliabilityScore: source.reliabilityScore,
      incidentCount: source.incidents,
      casualties: source.casualties,
    })),
  };
}

export async function getIncidents(query: IncidentQuery): Promise<IncidentList> {
  const page = (await getJson<ApiList>(`/api/incidents${queryString(query)}`)) ?? {
    ...EMPTY_LIST_PAYLOAD,
    limit: query.limit ?? 25,
    offset: query.offset ?? 0,
  };
  return {
    items: page.data.map(toRecord),
    total: page.total,
    limit: page.limit,
    offset: page.offset,
  };
}

export async function getIncidentMap(query: IncidentQuery): Promise<IncidentRecord[]> {
  const first = await getIncidents({ ...query, limit: MAP_PAGE_SIZE, offset: 0 });
  const items = [...first.items];
  const offsets: number[] = [];
  for (let offset = MAP_PAGE_SIZE; offset < first.total; offset += MAP_PAGE_SIZE) {
    offsets.push(offset);
  }
  const rest = await Promise.all(
    offsets.map((offset) => getIncidents({ ...query, limit: MAP_PAGE_SIZE, offset })),
  );
  for (const page of rest) items.push(...page.items);
  return items;
}

export async function getSourceOrganizations(): Promise<SourceOrganization[]> {
  const sources = await getJson<SourceOrganization[]>("/api/sources");
  if (!sources) return [];
  return sources
    .filter((source) => source.rawRecordCount > 0)
    .sort((left, right) => left.name.localeCompare(right.name, "ar"));
}

export const INCIDENT_YEARS = Array.from({ length: 2026 - 2014 + 1 }, (_, index) => 2026 - index);

export const INCIDENT_LIMITS = PAGE_LIMITS;

export type IncidentOrganization = {
  id: string;
  name: string;
  acronym: string | null;
  reliabilityScore: number;
  url: string | null;
};

export type IncidentClaim = {
  id: string;
  fromSourceFile: boolean;
  organization: IncidentOrganization;
  reportedDead: number | null;
  reportedMissing: number | null;
  reportedSurvivors: number | null;
  reportedDate: string | null;
  summary: string;
  sourceUrl: string | null;
  sourceQuality: number | null;
  createdAt: string;
};

export type EvidenceType =
  | "LEAK"
  | "SURVIVOR_TESTIMONY"
  | "INVESTIGATIVE_REPORT"
  | "OFFICIAL_STATEMENT"
  | "SATELLITE_IMAGERY";

export type IncidentEvidenceItem = {
  id: string;
  type: EvidenceType;
  title: string;
  description: string;
  fileUrl: string | null;
  submittedBy: string | null;
  isVerified: boolean;
  createdAt: string;
};

export type IncidentDossier = {
  id: string;
  sourceRecordId: string | null;
  date: string | null;
  location: string | null;
  region: string | null;
  latitude: number | null;
  longitude: number | null;
  coordinates: string | null;
  route: string | null;
  causeOfDeath: string | null;
  totalCasualties: number | null;
  sourceOrg: IncidentOrganization;
  demographics: {
    men: number | null;
    women: number | null;
    children: number | null;
  };
  claims: IncidentClaim[];
  evidence: IncidentEvidenceItem[];
  contradictions: {
    detected: boolean;
    disagreements: Array<{
      field: "reportedDead" | "reportedMissing" | "reportedSurvivors" | "reportedDate";
      values: Array<{ organizationName: string; value: number | string | null }>;
    }>;
  };
};

export async function getIncidentDossier(
  id: string,
): Promise<{ ok: true; data: IncidentDossier } | { ok: false; status: number | null }> {
  const url = `${apiBase()}/api/incidents/${encodeURIComponent(id)}`;
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return { ok: false, status: response.status };
    return { ok: true, data: (await response.json()) as IncidentDossier };
  } catch (error) {
    console.error(`Incidents API unreachable: ${url}`, error);
    return { ok: false, status: null };
  }
}
