/**
 * RSS feed of everything written: blog posts and stories, newest first.
 * Drafts never appear (getPublished hides them in production builds).
 */
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPublished, byNewest } from '@/lib/content';
import { postPath, postTopic, type Post } from '@/lib/posts';
import { SITE, TOPICS } from '@/site.config';

export async function GET(context: APIContext) {
  const posts: Post[] = [...(await getPublished('blog')), ...(await getPublished('stories'))].sort(byNewest);
  const category = (p: Post) => (p.collection === 'stories' ? 'Stories' : (TOPICS.find((t) => t.key === postTopic(p))?.label ?? 'Blog'));

  return rss({
    title: `${SITE.name}: Blog & Stories`,
    description: 'Notes on SEO, digital marketing, strategy and building a business in Nepal, by Aashish Khadka.',
    site: context.site ?? SITE.url,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.pubDate,
      link: postPath(p),
      categories: [category(p), ...p.data.tags],
    })),
    customData: '<language>en</language>',
    trailingSlash: true,
  });
}
