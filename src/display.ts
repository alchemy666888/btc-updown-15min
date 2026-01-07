import chalk from 'chalk';
import { MarketState, OutcomeState, Alert } from './types';
import { getTimeRemaining } from './api';

/**
 * Clear console and move cursor to top
 */
export function clearScreen(): void {
  console.clear();
}

/**
 * Print section header
 */
function printHeader(text: string): void {
  console.log('\n' + chalk.cyan.bold('═'.repeat(80)));
  console.log(chalk.cyan.bold(`  ${text}`));
  console.log(chalk.cyan.bold('═'.repeat(80)));
}

/**
 * Print market summary header
 */
export function printMarketSummary(markets: MarketState[]): void {
  printHeader('POLYMARKET BTC 15M UP/DOWN MONITOR');

  console.log(chalk.gray(`  Connected at: ${new Date().toLocaleTimeString()}`));
  console.log(chalk.gray(`  Monitoring ${markets.length} market(s)\n`));

  markets.forEach(market => {
    const typeLabel = market.type === 'CURRENT'
      ? chalk.yellow.bold('[CURRENT]')
      : chalk.blue.bold('[NEXT]');

    const timeRemaining = getTimeRemaining(market.endDate.toISOString());
    const timeColor = timeRemaining.startsWith('CLOSED')
      ? chalk.red
      : timeRemaining.includes('0m') || timeRemaining.includes('1m')
        ? chalk.red.bold
        : chalk.gray;

    console.log(`  ${typeLabel} ${chalk.white(market.question)}`);
    console.log(`  ${chalk.gray('Closes:')} ${timeColor(timeRemaining)} ${chalk.gray(`(${market.endDate.toLocaleTimeString()})`)}`);
    console.log();
  });
}

/**
 * Print outcome probabilities
 */
export function printOutcomeProbabilities(market: MarketState): void {
  const outcomes = Array.from(market.outcomes.values());

  if (outcomes.length === 0) return;

  // Print market title
  const typeLabel = market.type === 'CURRENT' ? chalk.yellow('[CURRENT]') : chalk.blue('[NEXT]');
  console.log(`\n${typeLabel} ${chalk.white.bold(market.question)}`);
  console.log(chalk.gray('─'.repeat(80)));

  // Calculate probabilities
  outcomes.forEach(outcome => {
    const name = outcome.name;
    const color = name === 'UP' ? chalk.green : chalk.red;

    // Display probability
    let probText = 'Waiting...';
    if (outcome.probability !== undefined) {
      probText = `${outcome.probability.toFixed(2)}%`;
    }

    // Display bid/ask spread
    let spreadText = '';
    if (outcome.bestBid !== undefined && outcome.bestAsk !== undefined) {
      spreadText = chalk.gray(` (Bid: ${outcome.bestBid.toFixed(2)} / Ask: ${outcome.bestAsk.toFixed(2)})`);
    }

    // Display price change
    let changeText = '';
    if (outcome.initialPrice !== undefined && outcome.probability !== undefined) {
      const change = outcome.probability - outcome.initialPrice;
      const changePercent = (change / outcome.initialPrice) * 100;

      if (Math.abs(changePercent) > 0.1) {
        const changeColor = change > 0 ? chalk.green : chalk.red;
        changeText = ` ${changeColor(change > 0 ? '▲' : '▼')} ${changeColor(change > 0 ? '+' : '')}${change.toFixed(2)} (${changePercent > 0 ? '+' : ''}${changePercent.toFixed(2)}%)`;
      }
    }

    // Display volume
    const volumeText = outcome.volume > 0
      ? chalk.gray(` | Vol: ${outcome.volume.toFixed(2)}`)
      : '';

    console.log(`  ${color.bold(name.padEnd(6))}: ${color.bold(probText.padEnd(8))}${spreadText}${changeText}${volumeText}`);
  });

  // Show time remaining
  const timeRemaining = getTimeRemaining(market.endDate.toISOString());
  const timeColor = timeRemaining.startsWith('CLOSED')
    ? chalk.red
    : timeRemaining.includes('0m') || timeRemaining.includes('1m')
      ? chalk.red.bold
      : chalk.gray;

  console.log(chalk.gray(`  Time remaining: ${timeColor(timeRemaining)}`));
}

/**
 * Print comparison view (UP vs DOWN)
 */
