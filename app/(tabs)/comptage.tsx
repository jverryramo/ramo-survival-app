// ============================================================
// Écran Comptage — Deux étapes : Config → Mode terrain plein écran
// ============================================================

import React, { useEffect, useRef, useState } from "react";
import { GpsPosition } from "@/components/gps-position";
import type { GeoPosition } from "@/lib/geolocation";
import {
  newDraft,
  persistDraft,
  restoreDraft,
  type CountingDraft,
} from "@/lib/counting-draft";
import { useRouter } from "expo-router";
import { Alert } from "@/lib/alert";
import {
  Animated,
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
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useSession } from "@/lib/session-context";
import {
  PlantCounts,
  STATE_KEYS,
  createEmptyCounts,
  totalCounts,
} from "@/lib/types";

// ---- Sélecteur +/- ----

function NumberPicker({
  label,
  value,
  onChange,
  min = 1,
  max = 9999,
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
          accessibilityLabel={`Diminuer ${label}`}
          onPress={() => num > min && onChange(String(num - 1))}
          style={[pickerStyles.btn, num <= min && pickerStyles.btnDisabled]}
          disabled={num <= min}
          activeOpacity={0.7}
        >
          <Text style={pickerStyles.btnText}>−</Text>
        </TouchableOpacity>
        <Text style={pickerStyles.value}>{num}</Text>
        <TouchableOpacity
          accessibilityLabel={`Augmenter ${label}`}
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
  btnText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 28,
  },
  value: {
    flex: 1,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A1A",
  },
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
      Animated.timing(scaleAnim, {
        toValue: 0.94,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  }

  return (
    <Animated.View
      style={[fieldStyles.btnWrapper, { transform: [{ scale: scaleAnim }] }]}
    >
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${count} plants. Ajouter un plant`}
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
        <Text style={[fieldStyles.btnLabel, { color: textColor }]}>
          ＋ {label}
        </Text>
        <Text style={[fieldStyles.btnCount, { color: textColor }]}>
          {count}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const fieldStyles = StyleSheet.create({
  btnWrapper: { flex: 1, minHeight: 64 },
  btn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    borderRadius: 0,
  },
  btnLabel: { fontSize: 18, fontWeight: "700", letterSpacing: 0.2, flex: 1 },
  btnCount: { fontSize: 42, fontWeight: "900", letterSpacing: -1 },
});

// ============================================================
// Écran principal
// ============================================================

export default function ComptageScreen() {
  const { activeSession, isLoading } = useSession();
  const router = useRouter();
  if (isLoading)
    return (
      <SafeAreaView>
        <Text>Chargement…</Text>
      </SafeAreaView>
    );
  if (!activeSession)
    return (
      <SafeAreaView
        style={{
          flex: 1,
          padding: 24,
          justifyContent: "center",
          backgroundColor: "#F5F2EE",
          gap: 20,
        }}
      >
        <Text style={{ fontSize: 24, color: "#003c38", fontWeight: "700" }}>
          Prêt pour le terrain ?
        </Text>
        <Text>Sélectionnez ou créez une session pour commencer.</Text>
        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => router.push("/(tabs)")}
        >
          <Text style={styles.startBtnText}>Choisir une session</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  return (
    <CountingSession key={activeSession.id} sessionId={activeSession.id} />
  );
}

function CountingSession({ sessionId }: { sessionId: string }) {
  const { activeSession, addRecord, records } = useSession();
  const insets = useSafeAreaInsets();

  useKeepAwake();

  const { soundEnabled, toggleSound } = useSoundEnabled();
  const { playClick } = useClickSound();

  const [draft, setDraft] = useState<CountingDraft>(newDraft);
  const [ready, setReady] = useState(false);
  const [draftError, setDraftError] = useState("");
  const [notice, setNotice] = useState("");
  const [lastLength, setLastLength] = useState("");
  const saving = useRef(false);
  const { aire, lengthM, variety, counts, comment, gps, mode } = draft;
  function change(patch: Partial<CountingDraft>) {
    setDraft((d) => ({ ...d, ...patch }));
  }
  const setAire = (aire: string) => change({ aire });
  const setLengthM = (lengthM: string) => change({ lengthM });
  const setVariety = (variety: string) => change({ variety });
  const setComment = (comment: string) => change({ comment });
  const setGps = (gps: GeoPosition) => change({ gps });
  const setMode = (mode: CountingDraft["mode"]) => change({ mode });
  useEffect(() => {
    let live = true;
    restoreDraft(sessionId)
      .then((value) => {
        if (live) {
          setDraft(value);
          setReady(true);
        }
      })
      .catch(() => {
        if (live)
          setDraftError(
            "Impossible de lire le brouillon. Revenez à la session pour réessayer.",
          );
      });
    return () => {
      live = false;
    };
  }, [sessionId]);
  useEffect(() => {
    if (!ready) return;
    let live = true;
    persistDraft(sessionId, draft)
      .then(() => {
        if (live) setDraftError("");
      })
      .catch(() => {
        if (live)
          setDraftError(
            "Brouillon non sauvegardé : gardez l’app ouverte et réessayez.",
          );
      });
    return () => {
      live = false;
    };
  }, [draft, ready, sessionId]);
  const [gpsBusy, setGpsBusy] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const saved = false;

  function increment(key: keyof PlantCounts) {
    if (saving.current) return;
    setDraft((d) => ({
      ...d,
      counts: { ...d.counts, [key]: d.counts[key] + 1 },
      history: [...d.history.slice(-99), d.counts],
    }));
    // Jouer le son si activé
    if (soundEnabled) {
      playClick();
    }
  }

  function resetCount(key: keyof PlantCounts) {
    if (saving.current) return;
    Alert.alert(
      "Réinitialiser",
      `Remettre "${STATE_KEYS.find((s) => s.key === key)?.label}" à 0 ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Réinitialiser",
          onPress: () =>
            setDraft((d) => ({
              ...d,
              counts: { ...d.counts, [key]: 0 },
              history: [...d.history.slice(-99), d.counts],
            })),
        },
      ],
    );
  }

  function handleStartCounting() {
    if (gpsBusy) return;
    if (!activeSession) {
      Alert.alert(
        "Aucune session active",
        "Démarre d'abord une session dans l'onglet Session.",
      );
      return;
    }
    setMode("terrain");
  }

  async function handleSave() {
    // Bloquer le double-enregistrement
    if (saving.current || gpsBusy) return;
    saving.current = true;
    setIsSaving(true);
    const release = () => {
      saving.current = false;
      setIsSaving(false);
    };

    const total = totalCounts(counts);
    if (total === 0) {
      Alert.alert(
        "Comptage vide",
        "Ajoute au moins un plant avant d'enregistrer.",
      );
      release();
      return;
    }

    if (
      lengthM.trim() &&
      (!Number.isFinite(Number(lengthM.replace(",", "."))) ||
        Number(lengthM.replace(",", ".")) <= 0)
    ) {
      Alert.alert(
        "Longueur invalide",
        "Indiquez une longueur positive en mètres.",
      );
      release();
      return;
    }
    const confirm = (title: string, message: string) =>
      new Promise<boolean>((resolve) =>
        Alert.alert(
          title,
          message,
          [
            { text: "Annuler", onPress: () => resolve(false), style: "cancel" },
            { text: "Continuer", onPress: () => resolve(true) },
          ],
          { cancelable: true, onDismiss: () => resolve(false) },
        ),
      );
    if (
      records.some(
        (r) =>
          r.sessionId === sessionId && r.aire === aire && r.variety === variety,
      )
    ) {
      if (
        !(await confirm(
          "Aire déjà relevée",
          `L’aire ${aire}, variété ${variety}, existe dans cette session. Ajouter un autre relevé ? Consultez l’onglet Relevés pour modifier l’existant.`,
        ))
      ) {
        release();
        return;
      }
    }
    if (!lengthM.trim()) {
      const confirmed = await new Promise<boolean>((resolve) => {
        Alert.alert(
          "Longueur manquante",
          "La longueur (m) n'est pas remplie.\nVeux-tu enregistrer quand même ?",
          [
            { text: "Annuler", style: "cancel", onPress: () => resolve(false) },
            { text: "Enregistrer quand même", onPress: () => resolve(true) },
          ],
          { cancelable: true, onDismiss: () => resolve(false) },
        );
      });
      if (!confirmed) {
        release();
        return;
      }
    }

    setIsSaving(true);
    try {
      await persistDraft(sessionId, draft);
      await addRecord(
        sessionId,
        aire,
        lengthM.replace(",", "."),
        variety,
        counts,
        comment,
        gps,
        draft.id,
      );
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setLastLength(lengthM);
      setNotice(`✓ Aire ${aire} enregistrée · ${total} plants`);
      setDraft(newDraft(draft));
    } catch {
      Alert.alert(
        "Enregistrement impossible",
        "Votre comptage reste affiché. Réessayez avant de quitter.",
      );
    } finally {
      setIsSaving(false);
      release();
    }
  }

  const total = totalCounts(counts);
  if (!ready)
    return (
      <SafeAreaView style={{ padding: 24 }}>
        <Text>{draftError || "Reprise du brouillon…"}</Text>
      </SafeAreaView>
    );

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
        <View style={[styles.terrainHeader, { paddingTop: insets.top + 8 }]}>
          <View style={styles.terrainHeaderLeft}>
            <Text style={styles.terrainAireLabel}>AIRE</Text>
            <Text style={styles.terrainAireValue}>{aire}</Text>
          </View>
          <View style={styles.terrainHeaderCenter}>
            <Text style={styles.terrainProjectLabel}>
              {activeSession?.projectId ?? "—"}
            </Text>
            <Text style={styles.terrainVarieteLabel}>
              {activeSession?.date} · Variété {variety}
            </Text>
          </View>
          <View style={styles.terrainHeaderRight}>
            <Text style={styles.terrainTotalLabel}>TOTAL</Text>
            <Text style={styles.terrainTotalValue}>{total}</Text>
          </View>
        </View>
        {/* Toggle son entre header et boutons */}
        <View style={styles.soundToggleRow}>
          <TouchableOpacity
            disabled={!draft.history.length || isSaving}
            style={{ padding: 12, opacity: draft.history.length ? 1 : 0.4 }}
            onPress={() =>
              setDraft((d) =>
                d.history.length
                  ? {
                      ...d,
                      counts: d.history[d.history.length - 1],
                      history: d.history.slice(0, -1),
                    }
                  : d,
              )
            }
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>
              ↶ Annuler le dernier appui
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={toggleSound}
            hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
          >
            <Text style={styles.soundToggleText}>
              {soundEnabled ? "Son activé" : "Son coupé"}
            </Text>
          </TouchableOpacity>
        </View>
        {!!draftError && (
          <Text
            accessibilityRole="alert"
            style={{ backgroundColor: "#FFF5F5", color: "#B91C1C", padding: 8 }}
          >
            {draftError}
          </Text>
        )}

        {/* 6 boutons plein écran */}
        <ScrollView
          contentContainerStyle={styles.terrainButtons}
          style={{ flex: 1 }}
        >
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
        </ScrollView>

        {/* Overlay de confirmation post-enregistrement */}
        {saved && (
          <View style={styles.savedOverlay}>
            <Text style={styles.savedIcon}>✓</Text>
            <Text style={styles.savedTitle}>Aire {aire} enregistrée</Text>
            <Text style={styles.savedSubtitle}>
              {total} plants · Passage à l’aire suivante…
            </Text>
          </View>
        )}

        {/* Footer : annuler + enregistrer */}
        <View style={styles.terrainFooter}>
          <TouchableOpacity
            style={styles.terrainCancelBtn}
            onPress={() => !isSaving && setMode("config")}
            activeOpacity={0.8}
            disabled={isSaving}
          >
            <Text style={styles.terrainCancelText}>← Retour</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.terrainSaveBtn,
              (isSaving || saved) && styles.terrainSaveBtnDisabled,
            ]}
            onPress={handleSave}
            disabled={isSaving || saved}
            activeOpacity={0.85}
          >
            <Text style={styles.terrainSaveText}>
              {isSaving ? "Enregistrement…" : "Enregistrer et suivante →"}
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
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F5F2EE" }}
      edges={["top", "left", "right"]}
    >
      {header}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {!!notice && (
          <Text
            accessibilityLiveRegion="polite"
            style={{
              padding: 14,
              marginBottom: 16,
              backgroundColor: "#E7EFE9",
              color: "#003c38",
              borderRadius: 10,
            }}
          >
            {notice}
          </Text>
        )}
        {!!draftError && (
          <Text
            accessibilityRole="alert"
            style={{ color: "#B91C1C", marginBottom: 12 }}
          >
            {draftError}
          </Text>
        )}
        {total > 0 && (
          <View
            style={{
              padding: 14,
              backgroundColor: "#E7EFE9",
              marginBottom: 16,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "#003c38", fontWeight: "700" }}>
              Comptage en cours · {total} plants
            </Text>
            <Text>Vos compteurs sont conservés au retour.</Text>
            <TouchableOpacity
              style={{ paddingVertical: 12 }}
              onPress={() =>
                Alert.alert(
                  "Recommencer ce comptage ?",
                  "Les compteurs du brouillon seront remis à zéro.",
                  [
                    { text: "Annuler", style: "cancel" },
                    {
                      text: "Recommencer",
                      style: "destructive",
                      onPress: () =>
                        change({ counts: createEmptyCounts(), history: [] }),
                    },
                  ],
                )
              }
            >
              <Text style={{ color: "#B91C1C" }}>Recommencer à zéro</Text>
            </TouchableOpacity>
          </View>
        )}
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
            {!lengthM.trim() && (
              <Text style={styles.fieldRequired}>à renseigner</Text>
            )}
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
          {!!lastLength && (
            <TouchableOpacity
              style={{ paddingVertical: 12 }}
              onPress={() => setLengthM(lastLength)}
            >
              <Text style={{ color: "#003c38" }}>
                Réutiliser la longueur précédente : {lastLength} m
              </Text>
            </TouchableOpacity>
          )}
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
        <GpsPosition
          key={activeSession?.id ?? "none"}
          value={gps}
          onChange={setGps}
          onBusyChange={setGpsBusy}
        />
        <TouchableOpacity
          style={[styles.startBtn, !activeSession && styles.startBtnDisabled]}
          onPress={handleStartCounting}
          disabled={!activeSession || gpsBusy}
          activeOpacity={0.85}
        >
          <Text style={styles.startBtnText}>
            {total > 0 ? "Reprendre le comptage →" : "Commencer le comptage →"}
          </Text>
        </TouchableOpacity>

        {!activeSession && (
          <Text style={styles.noSessionHint}>
            Démarre une session dans l’onglet Session pour commencer.
          </Text>
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
  headerProject: { fontSize: 22, fontWeight: "800", color: "#DCF21E" },
  headerDate: { fontSize: 13, color: "#D3CBBF", marginTop: 2 },
  headerNoSession: { fontSize: 16, color: "#D3CBBF", fontStyle: "italic" },

  scrollContent: { padding: 20, paddingBottom: 48 },

  pickersRow: { flexDirection: "row", marginBottom: 20 },

  fieldGroup: { marginBottom: 20 },
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
  input: {
    borderWidth: 1.5,
    borderColor: "#D3CBBF",
    borderRadius: 10,
    padding: 16,
    fontSize: 17,
    color: "#1A1A1A",
    backgroundColor: "#FFFFFF",
  },
  inputWarning: { borderColor: "#F59E0B", backgroundColor: "#FFFBF0" },
  textArea: { minHeight: 80, paddingTop: 12 },

  startBtn: {
    backgroundColor: "#003c38",
    borderRadius: 16,
    paddingVertical: 22,
    alignItems: "center",
    marginTop: 8,
  },
  startBtnDisabled: { opacity: 0.4 },
  startBtnText: {
    color: "#DCF21E",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  noSessionHint: {
    textAlign: "center",
    color: "#9BA1A6",
    fontSize: 13,
    marginTop: 12,
    fontStyle: "italic",
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
  terrainAireLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#D3CBBF",
    letterSpacing: 1,
  },
  terrainAireValue: {
    fontSize: 36,
    fontWeight: "900",
    color: "#DCF21E",
    lineHeight: 40,
  },
  terrainHeaderCenter: { flex: 1, alignItems: "center" },
  terrainProjectLabel: { fontSize: 16, fontWeight: "800", color: "#FFFFFF" },
  terrainVarieteLabel: { fontSize: 13, color: "#D3CBBF", marginTop: 2 },
  terrainHeaderRight: { alignItems: "center", width: 60 },
  terrainTotalLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#D3CBBF",
    letterSpacing: 1,
  },
  terrainTotalValue: {
    fontSize: 36,
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: 40,
  },

  terrainButtons: { flexGrow: 1, gap: 2, paddingHorizontal: 0 },

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
  terrainSaveText: {
    color: "#003c38",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },

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
  soundToggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    alignItems: "center",
    paddingVertical: 4,
    backgroundColor: "#003c38",
  },
  soundToggleText: {
    fontSize: 13,
    color: "#FFFFFF",
    padding: 12,
  },
});
