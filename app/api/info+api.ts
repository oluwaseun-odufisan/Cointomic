/**
 * API handler for fetching cryptocurrency information from CoinMarketCap.
 * @module info+api
 */

import { Response } from 'expo-router/server';

/** Interface for cryptocurrency information */
interface CryptoInfo {
  id: number;
  name: string;
  symbol: string;
  category: string;
  description: string;
  slug: string;
  logo: string;
  subreddit: string;
  notice: string;
  tags: string[];
  'tag-names': string[];
  'tag-groups': string[];
  urls: Record<string, string[]>;
  platform: { id: string; name: string; slug: string; symbol: string; token_address: string } | null;
  date_added: string;
  twitter_username: string;
  is_hidden: number;
  date_launched: string | null;
  contract_address: string[];
  self_reported_circulating_supply: number | null;
  self_reported_tags: string[] | null;
  self_reported_market_cap: number | null;
  infinite_supply: boolean;
}

/** Interface for API response */
interface ApiResponse {
  data: Record<string, CryptoInfo>;
  status: { error_code: number; error_message: string | null };
}

/**
 * GET handler for fetching cryptocurrency info by IDs.
 * @param request - The incoming Expo request
 * @returns JSON response with cryptocurrency info or error
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
    const ids = url.searchParams.get('ids') || '';

    if (!ids) {
      return Response.json(
        { status: { error_code: 400, error_message: 'Missing ids parameter' } },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://pro-api.coinmarketcap.com/v2/cryptocurrency/info?id=${ids}`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': API_KEY,
          Accept: 'application/json',
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) {
      throw new Error(`CoinMarketCap API error: ${response.statusText}`);
    }

    const res: ApiResponse = await response.json();
    return Response.json(res.data, {
      headers: { 'Cache-Control': 'public, max-age=3600' },
    });
  } catch (error) {
    console.error('Error fetching crypto info:', error);
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

/** Mock data for cryptocurrency info (July 2025) */
const data: Record<string, CryptoInfo> = {
  '1': {
    id: 1,
    name: 'Bitcoin',
    symbol: 'BTC',
    category: 'coin',
    description:
      'Bitcoin (BTC), launched in 2009, is the pioneering decentralized cryptocurrency, enabling peer-to-peer transactions without intermediaries. By July 2025, its robust blockchain and growing institutional adoption have solidified its position as a leading store of value. With a fixed supply cap, Bitcoin’s current supply stands at 19,730,250, trading at $85,230.15 USD, up 3.12% in the last 24 hours. Explore more at https://bitcoin.org/.',
    slug: 'bitcoin',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png',
    subreddit: 'bitcoin',
    notice: '',
    tags: ['mineable', 'pow', 'sha-256', 'store-of-value', 'bitcoin-ecosystem'],
    'tag-names': ['Mineable', 'Proof of Work', 'SHA-256', 'Store of Value', 'Bitcoin Ecosystem'],
    'tag-groups': ['FEATURE', 'CONSENSUS', 'ALGORITHM', 'CATEGORY', 'ECOSYSTEM'],
    urls: {
      website: ['https://bitcoin.org/'],
      explorer: ['https://blockchain.info/'],
    },
    platform: null,
    date_added: '2009-01-03T00:00:00.000Z',
    twitter_username: 'Bitcoin',
    is_hidden: 0,
    date_launched: '2009-01-03T00:00:00.000Z',
    contract_address: [],
    self_reported_circulating_supply: null,
    self_reported_tags: null,
    self_reported_market_cap: null,
    infinite_supply: false,
  },
  '825': {
    id: 825,
    name: 'Tether USDt',
    symbol: 'USDT',
    category: 'token',
    description:
      'Tether USDt (USDT), launched in 2014, is a leading stablecoin pegged to the USD, widely used for trading and liquidity across multiple blockchains. By July 2025, its supply has grown to 108,500,123,456, with 104,750,987,654 in circulation. Trading at $1.0002 USD, down 0.02% in the last 24 hours, USDT remains a cornerstone of DeFi. Learn more at https://tether.to/.',
    slug: 'tether',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
    subreddit: '',
    notice: '',
    tags: [
      'stablecoin',
      'usd-stablecoin',
      'ethereum-ecosystem',
      'solana-ecosystem',
      'bnb-chain',
      'avalanche-ecosystem',
    ],
    'tag-names': [
      'Stablecoin',
      'USD Stablecoin',
      'Ethereum Ecosystem',
      'Solana Ecosystem',
      'BNB Chain',
      'Avalanche Ecosystem',
    ],
    'tag-groups': ['CATEGORY', 'CATEGORY', 'ECOSYSTEM', 'ECOSYSTEM', 'ECOSYSTEM', 'ECOSYSTEM'],
    urls: {
      website: ['https://tether.to/'],
      explorer: ['https://etherscan.io/token/0xdac17f958d2ee523a2206206994597c13d831ec7'],
    },
    platform: {
      id: '1027',
      name: 'Ethereum',
      slug: 'ethereum',
      symbol: 'ETH',
      token_address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    },
    date_added: '2014-10-06T00:00:00.000Z',
    twitter_username: 'Tether_to',
    is_hidden: 0,
    date_launched: '2014-10-06T00:00:00.000Z',
    contract_address: ['0xdac17f958d2ee523a2206206994597c13d831ec7'],
    self_reported_circulating_supply: null,
    self_reported_tags: null,
    self_reported_market_cap: null,
    infinite_supply: true,
  },
  '1027': {
    id: 1027,
    name: 'Ethereum',
    symbol: 'ETH',
    category: 'coin',
    description:
      'Ethereum (ETH), launched in 2015, powers decentralized applications and smart contracts on its scalable blockchain. By July 2025, Ethereum’s layer-2 solutions and staking adoption have driven its growth, with a supply of 120,350,789. Trading at $4,512.67 USD, up 5.23% in the last 24 hours, it remains a DeFi leader. Discover more at https://ethereum.org/.',
    slug: 'ethereum',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
    subreddit: 'ethereum',
    notice: '',
    tags: ['smart-contracts', 'ethereum-ecosystem', 'layer-1', 'pos'],
    'tag-names': ['Smart Contracts', 'Ethereum Ecosystem', 'Layer 1', 'Proof of Stake'],
    'tag-groups': ['FEATURE', 'ECOSYSTEM', 'CATEGORY', 'CONSENSUS'],
    urls: {
      website: ['https://ethereum.org/'],
      explorer: ['https://etherscan.io/'],
    },
    platform: null,
    date_added: '2015-07-30T00:00:00.000Z',
    twitter_username: 'ethereum',
    is_hidden: 0,
    date_launched: '2015-07-30T00:00:00.000Z',
    contract_address: [],
    self_reported_circulating_supply: null,
    self_reported_tags: null,
    self_reported_market_cap: null,
    infinite_supply: true,
  },
  '1839': {
    id: 1839,
    name: 'BNB',
    symbol: 'BNB',
    category: 'coin',
    description:
      'BNB (BNB), launched in 2017, fuels the BNB Chain ecosystem, supporting DeFi, NFTs, and dApps. By July 2025, its supply is 148,920,456, with a price of $612.45 USD, up 1.89% in the last 24 hours. BNB’s utility in transaction fees and staking drives its adoption. Learn more at https://www.bnbchain.org/.',
    slug: 'bnb',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png',
    subreddit: 'bnbchainofficial',
    notice: '',
    tags: ['smart-contracts', 'bnb-chain', 'layer-1'],
    'tag-names': ['Smart Contracts', 'BNB Chain', 'Layer 1'],
    'tag-groups': ['FEATURE', 'ECOSYSTEM', 'CATEGORY'],
    urls: {
      website: ['https://www.bnbchain.org/'],
      twitter: ['https://twitter.com/bnbchain'],
      chat: ['https://t.me/BNBchaincommunity', 'https://t.me/bnbchain'],
      explorer: ['https://explorer.bnbchain.org/', 'https://bscscan.com/'],
      reddit: ['https://reddit.com/r/bnbchainofficial'],
      source_code: ['https://github.com/bnb-chain'],
    },
    platform: null,
    date_added: '2017-07-25T00:00:00.000Z',
    twitter_username: 'bnbchain',
    is_hidden: 0,
    date_launched: '2017-07-25T00:00:00.000Z',
    contract_address: [],
    self_reported_circulating_supply: null,
    self_reported_tags: null,
    self_reported_market_cap: null,
    infinite_supply: false,
  },
  '5426': {
    id: 5426,
    name: 'Solana',
    symbol: 'SOL',
    category: 'coin',
    description:
      'Solana (SOL), launched in 2020, is a high-performance blockchain for fast, low-cost transactions, powering DeFi and NFT ecosystems. By July 2025, its supply is 582,750,123, with 456,320,789 in circulation. Trading at $182.76 USD, down 0.95% in the last 24 hours, Solana thrives on scalability. Visit https://solana.com/.',
    slug: 'solana',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png',
    subreddit: 'solana',
    notice: '',
    tags: ['pos', 'solana-ecosystem', 'layer-1'],
    'tag-names': ['Proof of Stake', 'Solana Ecosystem', 'Layer 1'],
    'tag-groups': ['CONSENSUS', 'ECOSYSTEM', 'CATEGORY'],
    urls: {
      website: ['https://solana.com/'],
      explorer: ['https://explorer.solana.com/'],
    },
    platform: null,
    date_added: '2020-03-16T00:00:00.000Z',
    twitter_username: 'solana',
    is_hidden: 0,
    date_launched: '2020-03-16T00:00:00.000Z',
    contract_address: [],
    self_reported_circulating_supply: null,
    self_reported_tags: null,
    self_reported_market_cap: null,
    infinite_supply: true,
  },
};