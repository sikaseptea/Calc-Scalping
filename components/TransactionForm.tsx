"use client";

import { useState, useEffect } from "react";
import { PlusCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getUsdRate } from "@/lib/currency";

interface Props {
  onSuccess?: () => void;
}

export default function TransactionForm({ onSuccess }: Props) {
  const [type, setType] = useState("profit");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // FIX: USD rate state
  const [usdRate, setUsdRate] = useState<number | null>(null);

  // FIX: fetch async data properly
  useEffect(() => {
    const fetchRate = async () => {
      try {
        const rate = await getUsdRate();
        setUsdRate(rate);
      } catch (err) {
        console.error("Failed to fetch USD rate:", err);
      }
    };

    fetchRate();
  }, []);

  const handleAdd = async () => {
    if (!amount) return;

    const { error } = await supabase.from("financial_transactions").insert([
      {
        type,
        amount: Number(amount.replace(/\./g, "")),
        note,
        transaction_date: date,
      },
    ]);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Data berhasil disimpan");

    setAmount("");
    setNote("");

    if (onSuccess) onSuccess();
  };

  return (
    <div className="bg-zinc-900 border border-green-500/20 rounded-2xl p-5">
      <h2 className="text-xl font-bold text-green-400 mb-5">
        Tambah Transaksi
      </h2>

      <div className="grid md:grid-cols-4 gap-4">
        {/* TYPE */}
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="bg-black border border-zinc-700 rounded-xl p-3"
        >
          <option value="modal">Modal</option>
          <option value="pendapatan">Pendapatan</option>
          <option value="profit">Profit</option>
          <option value="biaya">Biaya</option>
          <option value="penarikan">Penarikan</option>
        </select>

        {/* AMOUNT */}
        <input
          type="text"
          value={amount}
          placeholder="Nominal"
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "");
            setAmount(Number(raw).toLocaleString("id-ID"));
          }}
          className="bg-black border border-zinc-700 rounded-xl p-3"
        />

        {/* DATE */}
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-black border border-zinc-700 rounded-xl p-3"
        />

        {/* NOTE */}
        <input
          type="text"
          placeholder="Catatan"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="bg-black border border-zinc-700 rounded-xl p-3"
        />
      </div>

      {/* optional debug */}
      {usdRate && (
        <p className="text-xs text-zinc-400 mt-3">
          USD Rate: {usdRate}
        </p>
      )}

      <button
        onClick={handleAdd}
        className="mt-5 flex items-center gap-2 bg-green-500 hover:bg-green-600 px-5 py-3 rounded-xl"
      >
        <PlusCircle size={18} />
        Add Transaction
      </button>
    </div>
  );
}