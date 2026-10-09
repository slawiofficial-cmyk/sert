import { BASE_URL } from './seo';
import { services, channels, markets, teams, devices, getAllComparisonPairs } from './coverage';

export interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: 'daily' | 'weekly' | 'monthly';
  priority: number;
}

const LAST_MOD = '2026-10-01';

export function getServicesSitemapEntries(): SitemapEntry[] {
  return [
    { loc: `${BASE_URL}/services/`, lastmod: LAST_MOD, changefreq: 'weekly', priority: 0.9 },
    ...services.map(s => ({
      loc: `${BASE_URL}/services/${s.slug}/`,
      lastmod: LAST_MOD,
      changefreq: 'weekly' as const,
      priority: 0.9
    }))
  ];
}

export function getCompareSitemapEntries(): SitemapEntry[] {
  const pairs = getAllComparisonPairs();
  return [
    { loc: `${BASE_URL}/compare/`, lastmod: LAST_MOD, changefreq: 'weekly', priority: 0.8 },
    ...pairs.map(p => ({
      loc: `${BASE_URL}/compare/${p.slug}/`,
      lastmod: LAST_MOD,
      changefreq: 'weekly' as const,
      priority: 0.8
    }))
  ];
}

export function getChannelsSitemapEntries(): SitemapEntry[] {
  const categories = ['sports', 'news', 'entertainment', 'kids', 'lifestyle', 'local'];
  return [
    { loc: `${BASE_URL}/channels/`, lastmod: LAST_MOD, changefreq: 'weekly', priority: 0.9 },
    ...categories.map(cat => ({
      loc: `${BASE_URL}/channels/category/${cat}/`,
      lastmod: LAST_MOD,
      changefreq: 'weekly' as const,
      priority: 0.7
    })),
    ...channels.map(c => ({
      loc: `${BASE_URL}/channels/${c.slug}/`,
      lastmod: LAST_MOD,
      changefreq: 'weekly' as const,
      priority: 0.8
    }))
  ];
}

export function getLocalSitemapEntries(): SitemapEntry[] {
  const states = Array.from(new Set(markets.map(m => m.state.toLowerCase())));
  return [
    { loc: `${BASE_URL}/local/`, lastmod: LAST_MOD, changefreq: 'weekly', priority: 0.8 },
    ...states.map(state => ({
      loc: `${BASE_URL}/local/${state}/`,
      lastmod: LAST_MOD,
      changefreq: 'weekly' as const,
      priority: 0.7
    })),
    ...markets.map(m => ({
      loc: `${BASE_URL}/local/${m.slug}/`,
      lastmod: LAST_MOD,
      changefreq: 'weekly' as const,
      priority: 0.8
    }))
  ];
}

export function getTeamsSitemapEntries(): SitemapEntry[] {
  return [
    { loc: `${BASE_URL}/watch/`, lastmod: LAST_MOD, changefreq: 'weekly', priority: 0.8 },
    { loc: `${BASE_URL}/watch/nfl/`, lastmod: LAST_MOD, changefreq: 'weekly', priority: 0.8 },
    { loc: `${BASE_URL}/watch/nba/`, lastmod: LAST_MOD, changefreq: 'weekly', priority: 0.8 },
    ...teams.map(t => ({
      loc: `${BASE_URL}/watch/${t.league.toLowerCase()}/${t.slug}/`,
      lastmod: LAST_MOD,
      changefreq: 'weekly' as const,
      priority: 0.8
    }))
  ];
}

export function getDevicesSitemapEntries(): SitemapEntry[] {
  return [
    { loc: `${BASE_URL}/devices/`, lastmod: LAST_MOD, changefreq: 'monthly', priority: 0.7 },
    ...devices.map(d => ({
      loc: `${BASE_URL}/devices/${d.slug}/`,
      lastmod: LAST_MOD,
      changefreq: 'monthly' as const,
      priority: 0.7
    }))
  ];
}

export function getPagesSitemapEntries(): SitemapEntry[] {
  return [
    { loc: `${BASE_URL}/`, lastmod: LAST_MOD, changefreq: 'daily', priority: 1.0 },
    { loc: `${BASE_URL}/about/`, lastmod: LAST_MOD, changefreq: 'monthly', priority: 0.5 },
    { loc: `${BASE_URL}/how-we-test/`, lastmod: LAST_MOD, changefreq: 'monthly', priority: 0.6 },
    { loc: `${BASE_URL}/editorial-policy/`, lastmod: LAST_MOD, changefreq: 'monthly', priority: 0.5 },
    { loc: `${BASE_URL}/affiliate-disclosure/`, lastmod: LAST_MOD, changefreq: 'monthly', priority: 0.5 },
    { loc: `${BASE_URL}/privacy-policy/`, lastmod: LAST_MOD, changefreq: 'monthly', priority: 0.3 },
    { loc: `${BASE_URL}/terms/`, lastmod: LAST_MOD, changefreq: 'monthly', priority: 0.3 },
    { loc: `${BASE_URL}/contact/`, lastmod: LAST_MOD, changefreq: 'monthly', priority: 0.4 }
  ];
}

export function generateSitemapXml(entries: SitemapEntry[]): string {
  const rows = entries.map(e => `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority.toFixed(1)}</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rows}
</urlset>`;
}

export function generateSitemapIndexXml(): string {
  const sitemaps = [
    'sitemap-pages.xml',
    'sitemap-services.xml',
    'sitemap-compare.xml',
    'sitemap-channels.xml',
    'sitemap-local.xml',
    'sitemap-teams.xml',
    'sitemap-devices.xml'
  ];

  const rows = sitemaps.map(sm => `  <sitemap>
    <loc>${BASE_URL}/${sm}</loc>
    <lastmod>${LAST_MOD}</lastmod>
  </sitemap>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rows}
</sitemapindex>`;
}

export function generateRobotsTxt(): string {
  return `# robots.txt for livetvstreaming.services
User-agent: *
Allow: /

# Sitemaps
Sitemap: ${BASE_URL}/sitemap-index.xml
`;
}
