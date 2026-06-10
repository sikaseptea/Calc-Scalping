# SIKASEP ROADMAP

## Phase 1 - Foundation ✅

* [x] Next.js Dashboard
* [x] Supabase Integration
* [x] News Engine
* [x] Live Market Data
* [x] Dashboard Home
* [x] News Database Storage

---

## Phase 2 - Market Intelligence

* [ ] Fear & Greed Index
* [ ] BTC Dominance
* [ ] Market Sentiment Engine
* [ ] Historical Sentiment Tracking
* [ ] News Impact Ranking

---

## Phase 3 - AI Layer

* [ ] OpenAI Sentiment Analysis
* [ ] AI News Classification
* [ ] AI Market Summary
* [ ] Confidence Scoring

---

## Phase 4 - Advanced Analytics

* [ ] ETF Flow Tracker
* [ ] Whale Alert Tracker
* [ ] Stablecoin Flow Monitor
* [ ] Exchange Reserve Monitor

---

## Phase 5 - Trading Intelligence

* [ ] Market Regime Detector
* [ ] Bull/Bear Cycle Detector
* [ ] Smart Market Score
* [ ] Daily Market Outlook

---

## Phase 6 - Personal Trading Assistant

* [ ] Daily Briefing
* [ ] Risk Dashboard
* [ ] Portfolio Monitoring
* [ ] Trade Journal Integration


# SIKASEP ROADMAP

## STATUS PROJECT

Last Updated: 2026-06-08

---

# ✅ REALTIME (SUDAH JALAN)

## Market

* [x] Live Market API
* [x] BTC Price
* [x] ETH Price
* [x] SOL Price
* [x] BNB Price
* [x] XRP Price
* [x] Auto Refresh

Source:

* CoinGecko

---

## News Engine

* [x] CoinGecko Trending
* [x] Save News To Supabase
* [x] News Database
* [x] News API

Table:

* news

Status:
REAL DATA

---

## Fear & Greed

* [x] Fear & Greed API
* [x] Fear & Greed Card
* [x] Save History
* [x] Fear & Greed Chart

Table:

* fear_greed_history

Status:
REAL DATA

---

## BTC Dominance

* [x] BTC Dominance API
* [x] BTC Dominance Card
* [x] Market Snapshot Save
* [x] BTC Dominance Chart

Table:

* market_snapshots

Status:
REAL DATA

---

## Market Intelligence

* [x] Smart Market Score
* [x] Daily Summary (Rule Engine)

Status:
SEMI REALTIME

Data Sources:

* Fear & Greed
* BTC Dominance
* News Sentiment

---

# ⚠️ PARTIAL / BASIC

## News Sentiment

Current:

* bullish
* bearish
* neutral

Method:

* rule based

Status:
BASIC

Need:

* AI Sentiment

---

## Daily Summary

Current:

* template based

Status:
BASIC

Need:

* OpenAI Summary

---

# 🚧 DUMMY / PLACEHOLDER

## ETF Flow

Current:

* manual seed data

Table:

* etf_flows

Status:
DUMMY

Need:

* real ETF source
* auto update

---

## Whale Alert

Status:
NOT BUILT

Need:

* whale tracker
* wallet movement monitor

---

## Stablecoin Flow

Status:
NOT BUILT

Need:

* USDT supply tracking
* USDC supply tracking

---

## AI Sentiment

Status:
NOT BUILT

Need:

* OpenAI API

---

## AI Daily Briefing

Status:
NOT BUILT

Need:

* OpenAI API

---

# NEXT PRIORITY

Priority 1:

* Fix ETF Flow → REAL DATA

Priority 2:

* Whale Alert

Priority 3:

* Stablecoin Supply Monitor

Priority 4:

* AI Sentiment

Priority 5:

* AI Daily Briefing

---

# DATABASE

Current Tables:

* news
* fear_greed_history
* market_snapshots
* market_sentiment
* etf_flows

Planned Tables:

* whale_alerts
* stablecoin_flows
* ai_summaries
* system_logs

---

# OVERALL PROJECT STATUS

Foundation:
100%

Market Data:
90%

News Engine:
80%

Intelligence Layer:
65%

AI Layer:
0%

Overall Progress:
≈ 70%


Lanjut project Sikasep.

Status terakhir:
- roadmap sudah update
- overall progress 70%
- priority berikutnya ETF Flow realtime

Saya ada di tahap setelah Smart Market Score dan Daily Summary.


----------------------------------------------------

PROJECT CONTEXT: SIKASEP

Status: ~85% Crypto Intelligence Terminal

STACK:
- Next.js App Router
- Supabase
- CoinGecko API
- Alternative.me Fear & Greed
- OpenAI (AI layer in progress)

CURRENT SPRINT:
Sprint 8.2 - AI Layer
whale/stable coin Alert

