// ============================================================
// VarietyChart — Graphique de répartition par variété
// Barres horizontales proportionnelles, couleurs distinctes
// ============================================================

import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { FieldRecord, totalCounts } from "@/lib/types";

// Palette de couleurs distinctes pour les variétés
const VARIETY_COLORS = [
  "#2563EB", // bleu
  "#DCF21E", // chartreuse
  "#F59E0B", // ambre
  "#8A6F48", // brun
  "#EC4899", // rose
  "#14B8A6", // teal
  "#8B5CF6", // violet
  "#EF4444", // rouge
  "#06B6D4", // cyan
  "#84CC16", // lime
  "#F97316", // orange
  "#6366F1", // indigo
  "#10B981", // émeraude
  "#D946EF", // fuchsia
  "#78716C", // stone
  "#0EA5E9", // sky
  "#A3E635", // lime clair
  "#FB923C", // orange clair
  "#818CF8", // indigo clair
  "#34D399", // émeraude clair
];

function getVarietyColor(index: number): string {
  return VARIETY_COLORS[index % VARIETY_COLORS.length];
}

function getTextColorForBg(bg: string): string {
  // Couleurs claires → texte noir, couleurs foncées → texte blanc
  const lightBgs = ["#DCF21E", "#F59E0B", "#A3E635", "#FB923C", "#34D399", "#84CC16"];
  return lightBgs.includes(bg) ? "#000000" : "#FFFFFF";
}

interface VarietyChartProps {
  records: FieldRecord[];
  title?: string;
}

export function VarietyChart({ records, title }: VarietyChartProps) {
  if (records.length === 0) return null;

  // Agréger par variété
  const varietyMap: Record<string, { total: number; vivant: number; aires: number }> = {};

  for (const record of records) {
    const v = record.variety;
    if (!varietyMap[v]) {
      varietyMap[v] = { total: 0, vivant: 0, aires: 0 };
    }
    varietyMap[v].total += totalCounts(record.counts);
    varietyMap[v].vivant += record.counts.Vivant;
    varietyMap[v].aires += 1;
  }

  // Trier par numéro de variété
  const varieties = Object.keys(varietyMap).sort(
    (a, b) => parseInt(a) - parseInt(b)
  );

  if (varieties.length === 0) return null;

  const grandTotal = Object.values(varietyMap).reduce((sum, v) => sum + v.total, 0);
  if (grandTotal === 0) return null;

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}

      {/* Barre empilée globale par variété */}
      <View style={styles.stackedBarContainer}>
        <View style={styles.stackedBar}>
          {varieties.map((v, idx) => {
            const pct = (varietyMap[v].total / grandTotal) * 100;
            if (pct === 0) return null;
            return (
              <View
                key={v}
                style={[
                  styles.stackedSegment,
                  {
                    width: `${pct}%`,
                    backgroundColor: getVarietyColor(idx),
                  },
                ]}
              />
            );
          })}
        </View>
        <Text style={styles.totalLabelRight}>{grandTotal} plants</Text>
      </View>

      {/* Légende avec barres individuelles */}
      <View style={styles.legend}>
        {varieties.map((v, idx) => {
          const data = varietyMap[v];
          const pct = grandTotal > 0 ? (data.total / grandTotal) * 100 : 0;
          const survivalPct = data.total > 0 ? Math.round((data.vivant / data.total) * 100) : 0;
          return (
            <View key={v} style={styles.legendRow}>
              {/* Label + count */}
              <View style={styles.legendLabelGroup}>
                <View
                  style={[styles.legendDot, { backgroundColor: getVarietyColor(idx) }]}
                />
                <Text style={styles.legendLabel}>Var. {v}</Text>
                <Text style={styles.legendCount}>{data.total}</Text>
              </View>
              {/* Barre proportionnelle */}
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${pct}%`,
                      backgroundColor: getVarietyColor(idx),
                    },
                  ]}
                />
              </View>
              {/* Pourcentage + survie */}
              <Text style={styles.pctLabel}>
                {Math.round(pct)}% · {survivalPct}%🌱
              </Text>
            </View>
          );
        })}
      </View>

      {/* Total */}
      <Text style={styles.totalLabel}>
        {varieties.length} variété{varieties.length !== 1 ? "s" : ""} · {grandTotal} plants · {records.length} aire{records.length !== 1 ? "s" : ""}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#D3CBBF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#003c38",
    marginBottom: 12,
  },
  // Barre empilée
  stackedBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 10,
  },
  stackedBar: {
    flex: 1,
    height: 18,
    borderRadius: 9,
    flexDirection: "row",
    overflow: "hidden",
    backgroundColor: "#F5F2EE",
  },
  stackedSegment: {
    height: "100%",
  },
  totalLabelRight: {
    fontSize: 13,
    fontWeight: "700",
    color: "#003c38",
    minWidth: 72,
    textAlign: "right",
  },
  // Légende
  legend: {
    gap: 8,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendLabelGroup: {
    flexDirection: "row",
    alignItems: "center",
    width: 110,
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendLabel: {
    fontSize: 13,
    color: "#1A1A1A",
    fontWeight: "500",
    flex: 1,
  },
  legendCount: {
    fontSize: 13,
    fontWeight: "700",
    color: "#003c38",
    minWidth: 28,
    textAlign: "right",
  },
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: "#F5F2EE",
    borderRadius: 5,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 5,
    minWidth: 4,
  },
  pctLabel: {
    fontSize: 11,
    color: "#6B6560",
    fontWeight: "600",
    minWidth: 70,
    textAlign: "right",
  },
  totalLabel: {
    fontSize: 12,
    color: "#9BA1A6",
    marginTop: 10,
    textAlign: "right",
    fontStyle: "italic",
  },
});
