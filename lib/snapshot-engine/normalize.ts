import { SnapshotPayload } from "./types";

export function normalizeSnapshot(
  type: string,
  raw: any
): SnapshotPayload {
  switch (type) {
    case "ETF_FLOW":
  return {
    updated_at:
      raw?.updated_at || new Date().toISOString(),

    total_inflow:
      Number(raw?.total_inflow || 0),

    total_outflow:
      Number(raw?.total_outflow || 0),

    total_net_flow:
      Number(raw?.total_net_flow || 0),
  };
    case "CRYPTO_PRICE":
      return {
        symbol: raw?.symbol,
        price: Number(raw?.price || 0),
        change_24h: Number(raw?.change_24h || 0),
      };

    case "WHALE_ALERT":
      return {
        hash: raw?.hash,
        amount: Number(raw?.amount || 0),
        from: raw?.from,
        to: raw?.to,
      };

    case "NEWS_SENTIMENT":
      return {
        score: Number(raw?.score || 0),
        label: raw?.label || "neutral",
      };

    default:
      return raw;
  }
}