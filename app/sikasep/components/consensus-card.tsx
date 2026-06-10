"use client";

import { useEffect, useState } from "react";

export default function ConsensusCard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await fetch("/api/sikasep/consensus");
      const json = await res.json();
      setData(json);
    } catch (e) {
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const i = setInterval(load, 60000);
    return () => clearInterval(i);
  }, []);

  if (loading) {
    return (
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">
        Loading consensus...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-3xl border border-red-900 bg-zinc-900 p-6 text-red-400">
        Failed to load consensus
      </div>
    );
  }

  const biasColor =
    data.bias === "Bullish"
      ? "text-emerald-400"
      : data.bias === "Bearish"
      ? "text-red-400"
      : "text-yellow-400";

  const biasIcon =
    data.bias === "Bullish"
      ? "🟢"
      : data.bias === "Bearish"
      ? "🔴"
      : "🟡";

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <p className="text-zinc-400 text-sm">
          Market Consensus
        </p>

        <span className="text-xs text-zinc-500">
          LIVE
        </span>
      </div>

      {/* SCORE */}
      <div className="mt-3 flex items-end gap-3">
        <h2 className="text-5xl font-bold">
          {data.score ?? 0}
        </h2>

        <span className="text-zinc-500 mb-1">
          /100
        </span>
      </div>

      {/* BIAS */}
      <div className="mt-2 flex items-center gap-2">
        <span className={`text-lg ${biasColor}`}>
          {biasIcon}
        </span>

        <p className={`text-sm font-semibold ${biasColor}`}>
          {data.bias ?? "Unknown"}
        </p>

        <span className="text-zinc-500 text-sm">
          • {data.confidence ?? "Low"} Confidence
        </span>
      </div>

      {/* COMPONENT BREAKDOWN */}
      <div className="mt-5 grid grid-cols-1 gap-2 text-xs text-zinc-400">

        <div className="flex justify-between">
          <span>📊 Macro</span>
          <span className="text-zinc-300">
            {data.components?.macro ?? 0}
          </span>
        </div>

        <div className="flex justify-between">
          <span>📉 Derivatives</span>
          <span className="text-zinc-300">
            {data.components?.derivatives ?? 0}
          </span>
        </div>

        <div className="flex justify-between">
          <span>📈 Technical</span>
          <span className="text-zinc-300">
            {data.components?.technical ?? 0}
          </span>
        </div>

      </div>
    </div>
  );
}