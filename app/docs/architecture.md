# SIKASEP ARCHITECTURE

## Data Flow

External APIs
↓
API Routes
↓
Processing Engine
↓
Supabase
↓
Dashboard UI

---

## Data Sources

### Market

* CoinGecko
* Binance

### News

* CoinGecko Trending
* Future:

  * CryptoPanic
  * CoinDesk
  * The Block

### Sentiment

* Rule Based Engine
* OpenAI (Future)

### Market Metrics

* Fear & Greed
* BTC Dominance
* ETF Flow
* Whale Activity

---

## Core Modules

### Market Engine

Responsibilities:

* Live Prices
* Volume
* Change %
* Dominance

### News Engine

Responsibilities:

* Fetch News
* Clean Data
* Store Database
* Rank Importance

### Sentiment Engine

Responsibilities:

* Analyze Headlines
* Classify News
* Confidence Score

### Intelligence Engine

Responsibilities:

* Market Bias
* Daily Summary
* Composite Score

---

## Dashboard Tabs

### Home

Market Overview

### Market

Live Prices
Dominance
Fear & Greed

### News

News Feed
Sentiment
Impact Score

### Intelligence

Market Summary
AI Insights
