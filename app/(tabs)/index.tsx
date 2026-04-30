// ============================================================
// Écran Session — Création et sélection de session
// ============================================================

import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
// Note: TextInput gardé pour le champ numéro de projet
import { useRouter, type Href } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { DatePickerField } from "@/components/DatePickerField";
import { useSession } from "@/lib/session-context";
import { Session } from "@/lib/types";

// ---- Utilitaires ----

function todayISO(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

// ---- Composant carte de session ----

function SessionCard({
  session,
  isActive,
  recordCount,
  onSelect,
  onDelete,
}: {
  session: Session;
  isActive: boolean;
  recordCount: number;
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <Pressable
      onPress={onSelect}
      style={({ pressed }) => [
        styles.sessionCard,
        isActive && styles.sessionCardActive,
        pressed && { opacity: 0.8 },
      ]}
    >
      <View style={styles.sessionCardContent}>
        <View style={styles.sessionCardLeft}>
          <Text style={[styles.sessionProjectId, isActive && styles.sessionProjectIdActive]}>
            {session.projectId}
          </Text>
          <Text style={[styles.sessionDate, isActive && styles.sessionDateActive]}>
            {formatDate(session.date)} · {recordCount} aire{recordCount !== 1 ? "s" : ""}
            {session.operator ? ` · ${session.operator}` : ""}
          </Text>
        </View>
        {isActive && (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>Actif</Text>
          </View>
        )}
        <TouchableOpacity
          onPress={onDelete}
          style={styles.deleteBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.deleteBtnText}>✕</Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  );
}

// ---- Écran principal ----

export default function SessionScreen() {
  const router = useRouter();
  const { sessions, activeSession, setActiveSession, createSession, removeSession, records, isLoading } =
    useSession();

  const [projectId, setProjectId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [operator, setOperator] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  async function handleStart() {
    if (!projectId.trim()) {
      Alert.alert("Champ requis", "Saisis un numéro de projet.");
      return;
    }
    if (!date) {
      Alert.alert("Champ requis", "Sélectionne une date.");
      return;
    }
    setIsCreating(true);
    try {
      await createSession(projectId.trim(), date, operator.trim());
      setProjectId("");
      setOperator("");
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      (router as any).push("/(tabs)/comptage");
    } finally {
      setIsCreating(false);
    }
  }

  function handleSelectSession(session: Session) {
    setActiveSession(session);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    (router as any).push("/(tabs)/comptage");
  }

  function handleDeleteSession(session: Session) {
    Alert.alert(
      "Supprimer la session",
      `Supprimer "${session.projectId}" et toutes ses données ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => removeSession(session.id),
        },
      ]
    );
  }

  function getRecordCount(sessionId: string): number {
    return records.filter((r) => r.sessionId === sessionId).length;
  }

  return (
    <ScreenContainer containerClassName="bg-primary" safeAreaClassName="bg-background">
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌱 Survival</Text>
        <Text style={styles.headerSubtitle}>Comptage de plants de saules</Text>
      </View>

      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Formulaire nouvelle session */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Nouvelle session</Text>

              <Text style={styles.label}>Numéro de projet</Text>
              <TextInput
                style={styles.input}
                value={projectId}
                onChangeText={setProjectId}
                placeholder="Ex. 2025-001"
                placeholderTextColor="#9BA1A6"
                autoCapitalize="characters"
                returnKeyType="done"
              />

              <DatePickerField
                label="Date"
                value={date}
                onChange={setDate}
              />

              <Text style={styles.label}>Opérateur</Text>
              <TextInput
                style={styles.input}
                value={operator}
                onChangeText={setOperator}
                placeholder="Nom de la personne"
                placeholderTextColor="#9BA1A6"
                autoCapitalize="words"
                returnKeyType="done"
              />

              <TouchableOpacity
                style={[styles.startBtn, isCreating && styles.startBtnDisabled]}
                onPress={handleStart}
                disabled={isCreating}
                activeOpacity={0.85}
              >
                <Text style={styles.startBtnText}>
                  {isCreating ? "Démarrage…" : "Démarrer la session"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Titre liste sessions */}
            {sessions.length > 0 && (
              <Text style={styles.sectionTitle}>Sessions récentes</Text>
            )}
          </>
        }
        renderItem={({ item }) => (
          <SessionCard
            session={item}
            isActive={activeSession?.id === item.id}
            recordCount={getRecordCount(item.id)}
            onSelect={() => handleSelectSession(item)}
            onDelete={() => handleDeleteSession(item)}
          />
        )}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={styles.emptyText}>
              Aucune session enregistrée.{"\n"}Crée ta première session ci-dessus.
            </Text>
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
    paddingTop: 16,
    paddingBottom: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#DCF21E",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#D3CBBF",
    marginTop: 2,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#003c38",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B6560",
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#D3CBBF",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: "#1A1A1A",
    backgroundColor: "#F5F2EE",
    marginBottom: 12,
  },
  startBtn: {
    backgroundColor: "#003c38",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  startBtnDisabled: {
    opacity: 0.6,
  },
  startBtnText: {
    color: "#DCF21E",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6B6560",
    marginBottom: 10,
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  sessionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "#D3CBBF",
    overflow: "hidden",
  },
  sessionCardActive: {
    borderColor: "#003c38",
    backgroundColor: "#F0FAF0",
  },
  sessionCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  sessionCardLeft: {
    flex: 1,
  },
  sessionProjectId: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  sessionProjectIdActive: {
    color: "#003c38",
  },
  sessionDate: {
    fontSize: 13,
    color: "#6B6560",
    marginTop: 2,
  },
  sessionDateActive: {
    color: "#00524d",
  },
  activeBadge: {
    backgroundColor: "#DCF21E",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 10,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#003c38",
  },
  deleteBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtnText: {
    fontSize: 16,
    color: "#9BA1A6",
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    color: "#9BA1A6",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 24,
  },
});
