/**
 * /llms.txt — a plain-text summary of the site for AI tools (https://llmstxt.org).
 * Built from the same content as the pages, so new posts (local or Fullbleed)
 * appear on the next build. Sections are included when `inLlms` is set in SECTIONS.
 */
import type { APIContext } from 'astro';
import { getPublished, byNewest, byOrder, workHref } from '@/lib/content';
import { postPath } from '@/lib/posts';
import { SITE, CONTACT, BASILPOT, PERSON, SECTIONS } from '@/site.config';

export async function GET(_context: APIContext) {
  const abs = (path: string) => (/^https?:\/\//.test(path) ? path : `${SITE.url}${path}`);
  const line = (title: string, href: string, text?: string) => `- [${title}](${abs(href)})${text ? `: ${text}` : ''}`;
  const on = (key: keyof typeof SECTIONS) => SECTIONS[key].enabled && SECTIONS[key].inLlms;

  const [services, work, projects, blog, stories, resources] = await Promise.all([
    on('services') ? getPublished('services') : [],
    on('work') ? getPublished('work') : [],
    on('projects') ? getPublished('projects') : [],
    on('blog') ? getPublished('blog') : [],
    on('stories') ? getPublished('stories') : [],
    on('resources') ? getPublished('resources') : [],
  ]);

  const out: string[] = [
    `# ${SITE.name}`,
    '',
    `> ${SITE.defaultDescription}`,
    '',
    `${PERSON.name} is the founder of ${BASILPOT.name} (${BASILPOT.url}): ${BASILPOT.description}`,
    `Based in ${CONTACT.address.display}. Works with businesses in Nepal and abroad. Expertise: ${PERSON.knowsAbout.join(', ')}.`,
  ];

  const section = (heading: string, lines: string[]) => {
    if (lines.length) out.push('', `## ${heading}`, '', ...lines);
  };

  section('Pages', [
    line('About', '/about/', `Background, education and how ${PERSON.givenName} works.`),
    line('Now', '/now/', 'What he is working on at the moment.'),
    line('Contact', '/contact/', `Email ${CONTACT.email}, phone ${CONTACT.phoneDisplay}.`),
  ]);
  section(SECTIONS.services.label, services.sort(byOrder).map((s) => line(s.data.title, `/services/${s.id}/`, s.data.summary)));
  section(SECTIONS.work.label, work.sort(byOrder).map((w) => line(w.data.title, workHref(w), w.data.summary)));
  section(SECTIONS.projects.label, projects.sort(byOrder).map((p) => line(p.data.title, p.data.url ?? '/projects/', p.data.tagline)));
  section(SECTIONS.blog.label, blog.sort(byNewest).map((p) => line(p.data.title, postPath(p), p.data.description)));
  section(SECTIONS.stories.label, stories.sort(byNewest).map((p) => line(p.data.title, postPath(p), p.data.description)));
  section(SECTIONS.resources.label, resources.sort(byNewest).map((r) => line(r.data.title, `/resource/${r.id}/`, r.data.description)));
  section('Optional', [
    line('Sitemap', '/sitemap.xml'),
    line('RSS feed', '/rss.xml'),
  ]);

  return new Response(`${out.join('\n')}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
