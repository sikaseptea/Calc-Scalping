"use client";

import { useEffect, useState, useRef } from "react";
import Chart from "./components/Chart";
import { AlertTriangle } from "lucide-react";

const PAIRS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT"];
const TF = ["1m","3m","5m","15m", "1h", "4h", "1d", "1M"];


type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};
type BOS = "BULLISH" | "BEARISH" | "SIDEWAYS";
type CHOCH = "BULLISH" | "BEARISH" | "NONE";
type MarketState = "BULLISH" | "BEARISH" | "SIDEWAYS" | "NONE";

function fmt(n: number | undefined, d = 2) {
  if (n === undefined || n === null || isNaN(n)) return "-";

  const clean = Number(n.toFixed(d));

  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  }).format(clean);
}

function RSI(data: Candle[]) {
  if (!data.length) return 50;

  let gain = 0;
  let loss = 0;

  for (let i = 1; i < data.length; i++) {
    const diff = data[i].close - data[i - 1].close;

    if (diff > 0) gain += diff;
    else loss += -diff;
  }

  if (loss === 0) return 100;

  const rs = gain / loss;

  return 100 - 100 / (1 + rs);
}

function forecast(rsi: number, bos: BOS, choch: CHOCH) {
  const score =
    (bos === "BULLISH" ? 2 : bos === "BEARISH" ? -2 : 0) +
    (choch === "BULLISH" ? 3 : choch === "BEARISH" ? -3 : 0) +
    (rsi > 55 ? 1 : rsi < 45 ? -1 : 0);

  const base =
    score >= 3 ? "BULLISH"
    : score <= -3 ? "BEARISH"
    : "SIDEWAYS";

  return {
    "15m": base,
    "1h": base,
    "4h": base,
    "1d": base,
    "1M": base,
  };
}
function detectBOS(data: Candle[]) {

  if (data.length < 200) {
    return "SIDEWAYS";
  }

  const ema20 =
    data.slice(-20).reduce((a, b) => a + b.close, 0) / 20;

  const ema50 =
    data.slice(-50).reduce((a, b) => a + b.close, 0) / 50;

  const ema200 =
    data.slice(-200).reduce((a, b) => a + b.close, 0) / 200;

  if (
    ema20 > ema50 &&
    ema50 > ema200
  ) {
    return "BULLISH";
  }

  if (
    ema20 < ema50 &&
    ema50 < ema200
  ) {
    return "BEARISH";
  }

  return "SIDEWAYS";
}
{/*function detectCHOCH(
  data: Candle[],
  bos: string
) {

  if (data.length < 20) {
    return "NONE";
  }

  let lastSwingHigh = data[0].high;
  let lastSwingLow = data[0].low;

  for (let i = 2; i < data.length - 2; i++) {

    if (
      data[i].high > data[i - 1].high &&
      data[i].high > data[i - 2].high &&
      data[i].high > data[i + 1].high &&
      data[i].high > data[i + 2].high
    ) {
      lastSwingHigh = data[i].high;
    }

    if (
      data[i].low < data[i - 1].low &&
      data[i].low < data[i - 2].low &&
      data[i].low < data[i + 1].low &&
      data[i].low < data[i + 2].low
    ) {
      lastSwingLow = data[i].low;
    }
  }

  const close = data[data.length - 1].close;

  // trend sebelumnya bullish
  if (bos === "BULLISH" && close < lastSwingLow) {
    return "BEARISH";
  }

  // trend sebelumnya bearish
  if (bos === "BEARISH" && close > lastSwingHigh) {
    return "BULLISH";
  }

  return "NONE";
}*/}

  const TF_MS: Record<string, number> = {
  "1m": 1 * 60 * 1000,
  "3m": 3 * 60 * 1000,
  "5m": 5 * 60 * 1000,
  "15m": 15 * 60 * 1000,
  "30m": 30 * 60 * 1000,

  "1h": 60 * 60 * 1000,
  "2h": 2 * 60 * 60 * 1000,
  "4h": 4 * 60 * 60 * 1000,
  "6h": 6 * 60 * 60 * 1000,
  "8h": 8 * 60 * 60 * 1000,
  "12h": 12 * 60 * 60 * 1000,

  "1d": 24 * 60 * 60 * 1000,
  "3d": 3 * 24 * 60 * 60 * 1000,
  "1w": 7 * 24 * 60 * 60 * 1000,

  "1M": 30 * 24 * 60 * 60 * 1000,
};


