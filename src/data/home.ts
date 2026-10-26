/**
 * Homepage copy that is data rather than layout: the working process and the FAQ.
 * The FAQ is also published as FAQPage structured data, so keep every answer true and current.
 */
import { STATS } from '@/site.config';

export const HOW_I_WORK = [
  { title: 'Talk', description: 'Tell me about your business, your goals and what isn’t working. A call or a message, whichever is easier for you.' },
  { title: 'Plan', description: 'I suggest what to focus on first and send a written scope and quote, so you know exactly what you’re getting.' },
  { title: 'Do the work', description: 'I lead it personally, with the Basilpot team for design and development when the project needs it.' },
  { title: 'Review & improve', description: 'Regular updates in plain language: what’s working, what isn’t, and what we’ll change next.' },
];

export const HOME_FAQ = [
  {
    question: 'Who is Aashish Khadka?',
    answer: `Aashish Khadka is the founder of Basilpot, a growth studio based in Pokhara, Nepal. Since ${STATS.workingSince} he has helped ${STATS.businessesWorkedWith}+ businesses grow with strategy, SEO, digital marketing, branding and websites.`,
  },
  {
    question: 'What services do you offer?',
    answer: 'Growth strategy and planning, SEO (including local SEO and AI search), digital marketing (social media, Meta and Google ads), branding, and website design and development with IT setup.',
  },
  {
    question: 'Do you only work with businesses in Pokhara?',
    answer: 'No. I’m based in Pokhara and work with businesses across Nepal and abroad. Most of the work happens online, so location is rarely a barrier.',
  },
  {
    question: 'What is the difference between you and Basilpot?',
    answer: 'Basilpot is the studio I founded. I lead the strategy and client work personally. When a project needs design, development or a larger team, it is delivered with the Basilpot team, so you still have one person who knows your business from start to finish.',
  },
  {
    question: 'Do you work with small businesses?',
    answer: 'Yes. Many of the businesses I work with are small and growing: clinics, schools, restaurants, salons, resorts and travel companies. The plan is sized to your business and budget.',
  },
  {
    question: 'How much does it cost?',
    answer: 'It depends on what your business needs. After a short conversation I send a written scope and quote, so you know the cost before any work starts.',
  },
  {
    question: 'How long before I see results?',
    answer: 'It depends on the work. Paid ads can bring enquiries within weeks. SEO usually takes three to six months to build, longer in competitive markets. I’ll be honest about what to expect for your situation.',
  },
  {
    question: 'How do we get started?',
    answer: 'Get in touch through the contact page, by email, phone or WhatsApp. Tell me a little about your business and goals, and I’ll reply personally.',
  },
];
