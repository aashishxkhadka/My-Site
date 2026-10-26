import type { CollectionEntry } from 'astro:content';
import type { MarkdownHeading } from 'astro';

export type Post = CollectionEntry<'blog'> | CollectionEntry<'stories'>;

/** A blog post's topic (its first one), which decides its URL. Stories have none. */
export const postTopic = (post: Post): string | undefined => (post.collection === 'blog' ? post.data.topics[0] : undefined);

/** /blog/[topic]/[slug]/, /blog/[slug]/ (no topic) or /stories/[slug]/. */
export const postPath = (post: Post) => {
  const topic = postTopic(post);
  return topic ? `/blog/${topic}/${post.id}/` : `/${post.collection}/${post.id}/`;
};

/** Hand-picked related posts first, topped up with the most recent posts sharing a topic (×2) or tags. */
export function relatedPosts<P extends Post>(post: P, all: P[], count = 3): P[] {
  const picked = post.data.related.map((id) => all.find((p) => p.id === id)).filter((p): p is P => !!p);
  const shared = all
    .filter((p) => p.id !== post.id && !picked.includes(p))
    .map((p) => ({
      p,
      score: 2 * p.data.topics.filter((t) => post.data.topics.includes(t)).length + p.data.tags.filter((t) => post.data.tags.includes(t)).length,
    }))
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
