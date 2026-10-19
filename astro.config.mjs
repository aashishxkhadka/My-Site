// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://aashishkhadka.com.np',
  trailingSlash: 'always',
  build: { format: 'directory' },
  // No prefetch, no client router: plain multi-page HTML.
  integrations: [
    mdx(),
    // Step 5 adds the noindex/draft/thin-page filter.
    sitemap({ filter: (page) => !page.includes('/404') && !page.includes('/designs/') }),
  ],
  image: {
    // AVIF first, WebP fallback via <Picture>.
    responsiveStyles: true,
  },
  // Fonts for every design candidate. Only the ones a page renders with <Font> ship.
  fonts: [
    // d1 — Grotesk
    { provider: fontProviders.fontsource(), name: 'Inter Tight', cssVariable: '--d1-sans', weights: ['400 800'], styles: ['normal'], subsets: ['latin'], fallbacks: ['system-ui', 'sans-serif'] },
    // d2 — Aurora
    { provider: fontProviders.fontshare(), name: 'Clash Display', cssVariable: '--d2-display', weights: ['500', '600'], styles: ['normal'], fallbacks: ['system-ui', 'sans-serif'] },
    { provider: fontProviders.fontshare(), name: 'Satoshi', cssVariable: '--d2-sans', weights: ['400', '500', '700'], styles: ['normal'], fallbacks: ['system-ui', 'sans-serif'] },
    // d3 — Onchain
    { provider: fontProviders.fontsource(), name: 'Syne', cssVariable: '--d3-display', weights: ['500 800'], styles: ['normal'], subsets: ['latin'], fallbacks: ['system-ui', 'sans-serif'] },
    { provider: fontProviders.fontsource(), name: 'Space Grotesk', cssVariable: '--d3-sans', weights: ['400 700'], styles: ['normal'], subsets: ['latin'], fallbacks: ['system-ui', 'sans-serif'] },
    { provider: fontProviders.fontsource(), name: 'JetBrains Mono', cssVariable: '--d3-mono', weights: ['400 600'], styles: ['normal'], subsets: ['latin'], fallbacks: ['ui-monospace', 'monospace'] },
    // d4 — Editorial
    { provider: fontProviders.fontshare(), name: 'Cabinet Grotesk', cssVariable: '--d4-display', weights: ['500', '700', '800'], styles: ['normal'], fallbacks: ['system-ui', 'sans-serif'] },
    { provider: fontProviders.fontsource(), name: 'Instrument Sans', cssVariable: '--d4-sans', weights: ['400 700'], styles: ['normal'], subsets: ['latin'], fallbacks: ['system-ui', 'sans-serif'] },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
