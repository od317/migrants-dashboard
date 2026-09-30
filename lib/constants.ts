export function isGovernorate(value: string): value is (typeof GOVERNORATES)[number] {
  return (GOVERNORATES as readonly string[]).includes(value);
}

export function governorateLabel(value: string): string {
  return isGovernorate(value) ? GOVERNORATE_LABELS[value] : value;
}

export const GOVERNORATE_LABELS: Record<(typeof GOVERNORATES)[number], string> = {
  Damascus: "دمشق",
  "Rif Dimashq": "ريف دمشق",
  Aleppo: "حلب",
  Homs: "حمص",
  Hama: "حماة",
  Latakia: "اللاذقية",
  Tartus: "طرطوس",
  Idlib: "إدلب",
  "Deir ez-Zor": "دير الزور",
  Raqqa: "الرقة",
  "Al-Hasakah": "الحسكة",
  Daraa: "درعا",
  Quneitra: "القنيطرة",
  "As-Suwayda": "السويداء",
};

export const GOVERNORATES = [
  "Damascus",
  "Rif Dimashq",
  "Aleppo",
  "Homs",
  "Hama",
  "Latakia",
  "Tartus",
  "Idlib",
  "Deir ez-Zor",
  "Raqqa",
  "Al-Hasakah",
  "Daraa",
  "Quneitra",
  "As-Suwayda",
] as const;

export const TIMELINE_START_YEAR = 2011;
export const TIMELINE_END_YEAR = 2026;

export const TIMELINE_YEARS = Array.from(
  { length: TIMELINE_END_YEAR - TIMELINE_START_YEAR + 1 },
  (_, index) => TIMELINE_START_YEAR + index,
);
