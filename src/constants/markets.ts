import { Nullable } from '@/constants/abacus';
import { STRING_KEYS } from '@/constants/localization';

import { IconName } from '@/components/Icon';

export type MarketData = {
  // Unique Market id (e.g. 'ETH-USD' or 'BUFFI,uniswap_v3,0x4c1b1302220d7de5c22b495e78b72f2dd2457d45-USD')
  id: string;

  // Base asset id (e.g. 'ETH' or 'BUFFI,uniswap_v3,0x4c1b1302220d7de5c22b495e78b72f2dd2457d45')
  assetId: string;

  // Displayable Market id (e.g. 'ETH-USD' or 'BUFFI-USD')
  displayId: Nullable<string>;

  clobPairId: number;
  effectiveInitialMarginFraction: Nullable<number>;
  imageUrl: Nullable<string>;
  initialMarginFraction: Nullable<number>;
  isNew?: boolean;
  isUnlaunched?: boolean;
  line?: Nullable<number[]>;
  name?: Nullable<string>;
  nextFundingRate?: Nullable<number>;
  openInterest?: Nullable<number>;
  openInterestUSDC?: Nullable<number>;
  oraclePrice?: Nullable<number>;
  priceChange24H?: Nullable<number>;
  priceChange24HPercent?: Nullable<number>;
  tickSizeDecimals?: Nullable<number>;
  trades24H?: Nullable<number>;
  volume24H?: Nullable<number>;
  tags?: Nullable<string[]>;
  isFavorite: boolean;
};

export enum MarketSorting {
  GAINERS = 'gainers',
  LOSERS = 'losers',
  RECENTLY_LISTED = 'recently-listed',
}

export enum MarketFilters {
  ALL = 'all',
  FAVORITE = 'favorite',
  NEW = 'new',
  PREDICTION_MARKET = 'prediction-market',

  // Existing Custom Tags from public/configs/markets.json
  // TODO: Remove when metadataService is default
  PREDICTION_MARKET_DEPRECATED = 'Prediction Market',
  FX_DEPRECATED = 'FX',
  LAYER_1_DEPRECATED = 'Layer 1',
  LAYER_2_DEPRECATED = 'Layer 2',
  DEFI_DEPRECATED = 'Defi',
  AI_DEPRECATED = 'AI',
  NFT_DEPRECATED = 'NFT',
  GAMING_DEPRECATED = 'Gaming',
  MEME_DEPRECATED = 'Meme',
  RWA_DEPRECATED = 'RWA',
  ENT_DEPRECATED = 'Entertainment',

  // CMC Sector Tags.
  FX = 'fiat',
  LAYER_1 = 'layer-1',
  LAYER_2 = 'layer-2',
  DEFI = 'defi',
  AI = 'ai-big-data',
  DEPIN = 'depin',
  GAMING = 'gaming',
  MEMES = 'memes',
  RWA = 'real-world-assets',
  LAUNCHABLE = 'launchable',
}

// ORDER IS INTENTIONAL
export const MARKET_FILTER_OPTIONS: Record<
  MarketFilters,
  {
    labelIconName?: IconName;
    labelStringKey?: string;
    isNew?: boolean;
  }
