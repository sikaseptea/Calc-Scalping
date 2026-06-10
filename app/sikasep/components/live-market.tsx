"use client";

import { useEffect, useState } from "react";

type Coin = {
  symbol: string;
  price: number;
  change: number;
};

export default function LiveMarket() {
  const [data, setData] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function fetchMarket() {
    try {
      setError(false);

      // 🔥 1 REQUEST ONLY (bulk data)
      const res = await fetch(
        "https://api.binance.com/api/v3/ticker/24hr",
        { cache: "no-store" }
      );

      if (!res.ok) throw new Error("Binance error");

      const json = await res.json();

      // filter top coins only
      const watchlist = [
        "BTCUSDT",
        "ETHUSDT",
        "SOLUSDT",
        "BNBUSDT",
        "XRPUSDT",
      ];

      const results: Coin[] = json
        .filter((item: any) =>
          watchlist.includes(item.symbol)
        )
        .map((item: any) => ({
          symbol: item.symbol.replace("USDT", ""),
          price: Number(item.lastPrice ?? 0),
          change: Number(item.priceChangePercent ?? 0),
        }));

      setData(results);
    } catch (e) {
      console.error("LiveMarket error:", e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMarket();

    const interval = setInterval(fetchMarket, 8000); // lebih stabil
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-4 border rounded-xl bg-zinc-950 text-zinc-400">
        Loading live market...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border rounded-xl bg-zinc-950 text-red-400">
        Failed to load live market
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="p-4 border rounded-xl bg-zinc-950 text-zinc-400">
        No market data available
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-xl bg-zinc-950 text-white">
      <h2 className="text-sm text-zinc-400 mb-3">
        LIVE MARKET
      </h2>

      <div className="space-y-2">
        {data.map((coin) => (
          <div
            key={coin.symbol}
            className="flex justify-between text-sm"
          >
            <span className="text-zinc-300">
              {coin.symbol}
            </span>

            <span className="text-white">
              ${coin.price.toLocaleString()}
            </span>

            <span
              className={
                coin.change >= 0
                  ? "text-emerald-400"
                  : "text-red-400"
              }
            >
              {coin.change.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}