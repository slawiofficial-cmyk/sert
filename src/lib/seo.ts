/**
 * Programmatic SEO (pSEO) and Structured Data Generator for LiveTVStreaming.services
 */

import { formatUsd, getMainPrice } from './pricing';
import type { StreamingService } from '../types';

export const BASE_URL = 'https://livetvstreaming.services';

/**
 * Deterministic hash from string to pick template variations
 */
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function pickVariation<T>(items: T[], seed: string): T {
  const index = hashString(seed) % items.length;
  return items[index];
}

/**
 * Generate SEO titles (under 60 chars) and descriptions (under 155 chars)
 */
export function generatePageMeta(pageType: string, params: Record<string, any> = {}) {
  const year = '2026';

  switch (pageType) {
    case 'home':
      return {
        title: `Live TV Streaming Services: Compare Plans & Channels (${year})`,
        description: `Independent comparison of live TV streaming services. Use our channel finder to compare YouTube TV, Sling, Fubo, and DirecTV Stream.`,
        canonical: `${BASE_URL}/`
      };

    case 'service': {
      const name = params.name || 'Streaming Service';
      const price = params.price ? `${formatUsd(Number(params.price))}/mo` : '';
      const templates = [
        {
          title: `${name} Review (${year}): Plans, Channels & Pricing`,
          description: `Is ${name} worth ${price}? Full editorial review covering channel lineup, DVR storage, streams, pros, cons, and alternatives.`
        },
        {
          title: `${name} Review (${year}) – Channels, Cost & Verdict`,
          description: `Our in-depth test of ${name} (${price}). See verified channel carriage, simultaneous screens, cloud DVR limits, and cheaper options.`
        },
        {
          title: `${name} Channel Lineup & Review (${year})`,
          description: `Detailed guide to ${name} (${price}). Explore sports networks, local broadcasts, 4K streaming, and hands-on editor verdict.`
        }
      ];
      const picked = pickVariation(templates, params.slug || name);
      return {
        ...picked,
        canonical: `${BASE_URL}/services/${params.slug}/`
      };
    }

    case 'compare': {
      const { a, b, slug } = params;
      const templates = [
        {
          title: `${a} vs ${b} (${year}): Channels, Price & Winner`,
          description: `Compare ${a} vs ${b}. Side-by-side analysis of channel lineups, monthly costs, sports coverage, and cloud DVR features.`
        },
        {
          title: `${a} vs. ${b}: Which Is Better in ${year}?`,
          description: `Stuck between ${a} and ${b}? See exactly which channels only one carries, price differences, and our expert recommendation.`
        },
        {
          title: `${a} vs ${b} Head-to-Head Comparison`,
          description: `Detailed face-off: ${a} against ${b}. Find out which service gives you more sports, locals, and value for your cord-cutting budget.`
        }
      ];
      const picked = pickVariation(templates, slug || `${a}-${b}`);
      return {
        ...picked,
        canonical: `${BASE_URL}/compare/${slug}/`
      };
    }

    case 'channel': {
      const { channelName, slug, cheapestService, cheapestPrice } = params;
      const priceStr = cheapestPrice ? `from $${cheapestPrice}/mo` : '';
      const templates = [
        {
          title: `How to Watch ${channelName} Live Without Cable (${year})`,
          description: `Find which streaming services carry ${channelName}. Cheapest option: ${cheapestService || 'compare'} ${priceStr}. Full lineup breakdown.`
        },
        {
          title: `Which Streaming Service Has ${channelName}? (${year})`,
          description: `Looking for ${channelName}? Compare every live TV provider carrying it, starting ${priceStr}. Filter with our channel finder.`
        },
        {
          title: `Watch ${channelName} Without Cable: Best Services`,
          description: `Never miss ${channelName}. Complete guide to legal cord-cutting options, free trials, and channel bundle comparisons.`
        }
      ];
      const picked = pickVariation(templates, slug || channelName);
      return {
        ...picked,
        canonical: `${BASE_URL}/channels/${slug}/`
      };
    }

    case 'local': {
      const { marketName, slug, city, state } = params;
      const templates = [
        {
          title: `Live TV Streaming in ${city}, ${state} (${year})`,
          description: `Watch ABC, CBS, FOX, and NBC in ${city}. Compare local affiliate carriage on YouTube TV, Hulu, Fubo, and DirecTV Stream.`
        },
        {
          title: `Local Channels in ${city} Without Cable (${year})`,
          description: `Complete guide to cord-cutting in ${marketName}. See which streaming services deliver your local stations and regional news.`
        },
        {
          title: `Best Live TV Service for ${city}, ${state}`,
          description: `Check local station availability for ${city}. Verify W-call letters and regional network feeds without traditional cable.`
        }
      ];
      const picked = pickVariation(templates, slug || city);
      return {
        ...picked,
        canonical: `${BASE_URL}/local/${slug}/`
      };
    }

    case 'team': {
      const { teamName, league, slug } = params;
      const templates = [
        {
          title: `How to Watch ${teamName} Games Without Cable (${year})`,
          description: `Live stream every ${teamName} game in ${year}. Regional network details, national broadcast channels, and cheapest packages.`
        },
        {
          title: `${teamName} Live Stream: Watch Online (${league})`,
          description: `Cord-cutter's guide for ${teamName} fans. Compare streaming providers carrying your local broadcasts without blackout headaches.`
        },
        {
          title: `Watch ${teamName} Games Live: Channels & Services`,
          description: `Find which services carry ${teamName} broadcasts this season. Avoid cable contracts while keeping every kickoff and tip-off.`
        }
      ];
      const picked = pickVariation(templates, slug || teamName);
      return {
        ...picked,
        canonical: `${BASE_URL}/watch/${league.toLowerCase()}/${slug}/`
      };
    }

    case 'device': {
      const { deviceName, slug } = params;
      return {
        title: `Best Live TV Streaming Services for ${deviceName}`,
        description: `Compare app performance, 4K HDR playback, and remote integration for YouTube TV, Sling, Fubo, and more on ${deviceName}.`,
        canonical: `${BASE_URL}/devices/${slug}/`
      };
    }

    case 'hub-services':
      return {
        title: `All Live TV Streaming Services Compared (${year})`,
        description: `Comprehensive directory and ranking of legal US live TV streaming providers. Compare pricing, channel counts, and features.`,
        canonical: `${BASE_URL}/services/`
      };

    case 'hub-compare':
      return {
        title: `Head-to-Head Streaming Comparisons Directory (${year})`,
        description: `Browse all pairwise comparisons between YouTube TV, Hulu + Live TV, Sling, Fubo, DirecTV Stream, Philo, and Frndly TV.`,
        canonical: `${BASE_URL}/compare/`
      };

    case 'hub-channels':
      return {
        title: `US TV Channels Streaming Directory (${year})`,
        description: `Find which live TV streaming services carry your favorite sports, news, and entertainment networks without cable.`,
        canonical: `${BASE_URL}/channels/`
      };

    case 'hub-local':
      return {
        title: `Local TV Markets Streaming Guide (Top 25 DMAs)`,
        description: `Explore local broadcast affiliate carriage by city and state across major live TV streaming providers.`,
        canonical: `${BASE_URL}/local/`
      };

    case 'hub-sports': {
      const league = params.league || 'NFL';
      return {
        title: `How to Stream ${league} Games Without Cable (${year})`,
        description: `Complete cord-cutter's handbook for all ${league} franchises. Find local networks and national channel carriers.`,
        canonical: `${BASE_URL}/watch/${league.toLowerCase()}/`
      };
    }

    case 'hub-devices':
      return {
        title: `Live TV Streaming Apps by Device & Platform (${year})`,
        description: `Discover which streaming services run best on Roku, Fire TV, Apple TV, Google TV, smart TVs, and game consoles.`,
        canonical: `${BASE_URL}/devices/`
      };

    case 'trust': {
      const title = params.title || 'Editorial';
      return {
        title: `${title} | LiveTVStreaming.services`,
        description: params.description || `Independent, consumer-first editorial principles and testing standards for live TV streaming services.`,
        canonical: `${BASE_URL}/${params.slug}/`
      };
    }

    default:
      return {
        title: `Live TV Streaming Services: Compare & Save (${year})`,
        description: `Independent comparison and channel finder for US cord-cutters.`,
        canonical: `${BASE_URL}/`
      };
  }
}

