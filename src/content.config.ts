/**
 * Content collections — every content type has a typed schema.
 *
 * URLs come from the entry id (filename), never from frontmatter taxonomy,
 * so moving a post between topics / groups never changes its URL.
 */
import { defineCollection, reference, type SchemaContext } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { SERVICE_GROUP_KEYS, TOPIC_KEYS } from './site.config';
import { withFullbleedPosts } from './lib/fullbleed';

/* ------------------------------------------------------------------ */
/* Shared fields                                                       */
/* ------------------------------------------------------------------ */

const mdx = (dir: string) => glob({ pattern: '**/[^_]*.{md,mdx}', base: `./src/content/${dir}` });

/** Meta description: unique per page, ≤ 155 chars. */
const description = z.string().min(50).max(155);

const faq = z
  .array(z.object({ question: z.string(), answer: z.string() }))
  .default([]);

/** Per-entry SEO overrides. Everything else is derived. */
const seo = z
  .object({
    /** Full <title> override, used without the site suffix. */
    title: z.string().max(65).optional(), // Google cuts by pixel width (~580px); keep under ~60 where possible
    noindex: z.boolean().default(false),
    /** Custom OG image; otherwise generated with satori. */
    ogImage: z.string().optional(),
  })
  .prefault({});

const topics = z.array(z.enum(TOPIC_KEYS));

const link = z.object({ label: z.string(), href: z.string() });

/** Base for future 'generic' sections (courses, talks, newsletter…). */
export const entryBase = z.object({
  title: z.string(),
  description,
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  topics: topics.default([]),
  draft: z.boolean().default(false),
  seo,
});

/* ------------------------------------------------------------------ */
/* Posts: blog → /blog/[slug]/, stories → /stories/[slug]/             */
/* Same shape; local MDX + published Fullbleed posts (src/lib/fullbleed.ts). */
/* Fullbleed category "stories" → stories, everything else → blog.     */
/* ------------------------------------------------------------------ */

const postSchema = ({ image }: SchemaContext) =>
  z
    .object({
      title: z.string().max(100),
      description,
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      /** First topic = primary hub (breadcrumb + "more on X" link). CMS posts get it from their category. Unused on stories. */
      topics: topics.default([]),
      /** Free-form, used for on-page filtering only. No tag pages (thin content). */
      tags: z.array(z.string()).default([]),
      primaryKeyword: z.string(),
      secondaryKeywords: z.array(z.string()).default([]),
      heroImage: image().optional(),
      heroAlt: z.string().optional(),
      /** Remote cover image (Fullbleed media domain). */
      coverImageUrl: z.url().optional(),
      /** Where the post comes from. */
      source: z.enum(['mdx', 'fullbleed']).default('mdx'),
      draft: z.boolean().default(false),
      faq,

      /** 2–3 sentence direct answer rendered under the H1. */
      answer: z.string().max(500).optional(),
      keyTakeaways: z.array(z.string()).default([]),
      /** Hand-picked related posts (same collection); topped up automatically by shared topics/tags. */
      related: z.array(z.string()).max(3).default([]),
      /** The one relevant service to link to. */
      service: reference('services').optional(),
      /** BlogPosting.mentions — real entities only. */
      mentions: z.array(z.object({ name: z.string(), url: z.url().optional() })).default([]),
      /** Force TOC on/off. Default: auto when the post has ≥ 4 H2s. */
      toc: z.boolean().optional(),
      seo,
    })
    .refine((d) => !d.heroImage || !!d.heroAlt, { message: 'heroAlt is required when heroImage is set', path: ['heroAlt'] })
    .refine((d) => !d.updatedDate || d.updatedDate >= d.pubDate, { message: 'updatedDate is before pubDate', path: ['updatedDate'] });

const blog = defineCollection({
  loader: withFullbleedPosts(mdx('blog'), 'blog'),
  schema: postSchema,
});

const stories = defineCollection({
  loader: withFullbleedPosts(mdx('stories'), 'stories'),
  schema: postSchema,
});

