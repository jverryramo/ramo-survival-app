import { afterEach, describe, expect, it, vi } from "vitest";
import { positionFromFix } from "../lib/geolocation";
import { capturePosition } from "../lib/capture-position";
import * as Location from "expo-location";

vi.mock("expo-location", () => ({
  Accuracy: { High: 4 },
  requestForegroundPermissionsAsync: vi.fn(),
  hasServicesEnabledAsync: vi.fn(),
  getCurrentPositionAsync: vi.fn(),
}));
const fix = {
  coords: { latitude: 46.2, longitude: -73.1, accuracy: 8 },
  timestamp: 1793820000000,
};
afterEach(() => {
  vi.resetAllMocks();
  vi.useRealTimers();
});
describe("GPS terrain", () => {
  it("preserves WGS84 coordinates, accuracy and the fix timestamp", () => {
    expect(positionFromFix(fix)).toEqual({
      latitude: 46.2,
      longitude: -73.1,
      accuracyMeters: 8,
      capturedAt: new Date(fix.timestamp).toISOString(),
    });
  });
  it("accepts zero coordinates and unknown accuracy", () => {
    expect(
      positionFromFix({
        ...fix,
        coords: { latitude: 0, longitude: 0, accuracy: null },
      }).accuracyMeters,
    ).toBeNull();
  });
  it.each([NaN, 91, -91])("rejects invalid latitude %s", (latitude) => {
    expect(() =>
      positionFromFix({ ...fix, coords: { ...fix.coords, latitude } }),
    ).toThrow();
  });
  it("rejects invalid longitude and date", () => {
    expect(() =>
      positionFromFix({ ...fix, coords: { ...fix.coords, longitude: 181 } }),
    ).toThrow();
    expect(() => positionFromFix({ ...fix, timestamp: NaN })).toThrow();
  });
  it("does not request a fix after permission is denied", async () => {
    vi.mocked(Location.requestForegroundPermissionsAsync).mockResolvedValue({
      status: "denied",
    } as never);
    await expect(capturePosition()).rejects.toThrow("permission");
    expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
  });
  it("reports disabled location services", async () => {
    vi.mocked(Location.requestForegroundPermissionsAsync).mockResolvedValue({
      status: "granted",
    } as never);
    vi.mocked(Location.hasServicesEnabledAsync).mockResolvedValue(false);
    await expect(capturePosition()).rejects.toThrow("unavailable");
    expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
  });
  it("captures a fresh foreground fix", async () => {
    vi.mocked(Location.requestForegroundPermissionsAsync).mockResolvedValue({
      status: "granted",
    } as never);
    vi.mocked(Location.hasServicesEnabledAsync).mockResolvedValue(true);
    vi.mocked(Location.getCurrentPositionAsync).mockResolvedValue(fix as never);
    await expect(capturePosition()).resolves.toEqual(positionFromFix(fix));
  });
  it("times out instead of blocking the form indefinitely", async () => {
    vi.useFakeTimers();
    vi.mocked(Location.requestForegroundPermissionsAsync).mockResolvedValue({
      status: "granted",
    } as never);
    vi.mocked(Location.hasServicesEnabledAsync).mockResolvedValue(true);
    vi.mocked(Location.getCurrentPositionAsync).mockReturnValue(
      new Promise(() => {}),
    );
    const result = expect(capturePosition()).rejects.toThrow("timeout");
    await vi.advanceTimersByTimeAsync(20000);
    await result;
  });
});
