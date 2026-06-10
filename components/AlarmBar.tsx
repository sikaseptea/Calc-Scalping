"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AlarmType } from "@/hooks/useAlarmSystem";

export default function AlarmBar({
  addAlarm,
  symbol,
  livePrice,
  support,
  resistance,
}: any) {
  const [type, setType] = useState<AlarmType>("PRICE_ABOVE");
  const [inputPrice, setInputPrice] = useState("");

  function handleAdd() {
    addAlarm({
      symbol, // <- mengikuti pair dropdown aktif
      type,
      price:
  type === "PRICE_ABOVE" || type === "PRICE_BELOW"
    ? inputPrice !== ""
      ? Number(inputPrice)
      : undefined
    : undefined,
    });

    setInputPrice("");
  }

  return (
    <div className="flex items-center gap-2">

      <select
        value={type}
        onChange={(e) => setType(e.target.value as AlarmType)}
        className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 w-[120px]"
      >
        <option value="PRICE_ABOVE">Price Above</option>
        <option value="PRICE_BELOW">Price Below</option>
        <option value="SUPPORT_TOUCH">Support Touch</option>
        <option value="RESISTANCE_TOUCH">Resistance Touch</option>
        <option value="BOS_CHANGE">BOS Change</option>
        <option value="CHOCH_CHANGE">CHOCH Change</option>
      </select>

      {(type === "PRICE_ABOVE" || type === "PRICE_BELOW") && (
        <input
          value={inputPrice}
          onChange={(e) => setInputPrice(e.target.value)}
          placeholder={livePrice ? String(livePrice) : "Price"}
          className="bg-white/10 border border-white/10 rounded-lg px-3 py-1 w-[120px]"
        />
      )}

      <button
  onClick={handleAdd}
  className="
    flex items-center justify-center
    w-9 h-9 rounded-lg
    bg-green-500 hover:bg-green-600
  "
  title="Add Alarm"
>
  <Plus size={16} />
</button>
    </div>
  );
}