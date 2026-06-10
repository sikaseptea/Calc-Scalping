import { ingestSnapshot } from "@/lib/snapshot-engine/ingest";

const mockNews = [
  "Bitcoin ETF inflow surges again",
  "Regulation fear hits crypto market",
  "Institutional adoption increasing rapidly",
];

function getSentiment(text: string) {
  if (text.toLowerCase().includes("surges") || text.toLowerCase().includes("adoption")) {
    return { sentiment: "bullish", score: 0.8 };
  }

  if (text.toLowerCase().includes("fear") || text.toLowerCase().includes("drops")) {
    return { sentiment: "bearish", score: -0.7 };
  }

  return { sentiment: "neutral", score: 0 };
}

export async function runNewsJob() {
  const headline =
    mockNews[Math.floor(Math.random() * mockNews.length)];

  const sentiment = getSentiment(headline);

  await ingestSnapshot({
    type: "NEWS_SENTIMENT",
    payload: {
      headline,
      sentiment: sentiment.sentiment,
      score: sentiment.score,
      impact: Math.abs(sentiment.score) > 0.7 ? "high" : "medium",
    },
    source: "orchestrator",
  });
}