# Polymarket BTC Up/Down 15m Event Monitor - TODO

A websocket-based monitoring system for Polymarket's BTC price prediction markets with 15-minute intervals using Gamma API and WebSocket subscriptions.

---

## 🎯 Project Overview

Real-time monitoring system that:
- ✅ Connects to Polymarket's Gamma API for market data
- ✅ Connects to Polymarket's WebSocket (wss://ws-subscriptions-clob.polymarket.com)
- ✅ Tracks current and next BTC 15m up/down markets
- ✅ Subscribes to market updates via CLOB token IDs
- 🔄 Displays live odds, volume, and price movements
- ⏳ Alerts on significant market changes

---

## ✅ COMPLETED - Phase 1: Research & Setup

### Research ✅
- ✅ Identified Gamma API: `https://gamma-api.polymarket.com`
- ✅ Identified WebSocket endpoint: `wss://ws-subscriptions-clob.polymarket.com/ws/market`
- ✅ Understood event structure and data format
- ✅ Confirmed no authentication required for public markets
- ✅ Slug pattern: `btc-updown-15m-{unix_timestamp}`

### Environment Setup ✅
- ✅ TypeScript + Node.js setup
- ✅ Dependencies: `ws`, `axios`
- ✅ Project structure with interfaces
- ✅ Basic error handling

---

## ✅ COMPLETED - Phase 2: Core WebSocket Connection

### Basic Connection ✅
- ✅ Implemented websocket connection handler
- ✅ Added exponential backoff retry logic (1s → 30s max)
- ✅ Handle connection errors gracefully
- ✅ Implemented PING/PONG heartbeat (10s interval)
- ✅ Connection state monitoring

### Authentication ✅
- ✅ No authentication required (public API)

---

## ✅ COMPLETED - Phase 3: Event Subscription & Data Handling

### Market Discovery ✅
- ✅ Generate current and next 15m interval timestamps
- ✅ Query markets by slug pattern via Gamma API
- ✅ Extract CLOB token IDs from market data
- ✅ Fallback to search all active BTC markets
- ✅ Store market metadata (outcomes, close dates, etc.)

### Event Subscription ✅
- ✅ Subscribe to markets using asset_ids (CLOB token IDs)
- ✅ Parse incoming websocket messages (book, price_change, etc.)
- ✅ Handle order book updates
- ✅ Handle trade events (last_trade_price)
- ✅ Handle best_bid_ask events

### Data Processing 🔄
- ✅ Map asset IDs to markets and outcomes
- ✅ Display market type (CURRENT/NEXT)
- ✅ Calculate time remaining
- [ ] **Calculate current odds/probabilities from prices**
- [ ] **Track cumulative volume for each outcome**
- [ ] **Compute price movements and trends**
- [ ] **Store historical data points in memory**

---

## 🔄 IN PROGRESS - Phase 4: Enhanced Monitoring & Analytics

### Real-time Monitoring Dashboard
- [ ] **Calculate and display implied probabilities**
  - [ ] Convert best_bid/ask prices to probability percentages
  - [ ] Formula: `probability = price / 100` (if price is in cents)
  - [ ] Display "UP: 52.3% | DOWN: 47.7%" format
  
- [ ] **Track and display volume metrics**
  - [ ] Accumulate trade sizes from `last_trade_price` events
  - [ ] Track volume separately for UP vs DOWN outcomes
  - [ ] Display cumulative volume since connection
  
- [ ] **Enhanced time display**
  - ✅ Show time remaining until market close
  - [ ] Add countdown timer for next market start
  - [ ] Highlight when market is about to close (<1 min)
  
- [ ] **Order book depth visualization**
  - [ ] Show top 3 bids and asks with sizes
  - [ ] Calculate total liquidity on each side
  - [ ] Display spread width and depth imbalance

### Price Movement Tracking
- [ ] **Price change detection**
  - [ ] Store initial price on first update
  - [ ] Calculate % change from initial price
  - [ ] Track min/max prices seen
  - [ ] Detect rapid price movements (>5% in 30s)
  
- [ ] **Moving averages**
  - [ ] Implement simple moving average (1min, 5min windows)
  - [ ] Track price momentum and direction
  - [ ] Identify trend reversals

### Alert System
- [ ] **Define alert conditions**
  - [ ] Price swing > X% in Y seconds
  - [ ] Volume spike (> 2x average)
  - [ ] Spread widens significantly (liquidity concerns)
  - [ ] Market about to close (<2 minutes)
  - [ ] Probability crosses 50% threshold
  
