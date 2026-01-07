import WebSocket from 'ws';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { MarketStateManager } from './market-state';
import { WSMessage, BestBidAsk, LastTradePrice } from './types';
import { printConnectionStatus, printDashboard } from './display';

const WS_URL = 'wss://ws-subscriptions-clob.polymarket.com/ws/market';
const PING_INTERVAL = 10000; // 10 seconds
const RECONNECT_BASE_DELAY = 1000; // 1 second
const RECONNECT_MAX_DELAY = 30000; // 30 seconds

// Configure proxy agent if needed
const proxyUrl = process.env.https_proxy || process.env.HTTPS_PROXY;
const wsAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;

export class PolymarketWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private subscribedAssetIds: string[] = [];
  private stateManager: MarketStateManager;
  private isIntentionallyClosed = false;
  private lastDisplayUpdate = 0;
  private displayUpdateInterval = 2000; // Update display every 2 seconds

  constructor(stateManager: MarketStateManager) {
    this.stateManager = stateManager;
  }

  /**
   * Connect to WebSocket
   */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    this.isIntentionallyClosed = false;
    printConnectionStatus('connecting', WS_URL);

    try {
      // Create WebSocket with proxy agent if configured
      const options: WebSocket.ClientOptions = {};
      if (wsAgent) {
        options.agent = wsAgent;
      }

      this.ws = new WebSocket(WS_URL, options);

      this.ws.on('open', () => this.handleOpen());
      this.ws.on('message', (data: WebSocket.Data) => this.handleMessage(data));
      this.ws.on('error', (error: Error) => this.handleError(error));
      this.ws.on('close', (code: number, reason: Buffer) => this.handleClose(code, reason));
      this.ws.on('pong', () => this.handlePong());
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Handle WebSocket open event
   */
  private handleOpen(): void {
    printConnectionStatus('connected');
    this.reconnectAttempts = 0;

    // Start ping/pong heartbeat
    this.startPingInterval();

    // Resubscribe to asset IDs if reconnecting
    if (this.subscribedAssetIds.length > 0) {
      console.log(`Resubscribing to ${this.subscribedAssetIds.length} assets...`);
      this.subscribe(this.subscribedAssetIds);
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(data: WebSocket.Data): void {
    try {
      const message = JSON.parse(data.toString()) as WSMessage;

      // Handle different event types
      if (message.event_type === 'best_bid_ask') {
        this.handleBestBidAsk(message as BestBidAsk);
      } else if (message.event_type === 'last_trade_price') {
        this.handleLastTrade(message as LastTradePrice);
      } else if (message.event_type === 'price_change') {
        // Price change events - can be handled similarly to best_bid_ask
        // logWSEvent('price_change', message.asset_id || 'unknown', { price: message.price });
      } else if (message.event_type === 'book') {
        // Order book updates - could be used for deeper analysis
        // logWSEvent('book', message.asset_id || 'unknown');
      }

      // Update display periodically (not on every message to reduce spam)
      this.updateDisplay();
    } catch (error) {
      if (data.toString() === 'PONG') {
        // Expected PONG response, ignore
        return;
      }

      // Ignore parsing errors for non-JSON messages
      // console.error('Failed to parse WebSocket message:', error);
    }
  }

  /**
   * Handle best bid/ask updates
   */
  private handleBestBidAsk(message: BestBidAsk): void {
    if (!message.asset_id) return;

    const market = this.stateManager.findMarketByAssetId(message.asset_id);
    if (!market) return;

    this.stateManager.updateBestBidAsk(
      market.marketId,
      message.asset_id,
      message.best_bid,
      message.best_ask
    );
  }

  /**
   * Handle trade updates
   */
  private handleLastTrade(message: LastTradePrice): void {
    if (!message.asset_id || !message.price || !message.size) return;

    const market = this.stateManager.findMarketByAssetId(message.asset_id);
    if (!market) return;

    this.stateManager.updateTrade(
      market.marketId,
      message.asset_id,
      message.price,
      message.size
    );
  }

  /**
   * Update display (throttled)
   */
  private updateDisplay(): void {
    const now = Date.now();
    if (now - this.lastDisplayUpdate > this.displayUpdateInterval) {
      const markets = this.stateManager.getMarkets();
      const alerts = this.stateManager.getRecentAlerts();

      printDashboard(markets, alerts);

      this.lastDisplayUpdate = now;
    }
  }

  /**
   * Handle WebSocket errors
   */
  private handleError(error: Error): void {
    console.error('WebSocket error:', error.message);
  }

  /**
   * Handle WebSocket close event
   */
  private handleClose(code: number, reason: Buffer): void {
    printConnectionStatus('disconnected', `Code: ${code}, Reason: ${reason.toString() || 'None'}`);

    this.stopPingInterval();

    if (!this.isIntentionallyClosed) {
      this.scheduleReconnect();
    }
  }

  /**
   * Handle pong response
   */
  private handlePong(): void {
    // Connection is alive
    // console.log('Received PONG');
  }

  /**
   * Start ping interval
   */
  private startPingInterval(): void {
    this.stopPingInterval();

    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.ping();
      }
    }, PING_INTERVAL);
  }

  /**
   * Stop ping interval
   */
  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    const delay = Math.min(
      RECONNECT_BASE_DELAY * Math.pow(2, this.reconnectAttempts),
      RECONNECT_MAX_DELAY
    );

    this.reconnectAttempts++;

    printConnectionStatus('reconnecting', `Attempt ${this.reconnectAttempts} in ${delay / 1000}s...`);

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Subscribe to asset IDs
   */
  subscribe(assetIds: string[]): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected, cannot subscribe');
      return;
    }

    // Store asset IDs for resubscription on reconnect
    this.subscribedAssetIds = [...new Set([...this.subscribedAssetIds, ...assetIds])];

    const subscribeMessage = {
      type: 'subscribe',
      channel: 'market',
      asset_ids: assetIds
    };

    console.log(`Subscribing to ${assetIds.length} asset(s)...`);
    this.ws.send(JSON.stringify(subscribeMessage));
  }

  /**
   * Close connection
   */
  close(): void {
    this.isIntentionallyClosed = true;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.stopPingInterval();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
