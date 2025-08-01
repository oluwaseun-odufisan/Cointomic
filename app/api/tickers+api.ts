/**
 * API handler for fetching historical ticker data for Bitcoin from CoinPaprika.
 * @module tickers+api
 */

import { ExpoRequest, ExpoResponse } from 'expo-router/server';

/** Interface for ticker data */
interface Ticker {
  timestamp: string;
  price: number;
  volume_24h: number;
  market_cap: number;
}

/** Interface for API response */
interface ApiResponse {
  data: Ticker[];
  status: { error_code: number; error_message: string | null };
}

/**
 * GET handler for fetching historical Bitcoin ticker data.
 * @param request - The incoming Expo request
 * @returns JSON response with ticker data or error
 */
export async function GET(request: ExpoRequest) {
  try {
    const url = new URL(request.url);
    const start = url.searchParams.get('start') || '2025-07-01';
    const interval = url.searchParams.get('interval') || '1d';

    const response = await fetch(
      `https://api.coinpaprika.com/v1/tickers/btc-bitcoin/historical?start=${start}&interval=${interval}`,
      {
        headers: {
          Accept: 'application/json',
        },
        next: { revalidate: 86400 }, // Cache for 1 day
      }
    );

    if (!response.ok) {
      throw new Error(`CoinPaprika API error: ${response.statusText}`);
    }

    const res = await response.json();
    const data: Ticker[] = res.map((item: any) => ({
      timestamp: item.timestamp,
      price: item.price,
      volume_24h: item.volume_24h,
      market_cap: item.market_cap,
    }));

    return ExpoResponse.json(
      { data, status: { error_code: 0, error_message: null } },
      { headers: { 'Cache-Control': 'public, max-age=86400' } }
    );
  } catch (error) {
    console.error('Error fetching tickers:', error);
    return ExpoResponse.json(
      {
        status: {
          error_code: 500,
          error_message: error instanceof Error ? error.message : 'Internal server error',
        },
        data: [],
      },
      { status: 500 }
    );
  }
}

/** Mock data for Bitcoin tickers (July 2025) */
const data: Ticker[] = [
  { timestamp: '2025-07-01T00:00:00Z', price: 82050.12, volume_24h: 45012345678, market_cap: 1619234567890 },
  { timestamp: '2025-07-02T00:00:00Z', price: 82500.45, volume_24h: 46234567890, market_cap: 1627890123456 },
  { timestamp: '2025-07-03T00:00:00Z', price: 81890.67, volume_24h: 47890123456, market_cap: 1616456789012 },
  { timestamp: '2025-07-04T00:00:00Z', price: 83012.89, volume_24h: 48901234567, market_cap: 1639012345678 },
  { timestamp: '2025-07-05T00:00:00Z', price: 83567.34, volume_24h: 45123456789, market_cap: 1649789012345 },
  { timestamp: '2025-07-06T00:00:00Z', price: 84234.56, volume_24h: 46789012345, market_cap: 1662345678901 },
  { timestamp: '2025-07-07T00:00:00Z', price: 84890.78, volume_24h: 47234567890, market_cap: 1675678901234 },
  { timestamp: '2025-07-08T00:00:00Z', price: 85345.23, volume_24h: 49890123456, market_cap: 1684567890123 },
  { timestamp: '2025-07-09T00:00:00Z', price: 86012.45, volume_24h: 51234567890, market_cap: 1697890123456 },
  { timestamp: '2025-07-10T00:00:00Z', price: 85789.67, volume_24h: 48789012345, market_cap: 1692345678901 },
  { timestamp: '2025-07-11T00:00:00Z', price: 86234.12, volume_24h: 52345678901, market_cap: 1701234567890 },
  { timestamp: '2025-07-12T00:00:00Z', price: 87012.34, volume_24h: 49890123456, market_cap: 1717890123456 },
  { timestamp: '2025-07-13T00:00:00Z', price: 86567.89, volume_24h: 47234567890, market_cap: 1709012345678 },
  { timestamp: '2025-07-14T00:00:00Z', price: 87123.45, volume_24h: 45678901234, market_cap: 1719876543210 },
  { timestamp: '2025-07-15T00:00:00Z', price: 87678.90, volume_24h: 48901234567, market_cap: 1730123456789 },
  { timestamp: '2025-07-16T00:00:00Z', price: 88012.34, volume_24h: 50123456789, market_cap: 1736789012345 },
  { timestamp: '2025-07-17T00:00:00Z', price: 87567.89, volume_24h: 47890123456, market_cap: 1729012345678 },
  { timestamp: '2025-07-18T00:00:00Z', price: 88234.56, volume_24h: 51234567890, market_cap: 1741234567890 },
  { timestamp: '2025-07-19T00:00:00Z', price: 89012.78, volume_24h: 49890123456, market_cap: 1756789012345 },
  { timestamp: '2025-07-20T00:00:00Z', price: 89567.23, volume_24h: 46789012345, market_cap: 1767890123456 },
  { timestamp: '2025-07-21T00:00:00Z', price: 90012.45, volume_24h: 52345678901, market_cap: 1779012345678 },
  { timestamp: '2025-07-22T00:00:00Z', price: 90567.89, volume_24h: 48901234567, market_cap: 1787890123456 },
  { timestamp: '2025-07-23T00:00:00Z', price: 91012.34, volume_24h: 50123456789, market_cap: 1796789012345 },
  { timestamp: '2025-07-24T00:00:00Z', price: 90789.67, volume_24h: 47890123456, market_cap: 1791234567890 },
  { timestamp: '2025-07-25T00:00:00Z', price: 91567.89, volume_24h: 51234567890, market_cap: 1807890123456 },
  { timestamp: '2025-07-26T00:00:00Z', price: 92012.34, volume_24h: 49890123456, market_cap: 1816789012345 },
  { timestamp: '2025-07-27T00:00:00Z', price: 92567.89, volume_24h: 46789012345, market_cap: 1827890123456 },
  { timestamp: '2025-07-28T00:00:00Z', price: 93012.45, volume_24h: 52345678901, market_cap: 1839012345678 },
  { timestamp: '2025-07-29T00:00:00Z', price: 93567.89, volume_24h: 48901234567, market_cap: 1847890123456 },
  { timestamp: '2025-07-30T00:00:00Z', price: 94012.34, volume_24h: 50123456789, market_cap: 1856789012345 },
  { timestamp: '2025-07-31T00:00:00Z', price: 85230.15, volume_24h: 89234567890, market_cap: 1682134567890 },
];