// ============================================================
// Composant DatePickerField — Sélecteur de date natif
// iOS : spinner inline ou modal calendrier
// Android : dialog calendrier natif
// Web : champ texte fallback
// ============================================================

import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

interface DatePickerFieldProps {
  label: string;
  value: string; // "YYYY-MM-DD"
  onChange: (date: string) => void;
}

function isoToDate(iso: string): Date {
  // Éviter les problèmes de fuseau horaire en parsant manuellement
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function dateToISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplayDate(iso: string): string {
  if (!iso) return "Choisir une date";
  const [y, m, d] = iso.split("-");
  const months = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre",
  ];
  const monthName = months[parseInt(m, 10) - 1] ?? m;
  return `${parseInt(d, 10)} ${monthName} ${y}`;
}

// ---- Fallback web ----

function WebDateField({
  label,
  value,
  onChange,
}: DatePickerFieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder="AAAA-MM-JJ"
        placeholderTextColor="#9BA1A6"
        keyboardType="numbers-and-punctuation"
        returnKeyType="go"
      />
    </View>
  );
}

// ---- Composant principal ----

export function DatePickerField({ label, value, onChange }: DatePickerFieldProps) {
  // Sur web, utiliser le fallback texte
  if (Platform.OS === "web") {
    return <WebDateField label={label} value={value} onChange={onChange} />;
  }

  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(isoToDate(value));

  function handleAndroidChange(event: DateTimePickerEvent, selectedDate?: Date) {
    setShowPicker(false);
    if (event.type === "set" && selectedDate) {
      onChange(dateToISO(selectedDate));
    }
  }

  function handleIOSChange(_event: DateTimePickerEvent, selectedDate?: Date) {
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  }

  function confirmIOS() {
    onChange(dateToISO(tempDate));
    setShowPicker(false);
  }

  function cancelIOS() {
    setTempDate(isoToDate(value)); // reset
    setShowPicker(false);
  }

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>

      {/* Bouton déclencheur */}
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => {
          setTempDate(isoToDate(value));
          setShowPicker(true);
        }}
        activeOpacity={0.75}
      >
        <Text style={styles.dateButtonIcon}>📅</Text>
        <Text style={styles.dateButtonText}>{formatDisplayDate(value)}</Text>
        <Text style={styles.dateButtonChevron}>›</Text>
      </TouchableOpacity>

      {/* Android : dialog natif direct */}
      {Platform.OS === "android" && showPicker && (
        <DateTimePicker
          value={isoToDate(value)}
          mode="date"
          display="calendar"
          onChange={handleAndroidChange}
        />
      )}

      {/* iOS : modal avec picker spinner + boutons Annuler / OK */}
      {Platform.OS === "ios" && (
        <Modal
          visible={showPicker}
          transparent
          animationType="slide"
          onRequestClose={cancelIOS}
        >
          <Pressable style={styles.modalOverlay} onPress={cancelIOS} />
          <View style={styles.modalSheet}>
            {/* Barre de titre */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={cancelIOS} style={styles.modalHeaderBtn}>
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Choisir une date</Text>
              <TouchableOpacity onPress={confirmIOS} style={styles.modalHeaderBtn}>
                <Text style={styles.modalConfirmText}>OK</Text>
              </TouchableOpacity>
            </View>

            {/* Picker natif iOS */}
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              onChange={handleIOSChange}
              style={styles.iosPicker}
              themeVariant="light"
            />
          </View>
        </Modal>
      )}
    </View>
  );
}

// ---- Styles ----

const styles = StyleSheet.create({
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B6560",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  // Bouton déclencheur
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#D3CBBF",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: "#F5F2EE",
    gap: 10,
  },
  dateButtonIcon: {
    fontSize: 18,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 16,
    color: "#1A1A1A",
    fontWeight: "500",
  },
  dateButtonChevron: {
    fontSize: 22,
    color: "#9BA1A6",
    fontWeight: "300",
  },
  // Fallback web
  input: {
    borderWidth: 1.5,
    borderColor: "#D3CBBF",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: "#1A1A1A",
    backgroundColor: "#F5F2EE",
  },
  // Modal iOS
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0EDE8",
  },
  modalHeaderBtn: {
    minWidth: 70,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  modalCancelText: {
    fontSize: 16,
    color: "#6B6560",
    fontWeight: "500",
  },
  modalConfirmText: {
    fontSize: 16,
    color: "#003c38",
    fontWeight: "700",
    textAlign: "right",
  },
  iosPicker: {
    height: 200,
    marginHorizontal: 8,
  },
});
