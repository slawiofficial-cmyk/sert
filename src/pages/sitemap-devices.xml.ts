import type { APIRoute } from 'astro';
import { generateSitemapXml, getDevicesSitemapEntries } from '../lib/sitemap';

export const GET: APIRoute = async () => {
  return new Response(generateSitemapXml(getDevicesSitemapEntries()), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
};
