// ============================================================
// Ramo Survival App — SessionContext (state global)
// ============================================================

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { GeoPosition } from "./geolocation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Session,
  FieldRecord,
  PlantCounts,
  createEmptyCounts,
} from "./types";
import {
  loadSessions,
  saveSession,
  deleteSession,
  loadRecords,
  saveRecord,
  deleteRecord,
  clearAllData,
  loadRecordsForSession,
  updateRecord,
} from "./store";

// ---- Types du contexte ----

interface SessionContextType {
  // Sessions
  sessions: Session[];
  activeSession: Session | null;
  setActiveSession: (session: Session | null) => void;
  createSession: (projectId: string, date?: string, operator?: string) => Promise<Session>;
  removeSession: (sessionId: string) => Promise<void>;

  // Enregistrements
  records: FieldRecord[];
  recordsForActiveSession: FieldRecord[];
  addRecord: (
    sessionId: string,
    aire: string,
    length_m: string,
    variety: string,
    counts: PlantCounts,
    comment: string,
    gps?: GeoPosition,
    id?: string
  ) => Promise<FieldRecord>;
  removeRecord: (recordId: string) => Promise<void>;
  editRecord: (record: FieldRecord) => Promise<void>;
  resetAll: () => Promise<void>;

  // Rafraîchissement
  refresh: () => Promise<void>;
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextType | null>(null);

// ---- Provider ----

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [records, setRecords] = useState<FieldRecord[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [s, r] = await Promise.all([loadSessions(), loadRecords()]);
    setSessions(s);
    setRecords(r);
    // Si la session active n'existe plus, la désélectionner
    if (activeSession) {
      const still = s.find((sess) => sess.id === activeSession.id);
      if (!still) setActiveSession(null);
    }
  }, [activeSession]);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await refresh();
      const savedId = await AsyncStorage.getItem("survival_active_session");
      const existing = await loadSessions();
      setActiveSession(existing.find((s) => s.id === savedId) ?? null);
      setIsLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!isLoading) void AsyncStorage.setItem("survival_active_session", activeSession?.id ?? "").catch(() => {});
  }, [activeSession, isLoading]);

  const createSession = useCallback(
    async (projectId: string, date?: string, operator?: string): Promise<Session> => {
      const session = await saveSession(projectId, date, operator);
      await refresh();
      setActiveSession(session);
      return session;
    },
    [refresh]
  );

  const removeSession = useCallback(
    async (sessionId: string) => {
      await deleteSession(sessionId);
      if (activeSession?.id === sessionId) setActiveSession(null);
      await refresh();
    },
    [activeSession, refresh]
  );

  const addRecord = useCallback(
    async (
      sessionId: string,
      aire: string,
      length_m: string,
      variety: string,
      counts: PlantCounts,
      comment: string,
      gps?: GeoPosition,
      id?: string
    ): Promise<FieldRecord> => {
      const record = await saveRecord({
        sessionId,
        aire,
        length_m,
        variety,
        counts,
        comment,
        gps,
        id,
      });
      await refresh();
      return record;
    },
    [refresh]
  );

  const removeRecord = useCallback(
    async (recordId: string) => {
      await deleteRecord(recordId);
      await refresh();
    },
    [refresh]
  );

  const resetAll = useCallback(async () => {
    await clearAllData();
    setActiveSession(null);
    await refresh();
  }, [refresh]);

  const recordsForActiveSession = activeSession
    ? records.filter((r) => r.sessionId === activeSession.id)
    : [];

  return (
    <SessionContext.Provider
      value={{
        sessions,
        activeSession,
        setActiveSession,
        createSession,
        removeSession,
        records,
        recordsForActiveSession,
        addRecord,
        removeRecord,
        editRecord: async (record) => { await updateRecord(record); await refresh(); },
        resetAll,
        refresh,
        isLoading,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

// ---- Hook ----

export function useSession(): SessionContextType {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
