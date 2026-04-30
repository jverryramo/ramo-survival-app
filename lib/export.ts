// ============================================================
// Ramo Survival App — Export XLSX
// iOS/Android : partage natif via expo-sharing
// Web (aperçu) : téléchargement direct via lien <a>
// ============================================================

import { Platform } from "react-native";
import * as XLSX from "xlsx";
import { Session, FieldRecord, totalCounts, survivalRate } from "./types";

// ---- Construction des lignes ----

function buildRows(records: FieldRecord[], sessions: Session[]) {
  const sessionMap = new Map<string, Session>(
    sessions.map((s) => [s.id, s])
  );

  return records.map((r) => {
    const session = sessionMap.get(r.sessionId);
    const total = totalCounts(r.counts);
    const rate = survivalRate(r.counts);
    return {
      Date: session?.date ?? "",
      Projet: session?.projectId ?? "",
      Opérateur: session?.operator ?? "",
      Aire: r.aire,
      "Longueur (m)": r.length_m,
      Variété: r.variety,
      Vivant: r.counts.Vivant,
      Base: r.counts.Base,
      "Non débourré": r.counts.NonDebourre,
      Mort: r.counts.Mort,
      Manquant: r.counts.Manquant,
      "Plant échappé": r.counts.PlantEchappe,
      Total: total,
      "Taux survie (%)": rate,
      Commentaire: r.comment,
    };
  });
}

function buildWorkbook(rows: ReturnType<typeof buildRows>) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Données");
  return workbook;
}

function buildFilename(projectId?: string): string {
  const today = new Date().toISOString().slice(0, 10);
  return projectId
    ? `survival_${projectId.replace(/[^a-zA-Z0-9-_]/g, "_")}_${today}.xlsx`
    : `survival_export_${today}.xlsx`;
}

// ---- Export web (fallback) ----

async function exportWeb(
  records: FieldRecord[],
  sessions: Session[],
  projectId?: string
): Promise<void> {
  const rows = buildRows(records, sessions);
  const workbook = buildWorkbook(rows);
  const filename = buildFilename(projectId);

  // Générer un ArrayBuffer et créer un Blob
  const wbout = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
  const blob = new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  // Créer un lien de téléchargement temporaire
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---- Export natif iOS/Android ----

async function exportNative(
  records: FieldRecord[],
  sessions: Session[],
  projectId?: string
): Promise<void> {
  // Import dynamique pour éviter les erreurs sur web
  const [FileSystem, Sharing] = await Promise.all([
    import("expo-file-system"),
    import("expo-sharing"),
  ]);

  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new Error("Le partage de fichiers n'est pas disponible sur cet appareil.");
  }

  const rows = buildRows(records, sessions);
  const workbook = buildWorkbook(rows);
  const filename = buildFilename(projectId);

  // Encoder en base64
  const base64 = XLSX.write(workbook, { type: "base64", bookType: "xlsx" });

  // Écrire dans le répertoire de documents (persistant)
  const fileUri = `${FileSystem.documentDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(fileUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Ouvrir la feuille de partage native
  await Sharing.shareAsync(fileUri, {
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    dialogTitle: "Exporter les données Survival",
    UTI: "com.microsoft.excel.xlsx",
  });
}

// ---- Point d'entrée principal ----

export async function exportToXLSX(
  records: FieldRecord[],
  sessions: Session[],
  projectId?: string
): Promise<void> {
  if (records.length === 0) {
    throw new Error("Aucune donnée à exporter.");
  }

  if (Platform.OS === "web") {
    await exportWeb(records, sessions, projectId);
  } else {
    await exportNative(records, sessions, projectId);
  }
}
