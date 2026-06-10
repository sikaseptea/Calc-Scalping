"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useEffect, useState } from "react";

export default function BTCDominanceChart() {
  const [data, setData] = useState<any[]>([]);

  async function load() {
    const res = await fetch(
      "/api/sikasep/market-history"
    );

    const json = await res.json();

    setData(json);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
      <h3 className="mb-4 text-lg font-semibold">
        BTC Dominance Trend
      </h3>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis hide />
            <YAxis />
            <Tooltip />

            <Line
              type="monotone"
              dataKey="btc_dominance"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}