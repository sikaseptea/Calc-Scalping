"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const MEMBERS = [
  { name: "REGULAR", fee: 0.0004 },
  { name: "VIP 1", fee: 0.0003 },
  { name: "VIP 2", fee: 0.0002 },
];

// ================= TP BAR =================
function TPBar({ label, value, percent, color }: any) {
  const p = Math.max(0, Math.min(percent || 0, 100));
  if (p <= 0) return null;

  return (
    <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-4">
      <div className="flex justify-between text-xs text-zinc-400 mb-2">
        <span>{label}</span>
        <span>{p}%</span>
      </div>

      <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`${color} h-3 rounded-full transition-all duration-500`}
          style={{ width: `${p}%` }}
        />
      </div>

      <div className="mt-3 text-lg font-bold">
        {Number.isFinite(value) ? value.toFixed(4) : "-"}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div
      className="
      bg-zinc-900/80
      border border-zinc-800
      rounded-2xl
      p-5
      backdrop-blur
      hover:border-yellow-200/90 
      transition
    "
    >
      <div className="text-xs text-zinc-500">
        {title}
      </div>

      <div className="mt-2 text-2xl font-bold">
        {value}
      </div>
    </div>
  );
}

// ================= TOAST =================
function Toast({ show, text }: { show: boolean; text: string }) {
  if (!show) return null;

  return (
    <div className="fixed top-5 right-5 z-50">
      <div className="bg-green-600 text-white px-4 py-2 rounded shadow-lg">
        {text}
      </div>
    </div>
  );
}

// ================= NORMALIZER =================
function normalizePair(input: string, list: string[]) {
  const raw = input.toUpperCase().replace(/[^A-Z]/g, "");
  if (!raw) return "";

  if (raw.endsWith("USDT")) return raw;

  const match = list.find((p) => p.startsWith(raw));
  return match || "";
}

