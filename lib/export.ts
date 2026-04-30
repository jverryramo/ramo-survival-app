// ============================================================
// Ramo Survival App — Export XLSX
// ============================================================

import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as XLSX from "xlsx";
import { Session, FieldRecord, totalCounts, survivalRate } from "./types";

export async function exportToXLSX(
  records: FieldRecord[],
  sessions: Session[],
  projectId?: string
): Promise<void> {
  if (records.length === 0) {
    throw new Error("Aucune donnée à exporter.");
  }

  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new Error("Le partage de fichiers n'est pas disponible sur cet appareil.");
  }

  // Construire un index des sessions pour accès rapide
  const sessionMap = new Map<string, Session>(
    sessions.map((s) => [s.id, s])
  );

  // Construire les lignes du tableau
  const rows = records.map((r) => {
    const session = sessionMap.get(r.sessionId);
    const total = totalCounts(r.counts);
    const rate = survivalRate(r.counts);
    return {
      Date: session?.date ?? "",
      Projet: session?.projectId ?? "",
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

  // Générer le classeur XLSX
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Données");

  // Encoder en base64
  const base64 = XLSX.write(workbook, { type: "base64", bookType: "xlsx" });

  // Nommer le fichier
  const today = new Date().toISOString().slice(0, 10);
  const filename = projectId
    ? `survival_${projectId}_${today}.xlsx`
    : `survival_export_${today}.xlsx`;

  // Écrire dans le système de fichiers temporaire
  const fileUri = `${FileSystem.documentDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(fileUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Partager via le système natif
  await Sharing.shareAsync(fileUri, {
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    dialogTitle: "Exporter les données",
    UTI: "com.microsoft.excel.xlsx",
  });
}
