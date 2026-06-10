# DATABASE DESIGN

## news

Stores processed news.

Columns:

* id
* title
* url
* source
* summary
* sentiment
* impact_score
* published_at
* created_at

---

## market_snapshots

Stores periodic market data.

Columns:

* id
* btc_price
* eth_price
* total_market_cap
* btc_dominance
* volume_24h
* created_at

---

## market_sentiment

Stores overall sentiment.

Columns:

* id
* market_score
* bullish
* bearish
* neutral
* created_at

---

## fear_greed_history

Stores Fear & Greed history.

Columns:

* id
* value
* classification
* created_at

---

## etf_flows

Stores ETF flow information.

Columns:

* id
* asset
* inflow
* outflow
* net_flow
* created_at

---

## whale_alerts

Stores whale movements.

Columns:

* id
* asset
* amount
* source_wallet
* destination_wallet
* impact
* created_at

---

## system_logs

Stores engine events.

Columns:

* id
* module
* message
* level
* created_at
