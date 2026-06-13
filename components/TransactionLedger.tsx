"use client";

import { useEffect, useState } from "react";
import { Trash2, Pencil } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getUsdRate } from "@/lib/currency";

export default function TransactionLedger() {
  const [rows, setRows] = useState<any[]>([]);
  const [usdRate, setUsdRate] = useState<number | null>(null);

  useEffect(() => {
    loadData();
    fetchRate();
  }, []);

  const loadData = async () => {
    const { data } = await supabase
      .from("financial_transactions")
      .select("*")
      .order("transaction_date", {
        ascending: false,
      });

    setRows(data || []);
  };

  const fetchRate = async () => {
    try {
      const rate = await getUsdRate();
      setUsdRate(rate);
    } catch (err) {
      console.error("Failed to fetch USD rate:", err);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase
      .from("financial_transactions")
      .delete()
      .eq("id", id);

    loadData();
  };

  return (
    <div className="bg-zinc-900 rounded-2xl p-5 border border-green-500/20">
      <h2 className="text-xl font-bold text-green-400 mb-5">
        Ledger Transaksi
      </h2>

      {/* optional debug USD rate */}
      {usdRate && (
        <p className="text-xs text-zinc-400 mb-3">
          USD Rate: {usdRate}
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="text-zinc-400 border-b border-zinc-700">
            <tr>
              <th className="text-left py-3">Tanggal</th>
              <th className="text-left py-3">Type</th>
              <th className="text-left py-3">Nominal</th>
              <th className="text-left py-3">Catatan</th>
              <th className="text-left py-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-zinc-800">
                <td className="py-3">
                  {new Date(row.transaction_date).toLocaleDateString("id-ID")}
                </td>

                <td>{row.type}</td>

                <td>
                  Rp{" "}
                  {Number(row.amount).toLocaleString("id-ID")}
                </td>

                <td>{row.note}</td>

                <td>
                  <button className="mr-3 text-blue-400">
                    <Pencil size={18} />
                  </button>

                  <button
                    onClick={() => handleDelete(row.id)}
                    className="text-red-400"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}