/**
 * API handler for fetching latest cryptocurrency listings from CoinMarketCap.
 * @module listing+api
 */

import { Response } from 'expo-router/server';

/** Interface for cryptocurrency quote */
interface Quote {
  EUR: {
    price: number;
    volume_24h: number;
    volume_change_24h: number;
    percent_change_1h: number;
    percent_change_24h: number;
    percent_change_7d: number;
    percent_change_30d: number;
    percent_change_60d: number;
    percent_change_90d: number;
    market_cap: number;
    market_cap_dominance: number;
    fully_diluted_market_cap: number;
    tvl: number | null;
    last_updated: string;
  };
}

/** Interface for cryptocurrency listing */
interface CryptoListing {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  num_market_pairs: number;
  date_added: string;
  tags: string[];
  max_supply: number | null;
  circulating_supply: number;
  total_supply: number;
  infinite_supply: boolean;
  platform: { id: number; name: string; symbol: string; slug: string; token_address: string } | null;
  cmc_rank: number;
  self_reported_circulating_supply: number | null;
  self_reported_market_cap: number | null;
  tvl_ratio: number | null;
  last_updated: string;
  quote: Quote;
}

/** Interface for API response */
interface ApiResponse {
  data: CryptoListing[];
  status: { error_code: number; error_message: string | null };
}

/**
 * GET handler for fetching latest cryptocurrency listings.
 * @param request - The incoming Expo request
 * @returns JSON response with cryptocurrency listings or error
 */
