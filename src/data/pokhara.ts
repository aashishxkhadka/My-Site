/**
 * Copy for /services/digital-marketing/pokhara/ (shared by every layout of the page).
 * Edit words here; the page file only decides how they look.
 */
import type { IconName } from '@/designs/d4/icons';
import { whatsappLink } from '@/site.config';

export const path = '/services/digital-marketing/pokhara/';
export const crumbs = [
  { label: 'Services', href: '/services/' },
  { label: 'Digital Marketing', href: '/services/digital-marketing/' },
  { label: 'Pokhara', href: path },
];
export const description = 'Digital marketing in Pokhara that brings real calls and bookings: local SEO, Google Maps, social media and ads. 60+ businesses served. Free first call.';
export const whatsapp = whatsappLink("Hi Aashish, I'd like to talk about digital marketing for my business in Pokhara.");
export const title = 'Digital Marketing in Pokhara: Local Expert | Aashish Khadka';
export const ogDescription = 'Local SEO, Google Business Profile, social media and ads for Pokhara businesses, with clear monthly reports. 60+ businesses served.';
export const ogImage = '/og/services/digital-marketing-service-in-pokhara-aashish-khadka.png';
export const ogImageAlt = 'Digital marketing in Pokhara by Aashish Khadka';

export const glance = [
  ['Two markets, one city.', 'Travellers plan weeks ahead in English; locals search the same day, often in Nepali.'],
  ['Seasons set the calendar.', 'Campaigns start before peak season, not during it.'],
  ['Mobile and messaging first.', 'Fast pages on mobile data, and WhatsApp over contact forms.'],
  ['Clear prices.', 'From NPR 5,000 one-time, or NPR 10,000 per month, with an exact quote after we talk.'],
] as const;

/** Reviews shown on the page: Pokhara businesses (tourism, health, education). */
export const testimonialIds = ['begnas-aqua-park', 'happyface-clinic', 'unistar-education'];

/** Starting prices; also the Offer list in the page's JSON-LD. */
export const prices = [
  { name: 'Google Business Profile setup and optimisation', price: 5000, label: 'NPR 5,000 (one-time)', amount: '5,000', per: 'one-time' },
  { name: 'Local SEO', price: 10000, unit: 'MON' as const, label: 'NPR 10,000 per month', amount: '10,000', per: 'per month' },
  { name: 'Social media marketing', price: 20000, unit: 'MON' as const, label: 'NPR 20,000 per month', amount: '20,000', per: 'per month' },
  { name: 'Full digital marketing plan', price: 30000, unit: 'MON' as const, label: 'NPR 30,000 per month', amount: '30,000', per: 'per month' },
];

/** "Jump to" bar; each section's kicker shows its number from this list. */
export const toc = [
  { id: 'different', label: 'Why Pokhara' },
  { id: 'services', label: 'Services' },
  { id: 'who', label: 'Who I help' },
  { id: 'how', label: 'How I work' },
  { id: 'cost', label: 'Pricing' },
  { id: 'why', label: 'Why local' },
  { id: 'this-week', label: 'Free tips' },
  { id: 'faq-title', label: 'FAQ' },
];
export const n = (id: string) => String(toc.findIndex((t) => t.id === id) + 1).padStart(2, '0');

export const markets = {
  rows: ['Who', 'When they search', 'How they search', 'Where they decide', 'What wins'],
  tourists: [
    'Foreign visitors, Indian and other South Asian travellers, domestic tourists',
    'Weeks or months before the trip, and again once they arrive',
    'English: "hotel in Lakeside Pokhara", "Poon Hill trek cost"',
    'Google, Google Maps, reviews, Instagram, booking sites',
    'A strong website, reviews, clear prices in USD and NPR',
  ],
  locals: [
    'People who live in and around Pokhara',
    'Usually the same day they need something',
    'English, Romanized Nepali and Nepali: "gym near me", "momo pasal near me"',
    'Google Maps, Facebook, word of mouth, WhatsApp',
    'A complete Google Business Profile, reviews, fast replies',
  ],
};

