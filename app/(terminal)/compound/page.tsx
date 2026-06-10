"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Trade = {
  id: string;
  actual_pnl: number | null;
  status: "WIN" | "LOSS" | "BE" | null;
  created_at: string;
};

type Params = {
  startCapital: number;
  dailyTarget: number;
  duration: number;
};

export default function CompoundPage() {
  const [trades, setTrades] = useState<Trade[]>([]);

  const [params, setParams] = useState<Params>({
    startCapital: 1000,
    dailyTarget: 2,
    duration: 30,
  });

  useEffect(() => {
  const loadTrades = async () => {
    const { data } = await supabase
      .from("trade_logs")
      .select("id, actual_pnl, status, created_at")
      .order("created_at", { ascending: true });

    if (data) {
      setTrades(data as Trade[]);
    }
  };

  void loadTrades();
}, []);

  const handleChange = (key: keyof Params, value: number) => {
    setParams((p) => ({
      ...p,
      [key]: value,
    }));
  };

  const validTrades = useMemo(() => {
  return trades.filter(
    (t) => t.status === "WIN"
  );
}, [trades]);

  const compound = useMemo(() => {
  let balance = params.startCapital;
  const history: number[] = [balance];

  validTrades.forEach((t) => {
    const pnl = Number(t.actual_pnl || 0);

    if (t.status === "WIN" && pnl > 0) {
      balance += pnl;
      history.push(balance);
    }
  });

  return {
    balance,
    history,
    profit: balance - params.startCapital,
  };
}, [validTrades, params.startCapital]);

const growth = useMemo(() => {
  return params.startCapital > 0
    ? (compound.profit / params.startCapital) * 100
    : 0;
}, [compound.profit, params.startCapital]);

  const max = Math.max(...compound.history, 1);
  const min = Math.min(...compound.history, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-blue-950 text-white p-6">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-yellow-300 via-cyan-400 to-purple-500 bg-clip-text text-transparent">
          Compound Dashboard
        </h1>

        <p className="text-zinc-400 mt-2">
          Real-time Trading Growth & Compound Projection
        </p>
      </div>

      {/* DASHBOARD CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

        <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg">
          <div className="text-xs text-zinc-400 uppercase">
            Start Capital
          </div>

          <div className="text-xl font-bold text-yellow-300 mt-1">
            ${params.startCapital.toFixed(2)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg">
          <div className="text-xs text-zinc-400 uppercase">
            Balance
          </div>

          <div className="text-xl font-bold text-emerald-400 mt-1">
            ${compound.balance.toFixed(2)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg">
          <div className="text-xs text-zinc-400 uppercase">
            Profit
          </div>

          <div className="text-xl font-bold text-cyan-400 mt-1">
            ${compound.profit.toFixed(2)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg">
          <div className="text-xs text-zinc-400 uppercase">
            Growth
          </div>

          <div className="text-xl font-bold text-purple-400 mt-1">
            {growth.toFixed(2)}%
          </div>
        </div>

      </div>

      {/* CHART TITLE */}
      <div className="text-sm text-zinc-400 mb-3">
        📈 Equity Curve
      </div>

      {/* CHART */}
      <div className="w-full h-64 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl mb-6 flex items-center justify-center">

        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full p-4"
        >
          <defs>

            <linearGradient
              id="lineColor"
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>

          </defs>

          <polyline
            fill="none"
            stroke="url(#lineColor)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={compound.history
              .map((v, i) => {
                const x =
                  (i /
                    Math.max(
                      compound.history.length - 1,
                      1
                    )) *
                  100;

                const y =
                  100 -
                  ((v - min) /
                    (max - min || 1)) *
                    100;

                return `${x},${y}`;
              })
              .join(" ")}
          />
        </svg>

      </div>

      {/* PARAMETER BOX */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-3xl mb-6">

        <div className="text-sm text-zinc-300 mb-4">
          ⚙️ Compound Settings
        </div>

        <div className="grid md:grid-cols-3 gap-4">

          <div>
            <div className="text-xs text-zinc-400 mb-2">
              💰 Start Capital
            </div>

            <input
              type="number"
              value={params.startCapital}
              onChange={(e) =>
                handleChange(
                  "startCapital",
                  Number(e.target.value)
                )
              }
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <div className="text-xs text-zinc-400 mb-2">
              📈 Daily Target (%)
            </div>

            <input
              type="number"
              value={params.dailyTarget}
              onChange={(e) =>
                handleChange(
                  "dailyTarget",
                  Number(e.target.value)
                )
              }
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <div className="text-xs text-zinc-400 mb-2">
              ⏳ Duration (Days)
            </div>

            <input
              type="number"
              value={params.duration}
              onChange={(e) =>
                handleChange(
                  "duration",
                  Number(e.target.value)
                )
              }
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

        </div>
      </div>

      {/* COMPOUND TABLE */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-3xl">

        <div className="text-sm text-zinc-300 mb-4">
          📊 Estimated Compound Projection
        </div>

        <div className="grid grid-cols-4 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-400 text-black font-bold text-sm rounded-xl p-3 mb-2">
          <div>Day</div>
          <div>Start</div>
          <div>Target</div>
          <div>End</div>
        </div>

        <div className="max-h-96 overflow-y-auto">

          {Array.from({
            length: params.duration,
          }).map((_, i) => {

            const start =
              i === 0
                ? params.startCapital
                : params.startCapital *
                  Math.pow(
                    1 +
                      params.dailyTarget / 100,
                    i
                  );

            const end =
              params.startCapital *
              Math.pow(
                1 + params.dailyTarget / 100,
                i + 1
              );

            return (
              <div
                key={i}
                className="grid grid-cols-4 text-sm py-3 px-2 border-b border-white/5 hover:bg-white/5 transition"
              >
                <div className="text-yellow-300">
                  {i + 1}
                </div>

                <div className="text-cyan-300">
                  {start.toFixed(2)}
                </div>

                <div className="text-emerald-400">
                  {params.dailyTarget.toFixed(2)}%
                </div>

                <div className="text-purple-400 font-semibold">
                  {end.toFixed(2)}
                </div>
              </div>
            );
          })}

        </div>

      </div>

    </div>
  );
}