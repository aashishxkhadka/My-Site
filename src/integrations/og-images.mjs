/**
 * Social share images (Open Graph, 1200×630), one per page, generated after the build.
 *
 * SEO.astro points every page's og:image at /og/<path>.png. Once the HTML is
 * written, this reads each page back (title, breadcrumb trail) and renders the
 * matching PNG, so a page and its image can never drift apart.
 * Images only exist in production builds; in dev the og:image URL 404s.
 */
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import sharp from 'sharp';

const ROOT = new URL('../../', import.meta.url);
const asset = (p) => new URL(`src/assets/${p}`, ROOT);

const W = 1200;
const H = 630;
const C = { bg: '#f6f5f1', ink: '#151514', muted: '#5d5b55', accent: '#c2410c', stage: '#1c1c1c', line: '#dedbd2' };

/** Title suffixes added by SEO.astro / seo.title overrides; the card shows the name separately. */
const SUFFIXES = [/\s+[—|]\s+Aashish Khadka$/];
/** Pages whose <title> doesn't make a good card headline. */
const OVERRIDES = {
  '/': { kicker: 'SEO & Digital Marketing Expert', title: 'I help businesses grow, properly.' },
  '/contact/': { kicker: 'Contact', title: "Let's talk about growing your business." },
};

const attr = (html, re) => html.match(re)?.[1]?.replace(/&amp;/g, '&').replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"');

/** Breadcrumb names between Home and the page itself, e.g. "Blog · SEO & Search". */
function kickerFrom(html) {
  for (const m of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
    try {
      const data = JSON.parse(m[1]);
      const nodes = data['@graph'] ?? [data];
      const list = nodes.find((n) => n['@type'] === 'BreadcrumbList');
      if (!list) continue;
      const names = list.itemListElement.map((i) => i.name ?? i.item?.name).filter(Boolean).slice(1);
      return (names.length > 1 ? names.slice(0, -1) : names).join(' · ');
    } catch {}
  }
  return '';
}

const h = (type, style, children) => ({ type, props: { style: { display: 'flex', ...style }, children } });

function card({ kicker, title, portrait }) {
  const size = title.length > 70 ? 54 : title.length > 42 ? 62 : 74;
  return h('div', { width: W, height: H, display: 'flex', background: C.bg, fontFamily: 'Cabinet Grotesk', color: C.ink }, [
    h('div', { flex: 1, display: 'flex', flexDirection: 'column', padding: '64px 56px 56px 72px' }, [
      h('div', { display: 'flex', alignItems: 'center', gap: 16, fontSize: 22, fontWeight: 500, letterSpacing: 3, textTransform: 'uppercase', color: C.muted }, [
        h('div', { width: 40, height: 3, background: C.accent }, []),
        kicker,
      ]),
      h('div', { display: 'flex', marginTop: 36, fontSize: size, fontWeight: 800, lineHeight: 1.04, letterSpacing: -1.5 }, title),
      h('div', { marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 28, borderTop: `2px solid ${C.line}` }, [
        h('div', { fontSize: 30, fontWeight: 800 }, 'Aashish Khadka'),
        h('div', { fontSize: 22, fontWeight: 500, color: C.muted }, 'SEO & Digital Marketing Expert · aashishkhadka.com.np'),
      ]),
    ]),
    h('div', { width: 400, margin: '40px 40px 40px 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden', borderRadius: 36, background: C.stage }, [
      { type: 'img', props: { src: portrait, width: 440, height: 660, style: { marginBottom: -150 } } },
    ]),
  ]);
}

async function* htmlFiles(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* htmlFiles(p);
    else if (e.name.endsWith('.html')) yield p;
  }
}

/** @returns {import('astro').AstroIntegration} */
export default function ogImages() {
  return {
    name: 'og-images',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const out = fileURLToPath(dir);
        const [extra, medium, cutout] = await Promise.all([
          readFile(asset('og/cabinet-grotesk-800.ttf')),
          readFile(asset('og/cabinet-grotesk-500.ttf')),
          sharp(fileURLToPath(asset('aashish-cutout.png'))).resize({ width: 704 }).png().toBuffer(),
        ]);
        const fonts = [
          { name: 'Cabinet Grotesk', data: extra, weight: 800, style: 'normal' },
          { name: 'Cabinet Grotesk', data: medium, weight: 500, style: 'normal' },
        ];
        const portrait = `data:image/png;base64,${cutout.toString('base64')}`;

        let count = 0;
        for await (const file of htmlFiles(out)) {
          const html = await readFile(file, 'utf8');
          const image = attr(html, /<meta property="og:image" content="([^"]+)"/);
          if (!image) continue;
          const { pathname } = new URL(image);
          if (!pathname.startsWith('/og/')) continue;

          const page = '/' + relative(out, dirname(file)).split('\\').join('/') + '/';
          const path = page === '//' ? '/' : page;
          let title = attr(html, /<meta property="og:title" content="([^"]+)"/) ?? '';
          for (const s of SUFFIXES) title = title.replace(s, '');
          const data = { kicker: kickerFrom(html), title, ...OVERRIDES[path], portrait };

          const svg = await satori(card(data), { width: W, height: H, fonts });
          const target = join(out, pathname);
          await mkdir(dirname(target), { recursive: true });
          await writeFile(target, await sharp(Buffer.from(svg)).png({ compressionLevel: 9, palette: false }).toBuffer());
          count++;
        }
        logger.info(`${count} share images written to /og/`);
      },
    },
  };
}
