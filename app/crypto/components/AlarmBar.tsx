import { useState } from "react";

export default function AlarmBar({ addAlarm }: any) {
  const [price, setPrice] = useState("");
  const [mode, setMode] = useState<"ABOVE" | "BELOW">("ABOVE");

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex gap-2 p-2 bg-black/80 border-b border-white/10">
      
      <input
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="Price"
        className="bg-white/10 px-3 py-1 rounded"
      />

      <select
        value={mode}
        onChange={(e) => setMode(e.target.value as any)}
        className="bg-white/10 px-2"
      >
        <option value="ABOVE">Above</option>
        <option value="BELOW">Below</option>
      </select>

      <button
        onClick={() =>
          addAlarm({
            symbol: "BTCUSDT",
            type: mode === "ABOVE" ? "PRICE_ABOVE" : "PRICE_BELOW",
            price: Number(price),
          })
        }
        className="bg-green-500 px-3 rounded"
      >
        ADD
      </button>
    </div>
  );
}