/**
 * Share image for a post or resource: the cover the author uploaded, if any,
 * otherwise undefined so SEO.astro falls back to the generated /og/ card.
 * Order: seo.ogImage override → local heroImage → CMS coverImageUrl.
 * Covers are re-encoded as a 1200×630 JPEG: every network reads JPEG (LinkedIn
 * often drops WebP), and 1200×630 is the size they all crop to anyway.
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

const SIZE = { width: 1200, height: 630 };
const toJpeg = async (src: ImageMetadata | string) =>
  (await getImage({ src, ...SIZE, fit: 'cover', format: 'jpg', quality: 82 })).src;

export async function shareImage(d: CoverData): Promise<ShareImage> {
  if (d.seo.ogImage) return { ogImage: d.seo.ogImage };
  if (d.heroImage) return { ogImage: await toJpeg(d.heroImage), ogImageSize: SIZE };
  if (d.coverImageUrl) {
    // Only hosts listed in astro.config image.domains get converted; getImage hands any other URL back unchanged.
    const src = await toJpeg(d.coverImageUrl).catch(() => d.coverImageUrl!);
    return src === d.coverImageUrl ? { ogImage: src } : { ogImage: src, ogImageSize: SIZE };
  }
  return {};
}
