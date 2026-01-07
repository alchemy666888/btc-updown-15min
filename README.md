# 📊 Polymarket BTC Up/Down 15m Event Monitor

A real-time monitoring system for Polymarket's BTC price prediction markets with 15-minute intervals. This tool connects to Polymarket's Gamma API and WebSocket to track live market data, probabilities, volumes, and price movements.

## ✨ Features

### Core Functionality
- ✅ Real-time WebSocket connection to Polymarket CLOB
- ✅ Automatic discovery of current and next 15m BTC markets
- ✅ Live probability calculations from bid/ask prices
- ✅ Volume tracking per outcome (UP vs DOWN)
- ✅ Price movement alerts (>5% swings)
- ✅ Automatic reconnection with exponential backoff
- ✅ PING/PONG heartbeat monitoring

### Display & UI
- 🎨 Color-coded terminal output (Green for UP, Red for DOWN)
- 📊 Real-time probability distribution visualization
- ⏱️ Countdown timer for market close
- 📈 Price change tracking with percentage movements
- 🚨 Alert notifications for significant market events
- 📋 Clean, organized dashboard layout

### Analytics
- 📊 Implied probability calculation from market prices
- 📈 Cumulative volume tracking
- 💹 Min/Max price tracking
- 📉 Price history storage (last 100 updates)
- ⚡ Price swing detection and alerts

## 🚀 Quick Start

### Prerequisites

- Node.js v16 or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd btc-updown-15min

# Install dependencies
npm install

# Build the project
npm run build

# Run the monitor
npm start
```

### Development Mode

```bash
# Run with ts-node (no build required)
npm run dev
```

## 📖 Usage

Simply run the application, and it will:

1. **Discover Markets**: Automatically finds current and next 15m BTC markets
2. **Connect**: Establishes WebSocket connection to Polymarket
3. **Subscribe**: Subscribes to market updates for UP and DOWN outcomes
4. **Monitor**: Displays live data with updates every 2 seconds
5. **Alert**: Notifies you of significant price movements

```bash
npm start
```

### Sample Output

```
🚀 Polymarket BTC 15m Up/Down Monitor

📊 Discovering markets...

✅ Found 1 current market, 1 next market

📈 Current Market: Will BTC price go UP or DOWN in the next 15 minutes?
   Outcomes: UP, DOWN
   Ends: 1/7/2026, 2:15:00 PM
   Asset IDs: 0x123..., 0x456...

🔌 Connecting to Polymarket WebSocket...

✅ Monitoring started! Press Ctrl+C to stop.

════════════════════════════════════════════════════════════════════════════════

  POLYMARKET BTC 15M UP/DOWN MONITOR
════════════════════════════════════════════════════════════════════════════════
  Connected at: 2:00:45 PM
  Monitoring 2 market(s)

  [CURRENT] Will BTC price go UP or DOWN in the next 15 minutes?
  Closes: 14m 15s (2:15:00 PM)

  [NEXT] Will BTC price go UP or DOWN in the next 15 minutes?
  Closes: 29m 15s (2:30:00 PM)

[CURRENT] Will BTC price go UP or DOWN in the next 15 minutes?
────────────────────────────────────────────────────────────────────────────────
  UP    : 52.34%   (Bid: 52.00 / Ask: 52.68) ▲ +2.34 (+4.68%) | Vol: 125.50
  DOWN  : 47.66%   (Bid: 47.32 / Ask: 48.00) ▼ -2.34 (-4.68%) | Vol: 98.25
  Time remaining: 14m 15s

  Probability Distribution:
  ████████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░
  UP 52.3%                                          DOWN 47.7%

════════════════════════════════════════════════════════════════════════════════
  RECENT ALERTS
════════════════════════════════════════════════════════════════════════════════
  ⚠️  2:00:30 PM UP: +5.23% (50.00 → 52.62)
  🚨  2:00:45 PM DOWN: -6.12% (50.00 → 46.94)

────────────────────────────────────────────────────────────────────────────────
  Last update: 2:00:45 PM
────────────────────────────────────────────────────────────────────────────────
```

## 🏗️ Project Structure

```
btc-updown-15min/
├── src/
│   ├── index.ts          # Main application entry point
│   ├── types.ts          # TypeScript interfaces and types
│   ├── api.ts            # Gamma API interaction
│   ├── websocket.ts      # WebSocket connection handler
│   ├── market-state.ts   # Market state management
│   └── display.ts        # Terminal UI and formatting
├── dist/                 # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
├── TODO.md               # Development roadmap
└── README.md
```

## 🔧 Configuration

The monitor uses default configuration values that can be adjusted in `src/market-state.ts`:

```typescript
private config = {
  priceAlertThreshold: 5,        // % change to trigger alert
  volumeSpikeMultiplier: 2,      // multiplier for volume spike detection
  marketCloseWarningMinutes: 2,  // minutes before close to warn
  maxPriceHistory: 100           // number of price points to store
};
```

## 🌐 API Endpoints

- **Gamma API**: `https://gamma-api.polymarket.com`
  - Market lookup: `GET /events/slug/{slug}`
  - Events list: `GET /events`

- **WebSocket**: `wss://ws-subscriptions-clob.polymarket.com/ws/market`
  - Public access (no authentication required)

## 📊 Data Flow

1. **Market Discovery** (API) → Find current/next 15m markets
2. **WebSocket Connect** → Establish real-time connection
3. **Subscribe** → Listen to specific CLOB token IDs (asset IDs)
4. **Receive Events**:
   - `best_bid_ask` → Update probabilities
   - `last_trade_price` → Update volumes
   - `book` → Order book updates
   - `price_change` → Price movements
5. **Process & Display** → Calculate metrics and render UI

## 🔍 Market Slug Format

Markets follow the pattern: `btc-updown-15m-{unix_timestamp}`

- Timestamp represents the 15-minute interval (in Unix seconds)
- Example: `btc-updown-15m-1704643200` for interval starting at that timestamp

## 🐛 Troubleshooting

### "No active BTC 15m markets found"
- Markets may not be active at the current time
- Try again during active market hours
- Check if Polymarket has changed market naming conventions

### WebSocket connection fails
- Check internet connectivity
- Verify firewall allows WebSocket connections
- Monitor will auto-reconnect with exponential backoff

### No data updates
- Ensure WebSocket is connected (look for ✅ connected status)
- Verify asset IDs are correct
- Check if market is still active (not closed)

## 📝 Development

### Build
```bash
npm run build
```

### Watch Mode
```bash
npm run watch
```

### Run
```bash
npm start
# or in dev mode
npm run dev
```

## 🎯 Roadmap

See [TODO.md](TODO.md) for detailed development roadmap and future features:

- Enhanced analytics (moving averages, trend detection)
- Order book depth visualization
- Multiple market support (ETH, SOL, different intervals)
- Data export (CSV, JSON)
- Web dashboard
- Historical data analysis

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please feel free to submit issues or pull requests.

## ⚠️ Disclaimer

This tool is for informational and educational purposes only. It is not financial advice. Use at your own risk. Always do your own research before making any trading decisions.

## 🔗 Resources

- [Polymarket](https://polymarket.com)
- [Polymarket Gamma API Docs](https://docs.polymarket.com)
- [CLOB API Documentation](https://docs.polymarket.com/api-reference)

---

**Built with TypeScript, WebSocket, and Chalk** 🚀
