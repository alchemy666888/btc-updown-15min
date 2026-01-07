import axios, { AxiosError } from 'axios';
import { Market, MarketResponse } from './types';

const GAMMA_API_BASE = 'https://gamma-api.polymarket.com';

/**
 * Generate slug for BTC 15m market based on timestamp
 */
export function generateMarketSlug(timestamp: number): string {
  return `btc-updown-15m-${timestamp}`;
}

/**
 * Calculate current and next 15-minute interval timestamps
 */
export function get15MinIntervals(): { current: number; next: number } {
  const now = Date.now();
  const fifteenMinutesMs = 15 * 60 * 1000;

  // Round down to nearest 15-minute interval
  const currentInterval = Math.floor(now / fifteenMinutesMs) * fifteenMinutesMs;
  const nextInterval = currentInterval + fifteenMinutesMs;

  // Convert to Unix timestamp in seconds
  return {
    current: Math.floor(currentInterval / 1000),
    next: Math.floor(nextInterval / 1000)
  };
}

/**
 * Fetch market by slug from Gamma API
 */
export async function getMarketBySlug(slug: string): Promise<Market | null> {
  try {
    const response = await axios.get<MarketResponse>(
      `${GAMMA_API_BASE}/events/slug/${slug}`
    );

    if (response.data) {
      return response.data;
    }

    return null;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        console.log(`Market not found: ${slug}`);
        return null;
      }
      console.error(`API Error for ${slug}:`, axiosError.message);
    } else {
      console.error(`Unknown error fetching ${slug}:`, error);
    }
    return null;
  }
}

/**
 * Search for active BTC markets as fallback
 */
export async function searchBTCMarkets(): Promise<Market[]> {
  try {
    const response = await axios.get(`${GAMMA_API_BASE}/events`, {
      params: {
        active: true,
        archived: false,
        closed: false,
        limit: 50
      }
    });

    if (response.data && Array.isArray(response.data)) {
      return response.data.filter((market: Market) =>
        market.slug.includes('btc') && market.slug.includes('updown-15m')
      );
    }

    return [];
  } catch (error) {
    console.error('Error searching BTC markets:', error);
    return [];
  }
}

/**
 * Discover current and next BTC 15m markets
 */
export async function discoverMarkets(): Promise<{
  current: Market | null;
  next: Market | null;
}> {
  const intervals = get15MinIntervals();

  console.log('Discovering markets...');
  console.log(`Current interval: ${new Date(intervals.current * 1000).toISOString()}`);
  console.log(`Next interval: ${new Date(intervals.next * 1000).toISOString()}`);

  const currentSlug = generateMarketSlug(intervals.current);
  const nextSlug = generateMarketSlug(intervals.next);

  console.log(`Looking for: ${currentSlug}`);
  console.log(`Looking for: ${nextSlug}`);

  const [current, next] = await Promise.all([
    getMarketBySlug(currentSlug),
    getMarketBySlug(nextSlug)
  ]);

  // Fallback: search all active markets if direct lookup fails
  if (!current && !next) {
    console.log('Direct lookup failed, searching all active BTC markets...');
    const markets = await searchBTCMarkets();

    if (markets.length > 0) {
      console.log(`Found ${markets.length} active BTC 15m markets`);
      // Sort by endDate to get current and next
      markets.sort((a, b) =>
        new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
      );

      return {
        current: markets[0] || null,
        next: markets[1] || null
      };
    }
  }

  return { current, next };
}

/**
 * Format time remaining until market close
 */
export function getTimeRemaining(endDate: string): string {
  const now = Date.now();
  const end = new Date(endDate).getTime();
  const diff = end - now;

  if (diff <= 0) {
    return 'CLOSED';
  }

  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  return `${minutes}m ${seconds}s`;
}
