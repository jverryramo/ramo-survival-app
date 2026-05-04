// ============================================================
// Écran Données — Historique et export XLSX
// ============================================================

import React, { useMemo, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";

import { SafeAreaView } from "react-native-safe-area-context";


import { useSession } from "@/lib/session-context";
import { FieldRecord, Session, STATE_KEYS, totalCounts } from "@/lib/types";
import { exportToXLSX } from "@/lib/export";

// ---- Composant carte d'enregistrement ----

function RecordCard({
  record,
  sessions,
  onDelete,
}: {
  record: FieldRecord;
  sessions: Session[];
  onDelete: () => void;
}) {
  const total = totalCounts(record.counts);

  const session = sessions.find((s) => s.id === record.sessionId);

  return (
    <View style={cardStyles.container}>
      <View style={cardStyles.header}>
        <View style={cardStyles.headerLeft}>
          <Text style={cardStyles.aireLabel}>Aire {record.aire}</Text>
          <Text style={cardStyles.meta}>
            Var. {record.variety}
            {record.length_m ? ` · ${record.length_m} m` : ""}
            {session ? ` · ${session.projectId}` : ""}
          </Text>
        </View>
        <View style={cardStyles.headerRight}>

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

// ---- Barre de filtres générique ----

function FilterBar({
  label,
  options,
  selected,
  onSelect,
  highlight,
}: {
  label: string;
  options: Array<{ value: string | null; label: string }>;
  selected: string | null;
  onSelect: (v: string | null) => void;
  highlight?: boolean;
}) {
  return (
    <View style={[filterStyles.row, highlight && filterStyles.rowHighlight]}>
      <Text style={[filterStyles.rowLabel, highlight && filterStyles.rowLabelHighlight]}>
        {label}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={filterStyles.chipsContainer}
      >
        {options.map((opt) => {
          const isActive = selected === opt.value;
          return (
            <TouchableOpacity
              key={opt.value ?? "__all__"}
              onPress={() => onSelect(opt.value)}
              style={[
                filterStyles.chip,
                highlight && filterStyles.chipHighlight,
                isActive && (highlight ? filterStyles.chipActiveHighlight : filterStyles.chipActive),
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  filterStyles.chipText,
                  highlight && filterStyles.chipTextHighlight,
                  isActive && (highlight ? filterStyles.chipTextActiveHighlight : filterStyles.chipTextActive),
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const filterStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#D3CBBF",
    paddingVertical: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  rowLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B6560",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    width: 62,
    flexShrink: 0,
  },
  chipsContainer: {
    flexDirection: "row",
    gap: 8,
    paddingRight: 8,
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

  // Styles highlight pour le filtre variété
  rowHighlight: {
    backgroundColor: "#F0F9F4",
    borderTopWidth: 1,
    borderTopColor: "#D3CBBF",
    paddingVertical: 10,
  },
  rowLabelHighlight: {
    color: "#003c38",
    fontWeight: "800",
    fontSize: 12,
  },
  chipHighlight: {
    backgroundColor: "#FFFFFF",
    borderColor: "#003c38",
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipActiveHighlight: {
    backgroundColor: "#003c38",
    borderColor: "#003c38",
  },
  chipTextHighlight: {
    color: "#003c38",
    fontWeight: "700",
    fontSize: 14,
  },
  chipTextActiveHighlight: {
    color: "#DCF21E",
  },
});

// ---- Écran principal ----

export default function DonneesScreen() {
  const { sessions, records, removeRecord, resetAll } = useSession();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedAire, setSelectedAire] = useState<string | null>(null);

  const [isExporting, setIsExporting] = useState(false);

  // Options dynamiques pour Aire et Variété (basées sur les données existantes)
  const aireOptions = useMemo(() => {
    const base = records
      .filter((r) => !selectedSessionId || r.sessionId === selectedSessionId);
    const unique = [...new Set(base.map((r) => r.aire))]
      .sort((a, b) => parseInt(a) - parseInt(b));
    return [
      { value: null, label: "Toutes" },
      ...unique.map((v) => ({ value: v, label: `Aire ${v}` })),
    ];
  }, [records, selectedSessionId]);


  const sessionOptions = useMemo(() => [
    { value: null, label: "Toutes" },
    ...sessions.map((s) => ({ value: s.id, label: s.projectId })),
  ], [sessions]);

  // Application des filtres
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (selectedSessionId && r.sessionId !== selectedSessionId) return false;
      if (selectedAire && r.aire !== selectedAire) return false;

      return true;
    });
  }, [records, selectedSessionId, selectedAire]);

  const filteredSessions = useMemo(() =>
    selectedSessionId ? sessions.filter((s) => s.id === selectedSessionId) : sessions,
    [sessions, selectedSessionId]
  );

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  // Réinitialiser les filtres Aire/Variété quand on change de session
  function handleSelectSession(id: string | null) {
    setSelectedSessionId(id);
    setSelectedAire(null);

  }

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
        selectedSession?.projectId,
        // Si aucune session sélectionnée → mode multi-onglets
        selectedSessionId === null
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
            setSelectedAire(null);
        
          },
        },
      ]
    );
  }

  // Calcul des totaux pour les données filtrées
  const totalRecords = filteredRecords.length;
  const totalPlants = filteredRecords.reduce((sum, r) => sum + totalCounts(r.counts), 0);

  // Label du bouton export
  const exportLabel = selectedSessionId === null
    ? "⬇ Télécharger XLSX (toutes sessions)"
    : "⬇ Télécharger XLSX";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F2EE' }} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Données</Text>
        {totalRecords > 0 && (
          <Text style={styles.headerStats}>
            {totalRecords} aire{totalRecords !== 1 ? "s" : ""} · {totalPlants} plants
          </Text>
        )}
      </View>

      {/* Filtres */}
      {sessions.length > 0 && (
        <View style={filterStyles.wrapper}>
          <FilterBar
            label="Session"
            options={sessionOptions}
            selected={selectedSessionId}
            onSelect={handleSelectSession}
          />
          {aireOptions.length > 2 && (
            <FilterBar
              label="Aire"
              options={aireOptions}
              selected={selectedAire}
              onSelect={setSelectedAire}
            />
          )}
        </View>
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.listContent}
      >
        {/* Liste des enregistrements */}
        {filteredRecords.length === 0 ? (
          <Text style={styles.emptyText}>
            {records.length === 0
              ? "Aucune donnée enregistrée.\nCommence un comptage dans l'onglet Comptage."
              : "Aucune donnée pour ces filtres."}
          </Text>
        ) : (
          filteredRecords.map((item) => (
            <RecordCard
              key={item.id}
              record={item}
              sessions={sessions}
              onDelete={() => handleDeleteRecord(item)}
            />
          ))
        )}

        {/* Boutons export et réinitialiser — toujours visibles si données existent */}
        {records.length > 0 && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.exportBtn, isExporting && styles.exportBtnDisabled]}
              onPress={handleExport}
              disabled={isExporting}
              activeOpacity={0.85}
            >
              <Text style={styles.exportBtnText}>
                {isExporting ? "Export en cours…" : exportLabel}
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
        )}
      </ScrollView>
    </SafeAreaView>
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
    paddingBottom: 200,
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
    marginBottom: 60,
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
