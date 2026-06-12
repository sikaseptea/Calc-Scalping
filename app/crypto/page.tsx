"use client";

import { useEffect, useState, useRef } from "react";
import Chart, { Candle as ChartCandle } from "./components/chart/Chart";
import {TrendingUp, TrendingDown, Shuffle, GitBranch,Activity,Minus,Clock3,
  AlertTriangle,
  Plus,
  Trash2,
  Calculator
} from "lucide-react";
import AlarmBar from "@/components/AlarmBar";

import { useAlarmSystem } from "@/hooks/useAlarmSystem";
import AlarmPopup from "../../components/AlarmPopup";

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
type Swing = {
  type: "HIGH" | "LOW";
  price: number;
  index: number;
};
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
const [pattern, setPattern] = useState<any>({
  name: "NONE",
  strength: 0,
  status: "WAITING",
  target: 0,
  neckline: 0,
});

const [isReloading, setIsReloading] = useState(false);
const [activeAlert, setActiveAlert] = useState<any>(null);
const audioRef = useRef<HTMLAudioElement | null>(null);

const {
  alarms,
  addAlarm,
  removeAlarm,
  clearAllAlarms,
} = useAlarmSystem(
  ticker.price,
  symbol,
  { bos, choch, support, resistance },
  (alarm) => {
    setActiveAlert(alarm);
    startSound();
  }
);

const lastCandleOpenRef = useRef<number | null>(null);
const fetchLockRef = useRef(false);
const lastSignalRef = useRef<any>(null);

const [mounted, setMounted] = useState(false);

// 🔥 SWEEP ALERT (INI YANG BARU DAN BENAR)
const [sweepAlert, setSweepAlert] = useState<any>(null);
const lastSweepRef = useRef<number>(0);
const [mode, setMode] = useState<"SCALP" | "INTRADAY" | "SWING">("SCALP");

