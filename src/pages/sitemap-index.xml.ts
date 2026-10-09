import type { APIRoute } from 'astro';
import { generateSitemapIndexXml } from '../lib/sitemap';

export const GET: APIRoute = async () => {
  return new Response(generateSitemapIndexXml(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
};
