#!/usr/bin/env node

import { discoverMarkets } from './api';
import { MarketStateManager } from './market-state';
import { PolymarketWebSocket } from './websocket';
import { printConnectionStatus } from './display';

/**
 * Main application entry point
 */
async function main() {
  console.log('🚀 Polymarket BTC 15m Up/Down Monitor\n');

  // Step 1: Discover current and next markets
  console.log('📊 Discovering markets...\n');
  const { current, next } = await discoverMarkets();

  if (!current && !next) {
    console.error('❌ No active BTC 15m markets found!');
    console.log('This could mean:');
    console.log('  - Markets are not currently active');
    console.log('  - API endpoint has changed');
    console.log('  - Network connectivity issues\n');
    process.exit(1);
  }

  console.log(`✅ Found ${current ? 1 : 0} current market, ${next ? 1 : 0} next market\n`);

  // Step 2: Initialize market state manager
  const stateManager = new MarketStateManager();

  const assetIds: string[] = [];

  if (current) {
    console.log(`📈 Current Market: ${current.question}`);
    console.log(`   Outcomes: ${current.outcomes.join(', ')}`);
    console.log(`   Ends: ${new Date(current.endDate).toLocaleString()}`);
    console.log(`   Asset IDs: ${current.clobTokenIds.join(', ')}\n`);

    stateManager.initializeMarket(current, 'CURRENT');
    assetIds.push(...current.clobTokenIds);
  }

  if (next) {
    console.log(`📈 Next Market: ${next.question}`);
    console.log(`   Outcomes: ${next.outcomes.join(', ')}`);
    console.log(`   Ends: ${new Date(next.endDate).toLocaleString()}`);
    console.log(`   Asset IDs: ${next.clobTokenIds.join(', ')}\n`);

    stateManager.initializeMarket(next, 'NEXT');
    assetIds.push(...next.clobTokenIds);
  }

  // Step 3: Connect to WebSocket
  console.log('🔌 Connecting to Polymarket WebSocket...\n');
  const wsClient = new PolymarketWebSocket(stateManager);

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down gracefully...');

    const markets = stateManager.getMarkets();
    const alerts = stateManager.getAllAlerts();

    console.log('\n📊 Session Summary:');
    console.log(`   Markets monitored: ${markets.length}`);
    console.log(`   Total alerts: ${alerts.length}`);

    markets.forEach(market => {
      const uptime = Date.now() - market.startTime;
      console.log(`\n   ${market.type} Market: ${market.question}`);
      console.log(`   Monitoring time: ${Math.floor(uptime / 60000)}m ${Math.floor((uptime % 60000) / 1000)}s`);

      market.outcomes.forEach(outcome => {
        console.log(`     ${outcome.name}: Vol ${outcome.volume.toFixed(2)}, Updates: ${outcome.priceHistory.length}`);
      });
    });

    console.log('\n✅ Goodbye!\n');

    wsClient.close();
    process.exit(0);
  });

  // Connect and subscribe
  wsClient.connect();

  // Wait for connection to establish
  await new Promise(resolve => setTimeout(resolve, 2000));

  if (wsClient.isConnected() && assetIds.length > 0) {
    wsClient.subscribe(assetIds);
  } else {
    console.error('❌ Failed to connect to WebSocket');
    process.exit(1);
  }

  console.log('\n✅ Monitoring started! Press Ctrl+C to stop.\n');
  console.log('═'.repeat(80) + '\n');

  // Keep the process running
  setInterval(() => {
    // Periodic cleanup of old alerts (every 5 minutes)
    stateManager.clearOldAlerts();
  }, 5 * 60 * 1000);
}

// Run the application
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
