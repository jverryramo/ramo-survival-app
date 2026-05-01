// ============================================================
// Hook useClickSound — Joue un son de click court
// Utilise expo-audio sur native, no-op sur web
// ============================================================

import { useCallback, useEffect, useRef } from "react";
import { Platform } from "react-native";

// Type minimal pour le player audio
interface AudioPlayerLike {
  seekTo: (position: number) => void;
  play: () => void;
  release: () => void;
}

export function useClickSound() {
  const playerRef = useRef<AudioPlayerLike | null>(null);

  useEffect(() => {
    if (Platform.OS === "web") return;

    // Import dynamique pour éviter le crash sur web
    let cancelled = false;
    (async () => {
      try {
        // Dynamic import to avoid crash on web
        // @ts-ignore - expo-audio may not have types in dev
        const audioModule = await import(/* webpackIgnore: true */ "expo-audio");
        if (cancelled) return;
        const player = audioModule.createAudioPlayer(
          require("@/assets/sounds/click.wav")
        );
        playerRef.current = player as unknown as AudioPlayerLike;
      } catch (_) {
        // Silently fail if expo-audio is not available
      }
    })();

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
