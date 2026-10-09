import type { APIRoute } from 'astro';
import { generateSitemapXml, getChannelsSitemapEntries } from '../lib/sitemap';

export const GET: APIRoute = async () => {
  return new Response(generateSitemapXml(getChannelsSitemapEntries()), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
};
