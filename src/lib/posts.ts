import type { CollectionEntry } from 'astro:content';
import type { MarkdownHeading } from 'astro';

type Post = CollectionEntry<'blog'>;

/** Hand-picked related posts first, topped up with the most recent posts sharing a topic. */
export function relatedPosts(post: Post, all: Post[], count = 3): Post[] {
  const picked = post.data.related.map((r) => all.find((p) => p.id === r.id)).filter((p): p is Post => !!p);
  const shared = all
    .filter((p) => p.id !== post.id && !picked.includes(p))
    .map((p) => ({ p, score: p.data.topics.filter((t) => post.data.topics.includes(t)).length }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.p.data.pubDate.valueOf() - a.p.data.pubDate.valueOf())
    .map(({ p }) => p);
  return [...picked, ...shared].slice(0, count);
}

/** TOC from H2s (and H3s under them). Auto-shown at ≥ 4 H2s unless frontmatter overrides. */
export function tocFor(headings: MarkdownHeading[], force?: boolean) {
  const items = headings.filter((h) => h.depth === 2 || h.depth === 3);
  const h2s = items.filter((h) => h.depth === 2).length;
  const show = force ?? h2s >= 4;
  return show ? items : [];
}

/** ~220 wpm. */
export const readingMinutes = (body: string | undefined) => Math.max(1, Math.round((body ?? '').split(/\s+/).filter(Boolean).length / 220));
