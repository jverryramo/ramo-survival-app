import { beforeEach, describe, expect, it, vi } from "vitest";
import { newDraft, persistDraft, restoreDraft } from "../lib/counting-draft";
import {
  clearAllData,
  loadRecords,
  saveRecord,
  updateRecord,
} from "../lib/store";
const data = vi.hoisted(() => new Map<string, string>());
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: async (key: string) => data.get(key) ?? null,
    setItem: async (key: string, value: string) => {
      data.set(key, value);
    },
    getAllKeys: async () => [...data.keys()],
    multiRemove: async (keys: string[]) =>
      keys.forEach((key) => data.delete(key)),
  },
}));
beforeEach(() => data.clear());
describe("terrain workflow persistence", () => {
  it("restores counts, undo history and GPS independently per session", async () => {
    const draft = newDraft();
    draft.counts.Vivant = 12;
    draft.history = [{ ...draft.counts, Vivant: 11 }];
    draft.mode = "terrain";
    draft.gps = {
      latitude: 46,
      longitude: -73,
      accuracyMeters: 8,
      capturedAt: new Date().toISOString(),
    };
    await persistDraft("a", draft);
    await persistDraft("b", newDraft());
    expect(await restoreDraft("a")).toEqual(draft);
    expect((await restoreDraft("b")).counts.Vivant).toBe(0);
  });
  it("does not re-record a draft after interruption following a successful save", async () => {
    const draft = newDraft();
    draft.aire = "20";
    draft.variety = "7";
    await persistDraft("a", draft);
    const record = {
      id: draft.id,
      sessionId: "a",
      aire: draft.aire,
      variety: draft.variety,
      length_m: "10",
      comment: "",
      counts: draft.counts,
    };
    await saveRecord(record);
    await saveRecord(record);
    expect(await loadRecords()).toHaveLength(1);
    const restored = await restoreDraft("a");
    expect(restored.aire).toBe("21");
    expect(restored.variety).toBe("7");
    expect(restored.id).not.toBe(draft.id);
  });
  it("edits counts without losing GPS, identity or original timestamp", async () => {
    const draft = newDraft();
    const gps = {
      latitude: 46,
      longitude: -73,
      accuracyMeters: 8,
      capturedAt: new Date().toISOString(),
    };
    const record = await saveRecord({
      sessionId: "a",
      aire: "1",
      variety: "1",
      length_m: "10",
      comment: "",
      counts: draft.counts,
      gps,
    });
    await updateRecord({
      ...record,
      counts: { ...record.counts, Mort: 2 },
      length_m: "20",
    });
    const [edited] = await loadRecords();
    expect(edited).toEqual({
      ...record,
      counts: { ...record.counts, Mort: 2 },
      length_m: "20",
    });
    await expect(updateRecord({ ...record, id: "missing" })).rejects.toThrow();
  });
  it("clears drafts along with records without clearing unrelated preferences", async () => {
    await persistDraft("a", newDraft());
    data.set("last_operator", "Test");
    await clearAllData();
    expect(data.has("survival_draft_a")).toBe(false);
    expect(data.get("last_operator")).toBe("Test");
  });
});
