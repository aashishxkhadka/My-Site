/**
 * Contact form → Resend.
 *
 * The site is static (GitHub Pages), so the Resend API key can't live in the page.
 * This Worker receives the form POST from /contact/, checks it, and sends the
 * enquiry to TO_EMAIL through Resend, with Reply-To set to the visitor.
 *
 * Responses:
 *   fetch() from the page (Accept: application/json) → JSON { ok } / { ok: false, error }
 *   plain form POST (no JavaScript)                 → 303 to THANKS_URL (or back to the form on error)
 *
 * Config: vars in wrangler.toml; the key with `npx wrangler secret put RESEND_API_KEY`.
 */

const LIMITS = { name: 120, email: 200, phone: 40, business: 200, interest: 300, message: 5000 };

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') ?? '';
    const allowed = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
    const cors = allowed.includes(origin) ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {};

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: { ...cors, 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Accept', 'Access-Control-Max-Age': '86400' } });
    }
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: { Allow: 'POST, OPTIONS' } });

    const wantsJson = (request.headers.get('Accept') ?? '').includes('application/json');
    const reply = (ok, error) =>
      wantsJson
        ? Response.json(ok ? { ok: true } : { ok: false, error }, { status: ok ? 200 : 400, headers: cors })
        : Response.redirect(ok ? env.THANKS_URL : `${env.FORM_URL}?error=1`, 303);

    // Only accept submissions from the site itself (browsers always send Origin on POST).
    if (!allowed.includes(origin)) return reply(false, 'Forbidden origin');

    let form;
    try {
      form = await request.formData();
    } catch {
      return reply(false, 'Could not read the form');
    }

    // Honeypot: a hidden checkbox only bots tick. Pretend it worked.
    if (form.get('botcheck')) return reply(true);

    const field = (k) => String(form.get(k) ?? '').trim().slice(0, LIMITS[k]);
    const data = {
      name: field('name'),
      email: field('email'),
      phone: field('phone'),
      business: field('business'),
      interest: form.getAll('interest').map(String).join(', ').slice(0, LIMITS.interest),
      message: field('message'),
    };
    if (!data.name || !data.message) return reply(false, 'Please fill in your name and message.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return reply(false, 'Please enter a valid email address.');

    const rows = [
      ['Name', data.name],
      ['Email', data.email],
      ['Phone / WhatsApp', data.phone],
      ['Business / website', data.business],
      ['Interested in', data.interest],
    ].filter(([, v]) => v);
    const text = `${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${data.message}`;
    const html = `<table cellpadding="4">${rows.map(([k, v]) => `<tr><td><b>${esc(k)}</b></td><td>${esc(v)}</td></tr>`).join('')}</table><p style="white-space:pre-wrap">${esc(data.message)}</p>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.FROM_EMAIL,
        to: [env.TO_EMAIL],
        reply_to: data.email,
        subject: `New enquiry from ${data.name}${data.business ? ` (${data.business})` : ''}`,
        text,
        html,
      }),
    });
    if (!res.ok) {
      console.error('Resend error', res.status, await res.text());
      return reply(false, 'The message could not be sent. Please email me directly.');
    }
    return reply(true);
  },
};

const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
