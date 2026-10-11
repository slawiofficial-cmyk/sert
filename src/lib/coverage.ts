import servicesData from '../data/services.json';
import channelsData from '../data/channels.json';
import marketsData from '../data/markets.json';
import teamsData from '../data/teams.json';
import devicesData from '../data/devices.json';
import type { StreamingService, Channel, LocalMarket, SportsTeam, StreamingDevice } from '../types';
import {
  computeCoverage,
  formatVerifiedDate,
  getCarriage,
  getMainPrice,
  getPromoLine,
  getTrackedCount,
  isCarriedBy,
  trackedLabel,
  trackedShort,
  type CoverageCore
} from './pricing';

// Pages import every pricing/carriage helper from here; the implementations live in pricing.ts.
export * from './pricing';

export const services: StreamingService[] = servicesData.services as unknown as StreamingService[];
export const channels: Channel[] = channelsData.channels as unknown as Channel[];
export const markets: LocalMarket[] = marketsData.markets as unknown as LocalMarket[];
export const teams: SportsTeam[] = teamsData.teams as unknown as SportsTeam[];
export const devices: StreamingDevice[] = devicesData.devices as unknown as StreamingDevice[];

/** Data-freshness metadata shown beside every price block and channel list. */
export const dataMeta = {
  lastVerified: servicesData.lastVerified as string,
  lastVerifiedLabel: formatVerifiedDate(servicesData.lastVerified),
  /** Most recent per-service price check; services older than this are flagged on their review. */
  newestVerified: [...servicesData.services.map((svc) => (svc as { priceVerifiedAt: string }).priceVerifiedAt)].sort().at(-1) as string,
  priceDisclaimer: (servicesData as { _disclaimer?: string })._disclaimer ?? '',
  channelDisclaimer: (channelsData as { _disclaimer?: string })._disclaimer ?? ''
};

export function getService(idOrSlug: string): StreamingService {
  const service = services.find((s) => s.id === idOrSlug || s.slug === idOrSlug);
  if (!service) throw new Error(`Unknown service "${idOrSlug}"`);
  return service;
}

/** Tracked-channel count for a service, using the channels.json sample. */
export function getTrackedChannelCount(service: Pick<StreamingService, 'id'>): number {
  return getTrackedCount(channels, service.id);
}

/** "44 of ~185" */
export function getTrackedShort(service: Pick<StreamingService, 'id' | 'channelCount'>): string {
  return trackedShort(channels, service);
}

/** "Key channels tracked: 44 of ~185" */
export function getTrackedLabel(service: Pick<StreamingService, 'id' | 'channelCount'>): string {
  return trackedLabel(channels, service);
}

export type CoverageResult = CoverageCore<StreamingService, Channel> & { isBestMatch?: boolean };

/**
 * Computes live coverage for an array of selected channel IDs across all services.
 * Ranked by main (monthly) price, never by promotional price.
 */
export function calculateCoverage(selectedChannelIds: string[]): CoverageResult[] {
  const selectedChannels = selectedChannelIds
    .map((id) => channels.find((c) => c.id === id || c.slug === id))
    .filter((c): c is Channel => Boolean(c));

  if (selectedChannels.length === 0) {
    return [...services]
      .sort((a, b) => b.editorialRating - a.editorialRating)
      .map((service) => ({
        service,
        totalSelected: 0,
        coveredCount: 0,
        percentage: 0,
        coveredChannels: [],
        missingChannels: [],
        conditionalChannels: [],
        monthlyPrice: getMainPrice(service),
        pricePerSelectedChannel: 0,
        isFullCoverage: false,
        isBestMatch: false
      }));
  }

  const results: CoverageResult[] = computeCoverage(selectedChannels, services);
  if (results.length > 0 && results[0].coveredCount > 0) {
    results[0].isBestMatch = true;
  }
  return results;
}

/**
 * Finds the cheapest service carrying a specific channel, by main (monthly) price.
 * `promoLine` is informational only.
 */
export function getCheapestServiceForChannel(
  channelIdOrSlug: string
): { service: StreamingService; price: number; promoLine: string | null; requirement: string | null } | null {
  const channel = channels.find((c) => c.id === channelIdOrSlug || c.slug === channelIdOrSlug);
  if (!channel) return null;

  const carrying = services
    .filter((s) => isCarriedBy(channel, s.id))
    .sort((a, b) => getMainPrice(a) - getMainPrice(b));
  const best = carrying[0];
  if (!best) return null;

  return {
    service: best,
    price: getMainPrice(best),
    promoLine: getPromoLine(best),
    requirement: getCarriage(channel, best)?.requirement ?? null
  };
}

/**
 * Generates pairwise comparisons for all services.
 */
export function getAllComparisonPairs(): { a: StreamingService; b: StreamingService; slug: string }[] {
  const pairs: { a: StreamingService; b: StreamingService; slug: string }[] = [];
  for (let i = 0; i < services.length; i++) {
    for (let j = i + 1; j < services.length; j++) {
      pairs.push({
        a: services[i],
        b: services[j],
        slug: `${services[i].slug}-vs-${services[j].slug}`
      });
    }
  }
  return pairs;
}

/**
 * Compares two services across the channels we track: exclusive to A, exclusive to B, and shared.
 */
export function compareTwoServices(serviceAId: string, serviceBId: string) {
  const serviceA = services.find((s) => s.id === serviceAId || s.slug === serviceAId);
  const serviceB = services.find((s) => s.id === serviceBId || s.slug === serviceBId);

  if (!serviceA || !serviceB) return null;

  const onlyInA: Channel[] = [];
  const onlyInB: Channel[] = [];
  const inBoth: Channel[] = [];

  channels.forEach((ch) => {
    const hasA = isCarriedBy(ch, serviceA.id);
    const hasB = isCarriedBy(ch, serviceB.id);

    if (hasA && hasB) {
      inBoth.push(ch);
    } else if (hasA) {
      onlyInA.push(ch);
    } else if (hasB) {
      onlyInB.push(ch);
    }
  });

  const priceDiff = Number((getMainPrice(serviceA) - getMainPrice(serviceB)).toFixed(2));
  const channelDiff = serviceA.channelCount - serviceB.channelCount;

  return {
    serviceA,
    serviceB,
    onlyInA,
    onlyInB,
    inBoth,
    priceDiff,
    channelDiff
  };
}
