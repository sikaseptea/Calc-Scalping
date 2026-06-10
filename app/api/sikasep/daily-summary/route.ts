import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
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
      .select("sentiment");

    const bullish =
      news?.filter(
        (x) => x.sentiment === "bullish"
      ).length || 0;

    const bearish =
      news?.filter(
        (x) => x.sentiment === "bearish"
      ).length || 0;

    const reasons: string[] = [];

    if (fg?.value >= 60) {
      reasons.push(
        `Fear & Greed berada di zona ${fg.classification}`
      );
    }

    if (market?.btc_dominance >= 55) {
      reasons.push(
        `BTC Dominance kuat di ${Number(
          market.btc_dominance
        ).toFixed(2)}%`
      );
    }

    if (bullish > bearish) {
      reasons.push(
        `Berita bullish (${bullish}) lebih banyak daripada bearish (${bearish})`
      );
    }

    let bias = "Neutral";
    let confidence = "Low";

    let score = 0;

    if (fg?.value >= 60) score += 1;
    if (market?.btc_dominance >= 55) score += 1;
    if (bullish > bearish) score += 1;

    if (score >= 3) {
      bias = "Bullish";
      confidence = "High";
    } else if (score >= 2) {
      bias = "Bullish";
      confidence = "Medium";
    } else if (score === 1) {
      bias = "Neutral";
      confidence = "Low";
    } else {
      bias = "Bearish";
      confidence = "Medium";
    }

    let conclusion =
      "Market sedang bergerak netral.";

    if (bias === "Bullish") {
      conclusion =
        "Momentum pasar masih positif, namun tetap perhatikan perubahan sentimen dan dominasi BTC.";
    }

    if (bias === "Bearish") {
      conclusion =
        "Tekanan pasar mulai meningkat, pertimbangkan manajemen risiko yang lebih ketat.";
    }

    return NextResponse.json({
      bias,
      confidence,
      reasons,
      conclusion,
    });
  } catch (error) {
    return NextResponse.json({
      bias: "Neutral",
      confidence: "Low",
      reasons: [],
      conclusion: "Data belum cukup.",
    });
  }
}