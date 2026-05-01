// ============================================================
// Ramo Survival App — Types TypeScript
// ============================================================

// --- États des plants ---

export interface PlantCounts {
  Vivant: number;
  Base: number;
  NonDebourre: number;
  Mort: number;
  Manquant: number;
  PlantEchappe: number;
}

export interface StateKey {
  key: keyof PlantCounts;
  label: string;
  bg: string;
  text: string;
  border?: string;
}

export const STATE_KEYS: StateKey[] = [
  { key: "Vivant", label: "Vivant", bg: "#8A6F48", text: "#FFFFFF" },
  { key: "Base", label: "Base", bg: "#DCF21E", text: "#000000" },
  { key: "NonDebourre", label: "Non débourré", bg: "#D3CBBF", text: "#000000" },
  { key: "Mort", label: "Mort", bg: "#003c38", text: "#FFFFFF" },
  { key: "Manquant", label: "Manquant", bg: "#FFFFFF", text: "#000000", border: "#000000" },
  { key: "PlantEchappe", label: "Plant échappé", bg: "#000000", text: "#FFFFFF" },
];

export function createEmptyCounts(): PlantCounts {
  return {
    Vivant: 0,
    Base: 0,
    NonDebourre: 0,
    Mort: 0,
    Manquant: 0,
    PlantEchappe: 0,
  };
}

export function totalCounts(counts: PlantCounts): number {
  return (
    counts.Vivant +
    counts.Base +
    counts.NonDebourre +
    counts.Mort +
    counts.Manquant +
    counts.PlantEchappe
  );
}

export function survivalRate(counts: PlantCounts): number {
  const total = totalCounts(counts);
  if (total === 0) return 0;
  return Math.round((counts.Vivant / total) * 100);
}

// --- Session ---

export interface Session {
  id: string;
  date: string;        // ISO date string "YYYY-MM-DD"
  projectId: string;   // Numéro de projet (ex: "2025-001")
  operator: string;    // Nom de l'opérateur terrain
  createdAt: string;   // ISO datetime
}

// --- Enregistrement terrain ---

export interface FieldRecord {
  id: string;
  sessionId: string;
  aire: string;        // "1" à "20"
  length_m: string;    // Longueur en mètres
  variety: string;     // "1" à "20"
  counts: PlantCounts;
  comment: string;
  createdAt: string;
}