/* ------------------------------------------------------------------ */
/* topics → /blog/[key]/  (hub intro copy; registry in site.config)   */
/* ------------------------------------------------------------------ */

const topicHubs = defineCollection({
  loader: mdx('topics'),
  schema: z.object({
    /** Must equal the filename and a TOPIC_KEYS entry. */
    topic: z.enum(TOPIC_KEYS),
    /** H1. Defaults to the label in site.config. */
    title: z.string().optional(),
    description,
    updatedDate: z.coerce.date(),
    /** Pinned pillar posts shown above the auto-list. */
    pillars: z.array(reference('blog')).default([]),
    faq,
    seo,
  }),
});

/* ------------------------------------------------------------------ */
/* services → /services/[slug]/                                        */
/* ------------------------------------------------------------------ */

const services = defineCollection({
  loader: mdx('services'),
  schema: z.object({
    title: z.string().max(60),
    /** Keyword-led H1 for the service page (the short `title` is used on cards and nav). */
    headline: z.string().max(80).optional(),
    primaryKeyword: z.string().optional(),
    secondaryKeywords: z.array(z.string()).default([]),
    description,
    /** Visual group on /services/ — not a URL segment. */
    group: z.enum(SERVICE_GROUP_KEYS),
    /** Shown as a card on the homepage (keep 3–5 true). */
    featured: z.boolean().default(false),
    order: z.number().default(100),
    /** One-line card text. */
    summary: z.string().max(160),
    /** schema.org Service.serviceType */
    serviceType: z.string(),

    /* Page sections, in render order. Body MDX is for extra detail. */
    forWho: z.array(z.string()).min(1),
    deliverables: z.array(z.string()).min(1),
    process: z.array(z.object({ title: z.string(), description: z.string() })).min(1),
    faq,
    relatedWork: z.array(reference('work')).default([]),
    relatedTopics: topics.default([]),

    areaServed: z.array(z.string()).default(['Nepal', 'Worldwide']),
    cta: link.default({ label: 'Start a conversation', href: '/contact/' }),
    draft: z.boolean().default(false),
    seo,
  }),
});

/* ------------------------------------------------------------------ */
/* work → /work/[slug]/   (case studies: problem → approach → result) */
/* ------------------------------------------------------------------ */

const work = defineCollection({
  loader: mdx('work'),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().max(100),
        description,
        /** Real client name, or omit when under NDA (then describe the client generically). */
        client: z.string().optional(),
        clientUrl: z.url().optional(),
        /** Filter facet on /work/. */
        industry: z.string(),
        services: z.array(reference('services')).min(1),
        /** Delivered personally or as a Basilpot team engagement. */
        via: z.enum(['personal', 'basilpot']).default('personal'),
        pubDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        heroImage: image().optional(),
        heroAlt: z.string().optional(),
        summary: z.string().max(200),
        /** Real numbers only. Use value: 'TODO' until confirmed — build warns on TODO. */
        results: z
          .array(z.object({ label: z.string(), value: z.string(), context: z.string().optional() }))
          .default([]),
        /** Named, attributable quotes only — no anonymous testimonials. */
        testimonial: z
          .object({ quote: z.string(), name: z.string(), role: z.string(), company: z.string().optional(), url: z.url().optional() })
          .optional(),
        featured: z.boolean().default(false),
        order: z.number().default(100),
        draft: z.boolean().default(false),
        seo,
      })
      .refine((d) => !d.heroImage || !!d.heroAlt, { message: 'heroAlt is required when heroImage is set', path: ['heroAlt'] }),
});

/* ------------------------------------------------------------------ */
/* projects → listed on /projects/ (no detail pages; link out)         */
/* ------------------------------------------------------------------ */

