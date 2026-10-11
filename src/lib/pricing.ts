/**
 * Pure pricing, carriage and coverage helpers.
 *
 * This module deliberately imports no JSON so the ChannelFinder client script can
 * bundle it without pulling in the teams/markets datasets. Pages import these
 * through `coverage.ts`, which re-exports everything here.
 *
 * Rule of thumb: the main price of a service is always `monthlyPrice`. Promotional
 * pricing is a secondary line only and never feeds ranking, sorting, schema or
 * "From $X/mo" copy.
 */
import type { AvailabilityEntry, Channel, ExtraFee, StreamingService } from '../types';

type PriceFields = Pick<StreamingService, 'priceSourceUrl' | 'monthlyPrice' | 'promoPrice' | 'promoDescription' | 'planName' | 'extraFees'>;

export function formatUsd(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/** "2026-10-01" -> "October 1, 2026" (no Date parsing, so no timezone drift). */
export function formatVerifiedDate(iso: string): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const [year, month, day] = iso.split('-').map((part) => parseInt(part, 10));
  const name = months[month - 1];
  if (!year || !name || !day) return iso;
  return `${name} ${day}, ${year}`;
}

export function getMainPrice(service: Pick<StreamingService, 'monthlyPrice'>): number {
  return service.monthlyPrice;
}

/** Secondary promo line, e.g. "$52.99 for first 3 months". Null when there is no promo. */
export function getPromoLine(service: Pick<StreamingService, 'promoPrice' | 'promoDescription'>): string | null {
  if (service.promoPrice == null) return null;
  const duration = service.promoDescription ? ` ${service.promoDescription}` : '';
  return `${formatUsd(service.promoPrice)}${duration}`;
}

export interface FeeView {
  text: string;
  note: string;
  optional: boolean;
}

export function formatFee(fee: ExtraFee): FeeView {
  const amount = fee.amount == null ? '' : `${fee.upTo ? 'up to ' : ''}${formatUsd(fee.amount)}/mo `;
  const optional = Boolean(fee.optional);
  return {
    text: optional ? `Optional: ${fee.label} ${amount}`.trim() : `+ ${amount}${fee.label}`.trim(),
    note: fee.note,
    optional
  };
}

export interface PriceView {
  main: number;
  mainText: string;
  planName: string;
  sourceUrl: string;
  promoLine: string | null;
  fees: FeeView[];
}

/** Everything a price block needs, derived in one place so every page agrees. */
export function getPriceView(service: PriceFields): PriceView {
  const main = getMainPrice(service);
  return {
    main,
    mainText: formatUsd(main),
    planName: service.planName,
    sourceUrl: service.priceSourceUrl,
    promoLine: getPromoLine(service),
    fees: (service.extraFees ?? []).map(formatFee)
  };
}

/** Orders by the main price, ascending. */
export function compareByMainPrice(a: Pick<StreamingService, 'monthlyPrice'>, b: Pick<StreamingService, 'monthlyPrice'>): number {
  return getMainPrice(a) - getMainPrice(b);
}

export function getCheapestByMainPrice<T extends Pick<StreamingService, 'monthlyPrice'>>(list: T[]): T | undefined {
  return [...list].sort(compareByMainPrice)[0];
}

/** Label for 4K that does not overstate what the listed plan includes. */
export function fourKLabel(service: Pick<StreamingService, 'supports4K' | 'extraFees'>): string {
  if (service.supports4K) return 'Supported';
  const addon = (service.extraFees ?? []).find((fee) => /4k/i.test(fee.label));
  return addon ? 'Add-on only' : 'Not included';
}

// ---------------------------------------------------------------------------
// Carriage (availableOn) helpers. Plain string ids stay valid.
// ---------------------------------------------------------------------------

export interface Carriage {
  service: string;
  tier?: string;
  addon: boolean;
  /** "Requires Choice plan" / "Add-on" when the listed plan does not include the channel. */
  requirement: string | null;
}

export function normalizeAvailability(entry: AvailabilityEntry): { service: string; tier?: string; addon: boolean } {
  if (typeof entry === 'string') return { service: entry, addon: false };
  return { service: entry.service, tier: entry.tier, addon: Boolean(entry.addon) };
}