// The two months before each peak season get a "launch" marker: marketing starts before the season.
export const months = [
  ['Jan', 'winter', true], ['Feb', 'winter', true], ['Mar', 'peak', false], ['Apr', 'peak', false], ['May', 'peak', false], ['Jun', 'monsoon', false],
  ['Jul', 'monsoon', true], ['Aug', 'monsoon', true], ['Sep', 'peak', false], ['Oct', 'festival', false], ['Nov', 'festival', false], ['Dec', 'winter', false],
] as const;
export const seasons = {
  peak: { label: 'Peak travel season', class: 'bg-[#ff7f00]' },
  festival: { label: 'Peak season + Dashain and Tihar', class: 'bg-[#ffc48a]' },
  monsoon: { label: 'Monsoon, quieter', class: 'bg-[#c8d2dc]' },
  winter: { label: 'Winter, slower', class: 'bg-[#e3e1db]' },
};

export const meaning: { icon: IconName; lead: string; text: string }[] = [
  { icon: 'users', lead: 'Facebook is still essential', text: 'for reaching local customers.' },
  { icon: 'camera', lead: 'Instagram matters a lot', text: 'for tourism, food and lifestyle businesses.' },
  { icon: 'phone', lead: 'Almost everyone is on mobile,', text: 'often on mobile data, so your website must load fast on a phone.' },
  { icon: 'message', lead: 'People prefer to message.', text: 'A WhatsApp or Viber button often gets more enquiries than a contact form.' },
];

export const services: { icon: IconName; title: string; text: string; bestFor?: string; results?: string; link?: { label: string; href: string } }[] = [
  {
    icon: 'pin',
    title: 'Local SEO and Google Business Profile',
    text: 'When someone in Pokhara searches "cafe near me" or "dentist in Pokhara", the businesses on the map get most of the calls. I set up and optimise your Google Business Profile, fix your details across the web, and build a steady flow of honest reviews, so you show up in Google Maps and the local pack.',
    bestFor: 'Any business with a location customers visit',
    results: 'Often within weeks for profile fixes; longer to build reviews',
    link: { label: 'How local SEO works', href: '/blog/local-seo/' },
  },
  {
    icon: 'search',
    title: 'Website SEO',
    text: 'For searches like "best trekking agency in Pokhara" or "paragliding Pokhara price", your website needs to rank. I handle keyword research, on-page SEO, technical fixes and content that answers what your customers actually search, in the language they search in.',
    bestFor: 'Tourism, services, education, e-commerce',
    results: 'Usually a few months; it keeps building after that',
    link: { label: 'SEO service', href: '/services/seo/' },
  },
  {
    icon: 'chat',
    title: 'Social media marketing (Facebook, Instagram, TikTok)',
    text: 'A content plan that fits your business and the season, posts and reels that show real people and real places (not stock photos), and replies that turn comments into enquiries.',
    bestFor: 'Awareness, trust, tourism, food, lifestyle',
    results: 'Steady growth over months',
  },
  {
    icon: 'target',
    title: 'Paid ads (Meta and Google Ads)',
    text: "Ads planned around Pokhara's seasons: reaching travellers while they're still planning, and locals when they're ready to buy. Every rupee is tracked, so we know which ads bring enquiries and which to stop.",
    bestFor: 'Seasonal offers, launches, fast enquiries',
    results: 'As soon as ads go live',
  },
  {
    icon: 'monitor',
    title: 'Websites and landing pages',
    text: 'With my team, we build fast, mobile-friendly websites and landing pages that load well on mobile data and make it easy to call, message or book.',
    link: { label: 'Website service', href: '/services/website-development/' },
  },
  {
    icon: 'chart',
    title: 'Tracking and monthly reporting',
    text: "I set up Google Analytics 4 and Search Console, and track the actions that matter: calls, WhatsApp clicks, form submissions and bookings. Every month you get a clear report on what happened, what worked and what we'll do next.",
    bestFor: 'Every business',
    results: 'From the first month',
  },
];

export const who = [
  ['Hotels, resorts and homestays', 'Google Business Profile, reviews, website SEO, Instagram'],
  ['Trekking, tour and adventure companies', 'SEO for trip pages, content for international searches, seasonal ads'],
  ['Restaurants and cafes', 'Google Maps, reviews, Instagram and TikTok, local ads'],
  ['Clinics and health businesses', 'Local SEO, trust-building content, Facebook'],
  ['Gyms and fitness centres', 'Google Maps, Instagram and reels, local ads'],
  ['Schools, colleges and institutes', 'SEO, Facebook, ads timed with admission seasons'],
  ['Shops and local services', 'Google Business Profile, Facebook, WhatsApp'],
].map(([type = '', first = '']) => ({ type, first: first.split(', ') }));

