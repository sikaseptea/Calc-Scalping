"use client";

import DashboardShell from "@/sikasep-components/layout/dashboard-shell";

import { useEffect, useState } from "react";

// components
import SmartMarketScore from "./components/smart-market-score";
import DailySummary from "./components/daily-summary";

import ETFFlowCard from "@/components/sikasep/ETFFlowCard";
import FearGreedCard from "./components/fear-greed-card";
import BTCDominanceCard from "./components/btc-dominance-card";

import DashboardSummary from "./components/dashboard-summary";
import LiveMarket from "./components/live-market";
import NewsFeed from "./components/news-feed";
import ETFHistoryChart from "./components/ETFHistoryChart";

import SafeRender from "@/components/sikasep/SafeRender";
import ConsensusCard from "./components/consensus-card";

export default function SikasepPage() {
  const [mounted, setMounted] = useState(false);

  // 🔥 hydration guard (FIX SSR mismatch)
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <DashboardShell>
        <div className="p-6 text-zinc-400">
          Loading Sikasep Terminal...
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-4">

        {/* ================= HEADER ================= */}
        <div className="sticky top-0 z-50 rounded-xl border border-zinc-800 bg-zinc-950/80 backdrop-blur px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex gap-4 items-center">
            <span className="text-emerald-400">● LIVE</span>
            <span className="text-zinc-400 font-medium">
              Sikasep Terminal
            </span>
            <span className="text-zinc-500">
              Crypto Intelligence Feed
            </span>
          </div>

          <div className="flex gap-4">
            <span className="text-emerald-400">ETF STREAM</span>
            <span className="text-zinc-400">MARKET LIVE</span>
            <span className="text-zinc-400">NEWS ACTIVE</span>
          </div>
        </div>

        {/* ================= CORE ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <SafeRender>
            <SmartMarketScore />
          </SafeRender>

          <SafeRender>
            <DailySummary />
          </SafeRender>
        </div>

        {/* ================= SENTIMENT LAYER ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <SafeRender>
            <ETFFlowCard />
          </SafeRender>

          <SafeRender>
            <FearGreedCard />
          </SafeRender>

          <SafeRender>
            <BTCDominanceCard />
          </SafeRender>
        </div>

        {/* ================= CONSENSUS ================= */}
		<div className="grid grid-cols-1 gap-3">
  <SafeRender>
    <ConsensusCard />
  </SafeRender>
</div>
		
        <SafeRender>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3 hover:border-emerald-500/20 transition-all">
            <DashboardSummary />
          </div>
        </SafeRender>

        {/* ================= LIVE STREAM ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <SafeRender>
            <LiveMarket />
          </SafeRender>

          <SafeRender>
            <NewsFeed />
          </SafeRender>
        </div>

        {/* ================= ETF CHART ================= */}
        <SafeRender>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3 hover:border-emerald-500/20 transition-all">
            <ETFHistoryChart />
          </div>
        </SafeRender>

      </div>
    </DashboardShell>
  );
}