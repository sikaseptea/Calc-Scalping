import { NextResponse } from "next/server";
import { buildDecisionEngine } from "@/lib/sikasep/decisionEngine";

type NewsItem = {
  title: string;
  url: string;
  source: string;
  publishedAt?: string;
};

// =========================
// SAFE FALLBACK (NEVER EMPTY)
// =========================
const fallback = {
  news: [
    {
      title: "Market Intelligence System Active (Live Multi-Source Mode)",
      source: "SIKASEP",
      publishedAt: new Date().toISOString(),
      url: "https://www.coindesk.com/"
    }
  ],
  decision: {
    regime: "NEUTRAL",
    confidence: 50,
    drivers: ["System fallback active"],
    bias: {
      btc: "neutral",
      eth: "neutral",
      stocks: "neutral",
      gold: "neutral",
      oil: "neutral"
    }
  }
};

// =========================
// 1. GDELT (MACRO REAL)
// =========================
async function fetchGDELT(): Promise<NewsItem[]> {
  try {
    const res = await fetch(
      "https://api.gdeltproject.org/api/v2/doc/doc?query=bitcoin%20OR%20war%20OR%20inflation%20OR%20fed%20OR%20oil%20OR%20economy&mode=ArtList&format=json"
    );

    const data = await res.json();

    const articles =
      data?.articles ||
      data?.results ||
      data?.documents ||
      [];

    if (!Array.isArray(articles)) return [];

    return articles.slice(0, 15).map((a: any) => ({
      title: a.title || "GDELT Macro News",
      url: a.url || a.documentUrl || "",
      source: "GDELT",
      publishedAt: a.seendate || new Date().toISOString()
    }));
  } catch {
    return [];
  }
}

// =========================
// 2. CRYPTO PANIC (REAL SENTIMENT)
// =========================
async function fetchCryptoPanic(): Promise<NewsItem[]> {
  try {
    const res = await fetch(
      "https://cryptopanic.com/api/v1/posts/?auth_token=YOUR_API_KEY&public=true"
    );

    const data = await res.json();

    const results = data?.results || [];

    if (!Array.isArray(results)) return [];

    return results.slice(0, 15).map((n: any) => ({
      title: n.title,
      url: n.url,
      source: "CryptoPanic",
      publishedAt: n.published_at
    }));
  } catch {
    return [];
  }
}

// =========================
// 3. COINGECKO NEWS
// =========================
async function fetchCoinGecko(): Promise<NewsItem[]> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/news"
    );

    const data = await res.json();

    const items = data?.data || data || [];

    if (!Array.isArray(items)) return [];

    return items.slice(0, 10).map((n: any) => ({
      title: n.title,
      url: n.url,
      source: "CoinGecko",
      publishedAt: n.updated_at
    }));
  } catch {
    return [];
  }
}

// =========================
// DEDUP ENGINE
// =========================
function dedup(items: NewsItem[]) {
  const seen = new Set<string>();

  return items.filter((i) => {
    const key = i.title?.toLowerCase().trim();
    if (!key) return false;

    if (seen.has(key)) return false;
    seen.add(key);

    return true;
  });
}

// =========================
// SORT ENGINE
// =========================
function safeTime(date?: string) {
  const t = Date.parse(date || "");
  return isNaN(t) ? Date.now() : t;
}

function sort(items: NewsItem[]) {
  return items.sort(
    (a, b) => safeTime(b.publishedAt) - safeTime(a.publishedAt)
  );
}

// =========================
// SIMPLE SENTIMENT → RISK MAPPER
// =========================
function calculateRiskScore(text: string): number {
  const t = text.toLowerCase();

  let score = 0.5; // neutral baseline

  if (t.includes("inflation") || t.includes("war") || t.includes("rate hike")) {
    score += 0.3;
  }

  if (t.includes("liquidity") || t.includes("cut") || t.includes("rally")) {
    score -= 0.2;
  }

  return Math.max(0, Math.min(1, score));
}

// =========================
// MAIN ENGINE
// =========================
export async function GET() {
  try {
    const [gdelt, cryptoPanic, coinGecko] = await Promise.all([
      fetchGDELT(),
      fetchCryptoPanic(),
      fetchCoinGecko()
    ]);

    let merged: NewsItem[] = [
      ...gdelt,
      ...cryptoPanic,
      ...coinGecko
    ];

    merged = dedup(merged);
    merged = sort(merged);

    const top5 = merged.slice(0, 5);

    if (top5.length === 0) {
      return NextResponse.json(fallback);
    }

    const combinedText = top5
      .map((n) => `${n.title} ${n.source}`)
      .join(" ");

    const risk = calculateRiskScore(combinedText);

    const decision = buildDecisionEngine({
      regime:
        risk > 0.65
          ? "RISK-OFF"
          : risk < 0.4
          ? "RISK-ON"
          : "NEUTRAL",
      risk,
      drivers: top5.map((n) => n.source),
    });

    return NextResponse.json({
      news: top5,
      decision
    });

  } catch (err) {
    console.error("News Engine Error:", err);
    return NextResponse.json(fallback);
  }
}