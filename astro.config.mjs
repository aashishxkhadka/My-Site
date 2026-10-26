// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import ogImages from './src/integrations/og-images.mjs';
import { readFileSync } from 'node:fs';

const outDir = new URL('./dist/', import.meta.url);

/** Pages marked noindex (thin hubs, redirect stubs, empty sections) stay out of the sitemap. */
const isNoindex = (/** @type {string} */ page) => {
  try {
    const html = readFileSync(new URL(`.${new URL(page).pathname}index.html`, outDir), 'utf8');
    return /<meta name="robots" content="noindex/.test(html);
  } catch {
    return false;
  }
};

export default defineConfig({
  site: 'https://aashishkhadka.com.np',
  trailingSlash: 'always',
  build: { format: 'directory' },
  // No prefetch, no client router: plain multi-page HTML.
  integrations: [
    mdx(),
    sitemap({ filter: (page) => !page.includes('/404') && !isNoindex(page) }),
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
