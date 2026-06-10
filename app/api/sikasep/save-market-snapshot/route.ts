import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/global",
      {
        cache: "no-store",
      }
    );

    const json = await res.json();

    const payload = {
      btc_dominance:
        json.data.market_cap_percentage.btc,

      total_market_cap:
        json.data.total_market_cap.usd,

      total_volume:
        json.data.total_volume.usd,
    };

    const { error } = await supabase
      .from("market_snapshots")
      .insert(payload);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: payload,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}