/**
 * Generate Structured Data (JSON-LD)
 * Per spec: Organization + WebSite without SearchAction
 */
export function generateSiteSchema() {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'LiveTVStreaming.services',
      url: BASE_URL,
      logo: `${BASE_URL}/logo.png`,
      publishingPrinciples: `${BASE_URL}/editorial-policy/`
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'LiveTVStreaming.services',
      url: BASE_URL
    }
  ];
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`
    }))
  };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  if (!faqs || faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

/**
 * Product + Editorial Review Schema
 * Requirement 3: Remove AggregateRating everywhere (one editor's score is not an aggregate).
 * Keep Product + editorial Review with author and datePublished.
 */
export function generateProductReviewSchema(
  service: Pick<
    StreamingService,
    'name' | 'monthlyPrice' | 'planName' | 'editorialRating' | 'summary' | 'slug' | 'datePublished' | 'dateModified'
  >
) {
  // Must match the main price rendered on the page (also getMainPrice / monthlyPrice).
  const price = getMainPrice(service);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: service.name,
    description: service.summary,
    brand: {
      '@type': 'Brand',
      name: service.name
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: price.toFixed(2),
      description: `${service.planName} (monthly)`,
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: price.toFixed(2),
        priceCurrency: 'USD',
        unitCode: 'MON'
      },
      availability: 'https://schema.org/InStock',
      url: `${BASE_URL}/services/${service.slug}/`
    },
    review: {
      '@type': 'Review',
      datePublished: service.datePublished || '2026-01-15',
      dateModified: service.dateModified || '2026-10-01',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: service.editorialRating,
        bestRating: '5',
        worstRating: '1'
      },
      author: {
        '@type': 'Organization',
        name: 'LiveTVStreaming Editorial Team',
        url: `${BASE_URL}/about/`
      },
      reviewBody: service.summary
    }
  };
}
