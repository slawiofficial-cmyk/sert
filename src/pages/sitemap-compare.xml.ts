import type { APIRoute } from 'astro';
import { generateSitemapXml, getCompareSitemapEntries } from '../lib/sitemap';

export const GET: APIRoute = async () => {
  return new Response(generateSitemapXml(getCompareSitemapEntries()), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
};