export function printComparison(market: MarketState): void {
  const outcomes = Array.from(market.outcomes.values());
  const upOutcome = outcomes.find(o => o.name === 'UP');
  const downOutcome = outcomes.find(o => o.name === 'DOWN');

  if (!upOutcome || !downOutcome) return;

  if (upOutcome.probability !== undefined && downOutcome.probability !== undefined) {
    const upProb = upOutcome.probability;
    const downProb = downOutcome.probability;

    // Create visual bar
    const barWidth = 60;
    const upWidth = Math.round((upProb / 100) * barWidth);
    const downWidth = barWidth - upWidth;

    const upBar = chalk.green('█'.repeat(upWidth));
    const downBar = chalk.red('█'.repeat(downWidth));

    console.log(`\n  ${chalk.gray('Probability Distribution:')}`);
    console.log(`  ${upBar}${downBar}`);
    console.log(`  ${chalk.green.bold('UP ' + upProb.toFixed(1) + '%')}${' '.repeat(barWidth - 15)}${chalk.red.bold('DOWN ' + downProb.toFixed(1) + '%')}`);
  }
}

/**
 * Print recent alerts
 */
export function printAlerts(alerts: Alert[]): void {
  if (alerts.length === 0) return;

  printHeader('RECENT ALERTS');

  alerts.slice(-5).forEach(alert => {
    const time = new Date(alert.timestamp).toLocaleTimeString();

    let color: typeof chalk.yellow = chalk.yellow;
    let icon = '⚠️';

    if (alert.severity === 'CRITICAL') {
      color = chalk.red;
      icon = '🚨';
    } else if (alert.severity === 'INFO') {
      color = chalk.blue;
      icon = 'ℹ️';
    }

    console.log(`  ${icon}  ${chalk.gray(time)} ${color(alert.message)}`);
  });

  console.log();
}

/**
 * Print order book (if available)
 */
export function printOrderBook(outcome: OutcomeState): void {
  if (outcome.bestBid === undefined || outcome.bestAsk === undefined) return;

  console.log(`\n  ${chalk.gray('Order Book for')} ${chalk.white.bold(outcome.name)}:`);

  const spread = outcome.bestAsk - outcome.bestBid;
  const spreadPercent = (spread / outcome.bestBid) * 100;

  console.log(`    ${chalk.red('Ask:')} ${outcome.bestAsk.toFixed(2)}`);
  console.log(`    ${chalk.gray('Spread:')} ${spread.toFixed(2)} (${spreadPercent.toFixed(2)}%)`);
  console.log(`    ${chalk.green('Bid:')} ${outcome.bestBid.toFixed(2)}`);
}

/**
 * Print full dashboard
 */
export function printDashboard(markets: MarketState[], alerts: Alert[]): void {
  // Don't clear on every update - only show meaningful updates
  // clearScreen();

  printMarketSummary(markets);

  markets.forEach(market => {
    printOutcomeProbabilities(market);
    printComparison(market);
  });

  printAlerts(alerts);

  console.log(chalk.gray('\n─'.repeat(80)));
  console.log(chalk.gray(`  Last update: ${new Date().toLocaleTimeString()}`));
  console.log(chalk.gray('─'.repeat(80) + '\n'));
}

/**
 * Print WebSocket event (minimal logging)
 */
export function logWSEvent(eventType: string, assetId: string, data?: any): void {
  const color = eventType === 'best_bid_ask' ? chalk.cyan :
    eventType === 'last_trade_price' ? chalk.magenta :
      eventType === 'book' ? chalk.blue :
        chalk.gray;

  console.log(chalk.gray(`[${new Date().toLocaleTimeString()}]`), color(eventType), chalk.gray(assetId.substring(0, 8)), data ? chalk.gray(JSON.stringify(data)) : '');
}

/**
 * Print connection status
 */
export function printConnectionStatus(status: 'connecting' | 'connected' | 'disconnected' | 'reconnecting', message?: string): void {
  const statusIcons = {
    connecting: '🔄',
    connected: '✅',
    disconnected: '❌',
    reconnecting: '🔄'
  };

  const statusColors = {
    connecting: chalk.yellow,
    connected: chalk.green,
    disconnected: chalk.red,
    reconnecting: chalk.yellow
  };

  const icon = statusIcons[status];
  const color = statusColors[status];

  console.log(`${icon}  ${color.bold(status.toUpperCase())}${message ? ': ' + chalk.gray(message) : ''}`);
}
