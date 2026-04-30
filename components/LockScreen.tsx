// ============================================================
// LockScreen — Écran de verrouillage par mot de passe
// Mot de passe : ramo26
// Stocke la session déverrouillée en mémoire (pas de persistance)
// ============================================================

import React, { useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { SafeAreaView } from "react-native-safe-area-context";

const APP_PASSWORD = "ramo26";

interface LockScreenProps {
  onUnlock: () => void;
}

export function LockScreen({ onUnlock }: LockScreenProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<TextInput>(null);

  function handleSubmit() {
    if (input === APP_PASSWORD) {
      setError(false);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      onUnlock();
    } else {
      setError(true);
      setInput("");
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      // Animation de secousse via state
      setShake(true);
      setTimeout(() => setShake(false), 500);
      inputRef.current?.focus();
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Logo / titre */}
        <View style={styles.logoArea}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🌱</Text>
          </View>
          <Text style={styles.appName}>Survival</Text>
          <Text style={styles.appSubtitle}>Ramo — Comptage de saules</Text>
        </View>

        {/* Carte de saisie */}
        <View style={[styles.card, shake && styles.cardShake]}>
          <Text style={styles.cardTitle}>Mot de passe requis</Text>
          <Text style={styles.cardSubtitle}>
            Saisissez le mot de passe pour accéder à l'application.
          </Text>

          <TextInput
            ref={inputRef}
            style={[styles.input, error && styles.inputError]}
            value={input}
            onChangeText={(t) => {
              setInput(t);
              setError(false);
            }}
            placeholder="Mot de passe"
            placeholderTextColor="#9BA1A6"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            autoFocus
          />

          {error && (
            <Text style={styles.errorText}>Mot de passe incorrect. Réessaie.</Text>
          )}

          <TouchableOpacity
            style={styles.btn}
            onPress={handleSubmit}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>Déverrouiller</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>© Ramo {new Date().getFullYear()}</Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#003c38",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 28,
  },
  // Logo
  logoArea: {
    alignItems: "center",
    gap: 8,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#DCF21E",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  logoEmoji: {
    fontSize: 38,
  },
  appName: {
    fontSize: 32,
    fontWeight: "800",
    color: "#DCF21E",
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: 14,
    color: "#D3CBBF",
    fontWeight: "400",
  },
  // Carte
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
    gap: 12,
  },
  cardShake: {
    // Effet visuel d'erreur — bordure rouge temporaire
    borderWidth: 2,
    borderColor: "#EF4444",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#003c38",
    textAlign: "center",
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#6B6560",
    textAlign: "center",
    lineHeight: 18,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#D3CBBF",
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: "#1A1A1A",
    backgroundColor: "#F5F2EE",
    textAlign: "center",
    letterSpacing: 4,
    marginTop: 4,
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FFF5F5",
  },
  errorText: {
    fontSize: 13,
    color: "#EF4444",
    textAlign: "center",
    fontWeight: "500",
  },
  btn: {
    backgroundColor: "#003c38",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  btnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#DCF21E",
  },
  // Footer
  footer: {
    fontSize: 12,
    color: "#6B9E9A",
    textAlign: "center",
  },
});