const [prevPrice, setPrevPrice] = useState<number | null>(null);
const [priceDirection, setPriceDirection] = useState<"UP" | "DOWN" | "FLAT">("FLAT");
const [webPopup, setWebPopup] = useState<null | string>(null);
 
 
function startSound() {
  if (!audioRef.current) {
    audioRef.current = new Audio("/alarm.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.8;
  }

  audioRef.current.play().catch(() => {});
}

function stopSound() {
  if (audioRef.current) {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  }
}

useEffect(() => {
  if (!activeAlert) {
    stopSound();
  }
}, [activeAlert]);
  
  
  

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

function getModeConfig(mode: string) {
  switch (mode) {
    case "SCALP":
      return {
        htf: "15m",
        ltf: "5m",
        sensitivity: 1,   // longgar
        minScore: 2
      };

    case "INTRADAY":
      return {
        htf: "1h",
        ltf: "15m",
        sensitivity: 2,
        minScore: 3
      };

    case "SWING":
      return {
        htf: "4h",
        ltf: "1h",
        sensitivity: 3,   // ketat
        minScore: 4
      };
  }
}

function getConfidenceLevel(v: number) {
  if (v >= 6) return "STRONG";
  if (v >= 4) return "GOOD";
  if (v >= 2) return "WEAK";
  return "NONE";
}

function confidenceIcon(v: number) {
  if (v >= 6) return "📈📈📈";
  if (v >= 4) return "📈📈";
  if (v >= 2) return "📈";
  return "⚪";
}

function signalColor(direction: string | null) {
  if (direction === "LONG") return "text-green-400";
  if (direction === "SHORT") return "text-red-400";
  return "text-zinc-400";
}

function signalBg(direction: string | null) {
  if (direction === "LONG") return "bg-green-500/10 border-green-500/30";
  if (direction === "SHORT") return "bg-red-500/10 border-red-500/30";
  return "bg-white/5 border-white/10";
}


function generateSignalV2(
  price: number,
  support: number,
  resistance: number,
  bos: BOS,
  choch: CHOCH,
  rsi: number,
  trend: string,
  sweep: any,
  mode: "SCALP" | "INTRADAY" | "SWING"
){
  let score = 0;
  
  const config = getModeConfig(mode);
  
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
  

const minScore = 1; // DEBUG MODE

  let direction: "LONG" | "SHORT" | "NONE" = "NONE";

  if (score > 0) direction = "LONG";
  if (score < 0) direction = "SHORT";
  
 

if (mode === "SCALP") score += 1;
if (mode === "SWING") score -= 1;
console.log({
  mode,
  bos,
  choch,
  rsi,
  sweep: sweep?.type
});
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

  score, // ✅ INI SUDAH BENAR

  entry: price,

  sl: direction === "LONG" ? support : resistance,

  tp1: direction === "LONG"
    ? price + risk
    : price - risk,

  tp2: direction === "LONG"
    ? price + risk * 1.5
    : price - risk * 1.5,

  tp3: direction === "LONG"
    ? price + risk * 2
    : price - risk * 2,
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
	// 🔥 IGNORE RESPONSE KALAU SYMBOL SUDAH BERUBAH
if (currentSymbol !== symbol || currentTf !== timeframe) {
  fetchLockRef.current = false;
  return;
}

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

const detectedPattern = detectPattern(c);
setPattern(detectedPattern);

    setCandles(c);
    setTicker({
      open: last.open,
      high: last.high,
      low: last.low,
      price: last.close,
    });

    setSupport(support);
    setResistance(resistance);
    setBos(structure.bos as "BULLISH" | "BEARISH" | "SIDEWAYS");
setChoch(structure.choch as "BULLISH" | "BEARISH" | "NONE");

  const plan = generateSignalV2(
  last.close,
  support,
  resistance,
  structure.bos,
  structure.choch,
  r,
  newTrend,
  sweep,
  mode
);
console.log("MODE:", mode);
console.log("SCORE:", plan?.score);
console.log("SIGNAL:", plan?.direction);

if (plan) {
  lastSignalRef.current = plan;
  setSignal(plan);
  setBias(plan.bias);
  setConfidence(plan.confidence);
} else {
  setSignal(null);
  setBias("SIDEWAYS");
  setConfidence(0);
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
    return {
      bos: "SIDEWAYS",
      choch: "NONE",
    };
  }

  const lastHigh =
    [...swings].reverse().find(
      s => s.type === "HIGH"
    );

  const lastLow =
    [...swings].reverse().find(
      s => s.type === "LOW"
    );

  const price = data[data.length - 1].close;

  let bos: BOS = "SIDEWAYS";
  let choch: CHOCH = "NONE";

  // BOS
  if (
    lastHigh &&
    price > lastHigh.price
  ) {
    bos = "BULLISH";
  } else if (
    lastLow &&
    price < lastLow.price
  ) {
    bos = "BEARISH";
  }

  // CHOCH
  if (
    bos === "BULLISH" &&
    lastLow &&
    price < lastLow.price
  ) {
    choch = "BEARISH";
  }

  if (
    bos === "BEARISH" &&
    lastHigh &&
    price > lastHigh.price
  ) {
    choch = "BULLISH";
  }

  return {
    bos,
    choch,
  };
}

function detectPattern(data: Candle[]) {

  const swings = getSwings(data);

  const highs = swings.filter(s => s.type === "HIGH").slice(-3);
  const lows = swings.filter(s => s.type === "LOW").slice(-3);

  const price = data[data.length - 1].close;

  // =========================
  // HEAD & SHOULDERS
  // =========================
  if (highs.length === 3 && lows.length >= 2) {

    const left = highs[0].price;
    const head = highs[1].price;
    const right = highs[2].price;

    const shoulderDiff =
      Math.abs(left - right) /
      ((left + right) / 2);

    if (
      head > left &&
      head > right &&
      shoulderDiff < 0.02
    ) {

      const neckline =
        (lows[lows.length - 1].price +
          lows[lows.length - 2].price) / 2;

      return {
        name: "HEAD_AND_SHOULDERS",
        strength: 87,
        status: price < neckline
          ? "CONFIRMED"
          : "FORMING",
        neckline,
        target: neckline - (head - neckline),
      };
    }
  }

  // =========================
  // INVERSE H&S
  // =========================
  if (lows.length === 3 && highs.length >= 2) {

    const left = lows[0].price;
    const head = lows[1].price;
    const right = lows[2].price;

    const shoulderDiff =
      Math.abs(left - right) /
      ((left + right) / 2);

    if (
      head < left &&
      head < right &&
      shoulderDiff < 0.02
    ) {

      const neckline =
        (highs[highs.length - 1].price +
          highs[highs.length - 2].price) / 2;

      return {
        name: "INVERSE_HEAD_AND_SHOULDERS",
        strength: 87,
        status: price > neckline
          ? "CONFIRMED"
          : "FORMING",
        neckline,
        target: neckline + (neckline - head),
      };
    }
  }

  // =========================
  // DOUBLE TOP
  // =========================
  if (highs.length === 3) {

    const a = highs[1].price;
    const b = highs[2].price;

    if (
      Math.abs(a - b) / a < 0.01
    ) {
      return {
        name: "DOUBLE_TOP",
        strength: 78,
        status: "FORMING",
        neckline: lows[lows.length - 1]?.price ?? 0,
        target: lows[lows.length - 1]?.price ?? 0,
      };
    }
  }

  // =========================
  // DOUBLE BOTTOM
  // =========================
  if (lows.length === 3) {

    const a = lows[1].price;
    const b = lows[2].price;

    if (
      Math.abs(a - b) / a < 0.01
    ) {
      return {
        name: "DOUBLE_BOTTOM",
        strength: 78,
        status: "FORMING",
        neckline: highs[highs.length - 1]?.price ?? 0,
        target: highs[highs.length - 1]?.price ?? 0,
      };
    }
  }

  return {
    name: "NONE",
    strength: 0,
    status: "WAITING",
    neckline: 0,
    target: 0,
  };
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

      setTicker((p: any) => {
  const newPrice = +data.price;

  if (p.price) {
    if (newPrice > p.price) setPriceDirection("UP");
    else if (newPrice < p.price) setPriceDirection("DOWN");
    else setPriceDirection("FLAT");
  }

  setPrevPrice(p.price);

  return {
    ...p,
    price: newPrice,
  };
});
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
  if (typeof window !== "undefined") {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }
}, []);
 
 
 useEffect(() => {
  fetchLockRef.current = false;
  lastCandleOpenRef.current = null;

  // 🔥 RESET REF (INI YANG KAMU KURANG)
  lastSignalRef.current = null;
  lastSweepRef.current = 0;

  // 🔥 RESET ALL UI STATE
  setCandles([]);
  setTicker({});
  setSignal(null);
  setBias("SIDEWAYS");
  setConfidence(0);
  setSweepAlert(null);

  setPattern({
    name: "NONE",
    strength: 0,
    status: "WAITING",
    target: 0,
    neckline: 0,
  });

  setBos("SIDEWAYS");
  setChoch("NONE");
  setSupport(0);
  setResistance(0);
  setTrend("SIDEWAYS");
  setRsi(50);
  setFc({});

  // 🔥 LOAD DATA BARU
  load();

}, [symbol, timeframe]);

