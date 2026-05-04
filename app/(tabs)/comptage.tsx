// ============================================================
// Écran Comptage — Deux étapes : Config → Mode terrain plein écran
// ============================================================

import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useKeepAwake } from "expo-keep-awake";
import { useSoundEnabled } from "@/hooks/use-sound";
import { useClickSound } from "@/hooks/use-click-sound";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenContainer } from "@/components/screen-container";
import { useSession } from "@/lib/session-context";
import { PlantCounts, STATE_KEYS, createEmptyCounts, totalCounts } from "@/lib/types";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// ---- Sélecteur +/- ----

function NumberPicker({
  label,
  value,
  onChange,
  min = 1,
  max = 20,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  min?: number;
  max?: number;
}) {
  const num = parseInt(value, 10) || min;
  return (
    <View style={pickerStyles.container}>
      <Text style={pickerStyles.label}>{label}</Text>
      <View style={pickerStyles.row}>
        <TouchableOpacity
          onPress={() => num > min && onChange(String(num - 1))}
          style={[pickerStyles.btn, num <= min && pickerStyles.btnDisabled]}
          disabled={num <= min}
          activeOpacity={0.7}
        >
          <Text style={pickerStyles.btnText}>−</Text>
        </TouchableOpacity>
        <Text style={pickerStyles.value}>{num}</Text>
        <TouchableOpacity
          onPress={() => num < max && onChange(String(num + 1))}
          style={[pickerStyles.btn, num >= max && pickerStyles.btnDisabled]}
          disabled={num >= max}
          activeOpacity={0.7}
        >
          <Text style={pickerStyles.btnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const pickerStyles = StyleSheet.create({
  container: { flex: 1 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B6560",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F2EE",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#D3CBBF",
    overflow: "hidden",
  },
  btn: {
    width: 52,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#003c38",
  },
  btnDisabled: { backgroundColor: "#D3CBBF" },
  btnText: { fontSize: 24, fontWeight: "700", color: "#FFFFFF", lineHeight: 28 },
  value: { flex: 1, textAlign: "center", fontSize: 22, fontWeight: "700", color: "#1A1A1A" },
});

// ---- Bouton de comptage plein écran ----

function CounterButton({
  label,
  count,
  bg,
  textColor,
  border,
  onPress,
  onLongPress,
}: {
  label: string;
  count: number;
  bg: string;
  textColor: string;
  border?: string;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  function handlePress() {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.94, duration: 50, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  }

  return (
    <Animated.View style={[fieldStyles.btnWrapper, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={onLongPress}
        style={[
          fieldStyles.btn,
          { backgroundColor: bg },
          border ? { borderWidth: 2.5, borderColor: border } : null,
        ]}
        activeOpacity={0.9}
        delayLongPress={600}
      >
        <Text style={[fieldStyles.btnLabel, { color: textColor }]}>{label}</Text>
        <Text style={[fieldStyles.btnCount, { color: textColor }]}>{count}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const fieldStyles = StyleSheet.create({
  btnWrapper: { flex: 1 },
  btn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    borderRadius: 0,
  },
  btnLabel: { fontSize: 20, fontWeight: "700", letterSpacing: 0.2 },
  btnCount: { fontSize: 52, fontWeight: "900", letterSpacing: -1 },
});

// ============================================================
// Écran principal
// ============================================================

export default function ComptageScreen() {
  const { activeSession, addRecord } = useSession();
  const insets = useSafeAreaInsets();

  useKeepAwake();

  const { soundEnabled, toggleSound } = useSoundEnabled();
  const { playClick } = useClickSound();

  const [aire, setAire] = useState("1");
  const [lengthM, setLengthM] = useState("");
  const [variety, setVariety] = useState("1");
  const [counts, setCounts] = useState<PlantCounts>(createEmptyCounts());
  const [comment, setComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false); // feedback post-enregistrement

  // Mode : "config" ou "terrain"
  const [mode, setMode] = useState<"config" | "terrain">("config");

  function increment(key: keyof PlantCounts) {
    setCounts((prev) => ({ ...prev, [key]: prev[key] + 1 }));
    // Jouer le son si activé
    if (soundEnabled) {
      playClick();
    }
  }

  function resetCount(key: keyof PlantCounts) {
    Alert.alert(
      "Réinitialiser",
      `Remettre "${STATE_KEYS.find((s) => s.key === key)?.label}" à 0 ?`,
      [
        { text: "Annuler", style: "cancel" },
        { text: "Réinitialiser", onPress: () => setCounts((prev) => ({ ...prev, [key]: 0 })) },
      ]
    );
  }

  function handleStartCounting() {
    if (!activeSession) {
      Alert.alert("Aucune session active", "Démarre d'abord une session dans l'onglet Session.");
      return;
    }
    setCounts(createEmptyCounts());
    setMode("terrain");
  }

  async function handleSave() {
    // Bloquer le double-enregistrement
    if (isSaving || saved) return;

    const total = totalCounts(counts);
    if (total === 0) {
      Alert.alert("Comptage vide", "Ajoute au moins un plant avant d'enregistrer.");
      return;
    }

    if (!lengthM.trim()) {
      const confirmed = await new Promise<boolean>((resolve) => {
        Alert.alert(
          "Longueur manquante",
          "La longueur (m) n'est pas remplie.\nVeux-tu enregistrer quand même ?",
          [
            { text: "Annuler", style: "cancel", onPress: () => resolve(false) },
            { text: "Enregistrer quand même", onPress: () => resolve(true) },
          ]
        );
      });
      if (!confirmed) return;
    }

    setIsSaving(true);
    try {
      await addRecord(activeSession!.id, aire, lengthM, variety, counts, comment);
      const nextAire = String(Math.min(parseInt(aire, 10) + 1, 20));
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      // Afficher le feedback visuel vert pendant 2 secondes avant de passer à l'aire suivante
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setAire(nextAire);
        setLengthM("");
        setComment("");
        setMode("config");
      }, 2000);
    } finally {
      setIsSaving(false);
    }
  }

  const total = totalCounts(counts);

  // ---- Header commun ----
  const header = (
    <View style={styles.header}>
      {activeSession ? (
        <>
          <Text style={styles.headerProject}>{activeSession.projectId}</Text>
          <Text style={styles.headerDate}>
            {activeSession.date}
            {activeSession.operator ? ` · ${activeSession.operator}` : ""}
          </Text>
        </>
      ) : (
        <Text style={styles.headerNoSession}>Aucune session active</Text>
      )}
    </View>
  );

  // ============================================================
  // MODE TERRAIN — Plein écran, 6 grands boutons
  // ============================================================
  if (mode === "terrain") {
    return (
      <View style={[styles.terrainContainer, { paddingBottom: insets.bottom }]}>
        {/* Header terrain compact */}
        <View style={styles.terrainHeader}>
          <View style={styles.terrainHeaderLeft}>
            <Text style={styles.terrainAireLabel}>AIRE</Text>
            <Text style={styles.terrainAireValue}>{aire}</Text>
          </View>
          <View style={styles.terrainHeaderCenter}>
            <Text style={styles.terrainProjectLabel}>
              {activeSession?.projectId ?? "—"}
            </Text>
            <Text style={styles.terrainVarieteLabel}>Variété {variety}</Text>
          </View>
          <View style={styles.terrainHeaderRight}>
            <Text style={styles.terrainTotalLabel}>TOTAL</Text>
            <Text style={styles.terrainTotalValue}>{total}</Text>
          </View>
          <TouchableOpacity
            onPress={toggleSound}
            style={styles.soundToggle}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.soundToggleText}>{soundEnabled ? "🔊" : "🔇"}</Text>
          </TouchableOpacity>
        </View>

        {/* 6 boutons plein écran */}
        <View style={styles.terrainButtons}>
          {STATE_KEYS.map((state) => (
            <CounterButton
              key={state.key}
              label={state.label}
              count={counts[state.key]}
              bg={state.bg}
              textColor={state.text}
              border={state.border}
              onPress={() => increment(state.key)}
              onLongPress={() => resetCount(state.key)}
            />
          ))}
        </View>

        {/* Overlay de confirmation post-enregistrement */}
        {saved && (
          <View style={styles.savedOverlay}>
            <Text style={styles.savedIcon}>✓</Text>
            <Text style={styles.savedTitle}>Aire {aire} enregistrée</Text>
            <Text style={styles.savedSubtitle}>{total} plants · Passage à l’aire suivante…</Text>
          </View>
        )}

        {/* Footer : annuler + enregistrer */}
        <View style={styles.terrainFooter}>
          <TouchableOpacity
            style={styles.terrainCancelBtn}
            onPress={() => !saved && setMode("config")}
            activeOpacity={0.8}
            disabled={saved}
          >
            <Text style={styles.terrainCancelText}>← Retour</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.terrainSaveBtn, (isSaving || saved) && styles.terrainSaveBtnDisabled]}
            onPress={handleSave}
            disabled={isSaving || saved}
            activeOpacity={0.85}
          >
            <Text style={styles.terrainSaveText}>
              {isSaving ? "Enregistrement…" : saved ? "✓ Enregistré !" : "✓ Enregistrer l'aire"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ============================================================
  // MODE CONFIG — Formulaire Aire / Longueur / Variété
  // ============================================================
  return (
    <ScreenContainer containerClassName="bg-primary" safeAreaClassName="bg-background">
      {header}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Aire + Variété */}
        <View style={styles.pickersRow}>
          <NumberPicker label="Aire" value={aire} onChange={setAire} />
          <View style={{ width: 14 }} />
          <NumberPicker label="Variété" value={variety} onChange={setVariety} />
        </View>

        {/* Longueur */}
        <View style={styles.fieldGroup}>
          <View style={styles.fieldLabelRow}>
            <Text style={styles.fieldLabel}>Longueur (m)</Text>
            {!lengthM.trim() && <Text style={styles.fieldRequired}>requis</Text>}
          </View>
          <TextInput
            style={[styles.input, !lengthM.trim() && styles.inputWarning]}
            value={lengthM}
            onChangeText={setLengthM}
            placeholder="Ex. 45.5"
            placeholderTextColor="#F59E0B"
            keyboardType="decimal-pad"
            returnKeyType="go"
            onSubmitEditing={handleStartCounting}
          />
        </View>

        {/* Commentaire */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Commentaire (optionnel)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={comment}
            onChangeText={setComment}
            placeholder="Notes sur cette aire…"
            placeholderTextColor="#9BA1A6"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Bouton commencer */}
        <TouchableOpacity
          style={[styles.startBtn, !activeSession && styles.startBtnDisabled]}
          onPress={handleStartCounting}
          disabled={!activeSession}
          activeOpacity={0.85}
        >
          <Text style={styles.startBtnText}>Commencer le comptage →</Text>
        </TouchableOpacity>

        {!activeSession && (
          <Text style={styles.noSessionHint}>
            Démarre une session dans l'onglet Session pour commencer.
          </Text>
        )}
      </ScrollView>
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
  headerProject: { fontSize: 22, fontWeight: "800", color: "#DCF21E" },
  headerDate: { fontSize: 13, color: "#D3CBBF", marginTop: 2 },
  headerNoSession: { fontSize: 16, color: "#D3CBBF", fontStyle: "italic" },

  scrollContent: { padding: 20, paddingBottom: 48 },

  pickersRow: { flexDirection: "row", marginBottom: 20 },

  fieldGroup: { marginBottom: 20 },
  fieldLabel: {
    fontSize: 13, fontWeight: "600", color: "#6B6560",
    marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5,
  },
  fieldLabelRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 6,
  },
  fieldRequired: {
    fontSize: 11, fontWeight: "700", color: "#F59E0B",
    textTransform: "uppercase", letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1.5, borderColor: "#D3CBBF", borderRadius: 10,
    padding: 16, fontSize: 17, color: "#1A1A1A", backgroundColor: "#FFFFFF",
  },
  inputWarning: { borderColor: "#F59E0B", backgroundColor: "#FFFBF0" },
  textArea: { minHeight: 80, paddingTop: 12 },

  startBtn: {
    backgroundColor: "#003c38", borderRadius: 16,
    paddingVertical: 22, alignItems: "center", marginTop: 8,
  },
  startBtnDisabled: { opacity: 0.4 },
  startBtnText: { color: "#DCF21E", fontSize: 20, fontWeight: "800", letterSpacing: 0.3 },
  noSessionHint: {
    textAlign: "center", color: "#9BA1A6", fontSize: 13,
    marginTop: 12, fontStyle: "italic",
  },

  // ---- Mode terrain ----
  terrainContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  terrainHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#003c38",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 12,
  },
  terrainHeaderLeft: { alignItems: "center", width: 60 },
  terrainAireLabel: { fontSize: 10, fontWeight: "700", color: "#D3CBBF", letterSpacing: 1 },
  terrainAireValue: { fontSize: 36, fontWeight: "900", color: "#DCF21E", lineHeight: 40 },
  terrainHeaderCenter: { flex: 1, alignItems: "center" },
  terrainProjectLabel: { fontSize: 16, fontWeight: "800", color: "#FFFFFF" },
  terrainVarieteLabel: { fontSize: 13, color: "#D3CBBF", marginTop: 2 },
  terrainHeaderRight: { alignItems: "center", width: 60 },
  terrainTotalLabel: { fontSize: 10, fontWeight: "700", color: "#D3CBBF", letterSpacing: 1 },
  terrainTotalValue: { fontSize: 36, fontWeight: "900", color: "#FFFFFF", lineHeight: 40 },

  terrainButtons: { flex: 1, gap: 2, paddingHorizontal: 0 },

  terrainFooter: {
    flexDirection: "row",
    backgroundColor: "#003c38",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  terrainCancelBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  terrainCancelText: { color: "#D3CBBF", fontSize: 16, fontWeight: "600" },
  terrainSaveBtn: {
    flex: 2,
    backgroundColor: "#DCF21E",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  terrainSaveBtnDisabled: { opacity: 0.5 },
  terrainSaveText: { color: "#003c38", fontSize: 18, fontWeight: "800" },

  // ---- Overlay confirmation enregistrement ----
  savedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 60, 56, 0.93)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  savedIcon: {
    fontSize: 72,
    color: "#DCF21E",
    fontWeight: "900",
    lineHeight: 80,
    marginBottom: 16,
  },
  savedTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  savedSubtitle: {
    fontSize: 16,
    color: "#D3CBBF",
    fontWeight: "500",
  },

  // Toggle son
  soundToggle: {
    position: "absolute",
    right: 16,
    top: 52,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  soundToggleText: {
    fontSize: 20,
  },
});
