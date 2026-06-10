import { supabase } from "@/lib/supabase/client";
import { SnapshotInput } from "./types";

export async function writeSnapshot(input: SnapshotInput) {
  const { type, payload, source } = input;

  // 1. insert snapshot
  const { data, error } = await supabase
    .from("snapshots")
    .insert({
      snapshot_type: type,
      payload,
      source: source || "system",
    })
    .select()
    .single();

  if (error) throw error;

  // 2. update latest pointer (ONLY HERE)
  await supabase.from("snapshot_latest").upsert({
    type,
    latest_snapshot_id: data.id,
    updated_at: new Date().toISOString(),
  });

  return data;
}