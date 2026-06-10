import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/global",
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch CoinGecko global data");
    }

    const json = await res.json();

    const btcDominance =
      json?.data?.market_cap_percentage?.btc;

    return NextResponse.json({
      success: true,
      value: Number(btcDominance?.toFixed(2)),
      classification: "BTC Dominance",
      updated_at: new Date().toISOString(),
      source: "coingecko",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Unable to fetch BTC Dominance",
      },
      { status: 500 }
    );
  }
}