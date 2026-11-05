import AsyncStorage from "@react-native-async-storage/async-storage";
import { createEmptyCounts, type PlantCounts } from "./types";
import type { GeoPosition } from "./geolocation";
import { loadRecords } from "./store";

export interface CountingDraft {
  id: string;
  aire: string;
  variety: string;
  lengthM: string;
  comment: string;
  counts: PlantCounts;
  history: PlantCounts[];
  gps?: GeoPosition;
  mode: "config" | "terrain";
}
export function newDraft(previous?: CountingDraft): CountingDraft {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    aire: previous ? String(Number(previous.aire) + 1) : "1",
    variety: previous?.variety ?? "1",
    lengthM: "",
    comment: "",
    counts: createEmptyCounts(),
    history: [],
    mode: "config",
  };
}
const pending = new Map<string, Promise<void>>();
export function persistDraft(
  sessionId: string,
  draft: CountingDraft,
): Promise<void> {
  const write = (pending.get(sessionId) ?? Promise.resolve())
    .catch(() => {})
    .then(() =>
      AsyncStorage.setItem(
        `survival_draft_${sessionId}`,
        JSON.stringify(draft),
      ),
    );
  pending.set(sessionId, write);
  return write;
}
export async function restoreDraft(sessionId: string): Promise<CountingDraft> {
  await pending.get(sessionId)?.catch(() => {});
  const raw = await AsyncStorage.getItem(`survival_draft_${sessionId}`);
  if (!raw) return newDraft();
  const draft = JSON.parse(raw) as CountingDraft;
  if (!draft.id || !draft.counts || !Array.isArray(draft.history))
    throw new Error("Brouillon illisible");
  // A crash after recording but before clearing the draft must not count the area twice.
  return (await loadRecords()).some((r) => r.id === draft.id)
    ? newDraft(draft)
    : draft;
}
