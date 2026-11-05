import * as Location from "expo-location";
import { positionFromFix, type GeoPosition } from "./geolocation";

export async function capturePosition(): Promise<GeoPosition> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== "granted") throw new Error("permission");
  if (!(await Location.hasServicesEnabledAsync()))
    throw new Error("unavailable");
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const fix = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("timeout")), 20000);
      }),
    ]);
    return positionFromFix(fix);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
