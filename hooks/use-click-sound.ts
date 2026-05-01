// ============================================================
// Hook useClickSound — Joue un son de click court
// Utilise expo-audio sur native, no-op sur web
// ============================================================

import { useCallback, useEffect, useRef } from "react";
import { Platform } from "react-native";

// Asset source déclaré au top level (Metro le résout correctement)
const CLICK_SOUND_SOURCE = Platform.OS !== "web"
  ? require("@/assets/sounds/click.wav")
  : null;

export function useClickSound() {
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS === "web" || !CLICK_SOUND_SOURCE) return;

    let cancelled = false;

    // Import expo-audio dynamiquement pour éviter le crash sur web
    const init = async () => {
      try {
        const { createAudioPlayer } = require("expo-audio");
        if (cancelled) return;
        playerRef.current = createAudioPlayer(CLICK_SOUND_SOURCE);
      } catch (_) {
        // Silently fail if expo-audio is not available
      }
    };
    init();

    return () => {
      cancelled = true;
      if (playerRef.current) {
        try {
          playerRef.current.release();
        } catch (_) {}
        playerRef.current = null;
      }
    };
  }, []);

  const playClick = useCallback(() => {
    if (Platform.OS === "web") return;
    if (!playerRef.current) return;
    try {
      playerRef.current.seekTo(0);
      playerRef.current.play();
    } catch (_) {}
  }, []);

  return { playClick };
}
