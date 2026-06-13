
"use client";
import { useState, useEffect } from "react";
import { Wallet, Target, Calendar, Info } from "lucide-react";

interface Transaction {
  type: string;
  amount: number;
  note?: string;
}

export default function MonthlyPnLPanel({ transactions, targetPercentage }: { transactions: Transaction[], targetPercentage: number }) {
  const [usdRate, setUsdRate] = useState(16385);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
        const data = await res.json(); // <--- FIX: Deklarasikan variabel data di sini

        if (data?.rates?.IDR) {
          setUsdRate(data.rates.IDR);
        }
      } catch (err) {
        console.error("Failed to fetch rate:", err);
      }
    };
    fetchRate();
  }, []);

  // Logika perhitungan
  const sum = (type: string) => transactions
    .filter(t => t.type.toLowerCase() === type.toLowerCase())
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const modal = sum('modal');
  const profit = sum('profit');
  const biaya = sum('biaya');
  const targetAmt = modal * (targetPercentage / 100);

  const formatIDR = (val: number) => new Intl.NumberFormat("id-ID").format(Math.round(val));
  const toUSD = (val: number) => (val / usdRate).toLocaleString("en-US", { style: "currency", currency: "USD" });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard label="Total Modal" value={modal} usd={toUSD(modal)} color="blue" icon={<Wallet />} />
      <StatCard label="Target Profit" value={targetAmt} usd={toUSD(targetAmt)} color="emerald" icon={<Target />} />
      <StatCard label="Daily Target" value={targetAmt / 30} usd={toUSD(targetAmt / 30)} color="yellow" icon={<Calendar />} />
      <StatCard label="Net Balance" value={modal + profit - biaya} usd={toUSD(modal + profit - biaya)} color="purple" icon={<Info />} />
    </div>
  );
}

// Sub-component StatCard
function StatCard({ label, value, usd, color, icon }: any) {
  const colors: any = { 
    blue: "from-blue-500/20 border-blue-500/10", 
    purple: "from-purple-500/20 border-purple-500/10", 
    yellow: "from-yellow-500/20 border-yellow-500/10", 
    emerald: "from-emerald-500/20 border-emerald-500/10" 
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} bg-zinc-900/40 border p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group`}>
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">{icon}</div>
      <p className="text-zinc-500 text-[10px] font-black uppercase mb-2 tracking-widest">{label}</p>
      <h2 className="text-2xl font-bold tracking-tighter italic text-white">
        Rp {new Intl.NumberFormat("id-ID").format(Math.round(value || 0))}
      </h2>
      <p className="text-zinc-500 text-xs mt-3 font-bold italic opacity-60 border-t border-white/5 pt-2">USD {usd}</p>
    </div>
  );
}