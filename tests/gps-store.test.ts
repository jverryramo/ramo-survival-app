import { beforeEach, describe, expect, it, vi } from "vitest";
import { saveRecord, loadRecords } from "../lib/store";
import { createEmptyCounts } from "../lib/types";
const data = vi.hoisted(() => new Map<string, string>());
vi.mock("@react-native-async-storage/async-storage", () => ({ default: {
  getItem: async (key: string) => data.get(key) ?? null,
  setItem: async (key: string, value: string) => { data.set(key, value); },
} }));
beforeEach(() => data.clear());
describe("GPS persistence per count", () => {
  it("stores each count's own coordinates and keeps old records usable", async () => {
    const draft = { sessionId: "s", aire: "1", length_m: "10", variety: "1", counts: createEmptyCounts(), comment: "" };
    const gps = { latitude: 46.2, longitude: -73.1, accuracyMeters: 8, capturedAt: "2026-11-04T16:00:00.000Z" };
    await saveRecord({ ...draft, gps });
    await saveRecord({ ...draft, aire: "2" });
    const records = await loadRecords();
    expect(records[0].gps).toEqual(gps);
    expect(records[1].gps).toBeUndefined();
  });
});
