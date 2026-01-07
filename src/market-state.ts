import { MarketState, OutcomeState, Alert, Market, PricePoint } from './types';

export class MarketStateManager {
  private markets: Map<string, MarketState> = new Map();
  private alerts: Alert[] = [];
  private config = {
    priceAlertThreshold: 5, // 5% price change
    volumeSpikeMultiplier: 2,
    marketCloseWarningMinutes: 2,
    maxPriceHistory: 100
  };

  /**
   * Initialize market state from API data
   */
  initializeMarket(market: Market, type: 'CURRENT' | 'NEXT'): MarketState {
    const outcomes = new Map<string, OutcomeState>();

    market.outcomes.forEach((name, index) => {
      const assetId = market.clobTokenIds[index];
      const initialPrice = parseFloat(market.outcomePrices[index]);

      outcomes.set(assetId, {
        name,
        assetId,
        volume: 0,
        initialPrice,
        minPrice: initialPrice,
        maxPrice: initialPrice,
        priceHistory: [{
          timestamp: Date.now(),
          price: initialPrice
        }]
      });
    });

    const state: MarketState = {
      marketId: market.id,
      question: market.question,
      slug: market.slug,
      endDate: new Date(market.endDate),
      type,
      outcomes,
      startTime: Date.now(),
      lastUpdateTime: Date.now()
    };

    this.markets.set(market.id, state);
    console.log(`Initialized ${type} market: ${market.question}`);

    return state;
  }

  /**
   * Update market with best bid/ask data
   */
  updateBestBidAsk(
    marketId: string,
    assetId: string,
    bestBid?: string,
    bestAsk?: string
  ): void {
    const market = this.markets.get(marketId);
    if (!market) return;

    const outcome = market.outcomes.get(assetId);
    if (!outcome) return;

    if (bestBid) {
      outcome.bestBid = parseFloat(bestBid);
    }

    if (bestAsk) {
      outcome.bestAsk = parseFloat(bestAsk);
    }

    // Calculate probability from midpoint of bid/ask
    if (outcome.bestBid !== undefined && outcome.bestAsk !== undefined) {
      const midPrice = (outcome.bestBid + outcome.bestAsk) / 2;
      outcome.probability = midPrice; // Price IS the probability (0-100)

      // Update price tracking
      this.updatePriceTracking(outcome, midPrice);

      // Check for price alerts
      this.checkPriceAlert(market, outcome, midPrice);
    }

    market.lastUpdateTime = Date.now();
  }

  /**
   * Update market with trade data
   */
  updateTrade(
    marketId: string,
    assetId: string,
    price: string,
    size: string
  ): void {
    const market = this.markets.get(marketId);
    if (!market) return;

    const outcome = market.outcomes.get(assetId);
    if (!outcome) return;

    const tradePrice = parseFloat(price);
    const tradeSize = parseFloat(size);

    outcome.lastPrice = tradePrice;
    outcome.volume += tradeSize;

    // Update price tracking
    this.updatePriceTracking(outcome, tradePrice);

    // Check for price alerts
    this.checkPriceAlert(market, outcome, tradePrice);

    market.lastUpdateTime = Date.now();
  }

  /**
   * Update price tracking (history, min/max)
   */
  private updatePriceTracking(outcome: OutcomeState, price: number): void {
    // Add to price history
    const pricePoint: PricePoint = {
      timestamp: Date.now(),
      price
    };

    outcome.priceHistory.push(pricePoint);

    // Keep only last N price points
    if (outcome.priceHistory.length > this.config.maxPriceHistory) {
      outcome.priceHistory.shift();
    }

    // Update min/max
    if (outcome.minPrice === undefined || price < outcome.minPrice) {
      outcome.minPrice = price;
    }

    if (outcome.maxPrice === undefined || price > outcome.maxPrice) {
      outcome.maxPrice = price;
    }
  }

  /**
   * Check for price alerts
   */
  private checkPriceAlert(
    market: MarketState,
    outcome: OutcomeState,
    currentPrice: number
  ): void {
    if (!outcome.initialPrice) return;

    const priceChange = ((currentPrice - outcome.initialPrice) / outcome.initialPrice) * 100;

    if (Math.abs(priceChange) >= this.config.priceAlertThreshold) {
      // Check if we already alerted recently (avoid spam)
      const recentAlert = this.alerts
        .filter(a => a.assetId === outcome.assetId)
        .filter(a => Date.now() - a.timestamp < 60000) // within last minute
        .find(a => a.type === 'PRICE_SWING');

      if (!recentAlert) {
        const alert: Alert = {
          timestamp: Date.now(),
          type: 'PRICE_SWING',
          message: `${outcome.name}: ${priceChange > 0 ? '+' : ''}${priceChange.toFixed(2)}% (${outcome.initialPrice.toFixed(2)} → ${currentPrice.toFixed(2)})`,
          severity: Math.abs(priceChange) > 10 ? 'CRITICAL' : 'WARNING',
          marketId: market.marketId,
          assetId: outcome.assetId
        };

        this.alerts.push(alert);
      }
    }
  }

  /**
   * Get all markets
   */
  getMarkets(): MarketState[] {
    return Array.from(this.markets.values());
  }

  /**
   * Get market by ID
   */
  getMarket(marketId: string): MarketState | undefined {
    return this.markets.get(marketId);
  }

  /**
   * Get recent alerts
   */
  getRecentAlerts(count: number = 10): Alert[] {
    return this.alerts.slice(-count);
  }

  /**
   * Get all alerts
   */
  getAllAlerts(): Alert[] {
    return this.alerts;
  }

  /**
   * Clear old alerts
   */
  clearOldAlerts(maxAge: number = 3600000): void {
    const cutoff = Date.now() - maxAge;
    this.alerts = this.alerts.filter(a => a.timestamp > cutoff);
  }

  /**
   * Find market ID by asset ID
   */
  findMarketByAssetId(assetId: string): MarketState | undefined {
    for (const market of this.markets.values()) {
      if (market.outcomes.has(assetId)) {
        return market;
      }
    }
    return undefined;
  }
}
