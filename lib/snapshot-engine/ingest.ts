import { normalizeSnapshot } from "./normalize";
import { writeSnapshot } from "./writer";
import { SnapshotInput } from "./types";

export async function ingestSnapshot(input: SnapshotInput) {
  try {
    // 1. normalize data
    const normalized = normalizeSnapshot(input.type, input.payload);

    // 2. write snapshot + update latest (handled in writer)
    const result = await writeSnapshot({
      type: input.type,
      payload: normalized,
      source: input.source,
    });

    return {
      success: true,
      snapshot_id: result.id,
    };
  } catch (err: any) {
    console.error("SNAPSHOT_ERROR:", err);
    return {
      success: false,
      error: err.message,
    };
  }
}