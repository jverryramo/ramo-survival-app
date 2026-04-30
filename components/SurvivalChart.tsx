// ============================================================
// SurvivalChart — Graphique de répartition des états de plants
// Barres horizontales proportionnelles, couleurs Ramo
// ============================================================

import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { FieldRecord, STATE_KEYS, totalCounts } from "@/lib/types";

interface SurvivalChartProps {
  records: FieldRecord[];
  title?: string;
}

export function SurvivalChart({ records, title }: SurvivalChartProps) {
  if (records.length === 0) return null;

  // Agréger tous les comptages
  const totals: Record<string, number> = {};
  let grandTotal = 0;

  for (const state of STATE_KEYS) {
    totals[state.key] = records.reduce((sum, r) => sum + r.counts[state.key], 0);
    grandTotal += totals[state.key];
  }

  if (grandTotal === 0) return null;

  // Taux de survie global (Vivant / total)
  const survivalPct = Math.round((totals["Vivant"] / grandTotal) * 100);

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}

      {/* Barre empilée globale */}
      <View style={styles.stackedBarContainer}>
        <View style={styles.stackedBar}>
          {STATE_KEYS.map((state) => {
            const count = totals[state.key];
            if (count === 0) return null;
            const pct = (count / grandTotal) * 100;
            return (
              <View
                key={state.key}
                style={[
                  styles.stackedSegment,
                  {
                    width: `${pct}%`,
                    backgroundColor: state.bg,
                    borderWidth: state.border ? 0 : 0,
                  },
                ]}
              />
            );
          })}
        </View>
        <Text style={styles.survivalLabel}>{survivalPct}% survie</Text>
      </View>

      {/* Légende avec barres individuelles */}
      <View style={styles.legend}>
        {STATE_KEYS.map((state) => {
          const count = totals[state.key];
          const pct = grandTotal > 0 ? (count / grandTotal) * 100 : 0;
          return (
            <View key={state.key} style={styles.legendRow}>
              {/* Label + count */}
              <View style={styles.legendLabelGroup}>
                <View style={[styles.legendDot, { backgroundColor: state.bg, borderWidth: state.border ? 1 : 0, borderColor: state.border ?? "transparent" }]} />
                <Text style={styles.legendLabel}>{state.label}</Text>
                <Text style={styles.legendCount}>{count}</Text>
              </View>
              {/* Barre proportionnelle */}
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${pct}%`,
                      backgroundColor: state.bg,
                      borderWidth: state.border ? 1 : 0,
                      borderColor: state.border ?? "transparent",
                    },
                  ]}
                />
              </View>
              {/* Pourcentage */}
              <Text style={styles.pctLabel}>{Math.round(pct)}%</Text>
            </View>
          );
        })}
      </View>

      {/* Total */}
      <Text style={styles.totalLabel}>Total : {grandTotal} plants · {records.length} aire{records.length !== 1 ? "s" : ""}</Text>
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
  survivalLabel: {
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
    width: 148,
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
    fontSize: 12,
    color: "#6B6560",
    fontWeight: "600",
    minWidth: 34,
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
