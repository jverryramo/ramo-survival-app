// ============================================================
// Hook useSoundEnabled — Toggle son pour le comptage
// Persiste le choix dans AsyncStorage
// ============================================================

import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const STORAGE_KEY = "sound_enabled";

export function useSoundEnabled() {
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val !== null) {
        setSoundEnabled(val === "true");
      }
    });
  }, []);

  const toggleSound = useCallback(async () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    await AsyncStorage.setItem(STORAGE_KEY, String(newValue));
  }, [soundEnabled]);

  return { soundEnabled, toggleSound };
}
