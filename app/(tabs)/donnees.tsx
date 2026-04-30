// ============================================================
// Écran Données — Historique et export XLSX
// ============================================================

import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { SurvivalChart } from "@/components/SurvivalChart";
import { useSession } from "@/lib/session-context";
import { FieldRecord, Session, STATE_KEYS, totalCounts, survivalRate } from "@/lib/types";
import { exportToXLSX } from "@/lib/export";

// ---- Composant carte d'enregistrement ----

function RecordCard({
  record,
  onDelete,
}: {
  record: FieldRecord;
  onDelete: () => void;
}) {
  const total = totalCounts(record.counts);
  const rate = survivalRate(record.counts);

  return (
    <View style={cardStyles.container}>
      <View style={cardStyles.header}>
        <View style={cardStyles.headerLeft}>
          <Text style={cardStyles.aireLabel}>Aire {record.aire}</Text>
          <Text style={cardStyles.meta}>
            Var. {record.variety}
            {record.length_m ? ` · ${record.length_m} m` : ""}
          </Text>
        </View>
        <View style={cardStyles.headerRight}>
          <View style={cardStyles.rateBadge}>
            <Text style={cardStyles.rateBadgeText}>{rate}% survie</Text>
          </View>
          <TouchableOpacity
            onPress={onDelete}
            style={cardStyles.deleteBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={cardStyles.deleteBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Badges des états */}
      <View style={cardStyles.badgesRow}>
        {STATE_KEYS.map((state) => {
          const count = record.counts[state.key];
          if (count === 0) return null;
          return (
            <View
              key={state.key}
              style={[
                cardStyles.badge,
                { backgroundColor: state.bg },
                state.border ? { borderWidth: 1, borderColor: state.border } : null,
              ]}
            >
              <Text style={[cardStyles.badgeText, { color: state.text }]}>
                {state.label.substring(0, 3)} {count}
              </Text>
            </View>
          );
        })}
        <View style={cardStyles.totalBadge}>
          <Text style={cardStyles.totalBadgeText}>Total {total}</Text>
        </View>
      </View>

      {/* Commentaire */}
      {record.comment ? (
        <Text style={cardStyles.comment}>{record.comment}</Text>
      ) : null}
    </View>
  );
}

const cardStyles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#D3CBBF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  headerLeft: { flex: 1 },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  aireLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#003c38",
  },
  meta: {
    fontSize: 12,
    color: "#6B6560",
    marginTop: 2,
  },
  rateBadge: {
    backgroundColor: "#003c38",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  rateBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#DCF21E",
  },
  deleteBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtnText: {
    fontSize: 14,
    color: "#9BA1A6",
    fontWeight: "600",
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  totalBadge: {
    backgroundColor: "#F5F2EE",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#D3CBBF",
  },
  totalBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B6560",
  },
  comment: {
    fontSize: 13,
    color: "#6B6560",
    marginTop: 8,
    fontStyle: "italic",
    borderTopWidth: 1,
    borderTopColor: "#F5F2EE",
    paddingTop: 8,
  },
});

// ---- Sélecteur de session ----

