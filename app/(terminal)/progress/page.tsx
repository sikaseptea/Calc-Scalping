"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Trade = {
  id: string;
  pair: string;
  direction: string;
  entry: number;
  actual_pnl: number | null;
  status: "WIN" | "LOSS" | "BE" | null;
  created_at: string;
};

type TradeStatus = "WIN" | "LOSS" | "BE" | null;

type EditTrade = {
  status?: TradeStatus;
  actual_pnl?: string | number;
};

export default function ProgressPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [edit, setEdit] = useState<Record<string, EditTrade>>({});

  // ================= LOAD =================
  useEffect(() => {
    const loadTrades = async () => {
      const { data } = await supabase
        .from("trade_logs")
        .select("*")
        .order("created_at", { ascending: true });

      if (data) setTrades(data as Trade[]);
    };

    void loadTrades();
  }, []);

  // ================= SAFE EDIT =================
  const v = (t: Trade, key: keyof Trade | keyof EditTrade) => {
    const edited = edit[t.id];

    if (edited && key in edited) {
      return edited[key as keyof EditTrade];
    }

    return t[key as keyof Trade] ?? "";
  };

  // ================= TODAY TRADES (FIXED) =================
  const todayTrades = useMemo(() => {
    const today = new Date().toDateString();

    return trades.filter(
      (t) => new Date(t.created_at).toDateString() === today
    );
  }, [trades]); // ✅ FIX DI SINI

  // ================= GROUP =================
  const winTrades = todayTrades.filter((t) => t.status === "WIN");
  const lossTrades = todayTrades.filter((t) => t.status === "LOSS");

  // ================= PNL =================
  const winPnL = winTrades.reduce(
    (a, t) => a + Number(t.actual_pnl || 0),
    0
  );

  const lossPnL = lossTrades.reduce(
    (a, t) => a + Math.abs(Number(t.actual_pnl || 0)),
    0
  );

  const netPnL = winPnL - lossPnL;

  const winRate = todayTrades.length
    ? (winTrades.length / todayTrades.length) * 100
    : 0;

  const lossRate = todayTrades.length
    ? (lossTrades.length / todayTrades.length) * 100
    : 0;

  const lossWarning = lossTrades.length >= 3;

  // ================= BEST TRADE =================
  const bestTrade = useMemo(() => {
    if (!todayTrades.length) return null;

    return [...todayTrades].sort(
      (a, b) =>
        Number(b.actual_pnl || 0) - Number(a.actual_pnl || 0)
    )[0];
  }, [todayTrades]);

  // ================= EQUITY CURVE =================
  const equity = useMemo(() => {
    return todayTrades.reduce<number[]>((acc, trade) => {
      const previous = acc.length ? acc[acc.length - 1] : 0;

      acc.push(previous + Number(trade.actual_pnl || 0));
      return acc;
    }, []);
  }, [todayTrades]);

  const max = Math.max(...equity, 1);
  const min = Math.min(...equity, 0);

  // ================= SAVE =================
  async function saveTrade(t: Trade) {
    const status = v(t, "status");
    const pnl = v(t, "actual_pnl");

    if (!status || pnl === "") return;

   const payload: Partial<Trade> = {
  status: status as TradeStatus,
  actual_pnl: Number(pnl),
};
    const { error } = await supabase
      .from("trade_logs")
      .update(payload)
      .eq("id", t.id);

    if (error) return;

    setTrades((prev) =>
      prev.map((x) =>
        x.id === t.id ? { ...x, ...payload } : x
      )
    );

    setEdit((prev) => {
      const copy = { ...prev };
      delete copy[t.id];
      return copy;
    });
  }

  // ================= DELETE =================
  async function deleteTrade(id: string) {
    if (!window.confirm("⚠️ Hapus trade ini?\nData tidak bisa dikembalikan.")) return;

    const { error } = await supabase
      .from("trade_logs")
      .delete()
      .eq("id", id);

    if (error) return;

    setTrades((prev) => prev.filter((t) => t.id !== id));
  }

  // ================= FORMAT =================
  const formatDate = (d: string) => {
    const dt = new Date(d);
    return dt.toLocaleString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-900 text-white p-6">

      {/* WARNING */}
      {lossWarning && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400 font-semibold">
          ⚠️ Risk Alert — 3 Consecutive Losses Detected
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Trading Performance</h1>
        <p className="text-zinc-400 text-sm">
          Daily Statistics & Trade Journal
        </p>
      </div>

      {/* DASHBOARD (FULL RESTORED) */}
      <div className="grid md:grid-cols-3 grid-cols-2 gap-4 mb-6">

        {/* WIN PNL */}
        <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl p-4 shadow-lg">
          <div className="text-xs uppercase text-zinc-500">WIN PnL</div>
          <div className="text-green-400 text-2xl font-bold mt-1">
            ${winPnL.toFixed(2)}
          </div>
        </div>

        {/* LOSS PNL */}
        <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl p-4 shadow-lg">
          <div className="text-xs text-gray-400">LOSS PnL</div>
          <div className="text-red-400 text-2xl font-bold mt-1">
            ${lossPnL.toFixed(2)}
          </div>
        </div>

        {/* NET PNL */}
        <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl p-4 shadow-lg">
          <div className="text-xs text-gray-400">NET PnL</div>
          <div className={`text-2xl font-bold mt-1 ${netPnL >= 0 ? "text-green-400" : "text-red-400"}`}>
            ${netPnL.toFixed(2)}
          </div>
        </div>

        {/* WIN RATE */}
        <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl p-4 shadow-lg">
          <div className="text-xs text-gray-400">WIN RATE</div>
          <div className="text-green-400 font-bold">
            {winRate.toFixed(1)}%
          </div>
        </div>

        {/* LOSS RATE */}
        <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl p-4 shadow-lg">
          <div className="text-xs text-gray-400">LOSS RATE</div>
          <div className="text-red-400 font-bold">
            {lossRate.toFixed(1)}%
          </div>
        </div>

        {/* TODAY TRADES */}
        <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl p-4 shadow-lg">
          <div className="text-xs text-gray-400">TODAY TRADES</div>
          <div className="font-bold">{todayTrades.length}</div>
        </div>
      </div>

      {/* BEST + EQUITY */}
      <div className="grid grid-cols-2 gap-3 mb-4">

        {/* BEST TRADE */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-lg">
          <div className="text-zinc-500 text-sm">BEST TRADE</div>
          <div className="text-3xl font-bold text-green-400 mt-2">
            {Number(bestTrade?.actual_pnl || 0).toFixed(2)}
          </div>
          <div className="text-zinc-400 mt-1">
            {bestTrade?.pair}
          </div>
        </div>

        {/* EQUITY */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-lg">
          <div className="text-xs text-gray-400 mb-2">EQUITY CURVE</div>

          <svg viewBox="0 0 100 100" className="w-full h-28">
            <polyline
              fill="none"
              stroke="#f0b90b"
              strokeWidth="3"
              points={equity
                .map((v, i) => {
                  const x = (i / Math.max(equity.length - 1, 1)) * 100;
                  const y = 100 - ((v - min) / (max - min || 1)) * 100;
                  return `${x},${y}`;
                })
                .join(" ")}
            />
          </svg>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden">

        <div className="grid grid-cols-7 bg-zinc-950 text-zinc-400 text-xs uppercase px-4 py-3 border-b border-zinc-800">
          <div>Time</div>
          <div>Pair</div>
          <div>Side</div>
          <div>Status</div>
          <div>PnL</div>
          <div>Save</div>
          <div>Delete</div>
        </div>

        {todayTrades.map((t) => (
          <div key={t.id} className="grid grid-cols-7 px-4 py-3 border-b border-zinc-800 text-sm">

            <div>{formatDate(t.created_at)}</div>
            <div>{t.pair}</div>

            <div className={t.direction === "LONG" ? "text-green-400" : "text-red-400"}>
              {t.direction}
            </div>

            <select
              
  className="bg-black border p-1 rounded"
  value={String(v(t, "status") ?? "")}
              onChange={(e) =>
  setEdit((prev) => ({
    ...prev,
    [t.id]: {
      ...prev[t.id],
      status: e.target.value as TradeStatus,
    },
  }))
}
            >
              <option value="">-</option>
              <option value="WIN">WIN</option>
              <option value="LOSS">LOSS</option>
              <option value="BE">BE</option>
            </select>

            <input
  className="bg-black border p-1 rounded w-full"
  value={String(v(t, "actual_pnl") ?? "")}
              onChange={(e) =>
                setEdit((prev) => ({
                  ...prev,
                  [t.id]: {
                    ...prev[t.id],
                    actual_pnl: e.target.value,
                  },
                }))
              }
            />

            <button onClick={() => saveTrade(t)} className="text-green-400">💾</button>
            <button onClick={() => deleteTrade(t.id)} className="text-red-500">🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
}