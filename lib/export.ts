// ============================================================
// Ramo Survival App — Export XLSX
// iOS/Android : partage natif via expo-sharing
// Web (aperçu) : téléchargement direct via lien <a>
// ============================================================

import { Platform } from "react-native";
import * as XLSX from "xlsx";
import { Session, FieldRecord, totalCounts } from "./types";

// ---- Ordre des colonnes ----
// Classement logique : identification → mesure → comptages → total

function buildRows(records: FieldRecord[], sessions: Session[]) {
  const sessionMap = new Map<string, Session>(
    sessions.map((s) => [s.id, s])
  );

  // Trier par aire (numérique croissant)
  const sorted = [...records].sort(
    (a, b) => parseInt(a.aire) - parseInt(b.aire)
  );

  return sorted.map((r) => {
    const session = sessionMap.get(r.sessionId);
    const total = totalCounts(r.counts);
    return {
      Aire: r.aire,
      Variété: r.variety,
      "Longueur (m)": r.length_m,
      Vivant: r.counts.Vivant,
      Base: r.counts.Base,
      "Non débourré": r.counts.NonDebourre,
      Mort: r.counts.Mort,
      Manquant: r.counts.Manquant,
      "Plant échappé": r.counts.PlantEchappe,
      Total: total,
      Opérateur: session?.operator ?? "",
      Date: session?.date ?? "",
    };
  });
}

// ---- Mise en forme de la feuille ----

function formatWorksheet(worksheet: XLSX.WorkSheet, rowCount: number) {
  // Largeurs de colonnes adaptées au contenu
  worksheet["!cols"] = [
    { wch: 6 },   // Aire
    { wch: 8 },   // Variété
    { wch: 12 },  // Longueur (m)
    { wch: 8 },   // Vivant
    { wch: 7 },   // Base
    { wch: 14 },  // Non débourré
    { wch: 7 },   // Mort
    { wch: 10 },  // Manquant
    { wch: 14 },  // Plant échappé
    { wch: 7 },   // Total
    { wch: 14 },  // Opérateur
    { wch: 12 },  // Date
  ];

  // AutoFilter sur toutes les colonnes (permet tri et filtrage dans Excel)
  const lastCol = 11; // 12 colonnes (A=0 à L=11)
  worksheet["!autofilter"] = {
    ref: XLSX.utils.encode_range(
      { r: 0, c: 0 },
      { r: rowCount, c: lastCol }
    ),
  };
}

// ---- Construction du classeur ----
// multiSheet=true → un onglet par session (export "toutes sessions")
// multiSheet=false → un seul onglet avec le nom du projet

function buildWorkbook(
  records: FieldRecord[],
  sessions: Session[],
  multiSheet: boolean
): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();

  if (multiSheet && sessions.length > 0) {
    // Un onglet par session, dans l'ordre des sessions
    for (const session of sessions) {
      const sessionRecords = records.filter((r) => r.sessionId === session.id);
      if (sessionRecords.length === 0) continue;

      const rows = buildRows(sessionRecords, sessions);
      const worksheet = XLSX.utils.json_to_sheet(rows);
      formatWorksheet(worksheet, rows.length);

      // Nom de l'onglet : projectId, caractères invalides remplacés, max 31 chars (limite Excel)
      const sheetName = session.projectId
        .replace(/[\\/*?[\]:]/g, "_")
        .slice(0, 31);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    }

    // Fallback si aucun onglet créé
    if (workbook.SheetNames.length === 0) {
      const rows = buildRows(records, sessions);
      const worksheet = XLSX.utils.json_to_sheet(rows);
      formatWorksheet(worksheet, rows.length);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Données");
    }
  } else {
    // Onglet unique
    const rows = buildRows(records, sessions);
    const worksheet = XLSX.utils.json_to_sheet(rows);
    formatWorksheet(worksheet, rows.length);

    // Nom de l'onglet = nom du projet si disponible
    const session = sessions.find((s) =>
      records.some((r) => r.sessionId === s.id)
    );
    const sheetName = session
      ? session.projectId.replace(/[\\/*?[\]:]/g, "_").slice(0, 31)
      : "Données";
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  }

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
  projectId?: string,
  multiSheet?: boolean
): Promise<void> {
  const workbook = buildWorkbook(records, sessions, multiSheet ?? false);
  const filename = buildFilename(projectId);

  const wbout = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
  const blob = new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

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
  projectId?: string,
  multiSheet?: boolean
): Promise<void> {
  const [FileSystem, Sharing] = await Promise.all([
    import("expo-file-system/legacy"),
    import("expo-sharing"),
  ]);

  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new Error("Le partage de fichiers n'est pas disponible sur cet appareil.");
  }

  const workbook = buildWorkbook(records, sessions, multiSheet ?? false);
  const filename = buildFilename(projectId);

  const base64 = XLSX.write(workbook, { type: "base64", bookType: "xlsx" });
  const fileUri = `${FileSystem.documentDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(fileUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

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
  projectId?: string,
  multiSheet?: boolean
): Promise<void> {
  if (records.length === 0) {
    throw new Error("Aucune donnée à exporter.");
  }

  if (Platform.OS === "web") {
    await exportWeb(records, sessions, projectId, multiSheet);
  } else {
    await exportNative(records, sessions, projectId, multiSheet);
  }
}
