/**
 * site.config.ts — single source of truth.
 *
 * Read by: layouts, <Header>/<Footer>, <SEO>, the JSON-LD graph, llms.txt,
 * sitemap filters, and the content schemas (service groups + topics are
 * validated against the keys defined here).
 *
 * Rule: anything marked `TODO` is waiting on Aashish. Never fill it with a guess.
 * `null` means "not provided yet" — consumers must skip null values, not render them.
 */

/* ------------------------------------------------------------------ */
/* Site                                                                */
/* ------------------------------------------------------------------ */

/**
 * Preview builds (SITE_PREVIEW=1, set in the deploy workflow while the site runs on
 * new.aashishkhadka.com.np): every page is noindex, nofollow, so the preview never
 * competes with the live domain in Google. Remove the variable at launch.
 */
export const PREVIEW = typeof process !== 'undefined' && process.env.SITE_PREVIEW === '1';

export const SITE = {
  url: 'https://aashishkhadka.com.np', // https + non-www, no trailing slash
  name: 'Aashish Khadka',
  locale: 'en',
  /** Appended to page titles. Page part must stay ≤ 60 − suffix length (≈43 chars). */
  titleSuffix: ' — Aashish Khadka',
  /** Homepage <title> (used as-is, no suffix). ≤ 60 chars. */
  // Keeps the keywords the old site ranked for (SEO, digital marketing, expert, Pokhara).
  defaultTitle: 'SEO & Digital Marketing Expert in Pokhara | Aashish Khadka',
  /** Fallback meta description. ≤ 155 chars. */
  defaultDescription:
    'Aashish Khadka is an SEO and digital marketing expert in Pokhara, Nepal, and founder of Basilpot. Since 2022 he has helped 60+ businesses grow.',
  trailingSlash: true,
} as const;

/** Future locales (/ne/). Only `en` is built today; hreflang reads this. */
export const I18N = {
  defaultLocale: 'en',
  locales: ['en'] as const, // later: ['en', 'ne']
} as const;

/* ------------------------------------------------------------------ */
/* Contact — must match the Google Business Profile character for     */
/* character. Do not reformat.                                         */
/* ------------------------------------------------------------------ */

export const CONTACT = {
  email: 'aashishxseo@gmail.com',
  phoneDisplay: '+977 9805106358',
  phoneE164: '+9779805106358', // tel: links + schema telephone
  /** Same number as the phone. */
  whatsapp: 'https://wa.me/9779805106358' as string | null,
  address: {
    display: 'Pokhara, Nepal', // as shown on GBP
    locality: 'Pokhara',
    region: 'Gandaki',
    countryCode: 'NP',
    countryName: 'Nepal',
  },
  /** Google Business Profile, linked from the "Based in" card on /contact/. */
  mapUrl: 'https://www.google.com/search?kgmid=/g/11w5823yh_' as string | null,
  /** Form backend chosen in step 3: 'web3forms' | 'pages-function'. */
  form: { provider: 'web3forms' as const, accessKey: null as string | null }, // TODO
} as const;

/* ------------------------------------------------------------------ */
/* Socials — `sameAs` is derived from entries with a non-null url.     */
/* ------------------------------------------------------------------ */

export type Social = {
  key: string;
  label: string;
  url: string | null;
  handle?: string;
  /** Include in Person.sameAs */
  sameAs: boolean;
  /** Show in footer / about */
  visible: boolean;
};

