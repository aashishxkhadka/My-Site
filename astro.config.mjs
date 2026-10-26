// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import ogImages from './src/integrations/og-images.mjs';
import { readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';

const outDir = new URL('./dist/', import.meta.url);

/** A built page's HTML ('' if it isn't there). */
const builtHtml = (/** @type {string} */ page) => {
  try {
    return readFileSync(new URL(`.${new URL(page).pathname}index.html`, outDir), 'utf8');
  } catch {
    return '';
  }
};
/** Pages marked noindex (thin hubs, redirect stubs, empty sections) stay out of the sitemap. */
const isNoindex = (/** @type {string} */ page) => /<meta name="robots" content="noindex/.test(builtHtml(page));
/** <lastmod> from the page's real content date (SEO.astro's last-modified meta); pages without one get none. */
const lastmodOf = (/** @type {string} */ page) => builtHtml(page).match(/<meta name="last-modified" content="([^"]+)"/)?.[1];

/**
 * Makes /sitemap.xml the one real sitemap: @astrojs/sitemap writes sitemap-0.xml
 * plus an index; this moves the URL list to sitemap.xml and points the index at it.
 * (Only while everything fits in one file, i.e. under 45,000 URLs.)
 */
function mainSitemap() {
  return {
    name: 'main-sitemap',
    hooks: {
      'astro:build:done': () => {
        const part = new URL('sitemap-0.xml', outDir);
        if (!existsSync(part) || existsSync(new URL('sitemap-1.xml', outDir))) return;
        // One <url> per line, plus /sitemap.xsl so browsers show a table (search engines ignore it).
        const xml = readFileSync(part, 'utf8')
          .replace(/^<\?xml[^>]*\?>(<\?xml-stylesheet[^>]*\?>)?/, '<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n')
          .replace(/(<urlset[^>]*>)/, '$1\n')
          .replace(/<url>/g, '  <url>')
          .replace(/<\/url>/g, '</url>\n');
        writeFileSync(new URL('sitemap.xml', outDir), xml);
        rmSync(part);
        writeFileSync(
          new URL('sitemap-index.xml', outDir),
          '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap><loc>https://aashishkhadka.com.np/sitemap.xml</loc></sitemap>\n</sitemapindex>\n',
        );
      },
    },
  };
}

export default defineConfig({
  site: 'https://aashishkhadka.com.np',
  trailingSlash: 'always',
  build: { format: 'directory' },
  // No prefetch, no client router: plain multi-page HTML.
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/404') && !isNoindex(page),
      serialize: (item) => {
        const lastmod = lastmodOf(item.url);
        return lastmod ? { ...item, lastmod } : item;
      },
    }),
    mainSitemap(),
    ogImages(),
  ],
  image: {
    // AVIF first, WebP fallback via <Picture>.
    responsiveStyles: true,
  },
  // d4 type, used by d5.
  fonts: [
    { provider: fontProviders.fontshare(), name: 'Cabinet Grotesk', cssVariable: '--d4-display', weights: ['500', '700', '800'], styles: ['normal'], fallbacks: ['system-ui', 'sans-serif'] },
    { provider: fontProviders.fontsource(), name: 'Instrument Sans', cssVariable: '--d4-sans', weights: ['400 700'], styles: ['normal'], subsets: ['latin'], fallbacks: ['system-ui', 'sans-serif'] },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