export function getCarriage(
  channel: Pick<Channel, 'availableOn'>,
  service: Pick<StreamingService, 'id' | 'planName'>
): Carriage | null {
  for (const raw of channel.availableOn) {
    const entry = normalizeAvailability(raw);
    if (entry.service !== service.id) continue;

    let requirement: string | null = null;
    if (entry.addon) {
      requirement = entry.tier ? `Add-on (${entry.tier})` : 'Add-on';
    } else if (entry.tier) {
      const inListedPlan = (service.planName ?? '').toLowerCase().includes(entry.tier.toLowerCase());
      if (!inListedPlan) requirement = `Requires ${entry.tier} plan`;
    }
    return { ...entry, requirement };
  }
  return null;
}

/** Service ids that carry the channel, whatever the plan. */
export function getCarrierIds(channel: Pick<Channel, 'availableOn'>): string[] {
  return channel.availableOn.map((entry) => normalizeAvailability(entry).service);
}

export function isCarriedBy(channel: Pick<Channel, 'availableOn'>, serviceId: string): boolean {
  return getCarrierIds(channel).includes(serviceId);
}

// ---------------------------------------------------------------------------
// Tracked-channel labels. channelCount is the provider's approximate lineup size;
// we only track a sample, so the two must never be shown as if they were the same.
// ---------------------------------------------------------------------------

export function getTrackedCount(channels: Pick<Channel, 'availableOn'>[], serviceId: string): number {
  return channels.filter((channel) => isCarriedBy(channel, serviceId)).length;
}

/** "44 of ~185" */
export function trackedShort(channels: Pick<Channel, 'availableOn'>[], service: Pick<StreamingService, 'id' | 'channelCount'>): string {
  return `${getTrackedCount(channels, service.id)} of ~${service.channelCount}`;
}

/** "Key channels tracked: 44 of ~185" */
export function trackedLabel(channels: Pick<Channel, 'availableOn'>[], service: Pick<StreamingService, 'id' | 'channelCount'>): string {
  return `Key channels tracked: ${trackedShort(channels, service)}`;
}

// ---------------------------------------------------------------------------
// Coverage
// ---------------------------------------------------------------------------

export interface CoverageCore<S, C> {
  service: S;
  totalSelected: number;
  coveredCount: number;
  percentage: number;
  coveredChannels: C[];
  missingChannels: C[];
  /** Covered channels that need a higher plan or an add-on, with the reason. */
  conditionalChannels: { channel: C; requirement: string }[];
  monthlyPrice: number;
  pricePerSelectedChannel: number;
  isFullCoverage: boolean;
}

type CoverageService = Pick<StreamingService, 'id' | 'planName' | 'monthlyPrice'>;
type CoverageChannel = Pick<Channel, 'availableOn'>;

/**
 * Ranks services for a set of selected channels.
 * Order: full coverage first (cheapest main price), then most channels covered, then cheapest.
 */
export function computeCoverage<S extends CoverageService, C extends CoverageChannel>(
  selectedChannels: C[],
  services: S[]
): CoverageCore<S, C>[] {
  const total = selectedChannels.length;

  const results = services.map((service) => {
    const coveredChannels: C[] = [];
    const missingChannels: C[] = [];
    const conditionalChannels: { channel: C; requirement: string }[] = [];

    for (const channel of selectedChannels) {
      const carriage = getCarriage(channel, service);
      if (!carriage) {
        missingChannels.push(channel);
        continue;
      }
      coveredChannels.push(channel);
      if (carriage.requirement) conditionalChannels.push({ channel, requirement: carriage.requirement });
    }

    const coveredCount = coveredChannels.length;
    const price = getMainPrice(service);
    return {
      service,
      totalSelected: total,
      coveredCount,
      percentage: total > 0 ? Math.round((coveredCount / total) * 100) : 0,
      coveredChannels,
      missingChannels,
      conditionalChannels,
      monthlyPrice: price,
      pricePerSelectedChannel: coveredCount > 0 ? Number((price / coveredCount).toFixed(2)) : 0,
      isFullCoverage: total > 0 && coveredCount === total
    };
  });

  results.sort((a, b) => {
    if (a.isFullCoverage !== b.isFullCoverage) return a.isFullCoverage ? -1 : 1;
    if (!a.isFullCoverage && b.coveredCount !== a.coveredCount) return b.coveredCount - a.coveredCount;
    return a.monthlyPrice - b.monthlyPrice;
  });

  return results;
}
