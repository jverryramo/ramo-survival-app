import {
  createEmptyCounts,
  FieldRecord,
  PlantCounts,
  totalCounts,
} from "./types";
import { GeoPosition } from "./geolocation";

export interface AreaSummary {
  key: string;
  sessionId: string;
  aire: string;
  counts: PlantCounts;
  total: number;
  livingPercent: number | null;
  records: FieldRecord[];
  gps?: GeoPosition;
}

// Keep sessions separate: the same area number can refer to different fields/visits.
export function summarizeAreas(records: FieldRecord[]): AreaSummary[] {
  const groups = new Map<string, AreaSummary>();
  for (const record of records) {
    const key = JSON.stringify([record.sessionId, record.aire]);
    let area = groups.get(key);
    if (!area) {
      area = {
        key,
        sessionId: record.sessionId,
        aire: record.aire,
        counts: createEmptyCounts(),
        total: 0,
        livingPercent: null,
        records: [],
      };
      groups.set(key, area);
    }
    area.records.push(record);
    for (const state of Object.keys(area.counts) as (keyof PlantCounts)[]) {
      area.counts[state] += record.counts[state];
    }
    const gps = record.gps;
    if (
      gps &&
      Number.isFinite(gps.latitude) &&
      Math.abs(gps.latitude) <= 90 &&
      Number.isFinite(gps.longitude) &&
      Math.abs(gps.longitude) <= 180 &&
      Number.isFinite(Date.parse(gps.capturedAt)) &&
      (!area.gps ||
        Date.parse(gps.capturedAt) > Date.parse(area.gps.capturedAt))
    ) {
      area.gps = gps;
    }
  }
  return [...groups.values()]
    .map((area) => {
      area.total = totalCounts(area.counts);
      area.livingPercent = area.total
        ? Math.round((100 * area.counts.Vivant) / area.total)
        : null;
      return area;
    })
    .sort((a, b) => a.aire.localeCompare(b.aire, undefined, { numeric: true }));
}

// Local equirectangular projection, equal scale on both axes; field-sized overview.
export function projectAreas(areas: AreaSummary[]) {
  const located = areas.filter(
    (a): a is AreaSummary & { gps: GeoPosition } => !!a.gps,
  );
  if (!located.length) return [];
  const origin = located[0].gps;
  const points = located.map((area) => ({
    area,
    x:
      (((area.gps.longitude - origin.longitude + 540) % 360) - 180) *
      Math.cos((origin.latitude * Math.PI) / 180),
    y: -(area.gps.latitude - origin.latitude),
  }));
  const minX = Math.min(...points.map((p) => p.x));
  const maxX = Math.max(...points.map((p) => p.x));
  const minY = Math.min(...points.map((p) => p.y));
  const maxY = Math.max(...points.map((p) => p.y));
  const span = Math.max(maxX - minX, maxY - minY, 0.0001);
  return points.map((p) => ({
    area: p.area,
    x: 160 + ((p.x - (minX + maxX) / 2) / span) * 220,
    y: 140 + ((p.y - (minY + maxY) / 2) / span) * 220,
  }));
}
