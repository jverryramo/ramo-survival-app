import { describe, expect, it, vi } from "vitest";
import { buildRows } from "../lib/export";
import { createEmptyCounts, type FieldRecord } from "../lib/types";
vi.mock("react-native", () => ({ Platform: { OS: "web" } }));
const record: FieldRecord = { id: "r", sessionId: "s", aire: "1", length_m: "10", variety: "1", counts: createEmptyCounts(), comment: "", createdAt: "2026-11-04" };
describe("GPS in Excel exports", () => {
  it("keeps numeric coordinates, zero accuracy, and timestamp", () => {
    const gps = { latitude: 0, longitude: -73, accuracyMeters: 0, capturedAt: "2026-11-04T16:00:00.000Z" };
    const [row] = buildRows([{ ...record, gps }], []);
    expect(row["Latitude (WGS84)"]).toBe(0);
    expect(row["Longitude (WGS84)"]).toBe(-73);
    expect(row["Précision GPS (m)"]).toBe(0);
    expect(row["Date et heure GPS (UTC)"]).toBe(gps.capturedAt);
  });
  it("leaves coordinates blank for historical counts without GPS", () => {
    const [row] = buildRows([record], []);
    expect(row["Latitude (WGS84)"]).toBe("");
    expect(row["Longitude (WGS84)"]).toBe("");
  });
});
