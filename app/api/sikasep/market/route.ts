import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,binancecoin,ripple&vs_currencies=usd&include_24hr_change=true",
      { cache: "no-store" }
    );

    const data = await res.json();

    const result = [
      {
        symbol: "BTCUSDT",
        price: data.bitcoin.usd,
        change: data.bitcoin.usd_24h_change,
      },
      {
        symbol: "ETHUSDT",
        price: data.ethereum.usd,
        change: data.ethereum.usd_24h_change,
      },
      {
        symbol: "SOLUSDT",
        price: data.solana.usd,
        change: data.solana.usd_24h_change,
      },
      {
        symbol: "BNBUSDT",
        price: data.binancecoin.usd,
        change: data.binancecoin.usd_24h_change,
      },
      {
        symbol: "XRPUSDT",
        price: data.ripple.usd,
        change: data.ripple.usd_24h_change,
      },
    ];

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);

    return NextResponse.json([]);
  }
}