export const steps = [
  { title: 'Understand', text: 'One or two meetings to learn what your business actually needs: your customers, your season, your goals.' },
  { title: 'Plan', text: 'We decide together how digital marketing can really help your business grow.' },
  { title: 'Agree', text: 'A clear proposal, agreement and contract, so everything is written down.' },
  { title: 'Deliver', text: 'We do the work we promised.' },
  { title: 'Report', text: "Every month, data shows what our work actually did, and what we'll do next." },
];

export const costFactors = [
  ['Which services you need', 'Local SEO alone costs less than SEO + social media + ads'],
  ['Your competition', 'Ranking for "hotel in Lakeside" is harder than for a niche service'],
  ['Your target market', 'Reaching international travellers usually takes more content and ad spend than reaching locals'],
  ['One-time or monthly', 'A one-time setup costs less than ongoing monthly growth work'],
];

export const reasons: { icon: IconName; lead: string; text: string }[] = [
  { icon: 'pin', lead: 'I know this market.', text: 'Lakeside, Damside, Prithvi Chowk, Mahendrapul: each area has different customers. I plan around that.' },
  { icon: 'coffee', lead: 'We can meet in person.', text: 'Strategy is easier over tea than over email.' },
  { icon: 'calendar', lead: 'I plan around the seasons.', text: "Your campaigns start before the season, not after it's already busy." },
  { icon: 'globe', lead: "I speak your customers' language.", text: 'English for travellers, Nepali and Romanized Nepali for locals.' },
  { icon: 'user', lead: 'You get one point of contact.', text: 'You talk to me, and my team handles development, design and branding behind the scenes.' },
  { icon: 'chart', lead: 'You see the data.', text: 'Monthly reports show real enquiries and results, not just reach and likes.' },
];

export const tips = [
  ['Claim and complete your Google Business Profile.', 'Add accurate hours, real photos, your services and a map pin exactly on your door.'],
  ['Ask every customer for an honest Google review.', 'Send a direct review link on WhatsApp right after a good experience. Never pay for reviews.'],
  ['Add a WhatsApp button to your website and profiles.', 'Many people here would rather message than call.'],
  ['Show your prices.', 'For tourism businesses, show NPR and USD. Hidden prices make travellers look elsewhere.'],
  ['Plan content one season ahead.', 'Post your autumn offers in summer, not in October.'],
];

export const faq = [
  { question: 'How much does digital marketing cost in Pokhara?', answer: 'It depends on the services you need, your competition and your target market. Base prices start from NPR 5,000 for a one-time Google Business Profile setup, and from NPR 10,000 per month for local SEO. You get an exact quote after our first meeting.' },
  { question: 'How long does it take to see results?', answer: 'Paid ads can bring enquiries as soon as they go live. Google Business Profile improvements often show results within weeks. Website SEO usually takes a few months to build, but it keeps working long after.' },
  { question: 'Do I need a website, or is Facebook enough?', answer: "Facebook is important in Nepal, but it isn't enough on its own. A website lets you rank on Google, show full details and prices, and build trust with travellers. A Google Business Profile is the minimum every local business should have." },
  { question: 'Which platform is best for a Pokhara business?', answer: 'It depends on your customers. Locals: Google Maps and Facebook. Tourists: Google search, Google Maps, reviews and Instagram. Food, fitness and lifestyle: Instagram and TikTok work well. We decide after understanding your business, not before.' },
  { question: 'Can you help my tourism business get direct bookings?', answer: 'Yes. Direct bookings are one of the most common goals for tourism businesses, and the approach is clear: ranking your own website, getting more reviews and making it easy to book directly, so you depend less on commission-based booking sites.' },
  { question: 'Do you only work with businesses in Pokhara?', answer: "No. I'm based in Pokhara and know this market best, and I can work with businesses in other cities remotely too.", link: { before: 'See my', label: 'digital marketing services', href: '/services/digital-marketing/' } },
  { question: 'Do you offer one-time work or only monthly plans?', answer: 'Both. Some clients need a one-time setup, like a Google Business Profile or a website audit. Others need ongoing monthly growth. We choose what fits your goals.' },
];

