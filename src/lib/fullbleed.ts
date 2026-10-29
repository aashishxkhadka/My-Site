/**
 * Fullbleed CMS (https://fullbleed.basilpot.com) — read-only public API client
 * and Astro content loaders that turn published Fullbleed posts into `blog`,
 * `stories` and `resources` entries, and the latest post in the "now" category
 * into the Now page, at build time.
 *
 * Auth: a workspace-scoped publishable key (`kb_pub_…`) in FULLBLEED_API_KEY.
 * Locally: put it in `.env` (git-ignored). On GitHub: a repository secret.
 * Without a key the loader logs a notice and loads nothing from the CMS, so
 * the site still builds from the local MDX files.
 */
import type { Loader, LoaderContext } from 'astro/loaders';
import type { MarkdownHeading } from 'astro';
import { loadEnv } from 'vite';
import { execFile } from 'node:child_process';
import { TOPIC_KEYS, STORIES_CATEGORY, RESOURCES_CATEGORY, NOW_CATEGORY } from '@/site.config';

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

const USER_AGENT = 'aashishkhadka-site-build/1.0 (+https://aashishkhadka.com.np)';

/**
 * GET via curl. Cloudflare in front of Fullbleed challenges Node's built-in fetch
 * from GitHub's runners (by connection fingerprint, whatever the headers), while
 * curl with the same headers goes through. The key is passed on stdin, never argv.
 * Returns null when curl isn't installed, so the caller can fall back to fetch.
 */
function curlGet(url: string, key: string): Promise<{ status: number; body: string } | null> {
  const config = [`header = "Authorization: Bearer ${key}"`, 'header = "Accept: application/json"', `user-agent = "${USER_AGENT}"`].join('\n');
  return new Promise((resolve, reject) => {
    const child = execFile('curl', ['-sS', '--max-time', '30', '-K', '-', '-w', '\n%{http_code}', url], { maxBuffer: 50 * 1024 * 1024 }, (err, stdout) => {
      if (err && (err as NodeJS.ErrnoException).code === 'ENOENT') return resolve(null);
      if (err) return reject(new Error(`curl ${url}: ${err.message}`));
      const i = stdout.lastIndexOf('\n');
      resolve({ status: Number(stdout.slice(i + 1)), body: stdout.slice(0, i) });
    });
    child.stdin?.end(config);
  });
}

async function get<T>(path: string, key: string): Promise<T> {
  const url = `${BASE}${path}`;
  let res = await curlGet(url, key);
  if (!res) {
    const r = await fetch(url, { headers: { Authorization: `Bearer ${key}`, Accept: 'application/json', 'User-Agent': USER_AGENT } });
    res = { status: r.status, body: await r.text() };
  }
  if (res.status < 200 || res.status >= 300) throw new Error(`Fullbleed ${path} → ${res.status} ${res.body.slice(0, 200)}`);
  return JSON.parse(res.body) as T;
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
 * Routing: category "stories" → stories, "resources" → resources; everything else → blog.
 *
 * Mapping (Fullbleed → post schema):
 *   category slug matching a topic key → topics (e.g. "seo" → /blog/seo/)
 *   tags                               → tags
 *   metaTitle (≤ 60 chars)             → seo.title
 *   coverImage                         → coverImageUrl
 *   first tag, else category           → primaryKeyword
 *
 * A published CMS post replaces a local *draft* with the same slug; it never
 * replaces a published local post. Slugs equal to a topic key or "page" are
 * skipped on the blog, since those URLs belong to hub and pagination pages.
 */
/** One fetch shared by the blog and stories loaders within the same content sync. */
let cache: { key: string; at: number; posts: Promise<FullbleedItem[]> } | undefined;
const fetchPosts = (key: string) => {
  if (cache?.key !== key || Date.now() - cache.at > 30_000) cache = { key, at: Date.now(), posts: listAll('/posts', key) };
  return cache.posts;
};

/**
 * Runs a CMS fetch, or returns null (and logs why) when there is no key or the API is unreachable.
 * FULLBLEED_STRICT=1 (set in the deploy workflow once the API is reliably reachable from CI)
 * fails the build instead, so a broken key or outage never silently removes content from the live site.
 */
async function fetchFromCms(ctx: LoaderContext, what: string, fetcher: (key: string) => Promise<FullbleedItem[]>): Promise<FullbleedItem[] | null> {
  const key = process.env.FULLBLEED_API_KEY ?? loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '').FULLBLEED_API_KEY;
  if (!key) {
    ctx.logger.info(`FULLBLEED_API_KEY not set: skipping CMS ${what} (local MDX only).`);
    return null;
  }
  try {
    return await fetcher(key);
  } catch (err) {
    cache = undefined;
    const msg = (err as Error).message.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').slice(0, 160);
    if (process.env.FULLBLEED_STRICT === '1') throw err;
    if (process.env.GITHUB_ACTIONS) console.log(`::warning title=Fullbleed CMS unreachable::${msg}`);
    ctx.logger.warn(`Could not reach Fullbleed (building without CMS ${what}): ${msg}`);
    return null;
  }
}

