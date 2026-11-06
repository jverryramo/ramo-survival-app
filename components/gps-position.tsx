import React, { useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { capturePosition } from "@/lib/capture-position";
import { formatPosition, type GeoPosition } from "@/lib/geolocation";

const labels = {
  fr: {
    title: "Position GPS",
    capture: "Capturer ma position",
    replace: "Actualiser la position",
    busy: "Recherche de la position…",
    none: "Placez-vous sur l’aire de comptage pour capturer son point GPS.",
    accuracy: "Précision annoncée",
    unknown: "Précision inconnue",
    poor: "Précision faible : réessayez dans un endroit dégagé.",
    permission:
      "Autorisez la localisation dans les réglages de l’app ou du navigateur, puis réessayez.",
    error:
      "Position indisponible. Vérifiez la localisation et réessayez à l’extérieur.",
    timeout: "Le GPS n’a pas répondu dans les 20 secondes. Réessayez.",
    hint: "Ce point situera l’aire dans le portrait du champ. Il sera conservé avec le relevé.",
    missing:
      "Vous pourrez enregistrer sans GPS si la position est indisponible.",
  },
  en: {
    title: "GPS position",
    capture: "Capture my position",
    replace: "Refresh position",
    busy: "Finding position…",
    none: "No position recorded. Stand at the point to record.",
    accuracy: "Reported accuracy",
    unknown: "Unknown accuracy",
    poor: "Low accuracy: try again in an open area.",
    permission: "Allow location in app or browser settings, then try again.",
    error:
      "Position unavailable. Check location settings and try again outdoors.",
    timeout: "GPS did not respond within 20 seconds. Try again.",
    hint: "The position will be saved with your record.",
    missing: "You can save without GPS if the position is unavailable.",
  },
  es: {
    title: "Posición GPS",
    capture: "Capturar mi posición",
    replace: "Actualizar posición",
    busy: "Buscando posición…",
    none: "Sin posición registrada. Sitúese en el punto a registrar.",
    accuracy: "Precisión indicada",
    unknown: "Precisión desconocida",
    poor: "Precisión baja: inténtelo en un lugar despejado.",
    permission:
      "Autorice la ubicación en los ajustes de la app o del navegador.",
    error:
      "Posición no disponible. Revise la ubicación e inténtelo al aire libre.",
    timeout: "El GPS no respondió en 20 segundos. Inténtelo de nuevo.",
    hint: "La posición se guardará con su registro.",
    missing: "Puede guardar sin GPS si la posición no está disponible.",
  },
};
export function GpsPosition({
  value,
  onChange,
  language = "fr",
  onBusyChange,
  disabled = false,
}: {
  value?: GeoPosition | null;
  onChange: (position: GeoPosition) => void;
  language?: keyof typeof labels;
  onBusyChange?: (busy: boolean) => void;
  disabled?: boolean;
}) {
  const t = labels[language];
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const running = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  async function capture() {
    if (running.current || disabled) return;
    running.current = true;
    setBusy(true);
    setError("");
    onBusyChange?.(true);
    try {
      const position = await capturePosition();
      if (mounted.current) onChange(position);
    } catch (cause) {
      if (mounted.current) {
        const code = cause instanceof Error ? cause.message : "";
        setError(
          code === "permission"
            ? t.permission
            : code === "timeout"
              ? t.timeout
              : t.error,
        );
      }
    } finally {
      running.current = false;
      if (mounted.current) {
        setBusy(false);
        onBusyChange?.(false);
      }
    }
  }
  return (
    <View
      style={{
        padding: 14,
        marginVertical: 12,
        borderWidth: 1,
        borderColor: "#D3CBBF",
        borderRadius: 10,
        backgroundColor: "#F5F2EE",
        gap: 8,
      }}
    >
      <Text
        accessibilityLiveRegion="polite"
        style={{ color: "#003c38", fontWeight: "700" }}
      >
        {language === "fr"
          ? busy
            ? "Recherche de position…"
            : value
              ? "✓ Position capturée"
              : "Sans position GPS"
          : t.title}
      </Text>
      <Text selectable style={{ color: "#1A1A1A" }}>
        {value ? formatPosition(value) : t.none}
      </Text>
      {value && (
        <>
          <Text style={{ color: "#1A1A1A" }}>
            {value.accuracyMeters === null
              ? t.unknown
              : t.accuracy + " : ± " + Math.round(value.accuracyMeters) + " m"}
          </Text>
          <Text style={{ color: "#1A1A1A" }}>
            {new Date(value.capturedAt).toLocaleString(language)}
          </Text>
          {value.accuracyMeters !== null && value.accuracyMeters > 50 && (
            <Text style={{ color: "#8A4800" }}>{t.poor}</Text>
          )}
        </>
      )}
      <TouchableOpacity
        accessibilityRole="button"
        disabled={busy || disabled}
        onPress={capture}
        style={{
          padding: 12,
          borderRadius: 8,
          backgroundColor: "#003c38",
          opacity: busy ? 0.6 : 1,
        }}
      >
        <Text
          style={{ color: "#FFFFFF", textAlign: "center", fontWeight: "600" }}
        >
          {busy ? t.busy : value ? t.replace : t.capture}
        </Text>
      </TouchableOpacity>
      {!!error && (
        <Text accessibilityRole="alert" style={{ color: "#B91C1C" }}>
          {error}
        </Text>
      )}
      <Text style={{ color: "#555555", fontSize: 12 }}>
        {value ? t.hint : t.missing}
      </Text>
    </View>
  );
}
