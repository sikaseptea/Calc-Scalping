
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, TrendingUp, TrendingDown, Globe, Landmark, 
  Swords, Zap, Wallet, RefreshCw, Clock, ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react';

// --- DATA NARRATIVE INITIAL (Akan diupdate via RSS) ---
const INITIAL_INTEL = [
  { id: 1, cat: "Macro", title: "Fed Interest Rate Decision", stance: "Bearish", desc: "The Fed holds rates steady. Market expects no cuts in 2024.", w: 30 },
  { id: 2, cat: "Politics", title: "US Presidential Election Impact", stance: "Bullish", desc: "Crypto-friendly policies becoming a key debate point.", w: 25 },
  { id: 3, cat: "Whale", title: "Institutional Accumulation", stance: "Bullish", desc: "Over $500M BTC moved from exchanges to cold storage.", w: 20 },
  { id: 4, cat: "War", title: "Middle East Stability Check", stance: "Bearish", desc: "Rising tensions affecting global supply chain routes.", w: 20 }
];

export default function SikasepIntelligenceV6() {
  const [narratives, setNarratives] = useState(INITIAL_INTEL);
  const [prices, setPrices] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString('id-ID'));
  const [search, setSearch] = useState("");

  // 1. LOGIC: TRULY REAL-TIME PRICES (Websocket)
  useEffect(() => {
    // Menghubungkan ke Stream Binance (Tanpa API Key, Real-time tiap detik)
    const streams = ['btcusdt', 'ethusdt', 'solusdt', 'bnbusdt', 'xrpusdt', 'adausdt', 'dogeusdt', 'maticusdt', 'dotusdt', 'linkusdt'];
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streams.map(s => `${s}@ticker`).join('/')}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setPrices((prev: any) => ({
        ...prev,
        [data.s.toLowerCase()]: {
          price: parseFloat(data.c).toLocaleString(),
          change: parseFloat(data.P).toFixed(2),
          isUp: parseFloat(data.P) >= 0
        }
      }));
    };

    return () => ws.close();
  }, []);

  // 2. LOGIC: FETCH NARRATIVES (RSS Feed)
  const fetchIntel = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent('https://cointelegraph.com/rss')}`);
      const data = await res.json();
      if (data.items) {
        const mapped = data.items.slice(0, 10).map((item: any, i: number) => ({
          id: i,
          cat: i % 2 === 0 ? "Macro" : "ETF",
          title: item.title,
          stance: item.title.toLowerCase().includes('bull') || item.title.toLowerCase().includes('up') ? "Bullish" : "Bearish",
          desc: item.description.replace(/<[^>]*>?/gm, '').substring(0, 100) + "...",
          w: 20
        }));
        setNarratives(mapped);
      }
      setLastUpdated(new Date().toLocaleTimeString('id-ID'));
    } catch (e) { console.log("RSS error, using fallback"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchIntel(); }, []);

  // 3. LOGIC: SCORING
  const stats = useMemo(() => {
    const filtered = narratives.filter(d => d.title.toLowerCase().includes(search.toLowerCase()));
    const score = Math.round((filtered.filter(d => d.stance === "Bullish").length / filtered.length) * 100) || 50;
    return { filtered, score };
  }, [narratives, search]);

  return (
    <div className="min-h-screen w-full bg-[#020202] text-zinc-100 font-sans antialiased flex flex-col overflow-hidden">
      
      {/* 🟢 TOP TICKER (TRULY REAL-TIME) */}
      <div className="h-10 bg-white/5 border-b border-white/10 flex items-center shrink-0">
        <div className="animate-marquee whitespace-nowrap flex gap-10 text-[10px] font-mono font-bold text-zinc-400 uppercase">
          {Object.entries(prices).map(([symbol, data]: any) => (
            <span key={symbol} className={data.isUp ? 'text-emerald-400' : 'text-red-400'}>
              {symbol.replace('usdt', '').toUpperCase()}: ${data.price} ({data.change}%)
            </span>
          ))}
          {!Object.keys(prices).length && <span>CONNECTING TO BINANCE REALTIME STREAM...</span>}
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* 🟢 SIDEBAR: WATCHLIST (Responsive) */}
        <aside className="w-full lg:w-80 border-r border-white/5 bg-black/40 flex flex-col shrink-0 overflow-y-auto max-h-[40vh] lg:max-h-none no-scrollbar">
          <div className="p-6 border-b border-white/5 sticky top-0 bg-black/80 backdrop-blur-md z-10">
            <h1 className="text-2xl font-black italic tracking-tighter text-orange-500">SIKASEP LIVE</h1>
            <div className="flex items-center gap-2 mt-1 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
              <Clock size={10}/> SYNCED: {lastUpdated}
            </div>
          </div>

          <div className="p-4 space-y-4">
            <button onClick={fetchIntel} className="w-full py-3 bg-orange-600 hover:bg-orange-500 rounded-xl flex items-center justify-center gap-2 text-xs font-black transition-all active:scale-95 shadow-lg">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> REFRESH NEWS
            </button>

            <div className={`p-6 rounded-[2rem] border text-center transition-all duration-700
              ${stats.score > 50 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
              <div className="text-[10px] font-black text-zinc-500 uppercase mb-1">Sentiment Score</div>
              <div className={`text-6xl font-black italic ${stats.score > 50 ? 'text-emerald-400' : 'text-red-400'}`}>
                {stats.score}%
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
              {Object.entries(prices).slice(0, 10).map(([symbol, data]: any) => (
                <div key={symbol} className="flex justify-between items-center p-3 bg-zinc-900/50 rounded-xl border border-white/5">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase">{symbol.replace('usdt', '')}</span>
                  <div className={`flex items-center gap-1 font-mono text-[10px] font-black ${data.isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                    {data.isUp ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
                    {data.change}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* 🟢 MAIN AREA: NARRATIVES */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#050505]">
          <header className="p-6 md:p-8 border-b border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
            <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter text-white">INTELLIGENCE</h2>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16}/>
              <input 
                type="text" placeholder="Search narrative..." 
                className="w-full bg-zinc-900 border border-white/10 rounded-full py-2.5 pl-12 pr-4 outline-none focus:border-orange-500/40 text-sm"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </header>

          {/* 🟢 THE WIDE GRID (SMART RESPONSIVE) */}
          <div className="flex-1 overflow-x-auto lg:overflow-x-auto overflow-y-auto p-4 md:p-8 flex flex-col lg:flex-row items-start gap-6 no-scrollbar">
            {stats.filtered.map((item) => (
              <div key={item.id} className={`w-full lg:w-[350px] lg:shrink-0 p-7 rounded-[2.5rem] border transition-all duration-300 flex flex-col justify-between min-h-[280px] lg:h-[320px]
                ${item.stance === 'Bullish' ? 'bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/40' : 'bg-red-500/5 border-red-500/10 hover:border-red-500/40'}`}>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black bg-white/5 px-3 py-1 rounded-full text-zinc-500 uppercase">{item.cat}</span>
                    <div className={`text-[10px] font-black flex items-center gap-1 ${item.stance === 'Bullish' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {item.stance === 'Bullish' ? <TrendingUp size={12}/> : <TrendingDown size={12}/>} {item.stance}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white leading-tight tracking-tight italic line-clamp-3 uppercase">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-500 leading-relaxed line-clamp-3 opacity-60">"{item.desc}"</p>
                </div>
                
                <div className="pt-4 border-t border-white/5 flex justify-between items-center font-mono text-[9px] font-black text-zinc-700">
                  <span className="flex items-center gap-2"><Activity size={10}/> SOURCE: SYNCED</span>
                  <span>W: {item.w}</span>
                </div>
              </div>
            ))}
            {/* Spacing for horizontal scroll on desktop */}
            <div className="hidden lg:block w-20 shrink-0 h-full"></div>
          </div>
        </main>

      </div>

      <style jsx global>{`
        @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
        .animate-marquee { animation: marquee 60s linear infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}