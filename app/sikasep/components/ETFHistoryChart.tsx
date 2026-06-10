"use client";

import { useEffect, useMemo, useState } from "react";

import {
  ResponsiveContainer,
  BarChart,
  Cell,
  ComposedChart,
  Bar,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";

type ChartRow = {
  date: string;
  net_flow: number;
};

export default function ETFHistoryChart() {
  const [data, setData] = useState<ChartRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);

  async function load() {
    try {
      setError(false);

      const res = await fetch("/api/sikasep/etf-history", {
        cache: "no-store",
      });

      if (!res.ok) throw new Error();

      const json = await res.json();

      const raw = Array.isArray(json?.data)
        ? json.data
        : [];

      const normalized = raw
        .map((item: any) => ({
          date: item.date ?? item.flow_date ?? "",
          net_flow: Number(item.net_flow ?? 0),
        }))
        .filter((i: { date: string }) => i.date);

      setData(normalized);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setMounted(true);
    load();
  }, []);

  // 🧠 CUMULATIVE FLOW
  const enriched = useMemo(() => {
    let sum = 0;

    return data.map((d) => {
      sum += d.net_flow;

      return {
        ...d,
        cumulative: sum,
        ma7: 0, // placeholder dulu
      };
    });
  }, [data]);

  // 🧠 MA7
  const finalData = useMemo(() => {
    return enriched.map((d, i, arr) => {
      const slice = arr.slice(Math.max(0, i - 6), i + 1);

      const ma7 =
        slice.reduce((s, x) => s + x.net_flow, 0) /
        slice.length;

      return {
        ...d,
        ma7,
      };
    });
  }, [enriched]);

  // 🧠 AVERAGE FOR ANOMALY
  const avgFlow = useMemo(() => {
    return (
      data.reduce((s, d) => s + d.net_flow, 0) /
      (data.length || 1)
    );
  }, [data]);

  const threshold = Math.abs(avgFlow) * 2;

  if (!mounted) {
    return (
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">
        Initializing ETF Intelligence...
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">
        Loading institutional flow...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-900 bg-zinc-900 p-6 text-red-400">
        Failed to load ETF data
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
      <h3 className="mb-6 text-lg font-semibold text-zinc-200">
        Institutional ETF Intelligence Flow
      </h3>

      <div className="h-[360px] w-full min-h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={finalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />

            <XAxis dataKey="date" tick={{ fill: "#888" }} />
            <YAxis tick={{ fill: "#888" }} />

            <Tooltip
              contentStyle={{
                backgroundColor: "#111",
                border: "1px solid #333",
                color: "#fff",
              }}
            />

            {/* ZERO LINE (IMPORTANT INSTITUTIONAL SIGNAL) */}
            <ReferenceLine y={0} stroke="#555" />

            {/* 🔴🟢 FLOW BARS */}
           <Bar dataKey="net_flow">
  {data.map((entry, index) => (
    <Cell
      key={`cell-${index}`}
      fill={entry.net_flow >= 0 ? "#22c55e" : "#ef4444"}
    />
  ))}
</Bar>
            {/* 🔵 SMART MONEY (MA7) */}
            <Line
              dataKey="ma7"
              stroke="#60a5fa"
              strokeWidth={2}
              dot={false}
            />

            {/* 🟠 CUMULATIVE */}
            <Line
              dataKey="cumulative"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}