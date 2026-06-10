import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: news } = await supabase
      .from("news")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    const bullish =
      news?.filter((n) => n.sentiment === "bullish").length || 0;

    const bearish =
      news?.filter((n) => n.sentiment === "bearish").length || 0;

    const neutral =
      news?.filter((n) => n.sentiment === "neutral").length || 0;

    const score =
      bullish > bearish
        ? Math.min(
            100,
            Math.round((bullish / (bullish + bearish || 1)) * 100)
          )
        : Math.max(
            0,
            Math.round((bullish / (bullish + bearish || 1)) * 100)
          );

    return NextResponse.json({
      marketScore: score,
      bullish,
      bearish,
      neutral,
      totalNews: news?.length || 0,
    });
  } catch (error) {
    return NextResponse.json({
      marketScore: 50,
      bullish: 0,
      bearish: 0,
      neutral: 0,
      totalNews: 0,
    });
  }
}