function SessionFilter({
  sessions,
  selectedId,
  onSelect,
}: {
  sessions: Session[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <View style={filterStyles.container}>
      <TouchableOpacity
        onPress={() => onSelect(null)}
        style={[filterStyles.chip, selectedId === null && filterStyles.chipActive]}
        activeOpacity={0.7}
      >
        <Text style={[filterStyles.chipText, selectedId === null && filterStyles.chipTextActive]}>
          Toutes
        </Text>
      </TouchableOpacity>
      {sessions.map((s) => (
        <TouchableOpacity
          key={s.id}
          onPress={() => onSelect(s.id)}
          style={[filterStyles.chip, selectedId === s.id && filterStyles.chipActive]}
          activeOpacity={0.7}
        >
          <Text
            style={[filterStyles.chipText, selectedId === s.id && filterStyles.chipTextActive]}
          >
            {s.projectId}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const filterStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#D3CBBF",
  },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "#F5F2EE",
    borderWidth: 1.5,
    borderColor: "#D3CBBF",
  },
  chipActive: {
    backgroundColor: "#003c38",
    borderColor: "#003c38",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B6560",
  },
  chipTextActive: {
    color: "#DCF21E",
  },
});

// ---- Écran principal ----

export default function DonneesScreen() {
  const { sessions, records, removeRecord, resetAll } = useSession();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const filteredRecords =
    selectedSessionId === null
      ? records
      : records.filter((r) => r.sessionId === selectedSessionId);

  const filteredSessions =
    selectedSessionId === null
      ? sessions
      : sessions.filter((s) => s.id === selectedSessionId);

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  async function handleExport() {
    if (filteredRecords.length === 0) {
      Alert.alert("Aucune donnée", "Il n'y a aucune donnée à exporter.");
      return;
    }
    setIsExporting(true);
    try {
      await exportToXLSX(
        filteredRecords,
        sessions,
        selectedSession?.projectId
      );
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'export.";
      Alert.alert("Erreur d'export", message);
    } finally {
      setIsExporting(false);
    }
  }

  function handleDeleteRecord(record: FieldRecord) {
    Alert.alert(
      "Supprimer l'enregistrement",
      `Supprimer l'aire ${record.aire} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => removeRecord(record.id),
        },
      ]
    );
  }

  function handleResetAll() {
    Alert.alert(
      "Réinitialiser tout",
      "Supprimer toutes les sessions et données de cet appareil ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Réinitialiser",
          style: "destructive",
          onPress: async () => {
            await resetAll();
            setSelectedSessionId(null);
          },
        },
      ]
    );
  }

  // Calcul des totaux pour la session sélectionnée
  const totalRecords = filteredRecords.length;
  const totalPlants = filteredRecords.reduce(
    (sum, r) => sum + totalCounts(r.counts),
    0
  );
  const totalVivants = filteredRecords.reduce((sum, r) => sum + r.counts.Vivant, 0);
  const avgRate =
    totalPlants > 0 ? Math.round((totalVivants / totalPlants) * 100) : 0;

  return (
    <ScreenContainer containerClassName="bg-primary" safeAreaClassName="bg-background">
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Données</Text>
        {totalRecords > 0 && (
          <Text style={styles.headerStats}>
            {totalRecords} aire{totalRecords !== 1 ? "s" : ""} · {totalPlants} plants · {avgRate}% survie
          </Text>
        )}
      </View>

      {/* Filtre sessions */}
      {sessions.length > 0 && (
        <SessionFilter
          sessions={sessions}
          selectedId={selectedSessionId}
          onSelect={setSelectedSessionId}
        />
      )}

      <FlatList
        data={filteredRecords}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          filteredRecords.length > 0 ? (
            <SurvivalChart
              records={filteredRecords}
              title={selectedSessionId ? "Répartition de la session" : "Répartition globale"}
            />
          ) : null
        }
        renderItem={({ item }) => (
          <RecordCard record={item} onDelete={() => handleDeleteRecord(item)} />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {records.length === 0
              ? "Aucune donnée enregistrée.\nCommence un comptage dans l'onglet Comptage."
              : "Aucune donnée pour cette session."}
          </Text>
        }
        ListFooterComponent={
          records.length > 0 ? (
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.exportBtn, isExporting && styles.exportBtnDisabled]}
                onPress={handleExport}
                disabled={isExporting}
                activeOpacity={0.85}
              >
                <Text style={styles.exportBtnText}>
                  {isExporting ? "Export en cours…" : "⬇ Télécharger XLSX"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resetBtn}
                onPress={handleResetAll}
                activeOpacity={0.85}
              >
                <Text style={styles.resetBtnText}>Réinitialiser tout</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />
    </ScreenContainer>
  );
}

// ---- Styles ----

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#003c38",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#DCF21E",
  },
  headerStats: {
    fontSize: 13,
    color: "#D3CBBF",
    marginTop: 2,
  },
  listContent: {
    padding: 16,
    paddingBottom: 16,
  },
  emptyText: {
    textAlign: "center",
    color: "#9BA1A6",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 40,
  },
  footer: {
    marginTop: 8,
    gap: 12,
  },
  exportBtn: {
    backgroundColor: "#DCF21E",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  exportBtnDisabled: {
    opacity: 0.6,
  },
  exportBtnText: {
    color: "#003c38",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  resetBtn: {
    backgroundColor: "#EF4444",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  resetBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
