export interface ExtraFee {
  label: string;
  /** Monthly USD amount; null when the fee varies and is described only in `note`. */
  amount: number | null;
  /** True when `amount` is a ceiling ("up to"), not a fixed charge. */
  upTo?: boolean;
  note: string;
  /** Optional add-ons are shown separately from fees that apply to everyone. */
  optional?: boolean;
}

export interface StreamingService {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  logo: string;
  /** The plan that `monthlyPrice` refers to, e.g. "Base plan". */
  planName: string;
  /** Date (YYYY-MM-DD) this price was last checked against the provider's own site. */
  priceVerifiedAt: string;
  /** Provider page the price and promo come from. */
  priceSourceUrl: string;
  monthlyPrice: number;
  promoPrice: number | null;
  promoDescription?: string | null;
  extraFees: ExtraFee[];
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

/**
 * A plain service id ("fubo") means the channel is in that service's listed plan.
 * The object form records a plan requirement or a paid add-on.
 */
export type AvailabilityEntry =
  | string
  | { service: string; tier?: string; addon?: boolean };

export interface Channel {
  id: string;
  name: string;
  slug: string;
  category: ChannelCategory;
  logo: string;
  description: string;
  availableOn: AvailabilityEntry[];
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
