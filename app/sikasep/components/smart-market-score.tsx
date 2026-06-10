"use client";

import { useEffect, useState } from "react";

type MarketScoreResponse = {
  bias: string;
  score: number;
  fearGreed: string;
  btcDominance: number;
  etfFlow: number;
  confidence: string;
  breakdown?: {
    fearGreed?: number;
    btcDominance?: number;
    news?: number;
    etf?: number;
  };
};

function formatMoney(value: number) {
  if (!value) return "$0";

  if (Math.abs(value) >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  }

  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }

  return `$${value.toLocaleString()}`;
}

export default function SmartMarketScore() {
  const [data, setData] = useState<MarketScoreResponse | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setError(false);

      const res = await fetch("/api/sikasep/market-score", {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to load market score");
      }

      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();

    const interval = setInterval(load, 60000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-zinc-400">
        Loading market intelligence...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-3xl border border-red-900 bg-zinc-900 p-8 text-red-400">
        Failed to load Market Score
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-zinc-400">Market Bias</p>

          <h2 className="mt-2 text-5xl font-bold">
            {data.bias || "Neutral"}
          </h2>
        </div>

        <div className="text-right">
          <div className="text-5xl font-bold">
            {data.score ?? 0}
          </div>

          <div className="text-zinc-400">/100</div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-4 gap-4">
        <Info
          label="Fear & Greed"
          value={data.fearGreed || "-"}
        />

        <Info
          label="BTC Dom"
          value={`${Number(data.btcDominance ?? 0).toFixed(2)}%`}
        />

        <Info
          label="ETF Flow"
          value={formatMoney(data.etfFlow ?? 0)}
        />

        <Info
          label="Confidence"
          value={data.confidence || "-"}
        />
      </div>

      <div className="mt-6 border-t border-zinc-800 pt-4">
        <h4 className="mb-3 text-sm font-semibold">
          Score Breakdown
        </h4>

        <div className="grid grid-cols-2 gap-3 text-sm text-zinc-300">
          <div>Fear & Greed: {data.breakdown?.fearGreed ?? 0}</div>
          <div>BTC Dominance: {data.breakdown?.btcDominance ?? 0}</div>
          <div>News: {data.breakdown?.news ?? 0}</div>
          <div>ETF: {data.breakdown?.etf ?? 0}</div>
        </div>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: any;
}) {
  return (
    <div>
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="mt-1 font-semibold">{value}</div>
    </div>
  );
}