ACTIVE FEATURES:
- ETF Flow (REAL)
- Fear & Greed (REAL)
- BTC Dominance (REAL)
- Market Score (PARTIAL rule-based)
- News Feed (REAL)
- Terminal UI (Binance-style compact)

DATABASE:
- news (REAL)
- etf_flows (REAL)
- fear_greed_history (REAL)
- market_snapshots (REAL)
- market_sentiment (PARTIAL)

IMPORTANT RULE:
- Always send FULL FILE when coding
- No partial snippets unless requested
- Keep Supabase schema consistent


buatkan
1. AUTO CRON PIPELINE
ETF auto fetch tiap 5–15 menit
⚡ 2. MARKET EVENT STREAM
setiap perubahan langsung update DB
⚡ 3. SOCKET LIVE UI (REAL TERMINAL FEEL)
no refresh, langsung update UI



SIKASEP PROJECT TREE (FINAL CURRENT STATE) app └─ api └─ sikasep ├─ btc-dominance │ └─ route.ts (REAL - CoinGecko) │ ├─ market │ └─ route.ts (REAL - CoinGecko) │ ├─ market-history │ └─ route.ts (REAL) │ ├─ market-score │ └─ route.ts (PARTIAL - rule-based + AI ready) │ ├─ fear-greed │ └─ route.ts (REAL - Alternative.me) │ ├─ fear-greed-history │ └─ route.ts (REAL) │ ├─ news │ └─ route.ts (REAL - CoinGecko trending) │ ├─ news-db │ └─ route.ts (REAL - Supabase storage) │ ├─ etf-flow │ └─ route.ts (REAL - Supabase read) │ ├─ save-etf-flow │ └─ route.ts (REAL pipeline - Farside/manual/API) │ ├─ save-fear-greed │ └─ route.ts (REAL ingest) │ ├─ save-market-snapshot │ └─ route.ts (REAL ingest) │ ├─ ai │ ├─ sentiment │ │ └─ route.ts (NEW - OPENAI AI LAYER) │ │ │ └─ briefing │ └─ route.ts (NEW - OPENAI DAILY BRIEF) │ ├─ dashboard │ └─ route.ts (PARTIAL - aggregation layer) │ └─ daily-summary └─ route.ts (PARTIAL - template / AI ready) 🖥️ UI LAYER app/sikasep ├─ page.tsx (TERMINAL PRO MODE UI) │ └─ components ├─ smart-market-score.tsx (PARTIAL - rule-based + AI upgrade ready) ├─ etf-flow-card.tsx (REAL - Supabase) ├─ etf-history-chart.tsx (PARTIAL - DB ready, simple chart) ├─ fear-greed-card.tsx (REAL) ├─ fear-greed-chart.tsx (REAL) ├─ btc-dominance-card.tsx (REAL) ├─ btc-dominance-chart.tsx (REAL) ├─ live-market.tsx (REAL - CoinGecko) ├─ news-feed.tsx (REAL - trending news) ├─ daily-summary.tsx (PARTIAL - template AI ready) ├─ dashboard-summary.tsx (PARTIAL - aggregation UI) └─ ETFHistoryChart.tsx (PARTIAL - visualization layer) 🗄️ SUPABASE TABLES (DATA LAYER) news → REAL (CoinGecko + storage) etf_flows → REAL (Farside / API / manual + pipeline) fear_greed_history → REAL (Alternative.me) market_snapshots → REAL (CoinGecko global) market_sentiment → PARTIAL (rule-based, no AI yet) ⚡ SYSTEM STATUS MAP REAL TIME SYSTEMS: - ETF Flow pipeline - Fear & Greed index - BTC dominance - Market price data - News feed PARTIAL SYSTEMS: - Smart Market Score (rule-based engine) - Daily Summary (template) - ETF history chart (visual only) AI SYSTEM (NEW): - AI sentiment engine (STARTED) - AI briefing (STARTED) NOT BUILT: - Whale alerts - Stablecoin flows - Market regime detection 🧠 ARCHITECTURE FLOW External APIs ↓ Next.js API Routes (/api/sikasep) ↓ AI Layer (OpenAI - in progress) ↓ Supabase (storage + history) ↓ Market Intelligence Engine ↓ Terminal UI (Binance-style dashboard) 🚀 FINAL STATUS Project Stage: 85% System Type: Crypto Intelligence Terminal Mode: Hybrid (Real-time + AI layer in progress) 📌 IMPORTANT NOTE (FOR PROJECT.md) Tambahkan ini: SYSTEM RULE: - Always separate REAL data vs AI logic vs UI layer - Avoid mixing API logic inside components - Maintain Supabase as single source of truth for historical data 🔥 NEXT STEP (BIAR NAIK KE 90–95%) Kalau lanjut, urutan terbaik: 1. Smart Market Score V2 (AI weighted system) 2. Whale Alert system (on-chain layer) 3. Stablecoin flow tracking 4. Market regime detection (Risk On / Risk Off)