> = {
  [MarketFilters.ALL]: {
    labelStringKey: STRING_KEYS.ALL,
  },
  [MarketFilters.FAVORITE]: {
    labelIconName: IconName.Star,
  },
  [MarketFilters.NEW]: {
    labelStringKey: STRING_KEYS.RECENTLY_LISTED,
  },
  [MarketFilters.LAUNCHABLE]: {
    labelStringKey: STRING_KEYS.LAUNCHABLE,
    isNew: true,
  },
  [MarketFilters.MEME_DEPRECATED]: {
    labelStringKey: STRING_KEYS.MEME,
  },
  [MarketFilters.MEMES]: {
    labelStringKey: STRING_KEYS.MEME,
  },
  [MarketFilters.AI_DEPRECATED]: {
    labelStringKey: STRING_KEYS.AI,
  },
  [MarketFilters.AI]: {
    labelStringKey: STRING_KEYS.AI_BIG_DATA,
  },
  [MarketFilters.DEFI_DEPRECATED]: {
    labelStringKey: STRING_KEYS.DEFI,
  },
  [MarketFilters.DEFI]: {
    labelStringKey: STRING_KEYS.DEFI,
  },
  [MarketFilters.DEPIN]: {
    labelStringKey: STRING_KEYS.DEPIN,
  },
  [MarketFilters.LAYER_1_DEPRECATED]: {
    labelStringKey: STRING_KEYS.LAYER_1,
  },
  [MarketFilters.LAYER_1]: {
    labelStringKey: STRING_KEYS.LAYER_1,
  },
  [MarketFilters.LAYER_2_DEPRECATED]: {
    labelStringKey: STRING_KEYS.LAYER_2,
  },
  [MarketFilters.LAYER_2]: {
    labelStringKey: STRING_KEYS.LAYER_2,
  },
  [MarketFilters.RWA_DEPRECATED]: {
    labelStringKey: STRING_KEYS.REAL_WORLD_ASSET_SHORT,
  },
  [MarketFilters.RWA]: {
    labelStringKey: STRING_KEYS.REAL_WORLD_ASSET_SHORT,
  },
  [MarketFilters.GAMING_DEPRECATED]: {
    labelStringKey: STRING_KEYS.GAMING,
  },
  [MarketFilters.GAMING]: {
    labelStringKey: STRING_KEYS.GAMING,
  },
  [MarketFilters.FX_DEPRECATED]: {
    labelStringKey: STRING_KEYS.FOREX,
  },
  [MarketFilters.FX]: {
    labelStringKey: STRING_KEYS.FOREX,
  },
  [MarketFilters.NFT_DEPRECATED]: {
    labelStringKey: STRING_KEYS.NFT,
  },
  [MarketFilters.ENT_DEPRECATED]: {
    labelStringKey: STRING_KEYS.ENTERTAINMENT,
  },
  [MarketFilters.PREDICTION_MARKET]: {
    labelStringKey: STRING_KEYS.PREDICTION_MARKET,
    isNew: true,
  },
  [MarketFilters.PREDICTION_MARKET_DEPRECATED]: {
    labelStringKey: STRING_KEYS.PREDICTION_MARKET,
    isNew: true,
  },
};

export const DEFAULT_MARKETID = 'ETH-USD';
export const DEFAULT_QUOTE_ASSET = 'USD';

export enum FundingDirection {
  ToShort = 'ToShort',
  ToLong = 'ToLong',
  None = 'None',
}

export const PREDICTION_MARKET = {
  TRUMPWIN: 'TRUMPWIN-USD',
};

// Liquidity Tiers
export const LIQUIDITY_TIERS = {
  0: {
    label: 'Large-cap',
    initialMarginFraction: 0.05,
    maintenanceMarginFraction: 0.03,
    impactNotional: 10_000,
  },
  1: {
    label: 'Small-cap',
    initialMarginFraction: 0.1,
    maintenanceMarginFraction: 0.05,
    impactNotional: 5_000,
  },
  2: {
    label: 'Long-tail',
    initialMarginFraction: 0.2,
    maintenanceMarginFraction: 0.1,
    impactNotional: 2_500,
  },
  3: {
    label: 'Safety',
    initialMarginFraction: 1,
    maintenanceMarginFraction: 0.2,
    impactNotional: 2_500,
  },
  4: {
    label: 'Isolated',
    initialMarginFraction: 0.05,
    maintenanceMarginFraction: 0.03,
    impactNotional: 2_500,
  },
  5: {
    label: 'Mid-cap',
    initialMarginFraction: 0.05,
    maintenanceMarginFraction: 0.03,
    impactNotional: 5_000,
  },
  6: {
    label: 'FX',
    initialMarginFraction: 0.01,
    maintenanceMarginFraction: 0.0005,
    impactNotional: 2_500,
  },
};

export const ISOLATED_LIQUIDITY_TIER_INFO = LIQUIDITY_TIERS[4];
