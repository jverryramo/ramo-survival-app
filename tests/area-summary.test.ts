import { describe, expect, it } from "vitest";
import { summarizeAreas, projectAreas } from "../lib/area-summary";
import { createEmptyCounts, FieldRecord } from "../lib/types";
const record = (patch: Partial<FieldRecord> = {}): FieldRecord => ({
  id: "r",
  sessionId: "s",
  aire: "1",
  variety: "1",
  length_m: "10",
  comment: "",
  createdAt: "2026-11-06",
  counts: { ...createEmptyCounts(), Vivant: 1, Mort: 1 },
  ...patch,
});
const gps = {
  latitude: 45,
  longitude: -73,
  accuracyMeters: 0,
  capturedAt: "2026-11-06T12:00:00Z",
};
describe("area overview", () => {
  it("weights by plants rather than averaging percentages and isolates sessions", () => {
    const areas = summarizeAreas([
      record(),
      record({ counts: { ...createEmptyCounts(), Vivant: 8 } }),
      record({ sessionId: "another" }),
    ]);
    expect(areas).toHaveLength(2);
    expect(areas[0].total).toBe(10);
    expect(areas[0].livingPercent).toBe(90);
  });
  it("uses the latest valid GPS without inventing a position for old data", () => {
    const latest = { ...gps, capturedAt: "2026-11-06T13:00:00Z", latitude: 46 };
    const areas = summarizeAreas([
      record({ gps: latest }),
      record({ gps }),
      record({ aire: "2" }),
      record({ gps: { ...latest, latitude: NaN } }),
    ]);
    expect(areas[0].gps).toEqual(latest);
    expect(areas[1].gps).toBeUndefined();
    expect(projectAreas(areas)).toHaveLength(1);
  });
  it("keeps coincident points finite and north above south", () => {
    const points = projectAreas(
      summarizeAreas([
        record({ gps }),
        record({ aire: "2", gps: { ...gps, latitude: 45.001 } }),
        record({ aire: "3", gps }),
      ]),
    );
    expect(points[1].y).toBeLessThan(points[0].y);
    expect(points[2].x).toBe(points[0].x);
    expect(projectAreas(summarizeAreas([record({ gps })]))[0]).toMatchObject({
      x: 160,
      y: 140,
    });
  });
  it("does not report zero percent for an empty count", () => {
    expect(
      summarizeAreas([record({ counts: createEmptyCounts() })])[0]
        .livingPercent,
    ).toBeNull();
  });
});
