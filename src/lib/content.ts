import { getCollection, type CollectionEntry, type CollectionKey } from 'astro:content';

/**
 * Drafts are visible in `astro dev` (so placeholder content can be designed
 * against) and excluded from every production build.
 */
export const isVisible = (data: { draft?: boolean }) => import.meta.env.DEV || !data.draft;

export async function getPublished<C extends CollectionKey>(collection: C): Promise<CollectionEntry<C>[]> {
  return getCollection(collection, ({ data }) => isVisible(data as { draft?: boolean }));
}

type Dated = { data: { pubDate: Date; updatedDate?: Date | undefined } };
export const byNewest = (a: Dated, b: Dated) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf();

type Ordered = { data: { order: number } };
export const byOrder = (a: Ordered, b: Ordered) => a.data.order - b.data.order;

/**
 * A work item gets its own case-study page only once its body has real text
 * (TODO comments don't count). Until then its card links to the client's site.
 */
export const hasCaseStudy = (item: CollectionEntry<'work'>) => (item.body ?? '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '').trim().length > 0;
export const workHref = (item: CollectionEntry<'work'>) => (hasCaseStudy(item) ? `/work/${item.id}/` : (item.data.clientUrl ?? '/work/'));
