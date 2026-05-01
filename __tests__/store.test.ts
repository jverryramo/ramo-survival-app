// ============================================================
// Tests unitaires — Store et Types
// ============================================================

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  PlantCounts,
  STATE_KEYS,
  createEmptyCounts,
  totalCounts,
  survivalRate,
} from "../lib/types";

// Mock AsyncStorage
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn().mockResolvedValue(null),
    setItem: vi.fn().mockResolvedValue(undefined),
    removeItem: vi.fn().mockResolvedValue(undefined),
    multiRemove: vi.fn().mockResolvedValue(undefined),
  },
}));

// ---- Tests des types ----

describe("createEmptyCounts", () => {
  it("retourne tous les compteurs à 0", () => {
    const counts = createEmptyCounts();
    expect(counts.Vivant).toBe(0);
    expect(counts.Base).toBe(0);
    expect(counts.NonDebourre).toBe(0);
    expect(counts.Mort).toBe(0);
    expect(counts.Manquant).toBe(0);
    expect(counts.PlantEchappe).toBe(0);
  });
});

describe("totalCounts", () => {
  it("calcule le total correct", () => {
    const counts: PlantCounts = {
      Vivant: 10,
      Base: 5,
      NonDebourre: 3,
      Mort: 2,
      Manquant: 1,
      PlantEchappe: 0,
    };
    expect(totalCounts(counts)).toBe(21);
  });

  it("retourne 0 pour des compteurs vides", () => {
    expect(totalCounts(createEmptyCounts())).toBe(0);
  });
});

describe("survivalRate", () => {
  it("calcule le taux de survie correct", () => {
    const counts: PlantCounts = {
      Vivant: 80,
      Base: 0,
      NonDebourre: 0,
      Mort: 20,
      Manquant: 0,
      PlantEchappe: 0,
    };
    expect(survivalRate(counts)).toBe(80);
  });

  it("retourne 0 si aucun plant", () => {
    expect(survivalRate(createEmptyCounts())).toBe(0);
  });

  it("arrondit correctement", () => {
    const counts: PlantCounts = {
      Vivant: 1,
      Base: 0,
      NonDebourre: 0,
      Mort: 2,
      Manquant: 0,
      PlantEchappe: 0,
    };
    // 1/3 = 33.33% → arrondi à 33
    expect(survivalRate(counts)).toBe(33);
  });
});

describe("STATE_KEYS", () => {
  it("contient exactement 6 états", () => {
    expect(STATE_KEYS).toHaveLength(6);
  });

  it("contient les clés attendues", () => {
    const keys = STATE_KEYS.map((s) => s.key);
    expect(keys).toContain("Vivant");
    expect(keys).toContain("Base");
    expect(keys).toContain("NonDebourre");
    expect(keys).toContain("Mort");
    expect(keys).toContain("Manquant");
    expect(keys).toContain("PlantEchappe");
  });

  it("Vivant a le fond brun", () => {
    const vivant = STATE_KEYS.find((s) => s.key === "Vivant");
    expect(vivant?.bg).toBe("#8A6F48");
    expect(vivant?.text).toBe("#FFFFFF");
  });

  it("Base a le fond chartreuse Ramo", () => {
    const base = STATE_KEYS.find((s) => s.key === "Base");
    expect(base?.bg).toBe("#DCF21E");
    expect(base?.text).toBe("#000000");
  });
});

// ---- Tests du store ----

describe("store — loadSessions", () => {
  it("retourne un tableau vide si AsyncStorage est vide", async () => {
    const { loadSessions } = await import("../lib/store");
    const sessions = await loadSessions();
    expect(Array.isArray(sessions)).toBe(true);
    expect(sessions).toHaveLength(0);
  });
});

describe("store — saveSession", () => {
  it("crée une session avec les champs requis", async () => {
    const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
    (AsyncStorage.getItem as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

    const { saveSession } = await import("../lib/store");
    const session = await saveSession("2025-001", "2025-06-15");

    expect(session.projectId).toBe("2025-001");
    expect(session.date).toBe("2025-06-15");
    expect(session.id).toBeTruthy();
    expect(session.createdAt).toBeTruthy();
  });
});
