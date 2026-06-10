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

export default function FearGreedChart() {
  const [data, setData] = useState<any[]>([]);

  async function load() {
    const res = await fetch(
      "/api/sikasep/fear-greed-history"
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
        Fear & Greed Trend
      </h3>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis hide />
            <YAxis />
            <Tooltip />

            <Line
              type="monotone"
              dataKey="value"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}