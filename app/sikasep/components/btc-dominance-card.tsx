"use client";

import { useEffect, useState } from "react";

type BTCDominanceResponse = {
  success?: boolean;
  value: number;
  classification?: string;
  updated_at?: string;
  source?: string;
};

export default function BTCDominanceCard() {
  const [data, setData] = useState<BTCDominanceResponse | null>(null);
  const [error, setError] = useState(false);

  async function load() {
    try {
      setError(false);

      const res = await fetch("/api/sikasep/btc-dominance", {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to load BTC Dominance");
      }

      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(true);
    }
  }

  useEffect(() => {
    load();

    const interval = setInterval(load, 300000);

    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="rounded-3xl border border-red-900 bg-zinc-900 p-6">
        Failed to load BTC Dominance
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
        Loading...
      </div>
    );
  }

  const value = data.value ?? 0;

  const color =
    value >= 60
      ? "text-emerald-500"
      : value >= 50
      ? "text-green-400"
      : value >= 40
      ? "text-yellow-400"
      : "text-red-400";

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
      <p className="text-zinc-400">BTC Dominance</p>

      <h2 className={`mt-3 text-4xl font-bold ${color}`}>
        {value.toFixed(2)}%
      </h2>

      <p className="mt-2 text-sm text-zinc-400">
        {data.classification || "Bitcoin Market Share"}
      </p>

      {data.updated_at && (
        <p className="mt-4 text-xs text-zinc-500">
          Updated: {new Date(data.updated_at).toLocaleString()}
        </p>
      )}

      {data.source && (
        <p className="mt-1 text-xs text-zinc-600">
          Source: {data.source}
        </p>
      )}
    </div>
  );
}