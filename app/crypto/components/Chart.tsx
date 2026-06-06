"use client";

import { useEffect, useRef } from "react";
import type { UTCTimestamp } from "lightweight-charts";

type Candle = {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
};

export default function Chart({
  candles,
}: {
  candles: Candle[];
}) {
  const ref = useRef<HTMLDivElement>(null);

  // ================= EMA =================
  function EMA(data: Candle[], period: number) {
    const k = 2 / (period + 1);

    let ema: any[] = [];

    let prev =
      data.slice(0, period).reduce((a, b) => a + b.close, 0) /
      period;

    for (let i = period - 1; i < data.length; i++) {
      if (i === period - 1) {
        ema.push({
          time: data[i].time,
          value: prev,
        });
      } else {
        prev = data[i].close * k + prev * (1 - k);

        ema.push({
          time: data[i].time,
          value: prev,
        });
      }
    }

    return ema;
  }

  // ================= BOLLINGER =================
  function Bollinger(
    data: Candle[],
    period = 20,
    mult = 2
  ) {
    let upper: any[] = [];
    let middle: any[] = [];
    let lower: any[] = [];

    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);

      const avg =
        slice.reduce((a, b) => a + b.close, 0) / period;

      const variance =
        slice.reduce(
          (a, b) => a + Math.pow(b.close - avg, 2),
          0
        ) / period;

      const std = Math.sqrt(variance);

      middle.push({
        time: data[i].time,
        value: avg,
      });

      upper.push({
        time: data[i].time,
        value: avg + mult * std,
      });

      lower.push({
        time: data[i].time,
        value: avg - mult * std,
      });
    }

    return {
      upper,
      middle,
      lower,
    };
  }

  useEffect(() => {
    if (!ref.current || !candles.length) return;

    ref.current.innerHTML = "";

   const chart = createChart(container, {
      width: ref.current.clientWidth,
      height: 600,

      layout: {
        background: {
          color: "transparent",
        },
        textColor: "#ffffff",
      },

      grid: {
        vertLines: {
          color: "#1f2937",
        },
        horzLines: {
          color: "#1f2937",
        },
      },
    });

    // ================= CANDLE =================
  const formattedCandles = candles.map((c) => ({
  time: Math.floor(c.time / 1000) as UTCTimestamp,
  open: Number(c.open),
  high: Number(c.high),
  low: Number(c.low),
  close: Number(c.close),
}));

   candleSeries.setData(formattedCandles);

    // ================= EMA =================
    const ema20 = EMA(candles, 20);
    const ema50 = EMA(candles, 50);
    const ema200 = EMA(candles, 200);

    const ema20Series = chart.addLineSeries({
      color: "#facc15",
      lineWidth: 2,
    });

    const ema50Series = chart.addLineSeries({
      color: "#38bdf8",
      lineWidth: 2,
    });

    const ema200Series = chart.addLineSeries({
      color: "#ef4444",
      lineWidth: 2,
    });

    ema20Series.setData(ema20);
    ema50Series.setData(ema50);
    ema200Series.setData(ema200);

    // ================= BOLLINGER =================
    const bb = Bollinger(candles);
	const sr = SwingLevels(candles);
	const bos = DetectBOS(candles);
	console.log("BOS =", bos);

    const upper = chart.addLineSeries({
      color: "#a855f7",
      lineWidth: 1,
    });

    const middle = chart.addLineSeries({
      color: "#94a3b8",
      lineWidth: 1,
    });

    const lower = chart.addLineSeries({
      color: "#a855f7",
      lineWidth: 1,
    });

    upper.setData(bb.upper);
    middle.setData(bb.middle);
    lower.setData(bb.lower);
	// ================= RESISTANCE =================
const resistanceSeries = chart.addLineSeries({
  color: "#ef4444",
  lineWidth: 2,
});

resistanceSeries.setData([
  {
    time: candles[0].time,
    value: sr.resistance,
  },
  {
    time: candles[candles.length - 1].time,
    value: sr.resistance,
  },
]);

// ================= SUPPORT =================
const supportSeries = chart.addLineSeries({
  color: "#22c55e",
  lineWidth: 2,
});

supportSeries.setData([
  {
    time: candles[0].time,
    value: sr.support,
  },
  {
    time: candles[candles.length - 1].time,
    value: sr.support,
  },
]);

    chart.timeScale().fitContent();

    const handleResize = () => {
      chart.applyOptions({
        width: ref.current?.clientWidth || 0,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );

      chart.remove();
    };
  }, [candles]);

  return (
    <div className="w-full rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-4">
	

      <div
        ref={ref}
        className="w-full h-[600px]"
      />
    </div>
  );
  
}
// ================= SUPPORT RESISTANCE =================
function SupportResistance(data: Candle[]) {
  const resistance = Math.max(
    ...data.slice(-50).map((c) => c.high)
  );

  const support = Math.min(
    ...data.slice(-50).map((c) => c.low)
  );

  return {
    resistance,
    support,
  };
}
function SwingLevels(data: Candle[]) {
  let resistance = data[0].high;
  let support = data[0].low;

  for (let i = 2; i < data.length - 2; i++) {

    // Swing High
    if (
      data[i].high > data[i - 1].high &&
      data[i].high > data[i - 2].high &&
      data[i].high > data[i + 1].high &&
      data[i].high > data[i + 2].high
    ) {
      resistance = data[i].high;
    }

    // Swing Low
    if (
      data[i].low < data[i - 1].low &&
      data[i].low < data[i - 2].low &&
      data[i].low < data[i + 1].low &&
      data[i].low < data[i + 2].low
    ) {
      support = data[i].low;
    }
  }

  return {
    resistance,
    support,
  };
}
function DetectBOS(data: Candle[]) {

  if (data.length < 10) {
    return "SIDEWAYS";
  }

  const last = data[data.length - 1];
  const prev = data[data.length - 2];

  // bullish break
  if (last.close > prev.high) {
    return "BULLISH";
  }

  // bearish break
  if (last.close < prev.low) {
    return "BEARISH";
  }

  return "SIDEWAYS";
}
