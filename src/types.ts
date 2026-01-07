// Polymarket Market Data Types

export interface Market {
  id: string;
  question: string;
  slug: string;
  outcomes: string[];
  outcomePrices: string[];
  clobTokenIds: string[];
  active: boolean;
  closed: boolean;
  endDate: string;
  volume: string;
}

export interface MarketResponse {
  id: string;
  question: string;
  slug: string;
  outcomes: string[];
  outcomePrices: string[];
  clobTokenIds: string[];
  active: boolean;
  closed: boolean;
  endDate: string;
  volume: string;
}

// WebSocket Message Types
export interface WSMessage {
  event_type: string;
  asset_id?: string;
  market?: string;
  timestamp?: number;
  price?: string;
  side?: string;
  size?: string;
  hash?: string;
}

export interface BookUpdate extends WSMessage {
  event_type: 'book';
  price: string;
  side: 'BUY' | 'SELL';
  size: string;
}

export interface PriceChange extends WSMessage {
  event_type: 'price_change';
  price: string;
}

export interface LastTradePrice extends WSMessage {
  event_type: 'last_trade_price';
  price: string;
  size: string;
}

export interface BestBidAsk extends WSMessage {
  event_type: 'best_bid_ask';
  best_bid?: string;
  best_ask?: string;
}

// Market State Tracking
export interface OutcomeState {
  name: string;
  assetId: string;
  bestBid?: number;
  bestAsk?: number;
  lastPrice?: number;
  probability?: number;
  volume: number;
  initialPrice?: number;
  minPrice?: number;
  maxPrice?: number;
  priceHistory: PricePoint[];
}

export interface PricePoint {
  timestamp: number;
  price: number;
}

export interface MarketState {
  marketId: string;
  question: string;
  slug: string;
  endDate: Date;
  type: 'CURRENT' | 'NEXT';
  outcomes: Map<string, OutcomeState>;
  startTime: number;
  lastUpdateTime: number;
}

// Alert Types
export interface Alert {
  timestamp: number;
  type: 'PRICE_SWING' | 'VOLUME_SPIKE' | 'MARKET_CLOSE' | 'PROBABILITY_FLIP';
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  marketId: string;
  assetId?: string;
}

// Configuration
export interface MonitorConfig {
  priceAlertThreshold: number; // % change to trigger alert
  volumeSpikeMultiplier: number; // multiplier for volume spike detection
  marketCloseWarningMinutes: number; // minutes before close to warn
  updateDisplayInterval: number; // ms between display updates
}