const projects = defineCollection({
  loader: mdx('projects'),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description,
      tagline: z.string().max(120),
      /** Live product URL */
      url: z.url().optional(),
      /** Product page on basilpot.com, if any */
      basilpotUrl: z.url().optional(),
      status: z.enum(['live', 'beta', 'in-development', 'archived']),
      /** Only claim SoftwareApplication when it really is one. */
      schemaType: z.enum(['SoftwareApplication', 'WebApplication', 'CreativeWork']),
      applicationCategory: z.string().optional(), // e.g. 'BusinessApplication'
      myRole: z.string().optional(),
      launched: z.coerce.date().optional(),
      logo: image().optional(),
      screenshot: image().optional(),
      screenshotAlt: z.string().optional(),
      featured: z.boolean().default(false),
      order: z.number().default(100),
      draft: z.boolean().default(false),
    }),
});

/* ------------------------------------------------------------------ */
/* resources → /resource/[slug]/                                       */
/* ------------------------------------------------------------------ */

const resources = defineCollection({
  loader: withFullbleedPosts(mdx('resources'), 'resources'),
  schema: ({ image }) =>
    z.object({
      title: z.string().max(100),
      description,
      kind: z.enum(['guide', 'template', 'checklist', 'tool']),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      topics: topics.default([]),
      /** Path under /public/downloads/ */
      file: z.string().optional(),
      externalUrl: z.url().optional(),
      heroImage: image().optional(),
      heroAlt: z.string().optional(),
      /** Remote cover image (e.g. from a CMS). */
      coverImageUrl: z.url().optional(),
      faq,
      draft: z.boolean().default(false),
      seo,
    }),
});

/* ------------------------------------------------------------------ */
/* clients → logo wall + /work/ (data only, no pages)                   */
/* ------------------------------------------------------------------ */

const clients = defineCollection({
  loader: file('src/content/clients.yaml'),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      /** Transparent PNG/WebP, roughly 5:2. Without one, the name is set in type. */
      logo: image().optional(),
      /** Logo is light-on-transparent and needs a dark tile. */
      logoOnDark: z.boolean().default(false),
      url: z.url().optional(),
      /** What was delivered: website build and/or media & marketing. */
      kind: z.array(z.enum(['web', 'marketing'])).min(1),
      industry: z.string().optional(),
      /** Shown in the homepage logo row (pick the clearest logos). */
      featured: z.boolean().default(false),
      order: z.number().default(100),
    }),
});

/* ------------------------------------------------------------------ */
/* testimonials → homepage (data only, no pages)                       */
/* Real words only: copy Google reviews (or messages you have          */
/* permission to quote) exactly. Never edit or invent them.            */
/* ------------------------------------------------------------------ */

const testimonials = defineCollection({
  loader: file('src/content/testimonials.yaml'),
  schema: z.object({
    /** The client's logo is shown when set (id in clients.yaml); otherwise initials. */
    client: reference('clients').optional(),
    /** Shown on the site: the client's exact words, shortened only by cutting sentences (marked …). ≤ 200 chars so cards stay equal. */
    quote: z.string().min(20).max(200),
    /** The full review as written, kept for reference. */
    original: z.string().optional(),
    name: z.string(),
    /** e.g. "Founder" or "Marketing Manager" */
    role: z.string().optional(),
    company: z.string().optional(),
    /** Where the words come from. Google reviews link to the profile. */
    source: z.enum(['google', 'linkedin', 'direct']),
    /** Star rating, for Google reviews. */
    rating: z.number().int().min(1).max(5).optional(),
    date: z.coerce.date().optional(),
    /** Our own description of the engagement, shown as context beside the quote (never inside it). */
    since: z.number().int().optional(),
    delivered: z.array(z.string()).default([]),
    /** Service pages show up to 3 testimonials that list the service. */
    services: z.array(reference('services')).default([]),
    /** Shown on the homepage (max 6). */
    featured: z.boolean().default(false),
    order: z.number().default(100),
    draft: z.boolean().default(false),
  }),
});

/* ------------------------------------------------------------------ */
/* pages → /now/, /privacy/, /terms/  (single prose pages)             */
/* ------------------------------------------------------------------ */

const pages = defineCollection({
  loader: mdx('pages'),
  schema: z.object({
    title: z.string(),
    description,
    updatedDate: z.coerce.date(),
    seo,
  }),
});

export const collections = { blog, stories, topics: topicHubs, services, work, projects, resources, clients, testimonials, pages };
