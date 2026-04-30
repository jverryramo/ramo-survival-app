// ============================================================
// Écran Comptage — Formulaire de saisie terrain
// ============================================================

import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
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

import { ScreenContainer } from "@/components/screen-container";
import { useSession } from "@/lib/session-context";
import { PlantCounts, STATE_KEYS, createEmptyCounts, totalCounts } from "@/lib/types";

// ---- Sélecteur numérique (1-20) ----

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

  function decrement() {
    if (num > min) onChange(String(num - 1));
  }
  function increment() {
    if (num < max) onChange(String(num + 1));
  }

  return (
    <View style={pickerStyles.container}>
      <Text style={pickerStyles.label}>{label}</Text>
      <View style={pickerStyles.row}>
        <TouchableOpacity
          onPress={decrement}
          style={[pickerStyles.btn, num <= min && pickerStyles.btnDisabled]}
          disabled={num <= min}
          activeOpacity={0.7}
        >
          <Text style={pickerStyles.btnText}>−</Text>
        </TouchableOpacity>
        <Text style={pickerStyles.value}>{num}</Text>
        <TouchableOpacity
          onPress={increment}
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
    width: 44,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#003c38",
  },
  btnDisabled: {
    backgroundColor: "#D3CBBF",
  },
  btnText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 26,
  },
  value: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
  },
});

// ---- Bouton de comptage ----

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
    // Animation flash
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 60, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={onLongPress}
        style={[
          counterStyles.btn,
          { backgroundColor: bg },
          border ? { borderWidth: 2, borderColor: border } : null,
        ]}
        activeOpacity={0.9}
        delayLongPress={600}
      >
        <Text style={[counterStyles.btnLabel, { color: textColor }]}>{label}</Text>
        <Text style={[counterStyles.btnCount, { color: textColor }]}>{count}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const counterStyles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 12,
    marginBottom: 10,
    minHeight: 80,
  },
  btnLabel: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  btnCount: {
    fontSize: 32,
    fontWeight: "800",
  },
});

// ---- Écran principal ----

export default function ComptageScreen() {
  const { activeSession, addRecord } = useSession();

  // Garder l'écran allumé pendant le comptage terrain
  useKeepAwake();

  const [aire, setAire] = useState("1");
  const [lengthM, setLengthM] = useState("");
  const [variety, setVariety] = useState("1");
  const [counts, setCounts] = useState<PlantCounts>(createEmptyCounts());
  const [comment, setComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function increment(key: keyof PlantCounts) {
    setCounts((prev) => ({ ...prev, [key]: prev[key] + 1 }));
  }

  function resetCount(key: keyof PlantCounts) {
    Alert.alert(
      "Réinitialiser",
      `Remettre "${STATE_KEYS.find((s) => s.key === key)?.label}" à 0 ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Réinitialiser",
          onPress: () => setCounts((prev) => ({ ...prev, [key]: 0 })),
        },
      ]
    );
  }

  function resetAllCounts() {
    Alert.alert("Réinitialiser les compteurs", "Remettre tous les compteurs à 0 ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Réinitialiser",
        onPress: () => setCounts(createEmptyCounts()),
      },
    ]);
  }

  async function handleSave() {
    if (!activeSession) {
      Alert.alert("Aucune session active", "Démarre d'abord une session dans l'onglet Session.");
      return;
    }
    const total = totalCounts(counts);
    if (total === 0) {
      Alert.alert("Comptage vide", "Ajoute au moins un plant avant d'enregistrer.");
      return;
    }

    // Validation longueur — avertissement si vide, bloquant si l'utilisateur annule
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
      await addRecord(
        activeSession.id,
        aire,
        lengthM,
        variety,
        counts,
        comment
      );
      // Réinitialiser le formulaire + auto-incrément de l'aire
      const nextAire = String(Math.min(parseInt(aire, 10) + 1, 20));
      setCounts(createEmptyCounts());
      setComment("");
      setLengthM("");
      setAire(nextAire);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert(
        "✓ Aire enregistrée",
        `Aire ${aire} — ${total} plants comptés.\n\nProchaine aire : ${nextAire}`
      );
    } finally {
      setIsSaving(false);
    }
  }

  const total = totalCounts(counts);

  return (
    <ScreenContainer containerClassName="bg-primary" safeAreaClassName="bg-background">
      {/* Header */}
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Sélecteurs Aire / Variété */}
        <View style={styles.pickersRow}>
          <NumberPicker label="Aire" value={aire} onChange={setAire} />
          <View style={{ width: 12 }} />
          <NumberPicker label="Variété" value={variety} onChange={setVariety} />
        </View>

        {/* Longueur */}
        <View style={styles.fieldGroup}>
          <View style={styles.fieldLabelRow}>
            <Text style={styles.fieldLabel}>Longueur (m)</Text>
            {!lengthM.trim() && (
              <Text style={styles.fieldRequired}>requis</Text>
            )}
          </View>
          <TextInput
            style={[
              styles.input,
              !lengthM.trim() && styles.inputWarning,
            ]}
            value={lengthM}
            onChangeText={setLengthM}
            placeholder="Ex. 45.5"
            placeholderTextColor="#F59E0B"
            keyboardType="decimal-pad"
            returnKeyType="done"
          />
        </View>

        {/* Section comptage */}
        <View style={styles.countingSection}>
          <View style={styles.countingHeader}>
            <Text style={styles.countingTitle}>Comptage</Text>
            <View style={styles.totalBadge}>
              <Text style={styles.totalBadgeText}>Total : {total}</Text>
            </View>
            <TouchableOpacity onPress={resetAllCounts} style={styles.resetAllBtn}>
              <Text style={styles.resetAllBtnText}>Tout remettre à 0</Text>
            </TouchableOpacity>
          </View>

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
          <Text style={styles.longPressHint}>Appui long sur un bouton pour remettre à 0</Text>
        </View>

        {/* Commentaire */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Commentaire</Text>
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

        {/* Bouton enregistrer */}
        <TouchableOpacity
          style={[styles.saveBtn, (isSaving || !activeSession) && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={isSaving || !activeSession}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>
            {isSaving ? "Enregistrement…" : "Enregistrer l'aire"}
          </Text>
        </TouchableOpacity>
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
  headerProject: {
    fontSize: 22,
    fontWeight: "800",
    color: "#DCF21E",
  },
  headerDate: {
    fontSize: 13,
    color: "#D3CBBF",
    marginTop: 2,
  },
  headerNoSession: {
    fontSize: 16,
    color: "#D3CBBF",
    fontStyle: "italic",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  pickersRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B6560",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  fieldRequired: {
    fontSize: 11,
    fontWeight: "700",
    color: "#F59E0B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputWarning: {
    borderColor: "#F59E0B",
    backgroundColor: "#FFFBF0",
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#D3CBBF",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: "#1A1A1A",
    backgroundColor: "#FFFFFF",
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  countingSection: {
    marginBottom: 16,
  },
  countingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    flexWrap: "wrap",
    gap: 8,
  },
  countingTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#003c38",
    flex: 1,
  },
  totalBadge: {
    backgroundColor: "#003c38",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  totalBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#DCF21E",
  },
  resetAllBtn: {
    borderWidth: 1,
    borderColor: "#D3CBBF",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  resetAllBtnText: {
    fontSize: 12,
    color: "#6B6560",
    fontWeight: "600",
  },
  longPressHint: {
    fontSize: 11,
    color: "#9BA1A6",
    textAlign: "center",
    marginTop: 4,
    fontStyle: "italic",
  },
  saveBtn: {
    backgroundColor: "#003c38",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 8,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    color: "#DCF21E",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
