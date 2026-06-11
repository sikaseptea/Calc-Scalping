"use client";

import { FibLine } from "./types";

export default function FibonacciTool({ fibs }: { fibs: FibLine[] }) {
  const levels = [
    { lv: 0, color: "#94a3b8" },
    { lv: 0.236, color: "#f87171" },
    { lv: 0.382, color: "#fbbf24" },
    { lv: 0.5, color: "#4ade80" },
    { lv: 0.618, color: "#2dd4bf" },
    { lv: 0.786, color: "#60a5fa" },
    { lv: 1, color: "#94a3b8" },
  ];

  return (
    <>
      {fibs.map((f, i) => (
        <g key={i}>
          {levels.map((item) => {
            // Pixel Y coordinate calculation
            const y = f.y1 + (f.y2 - f.y1) * item.lv;
            // Actual price value for the label
            const priceLabel = (f.startPrice + (f.endPrice - f.startPrice) * item.lv).toFixed(2);

            return (
              <g key={item.lv}>
                <line
                  x1={Math.min(f.x1, f.x2) - 100}
                  x2={Math.max(f.x1, f.x2) + 100}
                  y1={y}
                  y2={y}
                  stroke={item.color}
                  strokeWidth="1"
                  strokeDasharray={item.lv === 0 || item.lv === 1 ? "" : "4 2"}
                />
                <text
                  x={Math.max(f.x1, f.x2) + 105}
                  y={y + 4}
                  fill={item.color}
                  fontSize="10"
                  className="select-none font-bold"
                >
                  {item.lv} ({priceLabel})
                </text>
              </g>
            );
          })}
        </g>
      ))}
    </>
  );
}