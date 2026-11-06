import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Svg, { Circle, Text as SvgText } from "react-native-svg";
import { projectAreas, summarizeAreas } from "@/lib/area-summary";
import { FieldRecord, Session, STATE_KEYS } from "@/lib/types";

export function AreaOverview({
  records,
  sessions,
  sessionId,
  onSelect,
}: {
  records: FieldRecord[];
  sessions: Session[];
  sessionId: string | null;
  onSelect: (area: string, session: string) => void;
}) {
  const areas = summarizeAreas(records);
  const points = projectAreas(areas);
  return (
    <View style={{ gap: 12, marginBottom: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", color: "#003c38" }}>
        Portrait par aire
      </Text>
      <Text>
        {areas.length} aires · {areas.filter((a) => a.gps).length} géolocalisées
      </Text>
      {!sessionId ? (
        <Text>Sélectionnez une session pour voir son plan des aires.</Text>
      ) : points.length > 0 ? (
        <View
          style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: 12 }}
        >
          <Text style={{ fontWeight: "700", color: "#003c38" }}>
            Plan des points GPS · Nord ↑
          </Text>
          <Svg
            width="100%"
            height={280}
            viewBox="0 0 320 280"
            accessibilityLabel="Plan des aires géolocalisées, nord en haut"
          >
            {points.map(({ area, x, y }) => (
              <React.Fragment key={area.key}>
                <Circle
                  cx={x}
                  cy={y}
                  r={16}
                  fill="#003c38"
                  onPress={() => onSelect(area.aire, area.sessionId)}
                />
                <SvgText
                  x={x}
                  y={y + 5}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize={13}
                  onPress={() => onSelect(area.aire, area.sessionId)}
                >
                  {area.aire}
                </SvgText>
              </React.Fragment>
            ))}
          </Svg>
          <Text style={{ color: "#6B6560", fontSize: 12 }}>
            Position relative des aires, sans fond de carte ni limites de
            parcelles. Le point représente le dernier GPS capturé pour l’aire
            dans cette session. Les points proches peuvent se superposer.
          </Text>
        </View>
      ) : (
        <Text>
          Aucun point GPS dans cette session. Ouvrez un relevé et capturez la
          position en étant sur l’aire.
        </Text>
      )}
      {areas.map((area) => (
        <TouchableOpacity
          key={area.key}
          onPress={() => onSelect(area.aire, area.sessionId)}
          accessibilityRole="button"
          style={{
            backgroundColor: "#FFFFFF",
            padding: 16,
            borderRadius: 12,
            gap: 8,
            borderWidth: 1,
            borderColor: "#D3CBBF",
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#003c38" }}>
            Aire {area.aire} ·{" "}
            {area.livingPercent === null
              ? "—"
              : `${area.livingPercent} % vivants`}
          </Text>
          {!sessionId && (
            <Text>
              {sessions.find((s) => s.id === area.sessionId)?.projectId} ·{" "}
              {sessions.find((s) => s.id === area.sessionId)?.date}
            </Text>
          )}
          <Text>
            {area.total} plants · {area.records.length} relevés
          </Text>
          <Text>
            {STATE_KEYS.map((s) => `${s.label} : ${area.counts[s.key]}`).join(
              " · ",
            )}
          </Text>
          <Text style={{ color: "#6B6560" }}>
            {area.gps
              ? `${area.gps.latitude.toFixed(6)}, ${area.gps.longitude.toFixed(6)} · ${area.gps.accuracyMeters === null ? "précision inconnue" : `± ${Math.round(area.gps.accuracyMeters)} m`}`
              : "Sans position GPS"}
          </Text>
          <Text style={{ color: "#003c38", fontWeight: "600" }}>
            Voir les relevés →
          </Text>
        </TouchableOpacity>
      ))}
      {areas.length > 0 && (
        <Text style={{ color: "#6B6560", fontSize: 12 }}>
          Pourcentage de vivants = catégorie Vivant / tous les plants comptés.
          Tous les relevés de l’aire sont additionnés, y compris les
          répétitions.
        </Text>
      )}
    </View>
  );
}