export async function GET(request: Request) {
  const API_KEY = process.env.CRYPTO_API_KEY;
  if (!API_KEY) {
    return Response.json(
      { status: { error_code: 401, error_message: 'API key is missing' } },
      { status: 401 }
    );
  }

  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '5', 10);

    if (isNaN(limit) || limit < 1) {
      return Response.json(
        { status: { error_code: 400, error_message: 'Invalid limit parameter' } },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=1&limit=${limit}&convert=EUR`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': API_KEY,
          Accept: 'application/json',
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      throw new Error(`CoinMarketCap API error: ${response.statusText}`);
    }

    const res: ApiResponse = await response.json();
    return Response.json(res.data, {
      headers: { 'Cache-Control': 'public, max-age=300' },
    });
  } catch (error) {
    console.error('Error fetching crypto listings:', error);
    return Response.json(
      {
        status: {
          error_code: 500,
          error_message: error instanceof Error ? error.message : 'Internal server error',
        },
      },
      { status: 500 }
    );
  }
}

/** Mock data for cryptocurrency listings (July 2025) */
const data: CryptoListing[] = [
  {
    id: 1,
    name: 'Bitcoin',
    symbol: 'BTC',
    slug: 'bitcoin',
    num_market_pairs: 11250,
    date_added: '2009-01-03T00:00:00.000Z',
    tags: [
      'mineable',
      'pow',
      'sha-256',
      'store-of-value',
      'bitcoin-ecosystem',
      'institutional-adoption',
    ],
    max_supply: 21000000,
    circulating_supply: 19730250,
    total_supply: 19730250,
    infinite_supply: false,
    platform: null,
    cmc_rank: 1,
    self_reported_circulating_supply: null,
    self_reported_market_cap: null,
    tvl_ratio: null,
    last_updated: '2025-07-31T00:00:00.000Z',
    quote: {
      EUR: {
        price: 78650.42,
        volume_24h: 89234567890,
        volume_change_24h: 45.2312,
        percent_change_1h: -0.321456,
        percent_change_24h: 3.121456,
        percent_change_7d: 12.456789,
        percent_change_30d: 25.678901,
        percent_change_60d: 30.234567,
        percent_change_90d: 45.789012,
        market_cap: 1552134567890,
        market_cap_dominance: 50.1234,
        fully_diluted_market_cap: 1651658820000,
        tvl: null,
        last_updated: '2025-07-31T00:00:00.000Z',
      },
    },
  },
  {
    id: 1027,
    name: 'Ethereum',
    symbol: 'ETH',
    slug: 'ethereum',
    num_market_pairs: 8750,
    date_added: '2015-07-30T00:00:00.000Z',
    tags: ['smart-contracts', 'ethereum-ecosystem', 'layer-1', 'pos'],
    max_supply: null,
    circulating_supply: 120350789,
    total_supply: 120350789,
    infinite_supply: true,
    platform: null,
    cmc_rank: 2,
    self_reported_circulating_supply: null,
    self_reported_market_cap: null,
    tvl_ratio: null,
    last_updated: '2025-07-31T00:00:00.000Z',
    quote: {
      EUR: {
        price: 4162.89,
        volume_24h: 35678901234,
        volume_change_24h: 38.4567,
        percent_change_1h: -0.234567,
        percent_change_24h: 5.231456,
        percent_change_7d: 10.123456,
        percent_change_30d: 28.456789,
        percent_change_60d: 35.678901,
        percent_change_90d: 50.234567,
        market_cap: 500912345678,
        market_cap_dominance: 16.1876,
        fully_diluted_market_cap: 500912345678,
        tvl: null,
        last_updated: '2025-07-31T00:00:00.000Z',
      },
    },
  },
  {
    id: 825,
    name: 'Tether USDt',
    symbol: 'USDT',
    slug: 'tether',
    num_market_pairs: 79500,
    date_added: '2014-10-06T00:00:00.000Z',
    tags: ['stablecoin', 'usd-stablecoin', 'ethereum-ecosystem', 'solana-ecosystem'],
    max_supply: null,
    circulating_supply: 104750987654,
    total_supply: 108500123456,
    platform: {
      id: 1027,
      name: 'Ethereum',
      symbol: 'ETH',
      slug: 'ethereum',
      token_address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    },
    infinite_supply: true,
    cmc_rank: 3,
    self_reported_circulating_supply: null,
    self_reported_market_cap: null,
    tvl_ratio: null,
    last_updated: '2025-07-31T00:00:00.000Z',
    quote: {
      EUR: {
        price: 0.92345678,
        volume_24h: 145678901234,
        volume_change_24h: 50.1234,
        percent_change_1h: -0.012345,
        percent_change_24h: -0.021234,
        percent_change_7d: 0.012345,
        percent_change_30d: 0.098765,
        percent_change_60d: -0.056789,
        percent_change_90d: 0.067890,
        market_cap: 96734567890,
        market_cap_dominance: 3.9876,
        fully_diluted_market_cap: 100198765432,
        tvl: null,
        last_updated: '2025-07-31T00:00:00.000Z',
      },
    },
  },
  {
    id: 1839,
    name: 'BNB',
    symbol: 'BNB',
    slug: 'bnb',
    num_market_pairs: 2150,
    date_added: '2017-07-25T00:00:00.000Z',
    tags: ['smart-contracts', 'bnb-chain', 'layer-1'],
    max_supply: null,
    circulating_supply: 148920456,
    total_supply: 148920456,
    infinite_supply: false,
    platform: null,
    cmc_rank: 4,
    self_reported_circulating_supply: null,
    self_reported_market_cap: null,
    tvl_ratio: null,
    last_updated: '2025-07-31T00:00:00.000Z',
    quote: {
      EUR: {
        price: 564.78,
        volume_24h: 2890123456,
        volume_change_24h: 25.6789,
        percent_change_1h: -0.098765,
        percent_change_24h: 1.891234,
        percent_change_7d: 6.456789,
        percent_change_30d: 20.123456,
        percent_change_60d: 25.789012,
        percent_change_90d: 40.234567,
        market_cap: 84123456789,
        market_cap_dominance: 2.7654,
        fully_diluted_market_cap: 84123456789,
        tvl: null,
        last_updated: '2025-07-31T00:00:00.000Z',
      },
    },
  },
  {
    id: 5426,
    name: 'Solana',
    symbol: 'SOL',
    slug: 'solana',
    num_market_pairs: 680,
    date_added: '2020-03-16T00:00:00.000Z',
    tags: ['pos', 'solana-ecosystem', 'layer-1'],
    max_supply: null,
    circulating_supply: 456320789,
    total_supply: 582750123,
    infinite_supply: true,
    platform: null,
    cmc_rank: 5,
    self_reported_circulating_supply: null,
    self_reported_market_cap: null,
    tvl_ratio: null,
    last_updated: '2025-07-31T00:00:00.000Z',
    quote: {
      EUR: {
        price: 168.45,
        volume_24h: 5678901234,
        volume_change_24h: 35.4567,
        percent_change_1h: -0.067890,
        percent_change_24h: -0.951234,
        percent_change_7d: 10.789012,
        percent_change_30d: 20.234567,
        percent_change_60d: 25.678901,
        percent_change_90d: 50.123456,
        market_cap: 76834567890,
        market_cap_dominance: 2.5123,
        fully_diluted_market_cap: 98123456789,
        tvl: null,
        last_updated: '2025-07-31T00:00:00.000Z',
      },
    },
  },
];