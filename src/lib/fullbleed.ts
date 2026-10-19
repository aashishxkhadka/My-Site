/**
 * Fullbleed CMS (https://fullbleed.basilpot.com) — read-only public API client
 * and an Astro content loader that turns published Fullbleed posts into
 * `blog` entries at build time.
 *
 * Auth: a workspace-scoped publishable key (`kb_pub_…`) in FULLBLEED_API_KEY.
 * Locally: put it in `.env` (git-ignored). On GitHub: a repository secret.
 * Without a key the loader logs a notice and loads nothing from the CMS, so
 * the site still builds from the local MDX files.
 */
import type { Loader, LoaderContext } from 'astro/loaders';
import type { MarkdownHeading } from 'astro';
import { loadEnv } from 'vite';
import { TOPIC_KEYS } from '@/site.config';

const BASE = process.env.FULLBLEED_API_URL ?? 'https://fullbleed.basilpot.com/api/v1';

type Ref = { id: string; name: string; slug: string };
export type FullbleedItem = {
  id: string;
  type: 'page' | 'service' | 'post';
  title: string;
  slug: string;
  bodyHtml: string;
  status: string;
  publishedAt: string;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  coverImage: string | null;
  author: Ref | null;
  category: Ref | null;
  tags: Ref[];
  createdAt: string;
  updatedAt: string;
};

async function get<T>(path: string, key: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: { Authorization: `Bearer ${key}`, Accept: 'application/json', 'User-Agent': 'aashishkhadka-site-build/1.0 (+https://aashishxkhadka.github.io)' } });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Fullbleed ${path} → ${res.status} ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

/** All published items of a list endpoint, following pagination. */
export async function listAll(endpoint: '/posts' | '/pages' | '/services', key: string): Promise<FullbleedItem[]> {
  const out: FullbleedItem[] = [];
  for (let page = 1; page < 100; page++) {
    const { data, meta } = await get<{ data: FullbleedItem[]; meta: { page: number; limit: number; total: number } }>(`${endpoint}?limit=100&page=${page}`, key);
    out.push(...data);
    if (out.length >= meta.total || data.length === 0) break;
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* HTML helpers                                                        */
/* ------------------------------------------------------------------ */

const decode = (s: string) =>
  s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'");
const stripTags = (html: string) => decode(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);

/** Adds ids to <h2>/<h3> (for the table of contents) and returns the headings. */
function withHeadingIds(html: string): { html: string; headings: MarkdownHeading[] } {
  const headings: MarkdownHeading[] = [];
  const used = new Set<string>();
  const out = html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (_m, level: string, attrs: string, inner: string) => {
    const text = stripTags(inner);
    const existing = /\sid=["']([^"']+)["']/i.exec(attrs)?.[1];
    let slug = existing ?? (slugify(text) || 'section');
    if (!existing) {
      let n = 2;
      while (used.has(slug)) slug = `${slugify(text)}-${n++}`;
    }
    used.add(slug);
    headings.push({ depth: Number(level), slug, text });
    return existing ? `<h${level}${attrs}>${inner}</h${level}>` : `<h${level}${attrs} id="${slug}">${inner}</h${level}>`;
  });
  return { html: out, headings };
}

/** Meta description: the SEO field if set, otherwise the first ~150 chars of the body. */
function describe(item: FullbleedItem, text: string): string {
  const fromMeta = item.metaDescription?.trim();
  if (fromMeta && fromMeta.length >= 50 && fromMeta.length <= 155) return fromMeta;
  const base = fromMeta && fromMeta.length > 155 ? fromMeta : text;
  let d = base.length > 155 ? `${base.slice(0, 152).replace(/\s+\S*$/, '')}…` : base;
  if (d.length < 50) d = `${item.title}. ${d}`.trim();
  if (d.length < 50) d = `${d} Notes on growth, SEO and marketing by Aashish Khadka.`;
  return d.length > 155 ? `${d.slice(0, 152).replace(/\s+\S*$/, '')}…` : d;
}

/* ------------------------------------------------------------------ */
/* Loader                                                              */
/* ------------------------------------------------------------------ */

/**
 * Wraps another loader (the local MDX glob) and adds published Fullbleed posts
 * to the same collection, so templates treat both sources the same way.
 *
 * Mapping (Fullbleed → blog schema):
 *   category slug / tag slugs matching a topic key → topics (e.g. "technical-seo")
 *   other tags                                      → tags
 *   metaTitle (≤ 60 chars)                          → seo.title
 *   coverImage                                      → coverImageUrl
 *   first tag that is not a topic, else category    → primaryKeyword
 */
export function withFullbleedPosts(base: Loader): Loader {
  return {
    name: 'fullbleed-posts',
    load: async (ctx: LoaderContext) => {
      await base.load(ctx);
      const key = process.env.FULLBLEED_API_KEY ?? loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '').FULLBLEED_API_KEY;
      if (!key) {
        ctx.logger.info('FULLBLEED_API_KEY not set: skipping CMS posts (local MDX only).');
        return;
      }
      let posts: FullbleedItem[];
      try {
        posts = await listAll('/posts', key);
      } catch (err) {
        // FULLBLEED_STRICT=1 (set in the deploy workflow once the API is reliably reachable from CI)
        // fails the build instead, so a broken key or outage never silently removes posts from the live site.
        const msg = (err as Error).message.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').slice(0, 160);
        if (process.env.FULLBLEED_STRICT === '1') throw err;
        if (process.env.GITHUB_ACTIONS) console.log(`::warning title=Fullbleed CMS unreachable::${msg}`);
        ctx.logger.warn(`Could not reach Fullbleed (building without CMS posts): ${msg}`);
        return;
      }

      const topicKeys = TOPIC_KEYS as readonly string[];
      let added = 0;
      for (const item of posts) {
        const id = slugify(item.slug) || item.id;
        if (ctx.store.get(id)) {
          ctx.logger.warn(`Fullbleed post "${item.slug}" skipped: a local MDX post already uses that slug.`);
          continue;
        }
        const { html, headings } = withHeadingIds(item.bodyHtml ?? '');
        const text = stripTags(html);
        const slugs = [item.category?.slug, ...item.tags.map((t) => t.slug)].filter((s): s is string => !!s);
        const topics = [...new Set(slugs.filter((s) => topicKeys.includes(s)))];
        const tags = item.tags.filter((t) => !topicKeys.includes(t.slug)).map((t) => t.name);
        const published = new Date(item.publishedAt);
        const updated = new Date(item.updatedAt);
        const metaTitle = item.metaTitle?.trim();

        const raw = {
          title: item.title.slice(0, 100),
          description: describe(item, text),
          pubDate: published,
          ...(updated.valueOf() - published.valueOf() > 86_400_000 ? { updatedDate: updated } : {}),
          topics,
          tags,
          primaryKeyword: tags[0] ?? item.category?.name ?? item.title,
          ...(item.coverImage ? { coverImageUrl: item.coverImage, heroAlt: item.title } : {}),
          draft: false,
          source: 'fullbleed',
          seo: metaTitle && metaTitle.length <= 60 ? { title: metaTitle } : {},
        };

        try {
          const data = await ctx.parseData({ id, data: raw });
          ctx.store.set({
            id,
            data,
            body: text,
            rendered: { html, metadata: { headings } },
            digest: ctx.generateDigest({ ...raw, html }),
          });
          added++;
        } catch (err) {
          ctx.logger.warn(`Fullbleed post "${item.slug}" skipped: ${(err as Error).message}`);
        }
      }
      ctx.logger.info(`Loaded ${added} post${added === 1 ? '' : 's'} from Fullbleed.`);
    },
  };
}
