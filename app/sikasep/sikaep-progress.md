# SIKASEP PROJECT STATUS

Last Update: 2026-06-09

---

# CURRENT STATUS

STATUS: HYBRID SYSTEM (PARTIAL MIGRATION)

Sebagian panel masih menggunakan kombinasi:

* snapshot
* direct query
* dummy provider
* realtime provider

TARGET AKHIR:

Real API
↓
Orchestrator
↓
snapshots
↓
snapshot_latest
↓
UI Components

Tidak membuat dashboard baru.

Tetap menggunakan dashboard yang sudah ada.

---

# IMPORTANT RULES

JANGAN DIUBAH:

* lib/supabase.ts
* lib/supabase/client.ts
* NEXT_PUBLIC_SUPABASE_URL_MAIN
* NEXT_PUBLIC_SUPABASE_ANON_KEY

Karena masih digunakan oleh:

* Calculator App
* Scalping Analyzer
* Main Application lain

Tidak melakukan refactor global.

Perbaikan dilakukan per-panel.

---

# ENV ACTIVE

NEXT_PUBLIC_SUPABASE_URL_MAIN = ACTIVE

NEXT_PUBLIC_SUPABASE_ANON_KEY = ACTIVE

Tidak menggunakan service_role di frontend.

---

# DATABASE STATUS

TABLE EXIST:

[x] snapshots
[x] snapshot_latest
[ ] snapshot_metrics

[x] news
[x] market_sentiment
[x] market_snapshots
[x] market_metrics
[x] whale_alerts
[x] etf_flows
[x] ai_reports
[x] profiles
[x] trade_logs

---

# SNAPSHOT ENGINE

[x] normalizeSnapshot()
[x] writeSnapshot()
[x] ingestSnapshot()
[x] getLatestSnapshot()
[x] scheduler
[x] snapshots history table
[x] snapshot_latest pointer

[ ] snapshot_metrics

---

# SNAPSHOT TYPES

[x] ETF_FLOW
[x] NEWS_SENTIMENT

[ ] CRYPTO_PRICE
[ ] WHALE_ALERT
[ ] MARKET_SENTIMENT
[ ] SMART_SCORE

---

# API STATUS

[x] /api/snapshot
[x] curl test success

---

# ORCHESTRATOR

[x] startScheduler()
[x] runETFJob()
[x] runNewsJob()

BELUM:

[ ] Whale Job
[ ] Market Sentiment Job
[ ] Smart Score Job

---

# PROVIDERS

## ETF PROVIDER

[x] etf-provider.ts dibuat
[x] payload baru digunakan
[x] scheduler aktif
[x] refresh otomatis

BELUM:

[ ] Real ETF API

Provider saat ini:

* Fixed dummy value
* Inflow = 100M
* Outflow = 60M

Dummy random telah dihapus.

---

# DASHBOARD STRUCTURE

[x] DashboardShell
[x] app/sikasep/page.tsx finalized

---

# COMPONENT STATUS

## LIVE TERMINAL BAR

[x] selesai

---

## LIVE MARKET

[x] component tampil
[x] BTC tampil
[x] ETH tampil
[x] SOL tampil
[x] BNB tampil
[x] XRP tampil

BELUM:

[ ] CoinGecko realtime
[ ] snapshot integration

---

## NEWS FEED

[x] membaca Supabase
[x] auto refresh

BELUM:

[ ] snapshot source
[ ] AI sentiment
[ ] scoring engine

---

# PRIORITAS 1 — ETF FLOW CARD

STATUS: 95% SELESAI

[x] audit file
[x] migrasi snapshot
[x] ETFFlowCard membaca snapshot_latest
[x] scheduler aktif
[x] auto refresh
[x] payload baru
[x] dummy random dihapus
[x] UI normal

BELUM:

[ ] Real ETF API

Arsitektur saat ini:

Provider
↓
runETFJob()
↓
ingestSnapshot()
↓
snapshots
↓
snapshot_latest
↓
ETFFlowCard

STATUS ETF:

Realtime = YA

Valid Market Data = BELUM

Dummy Random = SUDAH DIHAPUS

Dummy Fixed Value = MASIH

---

# FEAR GREED CARD

STATUS UNKNOWN

TODO:

[ ] audit file
[ ] cek source
[ ] migrasi snapshot

---

# BTC DOMINANCE CARD

STATUS UNKNOWN

TODO:

[ ] audit file
[ ] cek source
[ ] migrasi snapshot

---

# SMART MARKET SCORE

BELUM:

[ ] aggregation engine
[ ] snapshot integration

---

# DAILY SUMMARY

BELUM:

[ ] snapshot integration

---

# DASHBOARD SUMMARY

BELUM:

[ ] audit dependency

---

# FEAR GREED CHART

BELUM:

[ ] audit
[ ] snapshot history

---

# BTC DOMINANCE CHART

BELUM:

[ ] audit
[ ] snapshot history

---

# ETF HISTORY CHART

BELUM:

[ ] audit
[ ] snapshot history

---

# ARCHITECTURE CLEANUP

BELUM:

[ ] remove direct API call from UI
[ ] single source snapshot_latest
[ ] unify data layer
[ ] read-only UI pattern

---

# PRODUCTION HARDENING

BELUM:

[ ] retry system
[ ] logging
[ ] cache layer
[ ] rate limit protection
[ ] DEV/PROD scheduler toggle

---

# NEXT PRIORITY

PRIORITAS 2

[ ] FearGreedCard

PRIORITAS 3

[ ] BTCDominanceCard

PRIORITAS 4

[ ] SmartMarketScore

PRIORITAS 5

[ ] DailySummary

PRIORITAS 6

[ ] DashboardSummary

PRIORITAS 7

[ ] FearGreedChart

PRIORITAS 8

[ ] BTCDominanceChart

PRIORITAS 9

[ ] ETFHistoryChart

---

# TARGET AKHIR

Real API
↓
Orchestrator
↓
snapshots
↓
snapshot_latest
↓
UI

---

# INSTRUCTION FOR NEXT CHAT

Lanjutkan proyek SIKASEP.

Jangan membuat dashboard baru.

Jangan mengubah konfigurasi Supabase global.

Kerjakan hanya item yang belum selesai.

Perbaiki satu panel sampai selesai lalu lanjut ke panel berikutnya.

Panel berikut yang dikerjakan:

1. FearGreedCard
2. BTCDominanceCard
3. SmartMarketScore
4. DailySummary
