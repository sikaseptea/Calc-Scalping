
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, TrendingUp, TrendingDown, Globe, Landmark, 
  Swords, Zap, RefreshCw, Clock, ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react';

// --- DATA NARRATIVE INITIAL (Fallback agar tidak kosong) ---
const INITIAL_INTEL = [
  { id: 1, cat: "Macro", title: "Fed Interest Rate Decision", stance: "Bearish", desc: "The Fed holds rates steady. Market expects no cuts in 2024.", w: 30 },
  { id: 2, cat: "Politics", title: "US Presidential Election Impact", stance: "Bullish", desc: "Crypto-friendly policies becoming a key debate point.", w: 25 },
  { id: 3, cat: "Whale", title: "Institutional Accumulation", stance: "Bullish", desc: "Over $500M BTC moved from exchanges to cold storage.", w: 20 },
  { id: 4, cat: "War", title: "Middle East Stability Check", stance: "Bearish", desc: "Rising tensions affecting global supply chain routes.", w: 20 }
];

export default function SikasepTerminalFinal() {
  const [narratives, setNarratives] = useState(INITIAL_INTEL);
  const [prices, setPrices] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(""); // Dikosongkan untuk cegah Hydration Error
  const [search, setSearch] = useState("");

  // 1. LOGIC: LIVE BINANCE WEBSOCKET (Harga Asli & Live)
  useEffect(() => {
    // Set jam hanya di client side
    setLastUpdated(new Date().toLocaleTimeString('id-ID'));

    const symbols = ['btcusdt', 'ethusdt', 'solusdt', 'bnbusdt', 'xrpusdt', 'adausdt', 'dogeusdt', 'maticusdt', 'dotusdt', 'linkusdt'];
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbols.map(s => `${s}@ticker`).join('/')}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setPrices((prev: any) => ({
        ...prev,
        [data.s.toLowerCase()]: {
          price: parseFloat(data.c) < 1.0 ? parseFloat(data.c).toFixed(4) : parseFloat(data.c).toLocaleString(undefined, { minimumFractionDigits: 2 }),
          change: parseFloat(data.P).toFixed(2),
          isUp: parseFloat(data.P) >= 0
        }
      }));
    };
    return () => ws.close();
  }, []);

  // 2. LOGIC: FETCH NEWS (RSS Feed)
  const fetchIntel = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent('https://cointelegraph.com/rss')}`);
      const data = await res.json();
      if (data.items) {
        const mapped = data.items.slice(0, 10).map((item: any, i: number) => {
          const isBull = item.title.toLowerCase().match(/bull|growth|up|rise|approve|etf|buy/);
          return {
            id: Math.random(),
            cat: "Live Feed",
            title: item.title,
            stance: isBull ? "Bullish" : "Bearish",
            desc: item.description.replace(/<[^>]*>?/gm, '').substring(0, 100) + "...",
            w: 20
          };
        });
        setNarratives(mapped);
      }
      setLastUpdated(new Date().toLocaleTimeString('id-ID'));
    } catch (e) { console.log("RSS error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchIntel(); }, []);

  // 3. LOGIC: SCORING ENGINE
  const stats = useMemo(() => {
    const filtered = narratives.filter(d => d.title.toLowerCase().includes(search.toLowerCase()));
    const score = Math.round((filtered.filter(d => d.stance === "Bullish").length / filtered.length) * 100) || 50;
    return { filtered, score };
  }, [narratives, search]);

  return (
    <div className="flex flex-col h-screen w-full bg-[#020202] text-zinc-100 font-sans antialiased overflow-hidden">
      
      {/* 🔴 TOP PRICE TICKER (Marquee) */}
      <div className="h-10 bg-zinc-900 border-b border-white/5 flex items-center shrink-0 z-50 overflow-hidden whitespace-nowrap">
        <div className="flex animate-[marquee_60s_linear_infinite] gap-10 text-[10px] font-mono font-bold text-zinc-400">
          {Object.entries(prices).map(([symbol, data]: any) => (
            <span key={symbol} className={data.isUp ? 'text-emerald-400' : 'text-red-400'}>
              {symbol.replace('usdt', '').toUpperCase()}: ${data.price} ({data.change}%)
            </span>
          ))}
          {!Object.keys(prices).length && <span>CONNECTING TO GLOBAL EXCHANGE STREAM...</span>}
        </div>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden min-h-0">
        
        {/* 🔴 SIDEBAR: LIVE MONITOR */}
        <aside className="w-full lg:w-80 border-r border-white/5 bg-black/40 flex flex-col shrink-0 overflow-y-auto max-h-[35vh] lg:max-h-none no-scrollbar">
          <div className="p-6 border-b border-white/5 sticky top-0 bg-black/90 backdrop-blur-md z-10 flex flex-col gap-1">
            <h1 className="text-2xl font-black italic text-orange-500 tracking-tighter leading-none">SIKASEP PRO</h1>
            <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-600 uppercase font-mono tracking-widest">
              <Clock size={10}/> {lastUpdated || "--:--:--"}
            </div>
          </div>

          <div className="p-4 space-y-4">
            <button onClick={fetchIntel} className="w-full py-3 bg-orange-600 hover:bg-orange-500 rounded-xl flex items-center justify-center gap-2 text-xs font-black transition-all shadow-lg active:scale-95 uppercase tracking-tighter">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Intelligence
            </button>

            {/* SENTIMENT SCORE PANEL */}
            <div className={`p-6 rounded-[2.5rem] border text-center transition-all duration-700
              ${stats.score > 50 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
              <div className="text-[10px] font-black text-zinc-500 uppercase mb-1 tracking-widest">Market Vibe</div>
              <div className={`text-6xl font-black italic tracking-tighter ${stats.score > 50 ? 'text-emerald-400' : 'text-red-400'}`}>
                {stats.score}%
              </div>
              <div className="text-[9px] font-bold text-zinc-500 mt-2 uppercase tracking-[0.2em]">{stats.score > 50 ? 'Bullish' : 'Bearish'}</div>
            </div>

            {/* LIVE WATCHLIST */}
            <div className="space-y-2">
              <div className="text-[10px] font-black text-zinc-600 uppercase px-2 mb-2 tracking-widest">Live Watchlist</div>
              {Object.entries(prices).map(([symbol, data]: any) => (
                <div key={symbol} className="flex justify-between items-center p-3.5 bg-zinc-900/50 rounded-2xl border border-white/5 hover:bg-zinc-800 transition-all">
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-black text-zinc-300 uppercase leading-none">{symbol.replace('usdt', '')}</div>
                    <div className="text-[11px] font-mono font-bold text-zinc-500 mt-1 truncate">${data.price}</div>
                  </div>
                  <div className={`flex items-center gap-1 font-mono text-[10px] font-black ${data.isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                    {data.isUp ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
                    {data.change}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* 🔴 MAIN AREA: NARRATIVE GRID */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#020202] lg:h-full">
          <header className="p-6 lg:p-10 border-b border-white/5 flex flex-col md:flex-row gap-6 items-center justify-between shrink-0">
            <h2 className="text-4xl lg:text-6xl font-black italic tracking-tighter text-white leading-none">COMMAND</h2>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18}/>
              <input 
                type="text" placeholder="Filter intelligence..." 
                className="w-full bg-zinc-900 border border-white/10 rounded-full py-4 pl-14 pr-6 outline-none focus:border-orange-500/40 text-sm font-bold transition-all shadow-inner"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </header>

          {/* GRID SCROLLABLE (WIDE ON DESKTOP, VERTICAL ON MOBILE) */}
          <div className="flex-1 overflow-x-auto lg:overflow-x-auto overflow-y-auto p-4 lg:p-10 flex flex-col lg:flex-row items-start gap-6 no-scrollbar min-h-0">
            {stats.filtered.map((item) => (
              <div key={item.id} className={`w-full lg:w-[380px] lg:shrink-0 p-8 rounded-[3.5rem] border transition-all duration-500 flex flex-col justify-between min-h-[300px] lg:h-[360px] shadow-2xl
                ${item.stance === 'Bullish' ? 'bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/30' : 'bg-red-500/5 border-red-500/10 hover:border-red-500/30'}`}>
                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black bg-white/5 px-3 py-1 rounded-full text-zinc-500 uppercase tracking-widest">{item.cat}</span>
                    <div className={`text-[10px] font-black flex items-center gap-1 ${item.stance === 'Bullish' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {item.stance === 'Bullish' ? <TrendingUp size={14}/> : <TrendingDown size={14}/>} {item.stance}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white leading-[1.1] tracking-tight italic line-clamp-3 uppercase group-hover:text-orange-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-500 leading-relaxed line-clamp-3 opacity-60 font-medium">"{item.desc}"</p>
                </div>
                
                <div className="pt-6 border-t border-white/5 flex justify-between items-center font-mono text-[9px] font-black text-zinc-700">
                  <span className="flex items-center gap-2"><Activity size={12}/> SOURCE: ENCRYPTED</span>
                  <span>W: {item.w}</span>
                </div>
              </div>
            ))}
            {/* Space for end scroll */}
            <div className="hidden lg:block w-40 shrink-0 h-full"></div>
          </div>
        </main>
      </div>

      <style jsx global>{`
        @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}