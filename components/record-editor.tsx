import React, { useState } from "react";
import {
  Linking,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Alert } from "@/lib/alert";
import { SafeAreaView } from "react-native-safe-area-context";
import { FieldRecord, STATE_KEYS, totalCounts } from "@/lib/types";
import { useSession } from "@/lib/session-context";
import { GpsPosition } from "@/components/gps-position";

export function RecordEditor({
  record,
  onClose,
}: {
  record: FieldRecord;
  onClose: () => void;
}) {
  const { editRecord, records, sessions } = useSession();
  const [value, setValue] = useState(record);
  const [busy, setBusy] = useState(false);
  const [gpsBusy, setGpsBusy] = useState(false);
  const session = sessions.find((s) => s.id === record.sessionId);
  const input = {
    borderWidth: 1,
    borderColor: "#D3CBBF",
    borderRadius: 10,
    padding: 14,
    backgroundColor: "#FFFFFF",
    color: "#1A1A1A",
    fontSize: 17,
  };
  function close() {
    if (busy || gpsBusy) return;
    if (JSON.stringify(value) === JSON.stringify(record)) return onClose();
    Alert.alert(
      "Quitter sans enregistrer ?",
      "Vos modifications ne seront pas conservées.",
      [
        { text: "Continuer", style: "cancel" },
        { text: "Quitter", style: "destructive", onPress: onClose },
      ],
    );
  }
  async function save() {
    if (busy || gpsBusy) return;
    if (
      !/^\d+$/.test(value.aire) ||
      Number(value.aire) < 1 ||
      !/^\d+$/.test(value.variety) ||
      Number(value.variety) < 1 ||
      (value.length_m.trim() &&
        (!Number.isFinite(Number(value.length_m.replace(",", "."))) ||
          Number(value.length_m.replace(",", ".")) <= 0)) ||
      totalCounts(value.counts) === 0
    ) {
      Alert.alert(
        "Vérifiez le relevé",
        "Aire et variété doivent être des entiers positifs, la longueur positive et le comptage non vide.",
      );
      return;
    }
    const normalized = {
      ...value,
      aire: String(Number(value.aire)),
      variety: String(Number(value.variety)),
      length_m: value.length_m.replace(",", "."),
    };
    if (
      records.some(
        (r) =>
          r.id !== value.id &&
          r.sessionId === value.sessionId &&
          r.aire === normalized.aire &&
          r.variety === normalized.variety,
      )
    ) {
      const yes = await new Promise<boolean>((resolve) =>
        Alert.alert(
          "Doublon possible",
          "Une autre fiche existe pour cette aire et cette variété. Conserver ?",
          [
            { text: "Annuler", onPress: () => resolve(false) },
            { text: "Conserver", onPress: () => resolve(true) },
          ],
          { cancelable: true, onDismiss: () => resolve(false) },
        ),
      );
      if (!yes) return;
    }
    setBusy(true);
    try {
      await editRecord(normalized);
      onClose();
    } catch {
      Alert.alert(
        "Modification impossible",
        "Réessayez. Vos modifications restent affichées.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal animationType="slide" onRequestClose={close}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F2EE" }}>
        <View style={{ padding: 20, backgroundColor: "#003c38" }}>
          <Text style={{ fontSize: 24, color: "#FFFFFF", fontWeight: "700" }}>
            Détail du relevé
          </Text>
          <Text style={{ color: "#D3CBBF", marginTop: 6 }}>
            {session?.projectId} · {session?.date}
          </Text>
        </View>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 20, gap: 12 }}
        >
          {(
            [
              ["aire", "Aire"],
              ["variety", "Variété"],
              ["length_m", "Longueur (m)"],
            ] as const
          ).map(([key, label]) => (
            <View key={key} style={{ gap: 6 }}>
              <Text>{label}</Text>
              <TextInput
                accessibilityLabel={label}
                editable={!busy && !gpsBusy}
                style={input}
                keyboardType={key === "length_m" ? "decimal-pad" : "number-pad"}
                value={value[key]}
                onChangeText={(text) =>
                  setValue((v) => ({ ...v, [key]: text }))
                }
              />
            </View>
          ))}
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: "#003c38",
              marginTop: 12,
            }}
          >
            Comptage · {totalCounts(value.counts)} plants
          </Text>
          {STATE_KEYS.map((state) => (
            <View
              key={state.key}
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <Text style={{ flex: 1 }}>{state.label}</Text>
              <TextInput
                accessibilityLabel={state.label}
                editable={!busy && !gpsBusy}
                style={[input, { width: 100, textAlign: "center" }]}
                keyboardType="number-pad"
                value={String(value.counts[state.key])}
                onChangeText={(text) => {
                  if (/^\d{0,7}$/.test(text))
                    setValue((v) => ({
                      ...v,
                      counts: { ...v.counts, [state.key]: Number(text) },
                    }));
                }}
              />
            </View>
          ))}
          <Text>Commentaire</Text>
          <TextInput
            accessibilityLabel="Commentaire"
            editable={!busy && !gpsBusy}
            style={[input, { minHeight: 80 }]}
            multiline
            value={value.comment}
            onChangeText={(comment) => setValue((v) => ({ ...v, comment }))}
          />
          <GpsPosition
            disabled={busy}
            value={value.gps}
            onChange={(gps) => setValue((v) => ({ ...v, gps }))}
            onBusyChange={setGpsBusy}
          />
          <Text style={{ color: "#6B6560" }}>
            {value.gps
              ? `Position capturée · ${value.gps.accuracyMeters === null ? "précision inconnue" : `± ${Math.round(value.gps.accuracyMeters)} m`}`
              : "Sans position GPS"}
          </Text>
          {value.gps && (
            <TouchableOpacity
              style={{ paddingVertical: 14 }}
              onPress={() => {
                void Linking.openURL(
                  `https://www.google.com/maps/search/?api=1&query=${value.gps!.latitude},${value.gps!.longitude}`,
                ).catch(() =>
                  Alert.alert(
                    "Carte indisponible",
                    "Impossible d’ouvrir la carte.",
                  ),
                );
              }}
            >
              <Text style={{ color: "#003c38", fontWeight: "700" }}>
                ↗ Voir la position sur la carte
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
        <View style={{ padding: 16, flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            disabled={busy || gpsBusy}
            style={{ padding: 16 }}
            onPress={close}
          >
            <Text>Fermer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={busy || gpsBusy}
            style={{
              flex: 1,
              padding: 16,
              borderRadius: 12,
              backgroundColor: "#003c38",
            }}
            onPress={save}
          >
            <Text
              style={{
                color: "#DCF21E",
                textAlign: "center",
                fontWeight: "700",
              }}
            >
              {busy ? "Enregistrement…" : "Enregistrer les modifications"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
