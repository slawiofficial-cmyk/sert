import servicesData from '../data/services.json';
import channelsData from '../data/channels.json';
import marketsData from '../data/markets.json';
import teamsData from '../data/teams.json';
import devicesData from '../data/devices.json';
import type { StreamingService, Channel, LocalMarket, SportsTeam, StreamingDevice } from '../types';

export const services: StreamingService[] = servicesData.services as unknown as StreamingService[];
export const channels: Channel[] = channelsData.channels as unknown as Channel[];
export const markets: LocalMarket[] = marketsData.markets as unknown as LocalMarket[];
export const teams: SportsTeam[] = teamsData.teams as unknown as SportsTeam[];
export const devices: StreamingDevice[] = devicesData.devices as unknown as StreamingDevice[];

export interface CoverageResult {
  service: StreamingService;
  totalSelected: number;
  coveredCount: number;
  percentage: number;
  missingChannels: Channel[];
  coveredChannels: Channel[];
  monthlyPrice: number;
  effectivePrice: number; // promoPrice if available, else monthlyPrice
  pricePerSelectedChannel: number;
  isFullCoverage: boolean;
  isBestMatch?: boolean;
}

/**
 * Computes live coverage for an array of selected channel IDs across all services.
 * Sorted by full coverage first, then lowest price, then highest coverage percentage.
 */
export function calculateCoverage(selectedChannelIds: string[]): CoverageResult[] {
  if (selectedChannelIds.length === 0) {
    return services.map(service => {
      const effectivePrice = service.promoPrice ?? service.monthlyPrice;
      return {
        service,
        totalSelected: 0,
        coveredCount: 0,
        percentage: 0,
        missingChannels: [],
        coveredChannels: [],
        monthlyPrice: service.monthlyPrice,
        effectivePrice,
        pricePerSelectedChannel: 0,
        isFullCoverage: false,
        isBestMatch: false
      };
    }).sort((a, b) => (b.service.editorialRating - a.service.editorialRating));
  }

  const selectedChannels = selectedChannelIds
    .map(id => channels.find(c => c.id === id || c.slug === id))
    .filter((c): c is Channel => Boolean(c));

  const results: CoverageResult[] = services.map(service => {
    const coveredChannels: Channel[] = [];
    const missingChannels: Channel[] = [];

    selectedChannels.forEach(channel => {
      if (channel.availableOn.includes(service.id)) {
        coveredChannels.push(channel);
      } else {
        missingChannels.push(channel);
      }
    });

    const coveredCount = coveredChannels.length;
    const totalSelected = selectedChannels.length;
    const percentage = totalSelected > 0 ? Math.round((coveredCount / totalSelected) * 100) : 0;
    const effectivePrice = service.promoPrice ?? service.monthlyPrice;
    const pricePerSelectedChannel = coveredCount > 0 ? Number((effectivePrice / coveredCount).toFixed(2)) : 0;
    const isFullCoverage = coveredCount === totalSelected;

    return {
      service,
      totalSelected,
      coveredCount,
      percentage,
      missingChannels,
      coveredChannels,
      monthlyPrice: service.monthlyPrice,
      effectivePrice,
      pricePerSelectedChannel,
      isFullCoverage
    };
  });

  // Sort logic: Full coverage first, then lowest effective price, then coveredCount desc
  results.sort((a, b) => {
    if (a.isFullCoverage && !b.isFullCoverage) return -1;
    if (!a.isFullCoverage && b.isFullCoverage) return 1;
    if (a.isFullCoverage && b.isFullCoverage) {
      return a.effectivePrice - b.effectivePrice;
    }
    // Neither has full coverage: sort by coveredCount desc, then price asc
    if (b.coveredCount !== a.coveredCount) {
      return b.coveredCount - a.coveredCount;
    }
    return a.effectivePrice - b.effectivePrice;
  });

  // Identify Best Match (top result if has at least 1 covered channel)
  if (results.length > 0 && results[0].coveredCount > 0) {
    results[0].isBestMatch = true;
  }

  return results;
}

/**
 * Finds the cheapest service carrying a specific channel.
 */
export function getCheapestServiceForChannel(channelIdOrSlug: string): { service: StreamingService; price: number } | null {
  const channel = channels.find(c => c.id === channelIdOrSlug || c.slug === channelIdOrSlug);
  if (!channel || channel.availableOn.length === 0) return null;

  const carryingServices = services.filter(s => channel.availableOn.includes(s.id));
  if (carryingServices.length === 0) return null;

  carryingServices.sort((a, b) => {
    const priceA = a.promoPrice ?? a.monthlyPrice;
    const priceB = b.promoPrice ?? b.monthlyPrice;
    return priceA - priceB;
  });

  const best = carryingServices[0];
  return {
    service: best,
    price: best.promoPrice ?? best.monthlyPrice
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
 * Compares two services: channels exclusive to A, exclusive to B, and in both.
 */
export function compareTwoServices(serviceAId: string, serviceBId: string) {
  const serviceA = services.find(s => s.id === serviceAId || s.slug === serviceAId);
  const serviceB = services.find(s => s.id === serviceBId || s.slug === serviceBId);

  if (!serviceA || !serviceB) return null;

  const onlyInA: Channel[] = [];
  const onlyInB: Channel[] = [];
  const inBoth: Channel[] = [];

  channels.forEach(ch => {
    const hasA = ch.availableOn.includes(serviceA.id);
    const hasB = ch.availableOn.includes(serviceB.id);

    if (hasA && hasB) {
      inBoth.push(ch);
    } else if (hasA) {
      onlyInA.push(ch);
    } else if (hasB) {
      onlyInB.push(ch);
    }
  });

  const priceDiff = Number((serviceA.monthlyPrice - serviceB.monthlyPrice).toFixed(2));
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
