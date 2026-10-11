import type { APIRoute } from 'astro';
import { generateSitemapXml, getPagesSitemapEntries } from '../lib/sitemap';

export const GET: APIRoute = async () => {
  return new Response(generateSitemapXml(getPagesSitemapEntries()), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
};
