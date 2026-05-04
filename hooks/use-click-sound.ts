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
  const readyRef = useRef(false);

  useEffect(() => {
    if (Platform.OS === "web" || !CLICK_SOUND_SOURCE) return;

    let cancelled = false;

    const init = async () => {
      try {
        const { createAudioPlayer, setAudioModeAsync } = require("expo-audio");

        // Activer le son même en mode silencieux iOS
        await setAudioModeAsync({ playsInSilentMode: true });

        if (cancelled) return;
        const player = createAudioPlayer(CLICK_SOUND_SOURCE);
        playerRef.current = player;
        readyRef.current = true;
      } catch (_) {
        // Silently fail if expo-audio is not available
      }
    };
    init();

    return () => {
      cancelled = true;
      if (playerRef.current) {
        try {
          playerRef.current.remove();
        } catch (_) {}
        playerRef.current = null;
        readyRef.current = false;
      }
    };
  }, []);

  const playClick = useCallback(() => {
    if (Platform.OS === "web") return;
    if (!readyRef.current || !playerRef.current) return;
    try {
      playerRef.current.seekTo(0);
      playerRef.current.play();
    } catch (_) {}
  }, []);

  return { playClick };
}
