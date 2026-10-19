/**
 * Design candidates. Each lives in src/designs/<id>/ with its own Layout,
 * global.css, components and Home. Content, SEO and schema are shared.
 *
 * `/` renders the design imported in src/pages/index.astro.
 * Every candidate is previewable at /designs/<id>/ (noindex).
 * Once one is chosen, the others and these preview routes get deleted.
 */
export const DESIGNS = [
  { id: 'd1', name: 'Grotesk', note: 'White/black, one electric accent, Swiss grid' },
  { id: 'd2', name: 'Aurora', note: 'Drifting gradient light, grain, expressive display type' },
  { id: 'd3', name: 'Onchain', note: 'Web3 / artist: neon, holographic, grid horizon' },
  { id: 'd4', name: 'Editorial', note: 'Portrait-led, charcoal hero, real clients and products' },
  { id: 'd5', name: 'Editorial+', note: 'd4 with a layered portrait hero: name watermark, floating cards, logo strip' },
] as const;

export type DesignId = (typeof DESIGNS)[number]['id'];
