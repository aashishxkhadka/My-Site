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

export const SITE = {
  url: 'https://aashishkhadka.com.np', // https + non-www, no trailing slash
  name: 'Aashish Khadka',
  locale: 'en',
  /** Appended to page titles. Page part must stay ≤ 60 − suffix length (≈43 chars). */
  titleSuffix: ' — Aashish Khadka',
  /** Homepage <title> (used as-is, no suffix). ≤ 60 chars. */
  defaultTitle: 'Aashish Khadka — Founder of Basilpot, Pokhara',
  /** Fallback meta description. ≤ 155 chars. TODO: final copy in step 2. */
  defaultDescription:
    'Aashish Khadka, founder of Basilpot in Pokhara, Nepal, helps businesses grow with strategy, SEO, digital marketing, branding and websites.',
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
  /** TODO: confirm WhatsApp is on the same number. */
  whatsapp: null as string | null, // e.g. 'https://wa.me/9779805106358'
  address: {
    display: 'Pokhara, Nepal', // as shown on GBP
    locality: 'Pokhara',
    region: 'Gandaki',
    countryCode: 'NP',
    countryName: 'Nepal',
  },
  /** TODO: GBP share URL / Maps embed for /contact/. */
  mapUrl: null as string | null,
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
  { key: 'gbp', label: 'Google Business Profile', url: null, sameAs: true, visible: false }, // TODO: GBP URL
];

/* ------------------------------------------------------------------ */
/* Entities for the JSON-LD graph (@id-linked)                         */
/* ------------------------------------------------------------------ */

export const BASILPOT = {
  /** TODO: if basilpot.com already publishes an Organization @id, use that exact value instead. */
  id: `${SITE.url}/#basilpot`,
  name: 'Basilpot',
  url: 'https://basilpot.com',
  description: 'An idea-to-growth studio: planning, design, development, digital marketing and growth.',
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
      institution: null as string | null, // TODO: which institution?
      status: 'completed' as const,
    },
    {
      credential: 'MBA',
      institution: 'Infomax College of IT & Management',
      affiliation: 'Asia Pacific University (APU)',
      status: 'in-progress' as const,
    },
  ],
  /** knowsAbout = topic labels + service titles (assembled in the schema builder). */
} as const;

/* ------------------------------------------------------------------ */
/* Stats — confirmed by Aashish. Only real, current numbers go here.   */
/* ------------------------------------------------------------------ */

export const STATS = {
  /** Businesses worked with, personally and through Basilpot (confirmed 2026-10-19). */
  businessesWorkedWith: 60,
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
 * Topic hubs → /topics/[key]/. The registry lives here; the hub's written
 * intro lives in src/content/topics/[key].mdx (build fails if one is missing).
 * Adding a topic = one entry here + one MDX file.
 */
export const TOPICS = [
  { key: 'technical-seo', label: 'Technical SEO', short: 'Crawling, rendering, indexing and site architecture.' },
  { key: 'semantic-seo', label: 'Semantic SEO', short: 'Entities, topical coverage and content structure.' },
  { key: 'geo', label: 'Generative Engine Optimization', short: 'Being cited by AI search: ChatGPT, Perplexity, AI Overviews.' },
  { key: 'local-seo', label: 'Local SEO', short: 'Google Business Profile, local pack and NAP consistency.' },
  { key: 'building-products', label: 'Building Products', short: 'Notes from building and launching products at Basilpot.' },
] as const;
export const TOPIC_KEYS = TOPICS.map((t) => t.key) as [
  (typeof TOPICS)[number]['key'],
  ...(typeof TOPICS)[number]['key'][],
];

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
        { label: 'Blog', href: '/blog/' },
        { label: 'Resources', href: '/resource/' },
        ...TOPICS.map((t) => ({ label: t.label, href: `/topics/${t.key}/` })),
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
