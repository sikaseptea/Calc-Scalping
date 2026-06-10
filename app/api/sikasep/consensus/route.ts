import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // =========================
    // 1. MACRO (SIKASEP CORE)
    // =========================
    const { data: fg } = await supabase
      .from("fear_greed_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const { data: market } = await supabase
      .from("market_snapshots")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const { data: news } = await supabase
      .from("news")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    const { data: etf } = await supabase
      .from("etf_flows")
      .select("*");

    const bullish = news?.filter(n => n.sentiment === "bullish").length || 0;
    const bearish = news?.filter(n => n.sentiment === "bearish").length || 0;

    const totalETF =
      etf?.reduce((s, r) => s + Number(r.net_flow || 0), 0) || 0;

    let macro = 50;

    // Fear & Greed
    if (fg?.value >= 75) macro += 20;
    else if (fg?.value >= 60) macro += 10;
    else if (fg?.value <= 40) macro -= 10;

    // BTC Dom
    if (market?.btc_dominance >= 60) macro += 10;

    // News
    if (bullish > bearish) macro += 10;
    else if (bearish > bullish) macro -= 10;

    // ETF
    if (totalETF > 100_000_000) macro += 10;
    else if (totalETF < -100_000_000) macro -= 10;

    macro = Math.max(0, Math.min(100, macro));

    // =========================
    // 2. DERIVATIVES (SIMPLIFIED)
    // =========================
    // (placeholder karena belum ada Binance API integration)
    let derivatives = 50;

    // dummy logic (nanti kita upgrade real Binance funding rate)
    const leverageBias = Math.random() * 100;

    if (leverageBias > 70) derivatives = 70;
    else if (leverageBias < 30) derivatives = 30;

    // =========================
    // 3. TECHNICAL (SIMPLIFIED)
    // =========================
    let technical = 50;

    const trend = market?.btc_trend || "neutral";

    if (trend === "bullish") technical = 70;
    if (trend === "bearish") technical = 30;

    // =========================
    // 4. CONSENSUS SCORE
    // =========================
    const score =
      macro * 0.5 +
      derivatives * 0.3 +
      technical * 0.2;

    let bias = "Neutral";

    if (score >= 70) bias = "Bullish";
    else if (score <= 40) bias = "Bearish";

    let confidence = "Low";
    if (score > 60 && score < 80) confidence = "Medium";
    if (score >= 80) confidence = "High";

    return NextResponse.json({
      score: Math.round(score),
      bias,
      confidence,

      components: {
        macro: Math.round(macro),
        derivatives: Math.round(derivatives),
        technical: Math.round(technical),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        score: 50,
        bias: "Neutral",
        confidence: "Low",
        components: {
          macro: 50,
          derivatives: 50,
          technical: 50,
        },
      },
      { status: 500 }
    );
  }
}