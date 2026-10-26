/**
 * Redirect map — the source of truth for migrating off WordPress.
 *
 * Hosting is GitHub Pages (no server-side redirects), so:
 *   - exact paths in PATH_REDIRECTS become static redirect pages
 *     (src/pages/[...legacy].astro: meta refresh + canonical + noindex);
 *   - old WordPress sitemap URLs (*.xml) serve a sitemap index pointing at
 *     /sitemap.xml, the real sitemap (src/pages/[legacy].xml.ts);
 *   - splats (/x/*) are only documented here; list each known URL explicitly.
 * QUERY_REDIRECTS (?page_id=) can't be done on GitHub Pages; those URLs load
 * the homepage. They'd need Cloudflare Redirect Rules if DNS moves there.
 */

export type PathRedirect = {
  from: string; // path, may end in /* (splat)
  to: string;
  status: 301 | 302;
  note?: string;
};

export type QueryRedirect = {
  path: string;
  query: string; // exact match, e.g. 'page_id=908'
  to: string;
  status: 301;
  note?: string;
};

/* ------------------------------------------------------------------ */
/* Query-string URLs → Cloudflare Redirect Rules                       */
/* ------------------------------------------------------------------ */

export const QUERY_REDIRECTS: QueryRedirect[] = [
  { path: '/', query: 'page_id=908', to: '/services/', status: 301, note: 'Old WP services page' },
  // TODO: add every ?p= / ?page_id= URL from the Search Console export
];

/* ------------------------------------------------------------------ */
/* Path redirects → public/_redirects                                  */
/* For exact paths the generator writes both `/x` and `/x/`.           */
/* ------------------------------------------------------------------ */

export const PATH_REDIRECTS: PathRedirect[] = [
  // Feeds
  { from: '/feed', to: '/rss.xml', status: 301 },
  { from: '/feed/*', to: '/rss.xml', status: 301 },
  { from: '/comments/feed/*', to: '/rss.xml', status: 301 },

  // WordPress / Yoast / Rank Math sitemaps
  // (/sitemap.xml itself is the real sitemap, written after the build: see astro.config.mjs.)
  { from: '/wp-sitemap.xml', to: '/sitemap.xml', status: 301 },
  { from: '/sitemap_index.xml', to: '/sitemap.xml', status: 301 },
  { from: '/page-sitemap.xml', to: '/sitemap.xml', status: 301 },
  { from: '/post-sitemap.xml', to: '/sitemap.xml', status: 301 },

  // Archives. Catch-alls for now; replace with per-category → /blog/[topic]/ mappings once we have the list.
  { from: '/category/*', to: '/blog/', status: 301, note: 'TODO: map each category to a topic hub' },
  { from: '/tag/*', to: '/blog/', status: 301 },
  { from: '/author/*', to: '/about/', status: 301 },
  { from: '/page/*', to: '/blog/', status: 301, note: 'WP homepage pagination' },

  // Known archive URLs from the old WordPress sitemap (splats above don't work on GitHub Pages).
  { from: '/category/digital-marketing', to: '/blog/', status: 301 },
  { from: '/author/moon', to: '/about/', status: 301 },

  // Old WordPress post/page slugs (posts at the root → /blog/[slug]/).
  // TODO: fill from the Search Console export. Never let an indexed URL 404.
  // { from: '/old-post-slug', to: '/blog/old-post-slug/', status: 301 },
];

/*
 * Deliberately NOT redirected (404s are correct here, none are indexed content):
 * /wp-admin/*, /wp-login.php, /xmlrpc.php, /wp-json/*.
 * Exception: if Search Console shows indexed /wp-content/uploads/* files (PDFs,
 * images), map each one individually.
 *
 * Host-level rules go in the Cloudflare zone, not here:
 *   http → https       : SSL/TLS → "Always Use HTTPS"
 *   www → non-www      : Redirect Rule, 301, keep path + query
 *   *.pages.dev        : X-Robots-Tag: noindex via public/_headers
 *   /about → /about/   : automatic on Pages (directory build format)
 */