export const SOCIALS: Social[] = [
  { key: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/aashishxkhadka/', sameAs: true, visible: true },
  { key: 'x', label: 'X', url: 'https://x.com/aashishxkhadka', handle: '@aashishxkhadka', sameAs: true, visible: true },
  { key: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/justaashish_/', sameAs: true, visible: true },
  { key: 'github', label: 'GitHub', url: null, sameAs: true, visible: true }, // TODO: GitHub URL
  // Knowledge Graph id of the Google Business Profile (stable; share.google links are redirects).
  { key: 'gbp', label: 'Google', url: 'https://www.google.com/search?kgmid=/g/11w5823yh_', sameAs: true, visible: false },
];

/* ------------------------------------------------------------------ */
/* Entities for the JSON-LD graph (@id-linked)                         */
/* ------------------------------------------------------------------ */

export const BASILPOT = {
  /** TODO: if basilpot.com already publishes an Organization @id, use that exact value instead. */
  id: `${SITE.url}/#basilpot`,
  name: 'Basilpot',
  url: 'https://basilpot.com',
  description: 'A growth studio. We help businesses grow with technology: strategy, websites and software, automation and digital marketing, all under one roof. We put the same energy into building our own products.',
  /** Short label for cards and one-liners. */
  tagline: 'Growth studio',
  founded: 2024,
  logo: null as string | null, // TODO: absolute URL to Basilpot logo
} as const;

export const PERSON = {
  id: `${SITE.url}/#person`,
  name: 'Aashish Khadka',
  givenName: 'Aashish',
  familyName: 'Khadka',
  jobTitle: 'Founder',
  worksFor: BASILPOT.id,
  founderOf: BASILPOT.id,
  /** Portrait lives at src/assets/aashish.jpg (imported by the schema builder). */
  education: [
    {
      credential: 'B.Sc. IT',
      institution: 'Infomax College of IT & Management',
      affiliation: 'Asia Pacific University (APU)',
      years: '2022–2025',
      status: 'completed' as const,
    },
    {
      credential: 'MBA',
      institution: 'Infomax College of IT & Management',
      affiliation: 'Asia Pacific University (APU)',
      years: '2026–',
      status: 'in-progress' as const,
    },
  ],
  /** Person.knowsAbout in JSON-LD. */
  knowsAbout: [
    'Growth strategy', 'Search engine optimization', 'Technical SEO', 'Local SEO',
    'Generative engine optimization', 'Digital marketing', 'Branding', 'Web development',
  ],
} as const;

/* ------------------------------------------------------------------ */
/* Stats — confirmed by Aashish. Only real, current numbers go here.   */
/* ------------------------------------------------------------------ */

export const STATS = {
  /** Businesses worked with, personally and through Basilpot (confirmed 2026-10-19). */
  businessesWorkedWith: 60,
  /** Year Aashish started doing this work (confirmed 2026-10-26). */
  workingSince: 2022,
  /** Google Business Profile star rating (confirmed 2026-10-26). Update when it changes. */
  googleRating: 4.9,
  /** Combined views on clients' social channels (confirmed 2026-10-26). */
  socialViews: '10M+',
} as const;

/* ------------------------------------------------------------------ */
/* Taxonomy — keys are validated by src/content.config.ts             */
/* ------------------------------------------------------------------ */

/** Visual grouping on /services/. Never a URL segment. */
export const SERVICE_GROUPS = [
  { key: 'strategy', label: 'Strategy' },
  { key: 'digital-marketing', label: 'Digital Marketing' },
  { key: 'design', label: 'Brand & Design' },
  { key: 'development', label: 'Web & IT' },
] as const;
export const SERVICE_GROUP_KEYS = SERVICE_GROUPS.map((g) => g.key) as [
  (typeof SERVICE_GROUPS)[number]['key'],
  ...(typeof SERVICE_GROUPS)[number]['key'][],
];

/**
 * Blog topics.
 *   Hub page:            /blog/[key]/
 *   Post in the topic:   /blog/[key]/[slug]/   (posts without a topic: /blog/[slug]/)
 * Every other path a post could have had redirects to its current one, so changing
 * a post's category never breaks a link.
 * Fullbleed: the post's category slug must equal a key here.
 * `service`: the service page posts in this topic link to, and whose "Further reading" lists them.
 * The hub's written intro lives in src/content/topics/[key].mdx (build fails if one is missing).
 * Keys are reserved: no post may use them as its slug (checked at build).
 */
export const TOPICS = [
  { key: 'strategy', label: 'Strategy & Brand', short: 'Growth plans, positioning, pricing and branding.', service: 'growth-strategy' },
  { key: 'marketing', label: 'Marketing', short: 'Ads, social media, content and tracking that bring in customers.', service: 'digital-marketing' },
  { key: 'seo', label: 'SEO & Search', short: 'SEO, local SEO, AI search and websites that get found.', service: 'seo' },
] as const;
export const TOPIC_KEYS = TOPICS.map((t) => t.key) as [
  (typeof TOPICS)[number]['key'],
  ...(typeof TOPICS)[number]['key'][],
];
export const topicPath = (key: string) => `/blog/${key}/`;

/** A topic hub appears in navigation and is indexable once it has this many posts. */
export const TOPIC_MIN_POSTS = 3;

/** Fullbleed category slug that sends a post to /stories/ instead of /blog/. */
export const STORIES_CATEGORY = 'stories';
/** Fullbleed category whose posts become Resources (/resource/[slug]/). A tag naming the kind (Guide, Template, Checklist, Tool) sets it; default Guide. */
export const RESOURCES_CATEGORY = 'resources';

/* ------------------------------------------------------------------ */
/* Sections — the extension point.                                     */
/* A new section = a collection in content.config.ts + an entry here.  */
/* `template: 'generic'` sections are rendered by                      */
/* src/pages/[section]/index.astro + [section]/[slug].astro, so no new */
/* page files are needed. 'custom' sections have their own templates.  */
/* ------------------------------------------------------------------ */

export type Section = {
  collection: string;
  base: `/${string}/`;
  label: string;
  template: 'custom' | 'generic';
  /** Has /base/[slug]/ detail pages */
  detailPages: boolean;
  enabled: boolean;
  inSitemap: boolean;
  inLlms: boolean;
  inRss: boolean;
  /** Paginated index → /base/page/N/ */
  pageSize?: number;
};

export const SECTIONS = {
  services:  { collection: 'services',  base: '/services/',  label: 'Services',  template: 'custom', detailPages: true,  enabled: true, inSitemap: true, inLlms: true, inRss: false },
  work:      { collection: 'work',      base: '/work/',      label: 'Work',      template: 'custom', detailPages: true,  enabled: true, inSitemap: true, inLlms: true, inRss: false },
  projects:  { collection: 'projects',  base: '/projects/',  label: 'Projects',  template: 'custom', detailPages: false, enabled: true, inSitemap: true, inLlms: true, inRss: false },
  blog:      { collection: 'blog',      base: '/blog/',      label: 'Blog',      template: 'custom', detailPages: true,  enabled: true, inSitemap: true, inLlms: true, inRss: true, pageSize: 12 },
  stories:   { collection: 'stories',   base: '/stories/',   label: 'Stories',   template: 'custom', detailPages: true,  enabled: true, inSitemap: true, inLlms: true, inRss: true, pageSize: 12 },
  resources: { collection: 'resources', base: '/resource/',  label: 'Resources', template: 'custom', detailPages: true,  enabled: true, inSitemap: true, inLlms: true, inRss: false },
  // Reserved — do not build yet, but nothing may claim these paths:
  // courses:    { collection: 'courses',    base: '/courses/',    label: 'Courses',    template: 'generic', detailPages: true,  enabled: false, ... },
  // talks:      { collection: 'talks',      base: '/talks/',      label: 'Talks',      template: 'generic', detailPages: true,  enabled: false, ... },
  // newsletter: { collection: 'newsletter', base: '/newsletter/', label: 'Newsletter', template: 'generic', detailPages: true,  enabled: false, ... },
} as const satisfies Record<string, Section>;

/** Top-level path segments no page, slug or collection may use. Checked at build. */
export const RESERVED_SEGMENTS = [
  'courses', 'talks', 'newsletter', 'ne', 'page', 'topics', 'api', 'og',
] as const;

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

export type NavLink = { label: string; href: string };
export type NavGroup = { heading: string; links: NavLink[] };

export const NAV = {
  /** Header — kept to 5 + CTA so it fits on mobile without a mega-menu. */
  primary: [
    { label: 'Services', href: '/services/' },
    { label: 'Work', href: '/work/' },
    { label: 'Projects', href: '/projects/' },
    { label: 'Blog', href: '/blog/' },
    { label: 'About', href: '/about/' },
  ] satisfies NavLink[],
  cta: { label: 'Work with me', href: '/contact/' } satisfies NavLink,

  footer: [
    {
      heading: 'Site',
      links: [
        { label: 'About', href: '/about/' },
        { label: 'Services', href: '/services/' },
        { label: 'Work', href: '/work/' },
        { label: 'Projects', href: '/projects/' },
        { label: 'Now', href: '/now/' },
        { label: 'Contact', href: '/contact/' },
      ],
    },
    {
      heading: 'Writing',
      links: [
        // Stories and Resources are hidden by the footer until they have published entries.
        { label: 'Blog', href: '/blog/' },
        { label: 'Stories', href: '/stories/' },
        { label: 'Resources', href: '/resource/' },
      ],
    },
    {
      heading: 'Company',
      links: [{ label: 'Basilpot', href: BASILPOT.url }],
    },
  ] satisfies NavGroup[],

  legal: [
    { label: 'Privacy', href: '/privacy/' },
    { label: 'Terms', href: '/terms/' },
    { label: 'RSS', href: '/rss.xml' },
  ] satisfies NavLink[],
} as const;

/* ------------------------------------------------------------------ */
/* Third-party (all deferred / non-blocking)                           */
/* ------------------------------------------------------------------ */

export const INTEGRATIONS = {
  metaPixelId: '624986926682601',
  gscVerification: null as string | null, // TODO: GSC meta verification code
  cloudflareAnalyticsToken: null as string | null, // TODO: set after Pages project exists
} as const;

/* ------------------------------------------------------------------ */
/* Derived helpers                                                     */
/* ------------------------------------------------------------------ */

export const sameAs = (): string[] => [
  ...SOCIALS.filter((s) => s.sameAs && s.url).map((s) => s.url as string),
  BASILPOT.url,
];

export const absoluteUrl = (path: string): string => new URL(path, SITE.url).href;
