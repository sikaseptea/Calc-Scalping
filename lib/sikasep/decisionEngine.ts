export type MarketRegime = "RISK-ON" | "RISK-OFF" | "NEUTRAL";

export type DecisionBias = {
  btc: "bullish" | "bearish" | "neutral";
  eth: "bullish" | "bearish" | "neutral";
  stocks: "bullish" | "bearish" | "neutral";
  gold: "bullish" | "bearish" | "neutral";
  oil: "bullish" | "bearish" | "neutral";
};

export type DecisionResult = {
  regime: MarketRegime;
  confidence: number;
  drivers: string[];
  bias: DecisionBias;
};

export function buildDecisionEngine(input: {
  regime: MarketRegime;
  risk: number;
  drivers: string[];
}): DecisionResult {
  const { regime, risk, drivers } = input;

  return {
    regime,
    confidence: Math.min(95, Math.abs(risk) * 20 + 50),
    drivers,
    bias: {
      btc: regime === "RISK-ON" ? "bullish" : regime === "RISK-OFF" ? "bearish" : "neutral",
      eth: regime === "RISK-ON" ? "bullish" : regime === "RISK-OFF" ? "bearish" : "neutral",
      stocks: regime === "RISK-ON" ? "bullish" : regime === "RISK-OFF" ? "bearish" : "neutral",
      gold: regime === "RISK-OFF" ? "bullish" : regime === "RISK-ON" ? "bearish" : "neutral",
      oil: regime === "RISK-ON" ? "bullish" : regime === "RISK-OFF" ? "bearish" : "neutral",
    },
  };
}

export function classify(text: string): MarketRegime {
  const t = text.toLowerCase();

  if (t.includes("inflation") || t.includes("rate hike")) return "RISK-OFF";
  if (t.includes("liquidity") || t.includes("cut")) return "RISK-ON";

  return "NEUTRAL";
}