function priceColor(direction: string) {
  if (direction === "UP") return "text-green-400";
  if (direction === "DOWN") return "text-red-400";
  return "text-yellow-300";
}


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
  <>
  <AlarmPopup
  alert={activeAlert}
  price={ticker.price}
  stopSound={stopSound}
  onClose={() => setActiveAlert(null)}
/>



 <div className="rounded-1xl bg-white/5 border border-white/10 p-1">
<div className="rounded-1xl flex items-center gap-3 p-1">
<AlarmBar
  addAlarm={addAlarm}
  symbol={symbol}
  livePrice={ticker.price}
  support={support}
  resistance={resistance}
/>

<button
  onClick={clearAllAlarms}
  className="
    flex items-center justify-center
    w-9 h-9 rounded-lg
    bg-red-500 hover:bg-red-600
  "
  title="Clear All Alarms"
>
  <Trash2 size={16} />
</button>


    {/* ACTIVE ALARMS LIST */}
    <div className="flex gap-2 relative z-50">
  {alarms.map((a) => (
  <div
    key={a.id}
    className={`
      flex items-center gap-2
      px-3 py-1
      rounded-lg border

      ${
        a.triggeredAt
          ? "bg-red-500/20 border-red-400"
          : "bg-white/10 border-white/10"
      }
    `}
  >
      <span
  className={`text-xs ${
    a.triggeredAt
      ? "text-red-300"
      : "text-white"
  }`}
>
        {a.symbol} | {a.type} | {a.price}
      </span>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          removeAlarm(a.id);
        }}
        className="text-red-400 hover:text-red-300 cursor-pointer"
      >
        ✕
      </button>
	  
    </div>
  ))}
</div>
  
  {/* RIGHT SIDE */}
  <div className="flex items-center gap-2 ml-auto relative z-50 p-1">

    {/* ADD BUTTON */}
  
<div className="rounded-xl bg-white/5 border border-white/10 p-1  text-l font-bold ">
        🚨 Love By ado
      </div>


</div>
  </div>

