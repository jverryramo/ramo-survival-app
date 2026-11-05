export interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
  capturedAt: string;
}

/** WGS84 decimal degrees; unknown accuracy stays unknown, never zero. */
export function positionFromFix(fix: {
  coords: { latitude: number; longitude: number; accuracy: number | null };
  timestamp: number;
}): GeoPosition {
  const { latitude, longitude, accuracy } = fix.coords;
  if (
    !Number.isFinite(latitude) ||
    Math.abs(latitude) > 90 ||
    !Number.isFinite(longitude) ||
    Math.abs(longitude) > 180 ||
    !Number.isFinite(fix.timestamp) ||
    fix.timestamp <= 0
  ) {
    throw new Error("invalid");
  }
  return {
    latitude,
    longitude,
    accuracyMeters:
      accuracy !== null && Number.isFinite(accuracy) && accuracy >= 0
        ? accuracy
        : null,
    capturedAt: new Date(fix.timestamp).toISOString(),
  };
}

export function formatPosition(position: GeoPosition): string {
  return position.latitude.toFixed(6) + ", " + position.longitude.toFixed(6);
}
