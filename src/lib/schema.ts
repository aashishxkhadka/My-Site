/**
 * JSON-LD graph builders. Every page emits ONE @graph containing the
 * site-wide entities (WebSite, Person, Organization) plus page nodes,
 * all linked by @id.
 */
import { SITE, PERSON, BASILPOT, CONTACT, sameAs, absoluteUrl } from '@/site.config';
import portrait from '@/assets/aashish.jpg';

export type JsonLdNode = Record<string, unknown> & { '@type': string | string[] };

const ids = {
  website: `${SITE.url}/#website`,
  person: PERSON.id,
  org: BASILPOT.id,
};

export const websiteNode = (): JsonLdNode => ({
  '@type': 'WebSite',
  '@id': ids.website,
  url: `${SITE.url}/`,
  name: SITE.name,
  inLanguage: SITE.locale,
  publisher: { '@id': ids.person },
});

export const personNode = (): JsonLdNode => {
  // alumniOf: completed studies only, one entry per institution.
  const alumniOf = [...new Set(PERSON.education.filter((e) => e.status === 'completed' && e.institution).map((e) => e.institution))].map((name) => ({ '@type': 'CollegeOrUniversity', name }));
  return {
    '@type': 'Person',
    '@id': ids.person,
    name: PERSON.name,
    givenName: PERSON.givenName,
    familyName: PERSON.familyName,
    url: `${SITE.url}/`,
    jobTitle: PERSON.jobTitle,
    worksFor: { '@id': ids.org },
    email: `mailto:${CONTACT.email}`,
    telephone: CONTACT.phoneE164,
    address: {
      '@type': 'PostalAddress',
      addressLocality: CONTACT.address.locality,
      addressRegion: CONTACT.address.region,
      addressCountry: CONTACT.address.countryCode,
    },
    image: absoluteUrl(portrait.src),
    ...(alumniOf.length ? { alumniOf } : {}),
    knowsAbout: [...PERSON.knowsAbout],
    sameAs: sameAs(),
  };
};

export const orgNode = (): JsonLdNode => ({
  '@type': 'Organization',
  '@id': ids.org,
  name: BASILPOT.name,
  url: BASILPOT.url,
  description: BASILPOT.description,
  founder: { '@id': ids.person },
  ...(BASILPOT.logo ? { logo: BASILPOT.logo } : {}),
});

export const webPageNode = (opts: { path: string; title: string; description: string; type?: string }): JsonLdNode => {
  const url = absoluteUrl(opts.path);
  return {
    '@type': opts.type ?? 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: opts.title,
    description: opts.description,
    isPartOf: { '@id': ids.website },
    inLanguage: SITE.locale,
    ...(opts.path !== '/' ? { breadcrumb: { '@id': `${url}#breadcrumb` } } : { about: { '@id': ids.person } }),
  };
};

export type Crumb = { label: string; href: string };

export const breadcrumbNode = (path: string, crumbs: Crumb[]): JsonLdNode => ({
  '@type': 'BreadcrumbList',
  '@id': `${absoluteUrl(path)}#breadcrumb`,
  itemListElement: crumbs.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.label,
    item: absoluteUrl(c.href),
  })),
});

export const baseGraph = (): JsonLdNode[] => [websiteNode(), personNode(), orgNode()];

/* ------------------------------------------------------------------ */
/* Page-type nodes                                                     */
/* ------------------------------------------------------------------ */

const iso = (d: Date) => d.toISOString();

export const serviceNode = (opts: { path: string; name: string; description: string; serviceType: string; areaServed: string[] }): JsonLdNode => {
  const url = absoluteUrl(opts.path);
  return {
    '@type': 'Service',
    '@id': `${url}#service`,
    name: opts.name,
    description: opts.description,
    serviceType: opts.serviceType,
    url,
    provider: { '@id': ids.person },
    brand: { '@id': ids.org },
    areaServed: opts.areaServed.map((a) => (a === 'Worldwide' ? { '@type': 'Place', name: 'Worldwide' } : { '@type': 'Country', name: a })),
  };
};

