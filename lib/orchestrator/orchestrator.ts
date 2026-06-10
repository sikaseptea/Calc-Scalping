import { ingestSnapshot } from "@/lib/snapshot-engine/ingest";
import { fetchETFData } from "@/lib/providers/etf-provider";

export async function runETFJob() {
  const data = await fetchETFData();

  const result = await ingestSnapshot({
    type: "ETF_FLOW",
    payload: data,
    source: "orchestrator",
  });

  console.log("ETF snapshot:", result);
}