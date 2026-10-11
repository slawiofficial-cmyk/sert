import { services, channels, markets, teams, devices, getAllComparisonPairs } from './coverage';
import type { Channel, StreamingService, LocalMarket, SportsTeam } from '../types';

export interface RouteMatch {
  type:
    | 'home'
    | 'service'
    | 'compare'
    | 'channel'
    | 'channel-category'
    | 'local'
    | 'local-state'
    | 'team'
    | 'team-league'
    | 'device'
    | 'hub-services'
    | 'hub-compare'
    | 'hub-channels'
    | 'hub-local'
    | 'hub-watch'
    | 'hub-devices'
    | 'trust'
    | 'not-found';
  params: Record<string, string>;
}

export function parsePath(pathname: string): RouteMatch {
  // Normalize pathname: ensure leading slash, trim trailing slash for parsing
  let path = pathname.split('?')[0];
  if (!path.startsWith('/')) path = '/' + path;
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  if (path === '' || path === '/') {
    return { type: 'home', params: {} };
  }

  // Services
  if (path === '/services') {
    return { type: 'hub-services', params: {} };
  }
  const serviceMatch = path.match(/^\/services\/([a-z0-9-]+)$/);
  if (serviceMatch) {
    const slug = serviceMatch[1];
    if (services.some(s => s.slug === slug)) {
      return { type: 'service', params: { slug } };
    }
  }

  // Comparisons
  if (path === '/compare') {
    return { type: 'hub-compare', params: {} };
  }
  const compareMatch = path.match(/^\/compare\/([a-z0-9-]+-vs-[a-z0-9-]+)$/);
  if (compareMatch) {
    const slug = compareMatch[1];
    return { type: 'compare', params: { slug } };
  }

  // Channels
  if (path === '/channels') {
    return { type: 'hub-channels', params: {} };
  }
  const channelCatMatch = path.match(/^\/channels\/category\/([a-z0-9-]+)$/);
  if (channelCatMatch) {
    return { type: 'channel-category', params: { category: channelCatMatch[1] } };
  }
  const channelMatch = path.match(/^\/channels\/([a-z0-9-]+)$/);
  if (channelMatch) {
    const slug = channelMatch[1];
    if (channels.some(c => c.slug === slug)) {
      return { type: 'channel', params: { slug } };
    }
  }

  // Local markets
  if (path === '/local') {
    return { type: 'hub-local', params: {} };
  }
  const localMatch = path.match(/^\/local\/([a-z0-9-]+)$/);
  if (localMatch) {
    const slug = localMatch[1];
    const market = markets.find(m => m.slug === slug);
    if (market) {
      return { type: 'local', params: { slug } };
    }
    // Check if it's a state code (e.g. /local/ny/)
    const stateMatches = markets.filter(m => m.state.toLowerCase() === slug.toLowerCase());
    if (stateMatches.length > 0) {
      return { type: 'local-state', params: { state: slug.toUpperCase() } };
    }
  }

  // Sports Teams
  if (path === '/watch' || path === '/watch/nfl' || path === '/watch/nba') {
    const league = path.endsWith('/nba') ? 'NBA' : path.endsWith('/nfl') ? 'NFL' : 'ALL';
    return { type: 'hub-watch', params: { league } };
  }
  const teamMatch = path.match(/^\/watch\/(nfl|nba)\/([a-z0-9-]+)$/);
  if (teamMatch) {
    const league = teamMatch[1].toUpperCase();
    const slug = teamMatch[2];
    if (teams.some(t => t.slug === slug && t.league === league)) {
      return { type: 'team', params: { league, slug } };
    }
  }

  // Devices
  if (path === '/devices') {
    return { type: 'hub-devices', params: {} };
  }
  const deviceMatch = path.match(/^\/devices\/([a-z0-9-]+)$/);
  if (deviceMatch) {
    const slug = deviceMatch[1];
    if (devices.some(d => d.slug === slug)) {
      return { type: 'device', params: { slug } };
    }
  }

  // Static trust pages
  const trustPages = [
    'about',
    'how-we-test',
    'editorial-policy',
    'affiliate-disclosure',
    'privacy-policy',
    'terms',
    'contact'
  ];
  const trustMatch = path.match(/^\/([a-z0-9-]+)$/);
  if (trustMatch && trustPages.includes(trustMatch[1])) {
    return { type: 'trust', params: { slug: trustMatch[1] } };
  }

  return { type: 'not-found', params: { path } };
}

/**
 * Related content generators
 */
export function getRelatedChannels(currentChannel: Channel, count: number = 6): Channel[] {
  const sameCategory = channels.filter(c => c.category === currentChannel.category && c.id !== currentChannel.id);
  const others = channels.filter(c => c.category !== currentChannel.category && c.id !== currentChannel.id);
  return [...sameCategory, ...others].slice(0, count);
}

export function getAlternativeServices(currentService: StreamingService, count: number = 4): StreamingService[] {
  return services
    .filter(s => s.id !== currentService.id)
    .sort((a, b) => Math.abs(a.monthlyPrice - currentService.monthlyPrice) - Math.abs(b.monthlyPrice - currentService.monthlyPrice))
    .slice(0, count);
}

export function getNearbyMarkets(currentMarket: LocalMarket, count: number = 5): LocalMarket[] {
  const sameState = markets.filter(m => m.state === currentMarket.state && m.id !== currentMarket.id);
  const byRank = markets.filter(m => m.id !== currentMarket.id).sort((a, b) => Math.abs(a.dmaRank - currentMarket.dmaRank) - Math.abs(b.dmaRank - currentMarket.dmaRank));
  return [...sameState, ...byRank].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i).slice(0, count);
}

export function getRelatedTeams(currentTeam: SportsTeam, count: number = 6): SportsTeam[] {
  const sameDiv = teams.filter(t => t.league === currentTeam.league && t.conferenceOrDivision === currentTeam.conferenceOrDivision && t.id !== currentTeam.id);
  const sameLeague = teams.filter(t => t.league === currentTeam.league && t.id !== currentTeam.id);
  return [...sameDiv, ...sameLeague].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i).slice(0, count);
}