export const blogPostingNode = (opts: {
  path: string;
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date | undefined;
  image?: string | undefined;
  keywords: string[];
  about: string[];
  mentions: { name: string; url?: string | undefined }[];
}): JsonLdNode => {
  const url = absoluteUrl(opts.path);
  return {
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: opts.title,
    description: opts.description,
    url,
    mainEntityOfPage: { '@id': `${url}#webpage` },
    datePublished: iso(opts.pubDate),
    dateModified: iso(opts.updatedDate ?? opts.pubDate),
    author: { '@id': ids.person },
    publisher: { '@id': ids.person },
    inLanguage: SITE.locale,
    ...(opts.image ? { image: absoluteUrl(opts.image) } : {}),
    ...(opts.keywords.length ? { keywords: opts.keywords.join(', ') } : {}),
    ...(opts.about.length ? { about: opts.about.map((name) => ({ '@type': 'Thing', name })) } : {}),
    ...(opts.mentions.length ? { mentions: opts.mentions.map((m) => ({ '@type': 'Thing', name: m.name, ...(m.url ? { url: m.url } : {}) })) } : {}),
  };
};

export const caseStudyNode = (opts: { path: string; title: string; description: string; pubDate: Date; updatedDate?: Date | undefined; image?: string | undefined; client?: string | undefined }): JsonLdNode => {
  const url = absoluteUrl(opts.path);
  return {
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: opts.title,
    description: opts.description,
    url,
    mainEntityOfPage: { '@id': `${url}#webpage` },
    datePublished: iso(opts.pubDate),
    dateModified: iso(opts.updatedDate ?? opts.pubDate),
    author: { '@id': ids.person },
    publisher: { '@id': ids.person },
    ...(opts.image ? { image: absoluteUrl(opts.image) } : {}),
    ...(opts.client ? { about: { '@type': 'Organization', name: opts.client } } : {}),
  };
};

export const productNode = (opts: { name: string; description: string; url?: string | undefined; type: 'SoftwareApplication' | 'WebApplication' | 'CreativeWork'; applicationCategory?: string | undefined; image?: string | undefined }): JsonLdNode => ({
  '@type': opts.type,
  name: opts.name,
  description: opts.description,
  ...(opts.url ? { url: opts.url } : {}),
  ...(opts.image ? { image: absoluteUrl(opts.image) } : {}),
  creator: { '@id': ids.org },
  ...(opts.type !== 'CreativeWork' ? { applicationCategory: opts.applicationCategory ?? 'BusinessApplication', operatingSystem: 'Web' } : {}),
});

export const itemListNode = (path: string, items: { name: string; url: string }[]): JsonLdNode => ({
  '@type': 'ItemList',
  '@id': `${absoluteUrl(path)}#list`,
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: absoluteUrl(it.url) })),
});

export const faqNode = (path: string, faq: { question: string; answer: string }[]): JsonLdNode => ({
  '@type': 'FAQPage',
  '@id': `${absoluteUrl(path)}#faq`,
  mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
});

/** /contact/: the business entity. NAP must match the Google Business Profile exactly. */
export const professionalServiceNode = (): JsonLdNode => ({
  '@type': 'ProfessionalService',
  '@id': `${SITE.url}/#business`,
  name: PERSON.name,
  url: `${SITE.url}/`,
  email: CONTACT.email,
  telephone: CONTACT.phoneE164,
  address: {
    '@type': 'PostalAddress',
    addressLocality: CONTACT.address.locality,
    addressRegion: CONTACT.address.region,
    addressCountry: CONTACT.address.countryCode,
  },
  areaServed: [{ '@type': 'Country', name: 'Nepal' }, { '@type': 'Place', name: 'Worldwide' }],
  founder: { '@id': ids.person },
  parentOrganization: { '@id': ids.org },
  ...(sameAs().length ? { sameAs: sameAs() } : {}),
});
