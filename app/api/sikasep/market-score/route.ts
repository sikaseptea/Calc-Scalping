import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: fg } = await supabase
      .from("fear_greed_history")
      .select("*")
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .single();

    const { data: market } = await supabase
      .from("market_snapshots")
      .select("*")
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .single();

    const { data: news } = await supabase
  .from("news")
  .select("*")
  .order("created_at", { ascending: false })
  .limit(20);

    const { data: etf } = await supabase
      .from("etf_flows")
      .select("*")
      .order("flow_date", {
        ascending: false,
      });

    const bullish =
      news?.filter(
        (x) => x.sentiment === "bullish"
      ).length || 0;

    const bearish =
      news?.filter(
        (x) => x.sentiment === "bearish"
      ).length || 0;

    const totalETF =
      etf?.reduce(
        (sum, row) =>
          sum + Number(row.net_flow || 0),
        0
      ) || 0;

    let score = 50;

    let fgScore = 0;
    let domScore = 0;
    let newsScore = 0;
    let etfScore = 0;

    // Fear & Greed
    if (fg?.value >= 75) {
      fgScore = 30;
    } else if (fg?.value >= 60) {
      fgScore = 20;
    } else if (fg?.value >= 40) {
      fgScore = 10;
    } else {
      fgScore = -10;
    }

    // BTC Dominance
    if (market?.btc_dominance >= 60) {
      domScore = 25;
    } else if (
      market?.btc_dominance >= 55
    ) {
      domScore = 15;
    } else if (
      market?.btc_dominance >= 50
    ) {
      domScore = 10;
    }

    // News Sentiment
    const totalNews = bullish + bearish;

if (totalNews === 0) {
  newsScore = 10; // default neutral optimism
} else if (bullish > bearish) {
  newsScore = 20;
} else if (bearish > bullish) {
  newsScore = -20;
} else {
  newsScore = 5;
}

    // ETF Flow
    if (totalETF > 300000000) {
      etfScore = 15;
    } else if (
      totalETF > 100000000
    ) {
      etfScore = 10;
    } else if (totalETF > 0) {
      etfScore = 5;
    } else {
      etfScore = -10;
    }

    score =
      score +
      fgScore +
      domScore +
      newsScore +
      etfScore;

    score = Math.max(
      0,
      Math.min(100, score)
    );

    let bias = "Neutral";

    if (score >= 75) {
      bias = "Bullish";
    }

    if (score <= 40) {
      bias = "Bearish";
    }

    let confidence = "Low";

    if (score >= 60) {
      confidence = "Medium";
    }

    if (score >= 80) {
      confidence = "High";
    }

    return NextResponse.json({
      score,
      bias,
      confidence,

      fearGreed: fg?.value,

      btcDominance:
        market?.btc_dominance,

      bullishNews: bullish,

      bearishNews: bearish,

      etfFlow: totalETF,

      breakdown: {
        fearGreed: fgScore,
        btcDominance: domScore,
        news: newsScore,
        etf: etfScore,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      score: 50,
      bias: "Neutral",
      confidence: "Low",
    });
  }
}