export default function CalculatorPage() {
  const [pairs, setPairs] = useState<string[]>([]);
  const [pairInput, setPairInput] = useState(""); // ✅ DEFAULT KOSONG
  const [pair, setPair] = useState("BTCUSDT");

  const [price, setPrice] = useState(0);
  const [paused, setPaused] = useState(false);

  const [balance, setBalance] = useState(1000);
  const [riskPercent, setRiskPercent] = useState(1);
  const [rr, setRR] = useState(2);
  const [leverage, setLeverage] = useState(10);

  const [member, setMember] = useState(MEMBERS[0]);

  const [entry, setEntry] = useState(0);
  const [entryMode, setEntryMode] = useState<"AUTO" | "MANUAL">("AUTO");

  const [direction, setDirection] = useState<"LONG" | "SHORT">("LONG");

  const [tp1Split, setTp1Split] = useState(0);
  const [tp2Split, setTp2Split] = useState(0);
  const [tp3Split, setTp3Split] = useState(0);

  const [toast, setToast] = useState(false);

  const splitTotal = tp1Split + tp2Split + tp3Split;
  const splitValid = splitTotal === 100;

  // ================= LOAD PAIRS =================
  useEffect(() => {
    fetch("https://api.binance.com/api/v3/exchangeInfo")
      .then((r) => r.json())
      .then((d) => {
        const usdt = d.symbols
          .filter((s: any) => s.quoteAsset === "USDT" && s.status === "TRADING")
          .map((s: any) => s.symbol);

        setPairs(usdt);
      });
  }, []);

  // ================= NORMALIZE =================
  useEffect(() => {
    const fixed = normalizePair(pairInput, pairs);
    if (fixed) setPair(fixed);
  }, [pairInput, pairs]);

  // ================= RESET ENTRY ON PAIR CHANGE =================
  useEffect(() => {
    setEntryMode("AUTO");
    setEntry(0);
  }, [pair]);

  // ================= LIVE PRICE =================
  useEffect(() => {
    if (paused || !pair) return;

    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${pair.toLowerCase()}@ticker`
    );

    ws.onmessage = (e) => {
      const d = JSON.parse(e.data);
      const p = parseFloat(d.c);
      if (!isNaN(p)) setPrice(p);
    };

    return () => ws.close();
  }, [pair, paused]);

  // ================= AUTO ENTRY =================
  useEffect(() => {
    if (entryMode === "AUTO" && price > 0) {
      setEntry(price);
    }
  }, [price, entryMode]);

  const baseEntry = entry || price || 0;

  // ================= CORE =================
  const riskAmount = balance * (riskPercent / 100);

  const slPrice =
    direction === "LONG"
      ? baseEntry * (1 - riskPercent / 100)
      : baseEntry * (1 + riskPercent / 100);

  const riskDistance = Math.abs(baseEntry - slPrice) || 0.0000001;

  const positionSize = riskAmount / riskDistance;
  const notional = positionSize * baseEntry;

  const grossPnL = riskAmount * rr;

  const splitPnL =
    (grossPnL * tp1Split) / 100 +
    (grossPnL * tp2Split) / 100 +
    (grossPnL * tp3Split) / 100;

  const feeCost = notional * member.fee * 2;
  const netPnL = splitPnL - feeCost;
  const roi = balance ? (netPnL / balance) * 100 : 0;

  const baseMove = riskDistance * rr;

  const tp1 = tp1Split
    ? direction === "LONG"
      ? baseEntry + baseMove
      : baseEntry - baseMove
    : 0;

  const tp2 = tp2Split
    ? direction === "LONG"
      ? baseEntry + baseMove * 2
      : baseEntry - baseMove * 2
    : 0;

  const tp3 = tp3Split
    ? direction === "LONG"
      ? baseEntry + baseMove * 3
      : baseEntry - baseMove * 3
    : 0;

  // ================= SAVE =================
  async function saveTrade() {
    if (!splitValid) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from("trade_logs").insert({
      user_id: user.id,
      pair,
      direction,
      entry: baseEntry,
      stoploss: slPrice,
      tp1,
      tp2,
      tp3,
      risk_percent: riskPercent,
      leverage,
      risk_amount: riskAmount,
      position_size: positionSize,
      pnl: netPnL,
    });

    setToast(true);
    setTimeout(() => setToast(false), 2000);
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  // ================= UI =================
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-900 text-white p-6">

      <Toast show={toast} text="Trade Saved 🚀" />

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <button onClick={() => setPaused(!paused)} className="px-3 py-1 bg-blue-600 rounded">
          {paused ? "Resume" : "Pause"}
        </button>

        <button onClick={logout} className="px-3 py-1 bg-red-600 rounded">
          Logout
        </button>
      </div>

      {/* PRICE */}
      <div
  className="
  rounded-3xl
  p-6
  mb-6
  text-center
  bg-gradient-to-r
  from-yellow-500
  via-yellow-400
  to-yellow-300
  shadow-2xl
"
>
  <div className="text-black text-sm font-semibold">
    LIVE MARKET PRICE
  </div>

  <div className="text-black text-5xl font-bold tracking-tight">
    ${price.toFixed(4)}
  </div>

  <div className="text-black text-lg font-bold">
    {pair || "-"}
  </div>
</div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* INPUT */}
        <div
  className="
  space-y-4
  bg-zinc-900/70
  backdrop-blur-xl
  border border-zinc-800
  rounded-3xl
  p-6
"
>

          <select
            value={member.name}
            onChange={(e) => {
              const m = MEMBERS.find(x => x.name === e.target.value);
              if (m) setMember(m);
            }}
            className="
w-full
p-3
bg-zinc-800
border
border-zinc-700
rounded-xl
focus:outline-none
focus:ring-2
focus:ring-yellow-500
"
          >
            {MEMBERS.map(m => (
              <option key={m.name} value={m.name}>{m.name}</option>
            ))}
          </select>

          <input
            value={pairInput}
            onChange={(e) => setPairInput(e.target.value)}
            className="w-full p-2 bg-red-900 rounded"
            placeholder="Cari pair..."
          />

         

          {/* REST SAME UI */}
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setDirection("LONG")} className={`
p-3
rounded-xl
font-bold
transition
${
  direction === "LONG"
    ? "bg-green-600 shadow-lg"
    : "bg-zinc-800"
}
`}>LONG</button>
            <button onClick={() => setDirection("SHORT")} className={`
p-3
rounded-xl
font-bold
transition
${
  direction === "SHORT"
    ? "bg-red-600 shadow-lg"
    : "bg-zinc-800"
}
`}>SHORT</button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input value={balance} onChange={e => setBalance(+e.target.value)} className="p-2 bg-zinc-900 rounded" />
            <input value={riskPercent} onChange={e => setRiskPercent(+e.target.value)} className="p-2 bg-zinc-900 rounded" />
            <input value={rr} onChange={e => setRR(+e.target.value)} className="p-2 bg-zinc-900 rounded" />
            <input value={leverage} onChange={e => setLeverage(+e.target.value)} className="p-2 bg-zinc-900 rounded" />
          </div>

 
          <input
  value={entry}
  onChange={(e) => {
    setEntry(+e.target.value);
    setEntryMode("MANUAL");
  }}
  className="
w-full
p-4
bg-yellow-400
text-white
font-bold
text-center
text-xl
rounded-2xl
border
border-yellow-500
focus:outline-none
focus:ring-2
focus:ring-yellow-400
"
  placeholder="Entry Price"
/>

          <div className="grid grid-cols-3 gap-2">
            <input value={tp1Split} onChange={e => setTp1Split(+e.target.value)} className="p-2 bg-zinc-900 rounded" />
            <input value={tp2Split} onChange={e => setTp2Split(+e.target.value)} className="p-2 bg-zinc-900 rounded" />
            <input value={tp3Split} onChange={e => setTp3Split(+e.target.value)} className="p-2 bg-zinc-900 rounded" />
          </div>

          <div className={splitValid ? "text-green-400" : "text-red-400"}>
            Total {splitTotal}%
          </div>

        </div>

        {/* OUTPUT */}
        <div
  className="
  lg:col-span-2
  space-y-4
  bg-zinc-900/60
  backdrop-blur-xl
  border border-zinc-800
  rounded-3xl
  p-6
"
>

          <TPBar label="TP1" value={tp1} percent={tp1Split} color="bg-green-500" />
          <TPBar label="TP2" value={tp2} percent={tp2Split} color="bg-blue-500" />
          <TPBar label="TP3" value={tp3} percent={tp3Split} color="bg-purple-500" />

          {/* OUTPUT GRID CLEAN */}
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">

  <StatCard
    title="STOP LOSS"
    value={slPrice.toFixed(4)}
  />

  <StatCard
    title="RISK"
    value={`$${riskAmount.toFixed(2)}`}
  />

  <StatCard
    title="SIZE"
    value={positionSize.toFixed(4)}
  />

  <StatCard
    title="GROSS"
    value={`$${grossPnL.toFixed(2)}`}
  />

  <StatCard
    title="NET"
    value={`$${netPnL.toFixed(2)}`}
  />

  <StatCard
    title="ROI"
    value={`${roi.toFixed(2)}%`}
  />

</div>

          {splitValid && (
            <button onClick={saveTrade} className="
w-full
p-4
rounded-2xl
bg-gradient-to-r
from-green-600
to-emerald-500
font-bold
text-lg
hover:scale-[1.01]
transition
shadow-lg
">
              SAVE TRADE
            </button>
          )}

        </div>
      </div>
    </div>
  );
}