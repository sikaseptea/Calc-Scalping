"use client";

import { useEffect, useState } from "react";
import Chart from "./components/Chart";

const PAIRS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT"];
const TF = ["15m", "1h", "4h", "1d", "1M"];


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
  if (!n) return "-";
  return Number(n).toFixed(d);
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

function forecast(rsi: number) {
  const base =
    rsi > 60
      ? "BULLISH"
      : rsi < 40
      ? "BEARISH"
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
function detectCHOCH(
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
}
const TF_MS: Record<string, number> = {
  "15m": 15 * 60 * 1000,
  "1h": 60 * 60 * 1000,
  "4h": 4 * 60 * 60 * 1000,
  "1d": 24 * 60 * 60 * 1000,
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
  
  const [tp1, setTp1] = useState(0);
  const [tp2, setTp2] = useState(0);
  const [tp3, setTp3] = useState(0);
  const [sl, setSl] = useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    setCountdown(getRemainingTime(timeframe));
  }, 1000);

  return () => clearInterval(interval);
}, [timeframe]);

  async function load() {
    const res = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${timeframe}&limit=200`
    );

    const data = await res.json();

    const c: Candle[] = data.map((k: any) => ({
      time: k[0] / 1000,
      open: +k[1],
      high: +k[2],
      low: +k[3],
      close: +k[4],
    }));

    setCandles(c);

    const last = c.at(-1);

    if (!last) return;

    setTicker({
      open: last.open,
      high: last.high,
      low: last.low,
      price: last.close,
    });
	setResistance(
  Math.max(...c.slice(-50).map((x) => x.high))
);

setSupport(
  Math.min(...c.slice(-50).map((x) => x.low))
);
const bosResult = detectBOS(c);

setBos(bosResult);
setChoch(detectCHOCH(c, bosResult));
  }

  useEffect(() => {
    load();
  }, [symbol, timeframe]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`
        );

        const data = await res.json();

        setTicker((p: any) => ({
          ...p,
          price: +data.price,
        }));
      } catch {}
    }, 1000);

    return () => clearInterval(interval);
  }, [symbol]);

  useEffect(() => {
    if (!candles.length) return;

    const r = RSI(candles);

    setRsi(r);

    if (r > 60) setTrend("BULLISH");
    else if (r < 40) setTrend("BEARISH");
    else setTrend("SIDEWAYS");

    setFc(forecast(r));
  }, [candles]);

function formatCountdown(ms: number) {
  const total = Math.floor(ms / 1000);

  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

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
      

      {/* TOP CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">

	  <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
          {/*<div className="text-xs text-zinc-400 uppercase">
           📈 Live Price
          </div>*/}

<div className="flex gap-3 mb-6">

        <select
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="transition bg-black/40 border border-white/10 rounded-xl p-4 text-center"
        >
          {PAIRS.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>

        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="bg-black/40 border border-white/10 rounded-xl p-4 text-center"
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
          <div className="text-5xl text-yellow-300 font-bold mt-12 text-center ">
            ${fmt(ticker.price)}
          </div>
		  

<div className="mt-3 text-center">
  <div className="text-xs text-zinc-400">
    ⏳ Candle closes in
  </div>

  <div className="text-xl font-bold text-cyan-400">
    {formatCountdown(countdown)}
  </div>
</div>
		  
        </div>

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
      {fc["15m"]}
    </div>
  </div>

  <div>
    <div className="text-zinc-500 text-sm">1h</div>
    <div className="font-bold">
      {fc["1h"]}
    </div>
  </div>

  <div>
    <div className="text-zinc-500 text-sm">4h</div>
    <div className="font-bold">
      {fc["4h"]}
    </div>
  </div>

  <div>
    <div className="text-zinc-500 text-sm">1D</div>
    <div className="font-bold">
      {fc["1d"]}
    </div>
  </div>

  <div className="col-span-2">
    <div className="text-zinc-500 text-sm">1M</div>
    <div className="font-bold">
      {fc["1M"]}
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
