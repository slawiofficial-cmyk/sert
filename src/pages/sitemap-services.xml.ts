import type { APIRoute } from 'astro';
import { generateSitemapXml, getServicesSitemapEntries } from '../lib/sitemap';

export const GET: APIRoute = async () => {
  return new Response(generateSitemapXml(getServicesSitemapEntries()), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
};
