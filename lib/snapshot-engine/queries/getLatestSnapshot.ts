import { supabase } from "@/lib/supabase/client";

export async function getLatestSnapshot(type: string) {
  const { data: latest, error: latestError } = await supabase
    .from("snapshot_latest")
    .select("*")
    .eq("type", type)
    .single();

  if (latestError || !latest) {
    console.error("Latest snapshot error:", latestError);
    return null;
  }

  const { data: snapshot, error: snapshotError } = await supabase
    .from("snapshots")
    .select("*")
    .eq("id", latest.latest_snapshot_id)
    .single();

  if (snapshotError || !snapshot) {
    console.error("Snapshot detail error:", snapshotError);
    return null;
  }

  return {
    type,
    snapshots: snapshot,
  };
}