type Target = 'blog' | 'stories' | 'resources';
/** Which section a Fullbleed post belongs to, by its category ('now' posts feed the Now page, not a section). */
const sectionOf = (item: FullbleedItem): Target | 'now' => {
  const c = item.category?.slug;
  return c === STORIES_CATEGORY ? 'stories' : c === RESOURCES_CATEGORY ? 'resources' : c === NOW_CATEGORY ? 'now' : 'blog';
};
const KINDS = ['guide', 'template', 'checklist', 'tool'] as const;

export function withFullbleedPosts(base: Loader, target: Target): Loader {
  return {
    name: `fullbleed-${target}`,
    load: async (ctx: LoaderContext) => {
      await base.load(ctx);
      const posts = await fetchFromCms(ctx, 'posts', fetchPosts);
      if (!posts) return;

      const topicKeys = TOPIC_KEYS as readonly string[];
      const reserved = target === 'blog' ? [...topicKeys, 'page'] : ['page'];
      let added = 0;
      for (const item of posts.filter((p) => sectionOf(p) === target)) {
        const id = slugify(item.slug) || item.id;
        if (reserved.includes(id)) {
          ctx.logger.warn(`Fullbleed post "${item.slug}" skipped: /${target}/${id}/ is reserved. Give it a different slug.`);
          continue;
        }
        const local = ctx.store.get(id);
        if (local && !(local.data as { draft?: boolean }).draft) {
          ctx.logger.warn(`Fullbleed post "${item.slug}" skipped: a local MDX post already uses that slug.`);
          continue;
        }
        const { html, headings } = withHeadingIds(item.bodyHtml ?? '');
        const text = stripTags(html);
        const category = item.category?.slug;
        const topics = target === 'blog' && category && topicKeys.includes(category) ? [category] : [];
        const tags = item.tags.map((t) => t.name);
        const published = new Date(item.publishedAt);
        const updated = new Date(item.updatedAt);
        const metaTitle = item.metaTitle?.trim();

        // Resources: a tag naming the kind (Guide, Template, Checklist, Tool) sets it; default Guide.
        const kind = KINDS.find((k) => item.tags.some((t) => t.slug === k || t.name.toLowerCase() === k)) ?? 'guide';
        const raw = target === 'resources' ? {
          title: item.title.slice(0, 100),
          description: describe(item, text),
          kind,
          pubDate: published,
          ...(updated.valueOf() - published.valueOf() > 86_400_000 ? { updatedDate: updated } : {}),
          ...(item.coverImage ? { coverImageUrl: item.coverImage, heroAlt: item.title } : {}),
          draft: false,
          seo: metaTitle && metaTitle.length <= 60 ? { title: metaTitle } : {},
        } : {
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
      ctx.logger.info(`Loaded ${added} ${target} post${added === 1 ? '' : 's'} from Fullbleed.`);
    },
  };
}

/**
 * Wraps the local `pages` loader: the most recently updated Fullbleed post in
 * category "now" becomes the Now page (slug and title in Fullbleed don't matter
 * for the URL, which stays /now/). There is no local now.mdx: without a key, or
 * with no such post, /now/ isn't built (the deploy sets FULLBLEED_STRICT=1, so
 * it fails rather than ship without it).
 *
 * Mapping: updatedAt → updatedDate ("Last updated"), metaTitle (≤ 60) → seo.title,
 * metaDescription (or the start of the body) → description.
 */
export function withFullbleedNow(base: Loader): Loader {
  return {
    name: 'fullbleed-now',
    load: async (ctx: LoaderContext) => {
      await base.load(ctx);
      const posts = await fetchFromCms(ctx, 'Now page', fetchPosts);
      if (!posts) return;

      const item = posts
        .filter((p) => sectionOf(p) === 'now')
        .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))[0];
      if (!item) {
        ctx.logger.warn(`No Fullbleed post in category "${NOW_CATEGORY}": /now/ will not be built.`);
        return;
      }
      const id = 'now';
      const { html, headings } = withHeadingIds(item.bodyHtml ?? '');
      const text = stripTags(html);
      const metaTitle = item.metaTitle?.trim();
      const raw = {
        title: item.title,
        description: describe(item, text),
        updatedDate: new Date(item.updatedAt),
        seo: metaTitle && metaTitle.length <= 60 ? { title: metaTitle } : {},
      };
      try {
        const data = await ctx.parseData({ id, data: raw });
        ctx.store.set({ id, data, body: text, rendered: { html, metadata: { headings } }, digest: ctx.generateDigest({ ...raw, html }) });
        ctx.logger.info(`Loaded the Now page from Fullbleed ("${item.title}").`);
      } catch (err) {
        ctx.logger.warn(`Fullbleed Now post "${item.slug}" skipped: ${(err as Error).message}`);
      }
    },
  };
}
