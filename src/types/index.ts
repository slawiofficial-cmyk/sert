export interface StreamingService {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  logo: string;
  monthlyPrice: number;
  promoPrice: number | null;
  promoDescription?: string | null;
  freeTrialDays: number;
  simultaneousStreams: number;
  dvrStorage: string; // e.g. "Unlimited (9 months)"
  supports4K: boolean;
  contractRequired: boolean;
  channelCount: number;
  supportedDevices: string[];
  pros: string[];
  cons: string[];
  bestFor: string;
  affiliateUrl: string; // e.g. "#AFFILIATE_YOUTUBETV"
  editorialRating: number; // e.g. 4.8
  summary: string;
  datePublished: string;
  dateModified: string;
  keyPlans?: { name: string; price: number; channels: number }[];
}

export type ChannelCategory = 'sports' | 'news' | 'entertainment' | 'kids' | 'lifestyle' | 'local';

export interface Channel {
  id: string;
  name: string;
  slug: string;
  category: ChannelCategory;
  logo: string;
  description: string;
  availableOn: string[]; // service IDs
}

export interface LocalMarketAffiliates {
  abc: string;
  cbs: string;
  nbc: string;
  fox: string;
  cw: string;
  pbs: string;
}

export interface LocalMarket {
  id: string;
  name: string; // "New York, NY"
  slug: string; // "new-york-ny"
  city: string;
  state: string; // "NY"
  dmaRank: number;
  localAffiliates: LocalMarketAffiliates;
  availability: Record<string, { abc: boolean; cbs: boolean; nbc: boolean; fox: boolean; cw: boolean; pbs: boolean }>;
}

export interface SportsTeam {
  id: string;
  name: string;
  slug: string;
  league: 'NFL' | 'NBA';
  city: string;
  conferenceOrDivision: string;
  regionalNetwork: string | null;
  nationalNetworks: string[];
  servicesThatCarryGames: string[];
  broadcastingSummary: string;
}

export interface StreamingDevice {
  id: string;
  name: string;
  slug: string;
  supportedServices: string[];
  setupTips: string;
  recommendedService: string;
}

export interface Author {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  verifiedCredentials: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}
