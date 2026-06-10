"use client";

import { useEffect, useState } from "react";
import { getLatestSnapshot } from "@/lib/snapshot-engine/queries/getLatestSnapshot";

function formatNumber(num: number) {
  if (num === undefined || num === null) return "0";

  if (Math.abs(num) >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2) + "B";
  }

  if (Math.abs(num) >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + "M";
  }

  if (Math.abs(num) >= 1_000) {
    return (num / 1_000).toFixed(2) + "K";
  }

  return num.toString();
}

export default function ETFFlowCard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const snapshot = await getLatestSnapshot("ETF_FLOW");

      const payload = snapshot?.snapshots?.payload;

      if (payload) {
        setData(payload);
      }
    } catch (err) {
      console.error("ETF load error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();

    const interval = setInterval(() => {
      load();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-4 border border-zinc-800 rounded-xl bg-zinc-950 text-zinc-400">
        Loading ETF Flow...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 border border-zinc-800 rounded-xl bg-zinc-950 text-red-400">
        No ETF snapshot data
      </div>
    );
  }

  const inflow = Number(data.total_inflow || 0);
  const outflow = Number(data.total_outflow || 0);
  const net = Number(data.total_net_flow || 0);

  const updatedAt = data.updated_at || "-";

  const isBullish = net >= 0;

  return (
    <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 text-white">

      <div className="flex items-center justify-between">
        <h2 className="text-sm text-zinc-400">
          ETF FLOW
        </h2>

        <span className="text-xs text-zinc-500">
          30s refresh
        </span>
      </div>

      <div
        className={`mt-3 text-lg font-bold ${
          isBullish
            ? "text-emerald-400"
            : "text-red-400"
        }`}
      >
        {isBullish
          ? "🟢 BULLISH INFLOW"
          : "🔴 BEARISH OUTFLOW"}
      </div>

      <div className="mt-4 space-y-2 text-sm">

        <div className="flex justify-between">
          <span className="text-zinc-400">
            Inflows
          </span>

          <span>
            {formatNumber(inflow)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-zinc-400">
            Outflows
          </span>

          <span>
            {formatNumber(outflow)}
          </span>
        </div>

        <div
          className={`flex justify-between font-bold ${
            isBullish
              ? "text-emerald-400"
              : "text-red-400"
          }`}
        >
          <span>Net Flow</span>

          <span>
            {formatNumber(net)}
          </span>
        </div>
      </div>

      <div className="mt-4 border-t border-zinc-800 pt-3 text-xs text-zinc-500">
        Updated: {updatedAt}
      </div>
    </div>
  );
}