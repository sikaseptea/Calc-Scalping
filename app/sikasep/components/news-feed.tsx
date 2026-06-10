"use client";

import { useEffect, useMemo, useState } from "react";

type NewsItem = {
  title?: string;
  url?: string;
  source?: string;
  publishedAt?: string;

  tag?: "BREAKING" | "CRYPTO" | "MACRO" | "INFO";
  sentiment?: "bullish" | "bearish" | "neutral";
  impactScore?: "low" | "medium" | "high";
};

type ApiResponse = {
  news: NewsItem[];
  decision?: any;
};

// =========================
// SAFE EXTRACTOR (ANTI NULL + ANTI SHAPE ERROR)
// =========================
function extractNews(raw: any): NewsItem[] {
  if (!raw) return [];

  if (Array.isArray(raw?.news)) return raw.news;
  if (Array.isArray(raw)) return raw;

  return [];
}

// =========================
// ULTRA FLEX SOURCE NORMALIZER (FIX NO SIGNAL ROOT CAUSE)
// =========================
function normalizeSource(source?: string): string {
  if (!source) return "UNKNOWN";

  const s = source.toLowerCase();

  if (s.includes("crypto")) return "CRYPTO";
  if (s.includes("gdelt")) return "GDELT";
  if (s.includes("binance")) return "BINANCE";
  if (s.includes("coindesk")) return "COINDESK";
  if (s.includes("panic")) return "CRYPTOPANIC";

  return source.toUpperCase();
}

// =========================
// ULTRA FLEX MATCHER (FIX EMPTY STATE BUG)
// =========================
function matchSource(source?: string, filter?: string) {
  if (!filter || filter === "ALL") return true;

  const s = (source || "").toUpperCase();
  const f = filter.toUpperCase();

  // fuzzy match (INI KUNCI FIX NO SIGNAL)
  return s.includes(f) || f.includes(s);
}

// =========================
// COMPONENT
// =========================
export default function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [decision, setDecision] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState("ALL");

  // =========================
  // FETCH ENGINE
  // =========================
  async function fetchNews() {
    try {
      const res = await fetch("/api/sikasep/news");
      const raw: ApiResponse = await res.json();

      const extracted = extractNews(raw);

      const normalized = extracted.map((n) => ({
        ...n,
        source: normalizeSource(n.source)
      }));

      setNews(normalized);
      setDecision(raw.decision || null);
    } catch (err) {
      console.error("fetchNews error:", err);
      setNews([]);
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    fetchNews();
  }, []);

  // =========================
  // REALTIME ENGINE (15s)
  // =========================
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNews();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // =========================
  // FILTERED NEWS (NO SIGNAL BUG FIXED HERE)
  // =========================
  const filteredNews = useMemo(() => {
    const result = news.filter((n) =>
      matchSource(n.source, sourceFilter)
    );

    // DEBUG SAFETY (hapus kalau sudah stable)
    console.log("FILTER:", sourceFilter, "RESULT:", result.length);

    return result;
  }, [news, sourceFilter]);

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="p-4 text-sm text-gray-400">
        Initializing Bloomberg Intelligence Terminal...
      </div>
    );
  }

  // =========================
  // EMPTY STATE (FIXED UX - NO FALSE EMPTY)
  // =========================
  if (!filteredNews.length) {
    return (
      <div className="p-4 space-y-3">
        <div className="text-sm text-gray-400">
          No signals found for: <b>{sourceFilter}</b>
        </div>

        <button
          onClick={() => setSourceFilter("ALL")}
          className="px-3 py-1 text-xs bg-white/10 rounded hover:bg-white/20"
        >
          Reset to ALL SOURCES
        </button>
      </div>
    );
  }

  // =========================
  // UI (BLOOMBERG V3 FOUNDATION)
  // =========================
  return (
    <div className="space-y-4">

      {/* ================= REGIME PANEL ================= */}
      {decision && (
        <div className="p-4 rounded-xl border border-gray-800 bg-black/40">
          <div className="text-sm font-bold">
            REGIME: {decision.regime}
          </div>

          <div className="text-xs text-gray-400">
            Confidence: {decision.confidence}%
          </div>

          <div className="mt-2 text-xs text-gray-500 space-y-1">
            {decision.drivers?.map((d: string, i: number) => (
              <div key={i}>• {d}</div>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-2 text-xs gap-1">
            <div>BTC: {decision?.bias?.btc || "neutral"}</div>
            <div>ETH: {decision?.bias?.eth || "neutral"}</div>
            <div>STOCKS: {decision?.bias?.stocks || "neutral"}</div>
            <div>GOLD: {decision?.bias?.gold || "neutral"}</div>
            <div>OIL: {decision?.bias?.oil || "neutral"}</div>
          </div>
        </div>
      )}

      {/* ================= CONTROL BAR ================= */}
      <div className="flex items-center gap-3">

        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="bg-black/40 border border-gray-700 text-sm p-2 rounded"
        >
          <option value="ALL">ALL SOURCES</option>
          <option value="CRYPTO">CRYPTO</option>
          <option value="GDELT">GDELT</option>
          <option value="BINANCE">BINANCE</option>
          <option value="COINDESK">COINDESK</option>
          <option value="CRYPTOPANIC">CRYPTOPANIC</option>
        </select>

        <div className="text-xs text-gray-500">
          LIVE • {filteredNews.length} signals
        </div>
      </div>

      {/* ================= NEWS LIST ================= */}
      <div className="space-y-3">
        {filteredNews.map((item, idx) => (
          <a
            key={idx}
            href={item.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="
              block p-4 rounded-xl border
              bg-black/30 hover:bg-black/50
              border-gray-800 transition
            "
          >
            <div className="text-sm font-semibold text-white">
              {item.title || "Untitled News"}
            </div>

            <div className="text-xs text-gray-400 mt-1 flex gap-2">
              <span>{item.source}</span>
              <span>•</span>
              <span>{item.publishedAt}</span>
            </div>

            <div className="mt-2 text-[10px] text-gray-500 flex gap-2 flex-wrap">
              <span>{item.tag || "INFO"}</span>
              <span>{item.sentiment || "neutral"}</span>
              <span>{item.impactScore || "low"}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}