- [ ] **Alert notifications**
  - [ ] Console alerts with color coding (yellow/red)
  - [ ] Optional sound alerts (terminal beep)
  - [ ] (Future) Telegram/Discord webhook integration
  
- [ ] **Alert history**
  - [ ] Log all triggered alerts with timestamp
  - [ ] Prevent alert spam (cooldown periods)
  - [ ] Summary of alerts at end of session

### Data Persistence
- [ ] **In-memory storage structure**
  - [ ] Create MarketState class to track each market
  - [ ] Store price history (circular buffer, last 100 updates)
  - [ ] Store trade history
  - [ ] Track subscription time and data points received
  
- [ ] **Optional: File logging**
  - [ ] Log all events to JSON lines file
  - [ ] Separate file per market/session
  - [ ] Rotation policy for log files

---

## ⏳ TODO - Phase 5: Enhanced Display & UI

### Terminal UI Improvements
- [ ] **Color coding**
  - [ ] Use chalk/colors library
  - [ ] Green for UP, Red for DOWN
  - [ ] Yellow for warnings, Red for alerts
  - [ ] Gray for timestamps and metadata
  
- [ ] **Formatted output**
  - [ ] Create ASCII table for order book
  - [ ] Progress bar for time remaining
  - [ ] Summary panel (header) with key metrics
  - [ ] Separate sections for CURRENT vs NEXT market
  
- [ ] **Live updating dashboard** (Optional advanced)
  - [ ] Use `blessed` or `ink` for TUI
  - [ ] Multiple panels: prices, volume, alerts, order book
  - [ ] Auto-refresh without scroll spam

### Summary Statistics
- [ ] **Per-market summary**
  - [ ] Total trades processed
  - [ ] Price range (high/low)
  - [ ] Average spread
  - [ ] Final probability before close
  
- [ ] **Session summary on exit**
  - [ ] Markets monitored
  - [ ] Total events processed
  - [ ] Alerts triggered
  - [ ] Uptime and reconnection count

---

## ⏳ TODO - Phase 6: Code Quality & Reliability

### Code Refactoring
- [ ] **Extract market state management**
  - [ ] Create MarketState class
  - [ ] Separate concerns: API fetching, WS handling, display logic
  - [ ] Move configuration to separate file/env vars
  
- [ ] **Improve type safety**
  - [ ] Add more specific types for WebSocket events
  - [ ] Validate incoming data structure
  - [ ] Handle missing/optional fields safely
  
- [ ] **Better logging**
  - [ ] Replace console.log with proper logger (winston, pino)
  - [ ] Log levels: debug, info, warn, error
  - [ ] Structured logging (JSON format)

### Error Handling Improvements
- [ ] **API error handling**
  - ✅ Basic axios error handling exists
  - [ ] Retry failed API calls (with backoff)
  - [ ] Fallback strategies when markets not found
  - [ ] Handle rate limiting (429 responses)
  
- [ ] **WebSocket error handling**
  - ✅ Basic reconnection logic exists
  - [ ] Handle invalid subscription responses
  - [ ] Detect stale connections (no data timeout)
  - [ ] Handle malformed messages gracefully
  
- [ ] **Edge cases**
  - [ ] Handle market closing during monitoring
  - [ ] Automatic transition from current → next market
  - [ ] Handle when next market doesn't exist yet
  - [ ] Deal with missing CLOB token IDs

### Testing
- [ ] **Unit tests**
  - [ ] Test timestamp calculation functions
  - [ ] Test slug generation
  - [ ] Test market filtering logic
  - [ ] Test time remaining calculation
  
- [ ] **Integration tests**
  - [ ] Mock Gamma API responses
  - [ ] Mock WebSocket messages
  - [ ] Test reconnection scenarios
  - [ ] Test alert triggering
  
- [ ] **Manual testing checklist**
  - [ ] Run during market transition time
  - [ ] Test with network interruptions
  - [ ] Test with invalid market slugs
  - [ ] Verify memory doesn't leak over long sessions

---

## ⏳ TODO - Phase 7: Advanced Features (Nice to Have)

### Multi-Market Support
- [ ] **Monitor multiple crypto pairs**
  - [ ] ETH-updown-15m
  - [ ] SOL-updown-15m
  - [ ] Support different intervals (5m, 30m, 1h)
  
- [ ] **Parallel monitoring**
  - [ ] Subscribe to multiple markets in single WS connection
  - [ ] Display all markets in organized view
  - [ ] Compare movements across different assets

