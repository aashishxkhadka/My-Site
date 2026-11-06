/**
 * Share image for a post or resource: the cover the author uploaded, if any,
 * otherwise undefined so SEO.astro falls back to the generated /og/ card.
 * Order: seo.ogImage override → local heroImage → CMS coverImageUrl.
 */
import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';

interface CoverData {
  heroImage?: ImageMetadata | undefined;
  coverImageUrl?: string | undefined;
  seo: { ogImage?: string | undefined };
}

export interface ShareImage {
  ogImage?: string;
  ogImageSize?: { width: number; height: number };
}

export async function shareImage(d: CoverData): Promise<ShareImage> {
  if (d.seo.ogImage) return { ogImage: d.seo.ogImage };
  if (d.heroImage) {
    // 1200×630 JPEG crop: the size every network expects, and small enough to fetch quickly.
    const img = await getImage({ src: d.heroImage, width: 1200, height: 630, fit: 'cover', format: 'jpg', quality: 82 });
    return { ogImage: img.src, ogImageSize: { width: 1200, height: 630 } };
  }
  if (d.coverImageUrl) return { ogImage: d.coverImageUrl };
  return {};
}