function getRemainingTime(tf: string) {
  const interval = TF_MS[tf];
  const now = Date.now();

  // cari candle open time saat ini
  const currentOpen = Math.floor(now / interval) * interval;

  // next candle open time
  const nextOpen = currentOpen + interval;

  return nextOpen - now;
}

function cleanPrice(n: number) {
  return Math.round(n * 1e6) / 1e6;
}

export default function CryptoPage() {
  const [symbol, setSymbol] = useState("BTCUSDT");
const [timeframe, setTimeframe] = useState("1h");

const [candles, setCandles] = useState<Candle[]>([]);
const [ticker, setTicker] = useState<any>({});

const [rsi, setRsi] = useState(50);
const [trend, setTrend] = useState("SIDEWAYS");
const [fc, setFc] = useState<any>({});

const [bos, setBos] = useState<BOS>("SIDEWAYS");
const [choch, setChoch] = useState<CHOCH>("NONE");

const [support, setSupport] = useState(0);
const [resistance, setResistance] = useState(0);

const [countdown, setCountdown] = useState(0);

const [signal, setSignal] = useState<any>(null);
const [bias, setBias] = useState("SIDEWAYS");
const [confidence, setConfidence] = useState(0);

const [isReloading, setIsReloading] = useState(false);

const lastCandleOpenRef = useRef<number | null>(null);
const fetchLockRef = useRef(false);
const lastSignalRef = useRef<any>(null);

const [mounted, setMounted] = useState(false);

// 🔥 SWEEP ALERT (INI YANG BARU DAN BENAR)
const [sweepAlert, setSweepAlert] = useState<any>(null);
const lastSweepRef = useRef<number>(0);
  
 

  
  
  

useEffect(() => {
  let active = true;

  const interval = setInterval(async () => {
    if (!active) return;

    try {
      const intervalMs = TF_MS[timeframe];
      const now = Date.now();

      const currentOpen = Math.floor(now / intervalMs) * intervalMs;
      const nextOpen = currentOpen + intervalMs;

      setCountdown(nextOpen - now);

      const res = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${timeframe}&limit=2`
      );

      const data = await res.json();
      const latestCandleOpen = data?.[data.length - 1]?.[0];

      if (!latestCandleOpen) return;

      // 🔥 hanya kalau candle baru
      if (
  lastCandleOpenRef.current !== latestCandleOpen &&
  !fetchLockRef.current
) {
  lastCandleOpenRef.current = latestCandleOpen;

  setIsReloading(true);

  try {
    await load();
  } catch (e) {
    console.error(e);
  } finally {
    setTimeout(() => setIsReloading(false), 500);
  }
}
    } catch (e) {
      console.error(e);
    }
  }, 1000);

  return () => {
    active = false;
    clearInterval(interval);
  };
}, [symbol, timeframe,]);

function getConfirmations(
  bos: BOS,
  choch: CHOCH,
  rsi: number,
  trend: string
) {
  let bullish = 0;
  let bearish = 0;

  if (bos === "BULLISH") bullish++;
  if (bos === "BEARISH") bearish++;

  if (choch === "BULLISH") bullish += 2;
  if (choch === "BEARISH") bearish += 2;

  if (rsi > 60) bullish++;
  if (rsi < 40) bearish++;

  if (trend === "BULLISH") bullish++;
  if (trend === "BEARISH") bearish++;

  return { bullish, bearish };
}

function calculateBias(conf: { bullish: number; bearish: number }) {
  const diff = conf.bullish - conf.bearish;

  if (diff >= 3) return "STRONG_BULLISH";
  if (diff === 2) return "BULLISH";
  if (diff === 1) return "WEAK_BULLISH";

  if (diff <= -3) return "STRONG_BEARISH";
  if (diff === -2) return "BEARISH";
  if (diff === -1) return "WEAK_BEARISH";

  return "SIDEWAYS";
}

function generateSignalV2(
  price: number,
  support: number,
  resistance: number,
  bos: BOS,
  choch: CHOCH,
  rsi: number,
  trend: string,
  sweep: { type: string }   // 🔥 TAMBAH INI
){
  let score = 0;
  
  if (sweep?.type === "BUY_SIDE_SWEEP") score -= 2;
if (sweep?.type === "SELL_SIDE_SWEEP") score += 2;

  if (bos === "BULLISH") score += 2;
  if (bos === "BEARISH") score -= 2;

  if (choch === "BULLISH") score += 3;
  if (choch === "BEARISH") score -= 3;

  if (rsi > 60) score += 1;
  if (rsi < 40) score -= 1;

  if (trend === "BULLISH") score += 1;
  if (trend === "BEARISH") score -= 1;

  // 🔥 FIX IMPORTANT: filter noise
  if (Math.abs(score) < 2) return null;

  let direction: "LONG" | "SHORT" | "NONE" = "NONE";

  if (score > 0) direction = "LONG";
  if (score < 0) direction = "SHORT";
  
  

  const risk = Math.abs(resistance - support);

  return {
    direction,
    bias:
  score >= 5 ? "STRONG_BULLISH" :
  score >= 3 ? "BULLISH" :
  score <= -5 ? "STRONG_BEARISH" :
  score <= -3 ? "BEARISH" :
  "SIDEWAYS",

    confidence: Math.abs(score),

    entry: price,
    sl: direction === "LONG" ? support : resistance,
    tp1: direction === "LONG" ? price + risk : price - risk,
    tp2: direction === "LONG" ? price + risk * 1.5 : price - risk * 1.5,
    tp3: direction === "LONG" ? price + risk * 2 : price - risk * 2,
  };
}

 async function load(currentSymbol = symbol, currentTf = timeframe) {
  if (fetchLockRef.current) return;
  fetchLockRef.current = true;

  try {
    const res = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${currentSymbol}&interval=${currentTf}&limit=200`
    );

    const data = await res.json();

    if (!Array.isArray(data) || data.length < 50) {
  fetchLockRef.current = false;
  return;
}

    const round = (n: number, d = 6) =>
      Math.round(Number(n) * Math.pow(10, d)) / Math.pow(10, d);

    const c: Candle[] = data.map((k: any) => ({
      time: k[0] / 1000,
      open: round(+k[1]),
      high: round(+k[2]),
      low: round(+k[3]),
      close: round(+k[4]),
    }));
	
	const prev = c.at(-2);
const last = c.at(-1);

if (!last) return;

const swings = getSwings(c);
const liquidity = getLiquidityLevels(swings);

const sweep = detectSweep(
  last.close,
  Math.max(...liquidity.highs),
  Math.min(...liquidity.lows),
  prev?.close ?? last.close
);

const now = Date.now();

// level yang disapu
const sweepLevel =
  sweep.type === "BUY_SIDE_SWEEP"
    ? Math.max(...liquidity.highs)
    : Math.min(...liquidity.lows);

// besar penetrasi
const sweepDistance = Math.abs(last.close - sweepLevel);

// minimal 0.05%
const minSweepDistance = last.close * 0.0005;

const validSweep =
  sweep.type !== "NONE" &&
  sweep.valid &&
  sweepDistance >= minSweepDistance;

if (
  validSweep &&
  now - lastSweepRef.current > 10000
) {
  lastSweepRef.current = now;

  setSweepAlert({
    type: sweep.type,
    price: last.close,
    time: now,
  });

  setTimeout(() => {
    setSweepAlert((prevAlert: any) => {
      if (prevAlert?.time === now) {
        return null;
      }
      return prevAlert;
    });
  }, 4000);
}

  const r = RSI(c);
setRsi(r);

    let newTrend: "BULLISH" | "BEARISH" | "SIDEWAYS" = "SIDEWAYS";
    if (r > 60) newTrend = "BULLISH";
    else if (r < 40) newTrend = "BEARISH";

    setTrend(newTrend);

   

    const support = Math.min(...c.slice(-50).map(x => x.low));
    const resistance = Math.max(...c.slice(-50).map(x => x.high));

    const structure: {
  bos: BOS;
  choch: CHOCH;
} = detectStructure(c);

    setCandles(c);
    setTicker({
      open: last.open,
      high: last.high,
      low: last.low,
      price: last.close,
    });

    setSupport(support);
    setResistance(resistance);
    setBos(structure.bos);
    setChoch(structure.choch);

  const plan = generateSignalV2(
  last.close,
  support,
  resistance,
  structure.bos,
  structure.choch,
  r,
  newTrend,
  sweep   // 🔥 TAMBAH INI
);

if (plan) {
  lastSignalRef.current = plan;
  setSignal(plan);
  setBias(plan.bias);
  setConfidence(plan.confidence);
} else {
  if (lastSignalRef.current) {
    setSignal(lastSignalRef.current);
  } else {
    setSignal(null);
    setBias("SIDEWAYS");
    setConfidence(0);
  }
}

    const fcResult = forecast(r, structure.bos, structure.choch);
    setFc(fcResult);

  } catch (err) {
    console.error("load error:", err);
	
	
  } finally {
    fetchLockRef.current = false;
  }
}

function generateTradePlan(price: number, support: number, resistance: number, bos: string) {
  let direction = "NONE";

  if (bos === "BULLISH") direction = "LONG";
  if (bos === "BEARISH") direction = "SHORT";

  if (direction === "NONE") return null;

  const risk = Math.abs(resistance - support);

  if (direction === "LONG") {
    return {
      direction,
      entry: price,
      sl: support,
      tp1: price + risk,
      tp2: price + risk * 1.5,
      tp3: price + risk * 2,
    };
  }

  if (direction === "SHORT") {
    return {
      direction,
      entry: price,
      sl: resistance,
      tp1: price - risk,
      tp2: price - risk * 1.5,
      tp3: price - risk * 2,
    };
  }

  return null;
}

function getSwings(data: Candle[]) {
  const swings: { type: "HIGH" | "LOW"; price: number; index: number }[] = [];

  const left = 3;
  const right = 3;

  for (let i = left; i < data.length - right; i++) {
    const window = data.slice(i - left, i + right + 1);

    const isSwingHigh =
      data[i].high === Math.max(...window.map(c => c.high));

    const isSwingLow =
      data[i].low === Math.min(...window.map(c => c.low));

    if (isSwingHigh) {
      swings.push({
        type: "HIGH",
        price: data[i].high,
        index: i,
      });
    }

    if (isSwingLow) {
      swings.push({
        type: "LOW",
        price: data[i].low,
        index: i,
      });
    }
  }

  return swings;
}

function detectStructure(
  data: Candle[]
): { bos: BOS; choch: CHOCH } {
  const swings = getSwings(data);

  if (swings.length < 10) {
    return { bos: "SIDEWAYS", choch: "NONE" };
  }

  const lastHigh = [...swings].reverse().find(s => s.type === "HIGH");
  const lastLow = [...swings].reverse().find(s => s.type === "LOW");

  const price = data.at(-1)!.close;

  let bos: BOS = "SIDEWAYS";
  let choch: CHOCH = "NONE";

  // BOS
  if (lastHigh && price > lastHigh.price) bos = "BULLISH";
  else if (lastLow && price < lastLow.price) bos = "BEARISH";

  // CHOCH (reversal only)
  // CHOCH = reversal only after BOS break failure

if (bos === "BULLISH") {
  if (lastLow && price < lastLow.price) {
    choch = "BEARISH";
  }
}

if (bos === "BEARISH") {
  if (lastHigh && price > lastHigh.price) {
    choch = "BULLISH";
  }
}

  if (bos === "SIDEWAYS" && lastHigh && lastLow) {
  const price = data.at(-1)!.close;

  if (price > lastHigh.price) bos = "BULLISH";
  if (price < lastLow.price) bos = "BEARISH";
}

return { bos, choch };
}




  useEffect(() => {
  let active = true;

  const interval = setInterval(async () => {
    try {
      const res = await fetch(
        `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`
      );

      const data = await res.json();

      if (!active) return;

      setTicker((p: any) => ({
        ...p,
        price: +data.price,
      }));
    } catch {}
  }, 1000);

  return () => {
    active = false;
    clearInterval(interval);
  };
}, [symbol]);

useEffect(() => {
  setMounted(true);
}, []);
 
 useEffect(() => {
  fetchLockRef.current = false;
  lastCandleOpenRef.current = null;

  setCandles([]);
  setTicker({});
  setSignal(null);
  setBias("SIDEWAYS");
  setConfidence(0);

  load();
}, [symbol, timeframe]);

function getLiquidityLevels(swings: Swing[]) {
  return {
    highs: swings
      .filter(s => s.type === "HIGH")
      .map(s => s.price),

    lows: swings
      .filter(s => s.type === "LOW")
      .map(s => s.price),
  };
}

function detectSweep(
  price: number,
  high: number,
  low: number,
  prevClose: number
) {
	const range = Math.abs(high - low);

  // 🔥 FILTER NOISE (INI PENAMBAHAN YANG KAMU TANYA)
  if (range < price * 0.001) {
    return {
      type: "NONE",
      valid: false,
    };
  }
  
  const sweptHigh = price > high && prevClose <= high;
  const sweptLow = price < low && prevClose >= low;

  const rejectionHigh = sweptHigh && price < high;
  const rejectionLow = sweptLow && price > low;

  return {
    type:
      sweptHigh ? "BUY_SIDE_SWEEP"
      : sweptLow ? "SELL_SIDE_SWEEP"
      : "NONE",

    valid: rejectionHigh || rejectionLow
  };
}

function getLiquiditySwings(swings: Swing[]) {
  return {
    highs: swings.filter(s => s.type === "HIGH"),
    lows: swings.filter(s => s.type === "LOW"),
  };
}

function formatCountdown(ms: number) {
  const total = Math.floor(ms / 1000);

  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
if (!mounted) return "00:00";
  // kalau ada jam → tampil HH:MM:SS
  if (h > 0) {
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  // kalau tidak ada jam → MM:SS
  return `${m.toString().padStart(2, "0")}:${s
    .toString()
    .padStart(2, "0")}`;
}

function resetAll(
  setCandles: any,
  setTicker: any,
  setRsi: any,
  setTrend: any,
  setFc: any,
  setBos: any,
  setChoch: any,
  setSupport: any,
  setResistance: any,
  setCountdown: any
) {
  setCandles([]);
  setTicker({});
  setRsi(50);
  setTrend("SIDEWAYS");
  setFc({});
  setBos("SIDEWAYS");
  setChoch("NONE");
  setSupport(0);
  setResistance(0);
  setCountdown(0);
}


  return (
  
   
  
  
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-blue-950 text-white p-6">

      {/* HEADER 
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-yellow-300 via-cyan-400 to-purple-500 bg-clip-text text-transparent">
          Crypto Dashboard
        </h1>

        <p className="text-zinc-400 mt-2">
          Real-time Market Analysis & Forecast
        </p>
      </div>*/}

      {/* CONTROL */}
      {sweepAlert && (
  <div className={`
    fixed top-5 right-5 z-50 px-4 py-3 rounded-xl
    backdrop-blur-md border
    ${sweepAlert.type === "BUY_SIDE_SWEEP"
      ? "bg-red-500/20 border-red-400 text-red-300"
      : "bg-green-500/20 border-green-400 text-green-300"}
  `}>
    🔥 SWEEP DETECTED  
    <div className="text-xs mt-1">
      {sweepAlert.type} @ {fmt(sweepAlert.price)}
    </div>
  </div>
)}

      {/* TOP CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-6">

	  <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
          {/*<div className="text-xs text-zinc-400 uppercase">
           📈 Live Price
          </div>*/}

<div className="flex gap-3 mb-6">

        <select
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="transition bg-black/40 border border-white/10 rounded-xl p-0 text-center"
        >
          {PAIRS.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>

        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="bg-black/40 border border-white/10 rounded-xl p-1 text-center"
        >
          {TF.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>

       {/* <button
          onClick={load}
          className="px-5 rounded-xl bg-green-500 text-black font-bold"
        >
          LOAD
        </button>*/}
      </div>
          <div className="text-4xl text-yellow-300 font-bold mt-8 text-center ">
            ${fmt(ticker.price)}
          </div>
		  

<div className="mt-3 text-center">
  <div className="text-xs text-zinc-400">
    ⏳ Candle closes in
  </div>

  <div className="text-xl font-bold text-cyan-400">
    {formatCountdown(countdown)}
  </div>
  
  {isReloading && (
  <div className="text-xs text-yellow-400 text-center mt-2">
    🔄 Refreshing new candle...
  </div>
)}
 
  
</div>
		  
        </div>
	<>
  {signal ? (
    <div className="rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-6">
      <div className="flex items-center justify-between">
        <div
          className={`text-xl font-bold flex items-center gap-2 ${
            signal.direction === "LONG" ? "text-green-400" : "text-red-400"
          }`}
        >
          {signal.direction}
        </div>

        <AlertTriangle
          className={`w-5 h-5 ${
            signal.direction === "LONG" ? "text-green-400" : "text-red-400"
          }`}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
  <div className="text-zinc-400">Entry</div>
  <div className="text-white text-right">{fmt(signal.entry)}</div>

  <div className="text-zinc-400">SL</div>
  <div className="text-red-400 text-right">{fmt(signal.sl)}</div>

  <div className="text-zinc-400">TP1</div>
  <div className="text-green-400 text-right">{fmt(signal.tp1)}</div>

  <div className="text-zinc-400">TP2</div>
  <div className="text-green-400 text-right">{fmt(signal.tp2)}</div>

  <div className="text-zinc-400">TP3</div>
  <div className="text-green-400 text-right">{fmt(signal.tp3)}</div>
  
  <div className="text-zinc-400">Confidence</div>
<div className="text-white text-right">{signal?.confidence}</div>

<div className="text-zinc-400">Bias</div>
<div className="text-white text-right">{signal?.bias}</div>
  
</div>
    </div>
  ) : (
    <div className="rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-6 text-center flex items-center justify-center gap-2 text-zinc-400 animate-pulse">
      <AlertTriangle className="w-5 h-5 text-yellow-400" />
      No valid signal (waiting BOS / structure...)
    </div>
  )}
</>
		

        {/* OHLC */}
  <div className="rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-6">

    <div className="text-zinc-400 text-sm mb-5">
      📈 OHLC
    </div>

    <div className="grid grid-cols-2 gap-6 text-center">

      <div>
        <div className="text-zinc-500 text-sm">OPEN</div>
        <div className="text-xl font-bold">
          {fmt(ticker.open)}
        </div>
      </div>

      <div>
        <div className="text-zinc-500 text-sm">HIGH</div>
        <div className="text-xl font-bold text-green-400">
          {fmt(ticker.high)}
        </div>
      </div>

      <div>
        <div className="text-zinc-500 text-sm">LOW</div>
        <div className="text-xl font-bold text-red-400">
          {fmt(ticker.low)}
        </div>
      </div>

      <div>
        <div className="text-zinc-500 text-sm">CLOSE</div>
        <div className="text-xl font-bold text-yellow-300">
          {fmt(ticker.price)}
        </div>
      </div>

    </div>

       
        
        </div>
		<div className="rounded-3xl bg-white/5 border border-white/10 p-6">

  <div className="text-zinc-400 mb-5">
   📈 Support & Resistance
  </div>

  <div className="space-y-6 text-center">

    <div>
      <div className="text-sm text-zinc-500">
        Resistance
      </div>

      <div className="text-2xl font-bold text-red-400">
        {fmt(resistance)}
      </div>
    </div>

    <div>
      <div className="text-sm text-zinc-500">
        Support
      </div>

      <div className="text-2xl font-bold text-green-400">
        {fmt(support)}
      </div>
    </div>




  </div>

</div>




<div className="rounded-3xl bg-white/5 border border-white/10 p-6">
  
  <div className="space-y-4 text-center">
     BOS
  </div>

  <div
    className={`text-3xl font-bold text-center ${
      bos === "BULLISH"
        ? "text-green-400"
        : bos === "BEARISH"
        ? "text-red-400"
        : "text-zinc-400"
    }`}
  >
    {bos}
  </div>
<div className="space-y-4 text-center p-6">
       
 </div>

 <div className="space-y-4 text-center">
    CHOCH
 </div>

 <div
    className={`text-3xl font-bold text-center ${
      choch === "BULLISH"
        ? "text-green-400"
        : choch === "BEARISH"
        ? "text-red-400"
        : "text-zinc-400"
    }`}
  >
    {choch}
  </div>
</div>
{/* MARKET INFO */}
  <div className="rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-6">

    <div className="text-zinc-400 text-sm mb-5">
      📊 Market Info
    </div>

    <div className="space-y-4 text-center">

      <div>
        <div className="text-zinc-500 text-sm">
          RSI
        </div>

        <div className="text-2xl font-bold text-cyan-400">
          {fmt(rsi)}
        </div>
      </div>

      <div>
        <div className="text-zinc-500 text-sm">
          Trend
        </div>

        <div className="text-2xl font-bold">
          {trend}
        </div>
      </div>


    </div>
	
	
      </div>
	  
	  <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
          <div className="text-xs text-zinc-400 uppercase">
          📊  Forecast
          </div>

          <div className="grid grid-cols-2 gap-y-4 gap-x-6 mt-5 text-center">

  <div>
    <div className="text-zinc-500 text-sm">15m</div>
    <div className="font-bold">
      {fc?.["15m"] ?? "-"}
    </div>
  </div>

  <div>
    <div className="text-zinc-500 text-sm">1h</div>
    <div className="font-bold">
      {fc?.["1h"] ?? "-"}
    </div>
  </div>

  <div>
    <div className="text-zinc-500 text-sm">4h</div>
    <div className="font-bold">
      {fc?.["4h"] ?? "-"}
    </div>
  </div>

  <div>
    <div className="text-zinc-500 text-sm">1D</div>
    <div className="font-bold">
      {fc?.["1d"] ?? "-"}
    </div>
  </div>

  <div className="col-span-2">
    <div className="text-zinc-500 text-sm">1M</div>
    <div className="font-bold">
      {fc?.["1M"] ?? "-"}
    </div>
	
  </div>

</div>


	  {/* MARKET INFO + OHLC */}
<div className="grid md:grid-cols-2 gap-4 mb-6">

  

  </div>

  

  </div>

</div>

      {/* INDICATORS 
      <div className="mb-3 text-zinc-400 text-sm">
        ☑ EMA20 &nbsp;&nbsp;
        ☑ EMA50 &nbsp;&nbsp;
        ☑ EMA200 &nbsp;&nbsp;
        ☑ Bollinger
      </div>*/}

      {/* CHART */}
      <Chart candles={candles} />

      

    </div>
  );
  
}