</div>


	 

  
  
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-blue-950 text-white p-6">

      

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
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">

	  <div className="p-2 rounded-2xl bg-white/5 backdrop-blur-md border border-yellow-300">

  {/* Pair + TF */}
  <div className="mt-4 grid grid-cols-2 gap-3 mb-8">

    <select
      value={symbol}
      onChange={(e) => setSymbol(e.target.value)}
      className="
        bg-yellow-300/40 border border-white/10 rounded-xl
        p-3 text-center text-sm
        hover:border-cyan-500/40 transition-all
      "
    >
      {PAIRS.map((p) => (
        <option key={p}>{p}</option>
      ))}
    </select>

    <select
      value={timeframe}
      onChange={(e) => setTimeframe(e.target.value)}
      className="
        bg-black/40 border border-white/10 rounded-xl
        p-3 text-center text-sm
        hover:border-cyan-500/40 transition-all
      "
    >
      {TF.map((t) => (
        <option key={t}>{t}</option>
      ))}
    </select>

  </div>
{/* TOP BAR */}
<select
  value={mode}
  onChange={(e) => setMode(e.target.value as any)}
  className="
    w-full
    h-11
    px-4
    bg-green-500/10
    border border-yellow-300
    rounded-xl
    text-xl text-center
    appearance-none
    flex items-center justify-center
  "
>
  <option value="SCALP">Scalping</option>
  <option value="INTRADAY">Intraday</option>
  <option value="SWING">Swing</option>
</select>
<div className="w-full border-t border-yellow-400 my-8" />
  {/* Price */}
  <div className="p-5 flex flex-col items-center">

    <div className="text-xs uppercase tracking-widest text-zinc-500 mb-2">
     Live Price
    </div>

    <div
  className={`
    text-4xl font-black tracking-tight
    transition-all duration-200
    ${priceColor(priceDirection)}
    ${priceDirection === "UP" ? "animate-pulse" : ""}
  `}
>
  ${fmt(ticker.price)}
</div>

  </div>


  {/* Countdown */}
  <div className="mt-8">

    <div className=" rounded-xl p-2 text-center">

      <div className="text-xs uppercase tracking-wider text-zinc-500 mb-2">
        ⏳ Closes In
      </div>

      <div className="text-2xl font-bold text-cyan-400">
        {formatCountdown(countdown)}
      </div>

      {isReloading && (
        <div className="mt-3 text-xs text-yellow-400 animate-pulse">
          🔄 Refreshing new candle...
        </div>
      )}

    </div>



