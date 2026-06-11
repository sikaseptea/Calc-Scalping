"use client";

import React, { useEffect, useRef, useState } from "react";
import { createChart, ColorType, Time, IChartApi, ISeriesApi } from "lightweight-charts";
import DrawingToolbar from "./DrawingToolbar";

// --- Definisi Tipe ---

export type Candle = {
  time: Time | number | string;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type Drawing = {
  type: string;
  point?: { time: Time; price: number };
  start?: { time: Time; price: number };
  end?: { time: Time; price: number };
  text?: string;
};

export type ChartProps = {
  candles: Candle[];
};

type Tool = "NONE" | "TRENDLINE" | "LINE" | "ARROW" | "RECTANGLE" | "FIB" | "TEXT";

export default function Chart({ candles }: ChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  const [tool, setTool] = useState<Tool>("NONE");
  const [startPoint, setStartPoint] = useState<{ time: Time; price: number } | null>(null);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [updateCounter, setUpdateCounter] = useState(0);

  const handleUndo = () => setDrawings((prev) => prev.slice(0, -1));
  const handleClear = () => confirm("Hapus semua gambar?") && setDrawings([]);

  // --- Fungsi Kalkulasi Indikator ---

  function calculateEMA(data: Candle[], period: number) {
    if (!data || data.length < period) return [];
    const k = 2 / (period + 1);
    let emaArray: { time: Time; value: number }[] = [];
    let prevEma = data[0].close;
    data.forEach((d, i) => {
      const val = i === 0 ? d.close : (d.close - prevEma) * k + prevEma;
      emaArray.push({ time: d.time as Time, value: val });
      prevEma = val;
    });
    return emaArray;
  }

  function calculateBollingerBands(data: Candle[], period: number, stdDev: number) {
    if (!data || data.length < period) return { upper: [], lower: [] };
    let upper: { time: Time; value: number }[] = [];
    let lower: { time: Time; value: number }[] = [];
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const mean = slice.reduce((acc, val) => acc + val.close, 0) / period;
      const variance = slice.reduce((acc, val) => acc + Math.pow(val.close - mean, 2), 0) / period;
      const sd = Math.sqrt(variance);
      upper.push({ time: data[i].time as Time, value: mean + stdDev * sd });
      lower.push({ time: data[i].time as Time, value: mean - stdDev * sd });
    }
    return { upper, lower };
  }

  useEffect(() => {
    if (!chartContainerRef.current || !candles || candles.length === 0) return;

    // 1. Inisialisasi Chart
    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: "rgba(0, 0, 0, 0.5)" }, textColor: "#d1d5db" },
      grid: { vertLines: { color: "rgba(42, 46, 57, 0.05)" }, horzLines: { color: "rgba(42, 46, 57, 0.05)" } },
      width: chartContainerRef.current.clientWidth,
      height: 600,
      crosshair: { mode: 0 },
      timeScale: { rightOffset: 12, barSpacing: 10 }
    });

    // 2. Tambah Candlestick Series
    const candleSeries = chart.addCandlestickSeries({
      upColor: "#26a69a", downColor: "#ef5350", borderVisible: false,
      wickUpColor: "#26a69a", wickDownColor: "#ef5350",
    });
    candleSeries.setData(candles as any);

    // 3. Tambah Indikator EMA (Biru)
    const emaSeries = chart.addLineSeries({ color: "#3b82f6", lineWidth: 2, title: "EMA 20" });
    emaSeries.setData(calculateEMA(candles, 20));

    // 4. Tambah Indikator Bollinger Bands
    const upperBand = chart.addLineSeries({ color: "rgba(38, 166, 154, 0.5)", lineWidth: 1, title: "Upper Band" });
    const lowerBand = chart.addLineSeries({ color: "rgba(239, 83, 80, 0.5)", lineWidth: 1, title: "Lower Band" });
    
    const bbData = calculateBollingerBands(candles, 20, 2);
    upperBand.setData(bbData.upper);
    lowerBand.setData(bbData.lower);

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;

    chart.timeScale().subscribeVisibleTimeRangeChange(() => setUpdateCounter(p => p + 1));
    const handleResize = () => chartContainerRef.current && chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    
    window.addEventListener("resize", handleResize);
    return () => { 
      window.removeEventListener("resize", handleResize); 
      chart.remove(); 
    };
  }, [candles]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (tool === "NONE" || !chartRef.current || !candleSeriesRef.current || !chartContainerRef.current) return;
    const rect = chartContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const time = chartRef.current.timeScale().coordinateToTime(x);
    const price = candleSeriesRef.current.coordinateToPrice(y);

    if (time !== null && price !== null) {
      if (tool === "TEXT") {
        const content = prompt("Masukkan teks:");
        if (content) setDrawings(p => [...p, { type: "TEXT", point: { time, price }, text: content }]);
        setTool("NONE");
      } else {
        if (!startPoint) {
          setStartPoint({ time, price });
        } else {
          setDrawings(p => [...p, { type: tool, start: startPoint, end: { time, price } }]);
          setStartPoint(null);
        }
      }
    }
  };

  const renderDrawings = () => {
    return drawings.map((draw, i) => {
      const t1 = draw.start?.time || draw.point?.time;
      const p1 = draw.start?.price || draw.point?.price;
      const x1 = t1 ? chartRef.current?.timeScale().timeToCoordinate(t1) : null;
      const y1 = p1 !== undefined ? candleSeriesRef.current?.priceToCoordinate(p1) : null;

      if (x1 === null || y1 === null) return null;
      if (draw.type === "TEXT") return <text key={i} x={x1} y={y1} fill="white" fontSize="14" className="select-none font-medium">{draw.text}</text>;

      const t2 = draw.end?.time;
      const p2 = draw.end?.price;
      const x2 = t2 ? chartRef.current?.timeScale().timeToCoordinate(t2 as Time) : null;
      const y2 = p2 !== undefined ? candleSeriesRef.current?.priceToCoordinate(p2) : null;

      if (x2 === null || y2 === null) return null;
      if (draw.type === "LINE" || draw.type === "TRENDLINE") return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3b82f6" strokeWidth="2" />;

      if (draw.type === "FIB" && draw.start && draw.end) {
        const fibLevels = [
          { lvl: 0, color: "#94a3b8" }, { lvl: 0.236, color: "#f87171" }, { lvl: 0.382, color: "#fbbf24" },
          { lvl: 0.5, color: "#4ade80" }, { lvl: 0.618, color: "#2dd4bf" }, { lvl: 0.786, color: "#60a5fa" }, { lvl: 1, color: "#94a3b8" }
        ];
        const priceDiff = draw.end.price - draw.start.price;
        const startX = Math.min(x1 as number, x2 as number) - 100;
        const endX = Math.max(x1 as number, x2 as number) + 100;

        return (
          <g key={i}>
            {fibLevels.map((level) => {
              const currentPrice = draw.start!.price + priceDiff * level.lvl;
              const yLvl = candleSeriesRef.current?.priceToCoordinate(currentPrice);
              if (yLvl === null || yLvl === undefined) return null;
              return (
                <g key={level.lvl}>
                  <line x1={startX} y1={yLvl} x2={endX} y2={yLvl} stroke={level.color} strokeWidth="1" strokeDasharray={level.lvl === 0 || level.lvl === 1 ? "" : "4 2"} />
                  <text x={endX + 5} y={yLvl + 4} fill={level.color} fontSize="10" className="select-none font-bold">{level.lvl} ({currentPrice.toFixed(2)})</text>
                </g>
              );
            })}
          </g>
        );
      }
      return null;
    });
  };

  return (
    <div className="relative w-full border border-white/10 rounded-xl overflow-hidden">
      <DrawingToolbar tool={tool} setTool={setTool} onUndo={handleUndo} onClear={handleClear} />
      <div ref={chartContainerRef} className="w-full h-[600px] cursor-crosshair" onMouseDown={handleMouseDown} />
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
        {renderDrawings()}
        {startPoint && (
          <circle cx={chartRef.current?.timeScale().timeToCoordinate(startPoint.time) ?? 0} cy={candleSeriesRef.current?.priceToCoordinate(startPoint.price) ?? 0} r="4" fill="#3b82f6" stroke="white" />
        )}
      </svg>
    </div>
  );
}