import type { CollectionEntry } from 'astro:content';
import { TOPICS, TOPIC_MIN_POSTS, topicPath } from '@/site.config';
import { getPublished } from './content';

type Topic = (typeof TOPICS)[number];
export type TopicInfo = Topic & { href: string; posts: CollectionEntry<'blog'>[]; hasPage: boolean; live: boolean };

/**
 * Every blog topic with its posts.
 *   hasPage: the hub at /blog/[key]/ is built (≥ 1 post), so it is safe to link to.
 *   live:    shown in navigation and indexable (≥ TOPIC_MIN_POSTS posts).
 */
export async function topicsInfo(): Promise<TopicInfo[]> {
  const posts = await getPublished('blog');
  return TOPICS.map((t) => {
    const mine = posts.filter((p) => (p.data.topics as string[]).includes(t.key));
    return { ...t, href: topicPath(t.key), posts: mine, hasPage: mine.length > 0, live: mine.length >= TOPIC_MIN_POSTS };
  });
}

/** Hrefs of writing sections that have nothing published yet (hidden from navigation). */
export async function emptySectionHrefs(): Promise<string[]> {
  const [stories, resources] = await Promise.all([getPublished('stories'), getPublished('resources')]);
  return [...(stories.length ? [] : ['/stories/']), ...(resources.length ? [] : ['/resource/'])];
}