### Historical Data & Analysis
- [ ] **Data export**
  - [ ] Export to CSV
  - [ ] Export to JSON
  - [ ] Include all price, volume, and timing data
  
- [ ] **Backtesting support**
  - [ ] Record all market data for replay
  - [ ] Analyze historical accuracy
  - [ ] Pattern recognition across past events

### Web Dashboard (Future)
- [ ] Set up Express/Fastify server
- [ ] WebSocket relay to frontend
- [ ] Real-time charts with Chart.js/D3
- [ ] Historical data visualization
- [ ] Mobile-responsive design

### Trading Integration (Advanced)
- [ ] **Paper trading mode**
  - [ ] Simulate orders based on signals
  - [ ] Track P&L
  - [ ] Strategy backtesting
  
- [ ] **Live trading** (use with caution!)
  - [ ] Integrate with Polymarket CLOB API
  - [ ] Place actual orders
  - [ ] Risk management safeguards

---

## 🛠️ Current Technical Stack

**Implemented:**
- ✅ TypeScript + Node.js
- ✅ `ws` - WebSocket client
- ✅ `axios` - HTTP client for Gamma API
- ✅ Native JSON parsing
- ✅ Manual console logging

**Recommended Additions:**
- `chalk` or `colors` - Terminal color output
- `winston` or `pino` - Structured logging
- `dotenv` - Environment variable management
- `blessed` or `ink` - Terminal UI (optional)
- `node-fetch` - Alternative to axios (optional)
- `jest` or `vitest` - Testing framework

---

## 🚀 Immediate Next Steps (Vibe Coding)

### Priority 1: Core Analytics (Today)
1. [ ] Calculate and display implied probabilities from prices
2. [ ] Track cumulative volume per outcome
3. [ ] Add color coding to console output (install chalk)
4. [ ] Implement basic price alerts (>5% swing)

### Priority 2: Better Display (Today)
5. [ ] Format output in cleaner tables/sections
6. [ ] Add summary header showing both markets at once
7. [ ] Show "UP vs DOWN" probability comparison
8. [ ] Reduce console spam (only show meaningful updates)

### Priority 3: Reliability (Tomorrow)
9. [ ] Add proper logging framework
10. [ ] Implement API retry logic
11. [ ] Handle market transition (current → next)
12. [ ] Store data points for historical analysis

### Priority 4: Polish (Later)
13. [ ] Write README with setup instructions
14. [ ] Add configuration file (thresholds, alerts, etc.)
15. [ ] Create simple test suite
16. [ ] Add export to CSV feature

---

## 📝 Implementation Notes

### Key Insights from Current Code:
- ✅ Gamma API endpoint: `GET /events/slug/{slug}` for specific markets
- ✅ WebSocket subscription uses `clobTokenIds` from market data
- ✅ Each outcome (UP/DOWN) has separate asset_id to track
- ✅ PING/PONG must be plain text, not JSON
- ✅ Event types: book, price_change, best_bid_ask, last_trade_price, market_resolved

### Current Limitations:
- ⚠️ No probability calculation (just raw price display)
- ⚠️ No volume tracking (trades are seen but not summed)
- ⚠️ No historical data storage
- ⚠️ Console output is verbose and hard to read
- ⚠️ No alerts on significant events
- ⚠️ Doesn't handle market transition automatically

### Quick Wins:
- Add chalk for colored output (5 min)
- Calculate probabilities from best_bid/ask (10 min)
- Sum trade volumes (15 min)
- Add alert on rapid price changes (20 min)
- Format output in clean sections (30 min)

---

## 🐛 Known Issues & Questions

### Confirmed Working:
- ✅ WebSocket connection stable
- ✅ PING/PONG heartbeat working
- ✅ Market discovery via Gamma API
- ✅ Subscription to clobTokenIds successful
- ✅ Receiving real-time events

### To Investigate:
- [ ] What's the exact price scale? (0-100? 0-1? Need to verify for probability calc)
- [ ] Do volumes accumulate or reset? (Need to track externally)
- [ ] How to detect market resolution in real-time?
- [ ] Is there a better way to find "next" market before it's active?
- [ ] Rate limits on Gamma API?

### Edge Cases to Handle:
- [ ] Market closes while monitoring → should auto-switch to next
- [ ] Next market not created yet → need fallback strategy  
- [ ] WebSocket disconnects during high volatility → ensure no data loss
- [ ] Multiple events for same asset_id in quick succession → debounce?

---

**Last Updated:** 2025-01-07
**Status:** Core functionality complete, enhancing analytics and display
**Current Focus:** Adding probability calculations, volume tracking, and better formatting
