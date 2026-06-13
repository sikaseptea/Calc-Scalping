"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Zap, Save, LogOut, CheckCircle2, AlertTriangle, TrendingUp, ShieldCheck, PieChart, Activity, LayoutGrid, UserCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// 1. Inisialisasi Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const TOP_15_PAIRS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'ADAUSDT', 'AVAXUSDT', 'DOGEUSDT', 'DOTUSDT', 'TRXUSDT', 'LINKUSDT', 'MATICUSDT', 'SHIBUSDT', 'LTCUSDT', 'BCHUSDT'];

export default function TradingTerminalProV8() {
  // --- SYSTEM STATES ---
  const [mode, setMode] = useState('AUTO'); 
  const [side, setSide] = useState('LONG');
  const [pair, setPair] = useState('BTCUSDT');
  const [member, setMember] = useState('REGULAR');
  const [livePrice, setLivePrice] = useState(0);
  const [priceColor, setPriceColor] = useState('text-white');
  const [toast, setToast] = useState(false);
  const prevPrice = useRef(0);

  // --- INPUT STATES ---
  const [entryPrice, setEntryPrice] = useState(0);
  const [modal, setModal] = useState(100);
  const [riskPct, setRiskPct] = useState(1);
  const [leverage, setLeverage] = useState(10);
  const [rrRatio, setRrRatio] = useState(3);
  const [slType, setSlType] = useState('REALISTIC');
  const [slippage, setSlippage] = useState(0.05);
  const [tpVol, setTpVol] = useState({ tp1: 50, tp2: 30, tp3: 20 });

  // --- RESULTS STATE ---
  const [results, setResults] = useState({
    sl: 0, slPct: 0, tp1: 0, tp2: 0, tp3: 0,
    size: 0, margin: 0, riskAmt: 0, gross: 0, fee: 0, slipAmt: 0, net: 0, roi: 0, 
    kelly: 0, totalPotentialLoss: 0
  });

  // WebSocket Live Price Binance
  useEffect(() => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${pair.toLowerCase()}@ticker`);
    ws.onmessage = (event) => {
      const ticker = JSON.parse(event.data);
      const current = parseFloat(ticker.c);
      if (current > prevPrice.current) setPriceColor('text-green-500');
      else if (current < prevPrice.current) setPriceColor('text-red-500');
      setLivePrice(current);
      prevPrice.current = current;
      if (mode === 'AUTO') setEntryPrice(current);
    };
    return () => ws.close();
  }, [pair, mode]);

  // Logic Kalkulasi Utama
  useEffect(() => {
    const entry = mode === 'AUTO' ? livePrice : entryPrice;
    if (!entry || entry === 0) return;

    const riskAmt = modal * (riskPct / 100);
    let slDist = slType === 'CONSERVATIVE' ? 0.02 : slType === 'ANTI-SWEEP' ? 0.006 : 0.01;
    
    const sl = side === 'LONG' ? entry * (1 - slDist) : entry * (1 + slDist);
    const size = riskAmt / slDist;
    const margin = size / leverage;

    const tp1 = side === 'LONG' ? entry * (1 + slDist) : entry * (1 - slDist);
    const tp2 = side === 'LONG' ? entry * (1 + (slDist * rrRatio)) : entry * (1 - (slDist * rrRatio));
    const tp3 = side === 'LONG' ? entry * (1 + (slDist * (rrRatio + 2))) : entry * (1 - (slDist * (rrRatio + 2)));
    
    // Profit Calculation based on Partial Exit Volume
    const p1 = (riskAmt * 1) * (tpVol.tp1 / 100);
    const p2 = (riskAmt * rrRatio) * (tpVol.tp2 / 100);
    const p3 = (riskAmt * (rrRatio + 2)) * (tpVol.tp3 / 100);
    const totalGross = p1 + p2 + p3;

    // Fees & Costs
    const feeRate = member === 'VIP' ? 0.0004 : 0.0005;
    const totalFee = (size * feeRate) * 2;
    const totalSlip = size * (slippage / 100);
    const totalNet = totalGross - totalFee - totalSlip;

    setResults({ 
      sl, slPct: slDist * 100, tp1, tp2, tp3,
      size, margin, riskAmt, gross: totalGross, fee: totalFee, slipAmt: totalSlip, net: totalNet, 
      roi: (totalNet / margin) * 100, kelly: ((0.5 * (rrRatio + 1) - 0.5) / rrRatio) * 100,
      totalPotentialLoss: riskAmt + totalFee + totalSlip
    });
  }, [livePrice, entryPrice, modal, riskPct, leverage, rrRatio, slType, side, mode, member, slippage, tpVol]);

useEffect(() => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    console.log("AUTH EVENT:", event);
    console.log("SESSION:", session);

    if (session?.user) {
      console.log("User logged in:", session.user.email);
    }

    if (event === "SIGNED_OUT") {
      window.location.href = "/login";
    }
  });

  return () => subscription.unsubscribe();
}, []);


async function handleLogout() {
  try {
    console.log("Logout clicked");

    const { error } = await supabase.auth.signOut({ scope: "global" });

    if (error) {
      console.error("Logout error:", error.message);
      alert("Logout gagal");
      return;
    }

    // paksa redirect ke login page
    window.location.href = "/login";
  } catch (err) {
    console.error("Unexpected logout error:", err);
  }
}

  async function saveTrade() {
    try {
      const {
  data: { session },
} = await supabase.auth.getSession();

const user = session?.user;

if (!user) {
  alert("Session tidak ditemukan. Login ulang.");
  return;
}
      const { error } = await supabase.from("trade_logs").insert({
        user_id: user.id, pair, direction: side, entry: mode === 'AUTO' ? livePrice : entryPrice, stoploss: results.sl,
        tp1: results.tp1, tp2: results.tp2, tp3: results.tp3, risk_percent: riskPct,
        leverage, risk_amount: results.riskAmt, position_size: results.size, pnl: results.net,
      });
      if (error) throw error;
      setToast(true);
      setTimeout(() => setToast(false), 3000);
    } catch (e) { alert("Save failed"); }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans p-2 md:p-6 overflow-x-hidden">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-[100] bg-green-600 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-2xl animate-in slide-in-from-top-5 border border-white/20">
          <CheckCircle2 size={24} /> <span className="font-black text-sm uppercase text-white">Cloud Synced!</span>
        </div>
      )}

      <main className="max-w-[1800px] mx-auto space-y-6">
        {/* HEADER AREA */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          <div className="xl:col-span-3 bg-zinc-900/40 border border-zinc-800 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
             <div className="text-center md:text-left">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Binance Real-time Feed</p>
                <h1 className={`text-5xl md:text-7xl font-black tabular-nums transition-all duration-300 ${priceColor}`}>
                  ${livePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h1>
             </div>
             <div className="flex flex-wrap justify-center gap-3">
                <select value={pair} onChange={(e) => setPair(e.target.value)} className="bg-zinc-800 border border-zinc-700 text-yellow-500 font-black rounded-2xl px-6 py-3 text-lg outline-none focus:ring-4 focus:ring-yellow-500/20">
                  {TOP_15_PAIRS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <div className="bg-blue-600/10 border border-blue-500/20 text-blue-400 px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2">
                  <Activity size={18}/> KELLY: {results.kelly.toFixed(1)}%
                </div>
             </div>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2rem] p-6 flex items-center justify-between shadow-xl">
            <div><p className="text-[10px] font-black text-zinc-500 uppercase tracking-tighter">Terminal V8 Pro</p><p className="text-xl font-black text-white italic">Sikasep Ado</p></div>
            <button
  onClick={handleLogout}
  className="bg-red-500/10 text-red-500 p-4 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-lg"
>
  <LogOut size={24} />
</button>
          </div>
        </div>

        {/* CHART SECTION */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] overflow-hidden h-[400px] md:h-[500px] shadow-2xl">
          <iframe 
            src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE%3A${pair}&interval=15&theme=dark&style=1&timezone=Etc%2FUTC&studies=PivotPointsStandard@tv-basicstudies`}
            width="100%" height="100%" frameBorder="0"
          ></iframe>
        </div>

        {/* CALCULATOR SIDE-BY-SIDE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
          
          {/* CONFIG PANEL */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-[2.5rem] p-6 md:p-10 space-y-6 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-2 text-zinc-400 font-black uppercase text-xs tracking-widest border-b border-zinc-800 pb-4"><LayoutGrid size={16}/> Configuration Panel</div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid grid-cols-2 gap-2 bg-black/40 p-1.5 rounded-2xl border border-zinc-800">
                    <button onClick={() => setMode('AUTO')} className={`py-3 rounded-xl text-[10px] font-black transition-all ${mode === 'AUTO' ? 'bg-blue-600 shadow-lg text-white' : 'text-zinc-500'}`}>AUTO</button>
                    <button onClick={() => setMode('MANUAL')} className={`py-3 rounded-xl text-[10px] font-black transition-all ${mode === 'MANUAL' ? 'bg-blue-600 shadow-lg text-white' : 'text-zinc-500'}`}>MANUAL</button>
                </div>
                <div className="relative">
                    <select value={member} onChange={(e) => setMember(e.target.value)} className="w-full bg-zinc-800 p-4 rounded-2xl border border-zinc-700 font-black text-xs outline-none text-white appearance-none cursor-pointer hover:border-yellow-500">
                        <option value="REGULAR">REGULAR (0.05% Fee)</option>
                        <option value="VIP">VIP MEMBER (0.04% Fee)</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500"><UserCircle size={20}/></div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setSide('LONG')} className={`p-6 rounded-[2rem] font-black text-xl tracking-[0.1em] transition-all ${side === 'LONG' ? 'bg-green-600 shadow-[0_0_40px_rgba(22,163,74,0.2)] ring-2 ring-green-400 text-white' : 'bg-zinc-800 opacity-20'}`}>LONG</button>
              <button onClick={() => setSide('SHORT')} className={`p-6 rounded-[2rem] font-black text-xl tracking-[0.1em] transition-all ${side === 'SHORT' ? 'bg-red-600 shadow-[0_0_40px_rgba(220,38,38,0.2)] ring-2 ring-red-400 text-white' : 'bg-zinc-800 opacity-20'}`}>SHORT</button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-1"><label className="text-[10px] text-zinc-500 font-black uppercase tracking-tighter">Capital ($)</label><input type="number" value={modal} onChange={(e) => setModal(Number(e.target.value))} className="w-full bg-zinc-800 p-4 rounded-2xl border border-zinc-700 font-bold outline-none" /></div>
              <div className="space-y-1"><label className="text-[10px] text-zinc-500 font-black uppercase tracking-tighter text-red-500">Risk %</label><input type="number" value={riskPct} onChange={(e) => setRiskPct(Number(e.target.value))} className="w-full bg-zinc-800 p-4 rounded-2xl border border-zinc-700 font-bold outline-none" /></div>
              <div className="space-y-1"><label className="text-[10px] text-zinc-500 font-black uppercase tracking-tighter text-green-500">Reward (RR)</label><input type="number" value={rrRatio} onChange={(e) => setRrRatio(Number(e.target.value))} className="w-full bg-zinc-800 p-4 rounded-2xl border border-zinc-700 font-bold outline-none" /></div>
              <div className="space-y-1"><label className="text-[10px] text-zinc-500 font-black uppercase tracking-tighter text-yellow-600">Slip %</label><input type="number" value={slippage} onChange={(e) => setSlippage(Number(e.target.value))} className="w-full bg-zinc-800 p-4 rounded-2xl border border-zinc-700 font-bold outline-none" /></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-zinc-800 pt-6">
              <div className="bg-black/40 p-5 rounded-[1.5rem] border border-zinc-800 space-y-3">
                <label className="text-[10px] text-zinc-400 font-black uppercase flex items-center gap-2 tracking-widest"><PieChart size={14}/> Partial Exit % (TP1-2-3)</label>
                <div className="grid grid-cols-3 gap-3">
                  <input type="number" value={tpVol.tp1} onChange={(e) => setTpVol({...tpVol, tp1: Number(e.target.value)})} className="bg-zinc-900 p-3 rounded-xl text-center text-xs font-black border border-zinc-700 outline-none" />
                  <input type="number" value={tpVol.tp2} onChange={(e) => setTpVol({...tpVol, tp2: Number(e.target.value)})} className="bg-zinc-900 p-3 rounded-xl text-center text-xs font-black border border-zinc-700 outline-none" />
                  <input type="number" value={tpVol.tp3} onChange={(e) => setTpVol({...tpVol, tp3: Number(e.target.value)})} className="bg-zinc-900 p-3 rounded-xl text-center text-xs font-black border border-zinc-700 outline-none" />
                </div>
              </div>
              <div className="space-y-1 flex flex-col justify-center">
                <label className="text-[10px] text-zinc-500 font-black uppercase ml-2 tracking-widest text-center">Stop Loss Strategy</label>
                <select value={slType} onChange={(e) => setSlType(e.target.value)} className="w-full bg-zinc-800 p-5 rounded-2xl text-yellow-500 font-black border border-zinc-700 outline-none hover:border-yellow-500 transition-all cursor-pointer">
                  <option value="REALISTIC">REALISTIC (1.0%)</option>
                  <option value="CONSERVATIVE">CONSERVATIVE (2.0%)</option>
                  <option value="ANTI-SWEEP">ANTI-SWEEP PRO (0.6%)</option>
                </select>
              </div>
            </div>

            <button onClick={saveTrade} className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 p-6 rounded-[2rem] font-black transition-all shadow-xl text-lg border-b-8 border-blue-900 active:border-b-0 active:translate-y-1 group">
              <Save size={26} className="group-hover:rotate-12 transition-transform" /> SAVE TRADE LOG
            </button>
          </div>

          {/* ANALYSIS OUTPUT PANEL */}
          <div className="bg-green-600/5 border border-green-500/20 rounded-[2.5rem] p-6 md:p-10 space-y-6 shadow-2xl h-full backdrop-blur-md overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 text-green-500 pointer-events-none"><ShieldCheck size={250} /></div>
            <h3 className="text-2xl font-black text-green-500 flex items-center gap-3 tracking-tighter uppercase"><Zap fill="currentColor" /> Live Strategy Output</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-zinc-900/90 p-6 rounded-3xl border-l-4 border-blue-500 border border-zinc-800 shadow-xl">
                <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-1">Position Size (USDT)</p>
                <p className="text-4xl font-black tabular-nums tracking-tighter text-white">${results.size.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-[10px] text-zinc-500 mt-2 font-bold uppercase tracking-tighter">Margin: ${results.margin.toFixed(2)}</p>
              </div>
              <div className="bg-zinc-900/90 p-6 rounded-3xl border-l-4 border-red-500 border border-zinc-800 shadow-xl">
                <p className="text-[10px] text-red-500 font-black uppercase tracking-widest mb-1 flex items-center gap-2"><AlertTriangle size={14}/> Max Potential Loss</p>
                <p className="text-4xl font-black text-red-500 tabular-nums tracking-tighter">-${results.totalPotentialLoss.toFixed(2)}</p>
                <p className="text-[10px] text-zinc-500 mt-2 font-bold uppercase tracking-tighter italic text-center">Fees & Slippage Included</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-sm">
                {[
                  { label: 'Stop Loss', val: results.sl, pct: results.slPct, color: 'text-red-400', sign: '-' },
                  { label: 'TP 1 (BEP)', val: results.tp1, pct: results.slPct, color: 'text-green-500', sign: '+', vol: tpVol.tp1 },
                  { label: 'TP 2 (Profit)', val: results.tp2, pct: results.slPct * rrRatio, color: 'text-green-400', sign: '+', vol: tpVol.tp2 },
                  { label: 'TP 3 (Max)', val: results.tp3, pct: results.slPct * (rrRatio + 2), color: 'text-green-300', sign: '+', vol: tpVol.tp3 }
                ].map((item, idx) => (
                  <div key={idx} className={`flex justify-between items-center p-5 rounded-2xl border border-zinc-800 bg-black/60 shadow-inner ${idx === 1 ? 'border-green-500/30 bg-green-500/5' : ''}`}>
                    <span className={`${item.color} text-[10px] font-black uppercase tracking-tighter`}>{item.label} {item.vol && <span className="text-[9px] opacity-40">({item.vol}%)</span>}</span>
                    <div className="text-right">
                      <p className="font-black text-xl text-white tracking-tighter">${item.val.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      <p className="text-[10px] font-bold opacity-40">{item.sign}{item.pct.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
            </div>

            <div className="p-8 bg-zinc-950 rounded-[2.5rem] border border-zinc-800 shadow-2xl flex-grow flex flex-col justify-center border-t-4 border-t-zinc-800">
               <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Gross Forecast Profit</span>
                  <span className="text-xl font-black text-green-500 tracking-tighter">+${results.gross.toFixed(2)}</span>
               </div>
               <div className="flex justify-between items-center pb-5 border-b border-zinc-800">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] text-red-500">Total Costs (Fee+Slip)</span>
                  <span className="text-xl font-black text-red-500 tracking-tighter">-${(results.fee + results.slipAmt).toFixed(2)}</span>
               </div>
               <div className="pt-6 flex flex-col md:flex-row justify-between items-center md:items-end gap-6 text-center md:text-left">
                  <div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase mb-1 tracking-[0.3em]">Estimated Net Gain</p>
                    <p className="text-7xl font-black tracking-tighter text-white">${results.net.toFixed(2)}</p>
                  </div>
                  <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 px-10 py-5 rounded-[2rem] border border-white/10 shadow-2xl ring-1 ring-white/5">
                    <p className="text-[10px] font-black text-zinc-500 uppercase text-center mb-1 tracking-widest">ROI %</p>
                    <span className="text-3xl font-black italic text-yellow-500 tracking-tighter">{results.roi.toFixed(2)}%</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