</div>
		  
        </div>
	<>
  {signal ? (
    <div
  className={`
    rounded-3xl backdrop-blur-md border p-6 transition-all
    ${signalBg(signal.direction)}
  `}
>
  {/* HEADER FIXED */}
<div className="flex flex-col gap-2 mb-4">

  {/* ROW 1: MODE + CONFIDENCE */}
  <div className="flex items-center justify-between">

    <div className="text-xs px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300">
      {mode}
    </div>

    <div className="p-1 text-CENTER">
            <div className="text-sm text-center font-bold">
        {confidenceIcon(signal.confidence)} {signal.confidence}
      </div>
      <div className="text-xs text-zinc-500">
        {getConfidenceLevel(signal.confidence)}
      </div>
    </div>

  </div>

  {/* ROW 2: SIGNAL CENTER */}
  <div className="flex items-center justify-center">
    <div className={`text-2xl font-black tracking-wide ${signalColor(signal.direction)}`}>
      {signal.direction}
    </div>
  </div>

</div>

  {/* NO TRADE ZONE WARNING */}
  {signal.confidence <= 1 && (
    <div className="text-center mb-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-sm">
      ⚠ NO TRADE ZONE
    </div>
  )}

  {/* BODY */}
  <div className="grid grid-cols-2 gap-3 text-sm">

    <div className="text-zinc-400">Entry</div>
    <div className="text-white text-right">{fmt(signal.entry)}</div>

    <div className="text-zinc-400">SL</div>
<div className="text-red-400 text-right animate-blink drop-shadow-[0_0_6px_rgba(239,68,68,0.8)]">
  {fmt(signal.sl)}
</div>

    <div className="text-zinc-400">TP1</div>
    <div className="text-green-400 text-right">{fmt(signal.tp1)}</div>

    <div className="text-zinc-400">TP2</div>
    <div className="text-green-400 text-right">{fmt(signal.tp2)}</div>

    <div className="text-zinc-400">TP3</div>
    <div className="text-green-400 text-right">{fmt(signal.tp3)}</div>

    <div className="text-zinc-400">Bias</div>
    <div className="text-right">{signal.bias}</div>

  </div>

  {/* FOOTER SENSITIVITY */}
  <div className="text-center mt-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-sm">
        {mode === "SCALP" && " HIGH (fast, noisy, fast entry)"}
    {mode === "INTRADAY" && " MEDIUM (balanced confirmation)"}
    {mode === "SWING" && " LOW (strict, high quality only)"}
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
  <div className="rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-6 space-y-6">

 

  {/* GRID WRAPPER (2 CARD SECTION) */}
  <div className="mt-2 grid grid-cols-1 gap-4">

    {/* ================= OHLC ================= */}
   
      <div className="text-zinc-400 mb-4 text-sm">📊 OHLC</div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-center">

        <div>
          <div className="text-zinc-500 text-xs">OPEN</div>
          <div className="text-lg font-bold">{fmt(ticker.open)}</div>
        </div>

        <div>
          <div className="text-zinc-500 text-xs">HIGH</div>
          <div className="text-lg font-bold text-green-400">
            {fmt(ticker.high)}
          </div>
        </div>

        <div>
          <div className="text-zinc-500 text-xs">LOW</div>
          <div className="text-lg font-bold text-red-400">
            {fmt(ticker.low)}
          </div>
        </div>

        <div>
          <div className="text-zinc-500 text-xs">CLOSE</div>
          <div className="text-lg font-bold text-yellow-300">
            {fmt(ticker.price)}
          </div>
        </div>

      
    </div>

    {/* ================= SR ================= */}
   
     <div className="w-full border-t border-yellow-400 my-4" />

      <div className=" grid grid-cols-1 gap- text-center">

        <div>
          <div className="p-1 text-zinc-500 text-xs">RESISTANCE</div>
          <div className="text-3xl font-bold text-red-400">
            {fmt(resistance)}
          </div>
        </div>

        <div>
          <div className="p-2 text-zinc-500 text-xs">SUPPORT</div>
          <div className="text-3xl font-bold text-green-400">
            {fmt(support)}
          </div>
        </div>

      </div>
    

  </div>
</div>



<div className="rounded-3xl bg-white/5 border border-white/10 p-6">
  

  {/* BOS */}
  <div className=" p-1 flex flex-col items-center">
    <div className="flex items-center gap-2 text-zinc-400 text-sm uppercase tracking-wider mb-3">
      {bos === "BULLISH" ? (
        <TrendingUp size={18} className="text-green-400" />
      ) : (
        <TrendingDown size={18} className="text-red-400" />
      )}
      <span>BOS</span>
    </div>

    <div
      className={`text-2xl font-bold ${
        bos === "BULLISH"
          ? "text-green-400"
          : bos === "BEARISH"
          ? "text-red-400"
          : "text-zinc-400"
      }`}
    >
      {bos}
    </div>
  </div>
<div className="w-full border-t border-yellow-400 my-4" />

  {/* CHOCH */}
  <div className="  p-1 flex flex-col items-center ">
    <div className="flex items-center gap-2 text-zinc-400 text-sm uppercase tracking-wider mb-3">
      <GitBranch size={18} className="text-yellow-400" />
      <span>CHOCH</span>
    </div>

    <div
      className={`text-2xl font-bold ${
        choch === "BULLISH"
          ? "text-green-400"
          : choch === "BEARISH"
          ? "text-red-400"
          : "text-zinc-400"
      }`}
    >
      {choch}
    </div>
<div className="w-full border-t border-yellow-400 my-4" />
{/* RSI */}
  <div className=" p-1 flex flex-col items-center">
    <div className="flex items-center gap-2 text-zinc-500 text-sm uppercase tracking-wider mb-2">
      <Activity size={16} className="text-cyan-400" />
      <span>RSI</span>
    </div>

    <div className="text-2xl font-bold text-cyan-400">
      {fmt(rsi)}
    </div>
  </div>
<div className="w-full border-t border-yellow-400 my-4" />
  {/* Trend */}
  <div className=" p-1 flex flex-col items-center">
    <div className="flex items-center gap-2 text-zinc-500 text-sm uppercase tracking-wider mb-2">

      {trend === "UPTREND" ? (
        <TrendingUp size={16} className="text-green-400" />
      ) : trend === "DOWNTREND" ? (
        <TrendingDown size={16} className="text-red-400" />
      ) : (
        <Minus size={16} className="text-yellow-400" />
      )}

      <span>TREND</span>
    </div>

    <div
      className={`text-2xl font-bold ${
        trend === "UPTREND"
          ? "text-green-400"
          : trend === "DOWNTREND"
          ? "text-red-400"
          : "text-yellow-400"
      }`}
    >
      {trend}
    </div>
  </div>



</div>
</div>

	  <div className="rounded-3xl bg-white/5 border border-white/10 p-6">

    <div className="text-zinc-400 mb-5">
    🧩 Pattern Engine
  </div>

  <div className="space-y-4">

    <div>
      

      <div className="text-2xl font-bold text-yellow-300">
        {pattern.name.replaceAll("_"," ")}
      </div>
    </div>
<div className="w-full border-t border-yellow-400 my-2" />
    <div>
      <div className="text-zinc-500 text-sm">
        Strength
      </div>

      <div className="text-cyan-400">
        {pattern.strength}%
      </div>
    </div>
<div className="w-full border-t border-yellow-400 my-2" />
    <div>
      <div className="text-zinc-500 text-sm">
        Status
      </div>
<div className={
        pattern.status === "CONFIRMED"
          ? "text-green-400"
          : "text-yellow-400"
      }>
        {pattern.status}
      </div>
      <div className="w-full border-t border-yellow-400 my-2" />
    </div>

    <div>
      <div className="text-zinc-500 text-sm">
        Neckline
      </div>

      <div>
        {fmt(pattern.neckline)}
      </div>
    </div>
<div className="w-full border-t border-yellow-400 my-2" />
    <div>
      <div className="text-zinc-500 text-sm">
       Target
      </div>

      <div>
        {fmt(pattern.target)}
      </div>
    </div>

  </div>



</div>
	  <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
          <div className="p-2 flex items-center gap-3  text-zinc-400 uppercase mb-5">
  <Clock3 size={14} />
  <span>Forecast</span>
</div>

<div className="grid grid-cols-2 gap-4">

  {/* 15m */}
  <div className=" p-1 text-center">
    <div className="text-xs text-zinc-500 uppercase mb-2">
      15m
    </div>

    <div className="text-l text-center font-bold text-white">
      {fc?.["15m"] ?? "-"}
    </div>
  </div>

  {/* 1h */}
  <div className=" p-1 text-center">
    <div className="text-xs text-zinc-500 uppercase mb-2">
      1H
    </div>

    <div className="text-l text-center font-bold text-white">
      {fc?.["1h"] ?? "-"}
    </div>
  </div>

  {/* 4h */}
  <div className=" p-1 text-center">
    <div className="text-xs text-zinc-500 uppercase mb-2">
      4H
    </div>

    <div className="text-l text-center font-bold text-white">
      {fc?.["4h"] ?? "-"}
    </div>
  </div>

  {/* 1D */}
  <div className=" p-1 text-center">
    <div className="text-xs text-zinc-500 uppercase mb-2">
      1D
    </div>

    <div className="text-l text-center font-bold text-white">
      {fc?.["1d"] ?? "-"}
    </div>
  </div>

  {/* 1M */}
  <div className="col-span-2  rounded-xl p-1 text-center">
    <div className="text-xs text-zinc-500 uppercase mb-2">
      1M
    </div>

    <div className="text-xl font-bold text-cyan-400">
      {fc?.["1M"] ?? "-"}
    </div>
  </div>
{/* BUTTON POPUP */}


</div>
<div className="w-full border-t border-yellow-400 my-2" />
<div className="p-2 flex items-center gap-3  text-zinc-400 uppercase mt-6 justify-center">
  <button
  onClick={() => setWebPopup("https://calc-scalping-sikasep.vercel.app/calculator")}
  className="
    mt-3 px-3 py-1 text-2xl
    bg-green-500/20 border border-green-400
    text-green-300 rounded-lg hover:bg-green-500/30
    flex items-center gap-2
  "
>
  <Calculator size={18} />
  Calculator
</button>
</div>
	  {/* MARKET INFO + OHLC */}


    

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
	
	{webPopup && (
  <div className="fixed inset-0 z-50 bg-black/10 flex items-center justify-end">
    
    <div className=" right-2 w-[65%] h-[90%] bg-black border border-purple/10 rounded-2xl overflow-hidden relative">

      {/* CLOSE BUTTON */}
      <button
        onClick={() => setWebPopup(null)}
        className="absolute top-2 right-2 z-50 bg-red-500/20 text-red-300 px-3 py-1 rounded-lg"
      >
        Close
      </button>

      {/* IFRAME */}
      <iframe
        src={webPopup}
        className="w-full h-full"
      />
    </div>

  </div>
)}
	
	</>
  );
  
}
