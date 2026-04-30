// ============================================================
// Ramo Survival App — Store AsyncStorage (CRUD pur, sans state React)
// ============================================================

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Session, FieldRecord } from "./types";

const SESSIONS_KEY = "survival_sessions";
const RECORDS_KEY = "survival_records";

// ---- Utilitaires ----

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function todayISO(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

// ---- Sessions ----

export async function loadSessions(): Promise<Session[]> {
  try {
    const raw = await AsyncStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveSession(
  projectId: string,
  date?: string,
  operator?: string
): Promise<Session> {
  const sessions = await loadSessions();
  const session: Session = {
    id: generateId(),
    date: date ?? todayISO(),
    projectId: projectId.trim(),
    operator: (operator ?? "").trim(),
    createdAt: new Date().toISOString(),
  };
  sessions.unshift(session); // plus récent en premier
  await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  return session;
}

export async function deleteSession(sessionId: string): Promise<void> {
  const sessions = await loadSessions();
  const filtered = sessions.filter((s) => s.id !== sessionId);
  await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(filtered));
  // Supprimer aussi les enregistrements liés
  const records = await loadRecords();
  const filteredRecords = records.filter((r) => r.sessionId !== sessionId);
  await AsyncStorage.setItem(RECORDS_KEY, JSON.stringify(filteredRecords));
}

// ---- Enregistrements terrain ----

export async function loadRecords(): Promise<FieldRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(RECORDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveRecord(
  record: Omit<FieldRecord, "id" | "createdAt">
): Promise<FieldRecord> {
  const records = await loadRecords();
  const newRecord: FieldRecord = {
    ...record,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  records.push(newRecord);
  await AsyncStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  return newRecord;
}

export async function deleteRecord(recordId: string): Promise<void> {
  const records = await loadRecords();
  const filtered = records.filter((r) => r.id !== recordId);
  await AsyncStorage.setItem(RECORDS_KEY, JSON.stringify(filtered));
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove([SESSIONS_KEY, RECORDS_KEY]);
}

export async function loadRecordsForSession(
  sessionId: string
): Promise<FieldRecord[]> {
  const records = await loadRecords();
  return records.filter((r) => r.sessionId === sessionId);
}
