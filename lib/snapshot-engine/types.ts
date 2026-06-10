export type SnapshotType =
  | "ETF_FLOW"
  | "CRYPTO_PRICE"
  | "WHALE_ALERT"
  | "MARKET_SENTIMENT"
  | "SMART_SCORE"
  | "NEWS_SENTIMENT";

export interface SnapshotPayload {
  [key: string]: any;
}

export interface SnapshotInput {
  type: SnapshotType;
  payload: SnapshotPayload;
  source?: string;
}