/**
 * Old WordPress sitemap URLs (sitemap_index.xml, wp-sitemap.xml, …) answer with a
 * sitemap index pointing at the real sitemap, so crawlers that remember them
 * still find every page. Names come from the .xml entries in PATH_REDIRECTS.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { PATH_REDIRECTS } from '@/redirects.config';
import { SITE } from '@/site.config';

export const getStaticPaths = (() =>
  PATH_REDIRECTS.filter((r) => /^\/[^/*]+\.xml$/.test(r.from)).map((r) => ({ params: { legacy: r.from.slice(1, -4) } }))) satisfies GetStaticPaths;

export const GET: APIRoute = () =>
  new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap><loc>${SITE.url}/sitemap.xml</loc></sitemap>\n</sitemapindex>\n`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
