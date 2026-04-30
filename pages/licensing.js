import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import { TOTAL_IMAGES_FORMATTED } from '../lib/categories-config';

const SERIF = "'Fraunces', Georgia, 'Times New Roman', serif";
const GRAPHITE = '#111827';
const WARM = '#9a6a3a';
const RULE = '#e6e2dc';
const PAPER = '#fafaf7';
const MUTED = '#6b7280';

function Eyebrow({ children, light = false }) {
  return (
    <div
      style={{
        fontSize: '0.75rem',
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: light ? '#c79a6b' : WARM,
        fontWeight: 600,
        marginBottom: '1.25rem',
      }}
    >
      {children}
    </div>
  );
}

function ValuePillar({ title, body }) {
  return (
    <div
      style={{
        padding: '2rem 1.5rem',
        borderTop: `2px solid ${GRAPHITE}`,
        background: '#fff',
      }}
    >
      <h3
        style={{
          fontFamily: SERIF,
          fontWeight: 600,
          letterSpacing: '-0.01em',
          fontSize: '1.35rem',
          color: GRAPHITE,
          margin: '0 0 0.75rem',
        }}
      >
        {title}
      </h3>
      <p style={{ color: MUTED, lineHeight: 1.7, margin: 0, fontSize: '0.95rem' }}>{body}</p>
    </div>
  );
}

function inputStyle(invalid) {
  return {
    width: '100%',
    padding: '0.85rem 1rem',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    color: GRAPHITE,
    background: '#fff',
    border: `1px solid ${invalid ? '#b00020' : RULE}`,
    borderRadius: '2px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  };
}

const labelStyle = {
  display: 'block',
  fontSize: '0.7rem',
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  fontWeight: 600,
  color: GRAPHITE,
  marginBottom: '0.5rem',
};

export default function Licensing() {
  const [form, setForm] = useState({
    name: '',
    workEmail: '',
    company: '',
    role: '',
    teamSize: '',
    useCase: '',
    timeline: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [serverError, setServerError] = useState('');

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.workEmail))
      next.workEmail = 'Enter a valid work email';
    if (!form.company.trim()) next.company = 'Required';
    if (!form.teamSize) next.teamSize = 'Select a team size';
    if (!form.useCase.trim()) next.useCase = 'Tell us how you plan to use the library';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus('submitting');
    setServerError('');
    try {
      const res = await fetch('/api/licensing-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Submission failed');
      }
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setServerError(err.message || 'Submission failed. Please email info@streambackdrops.com.');
    }
  };

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'StreamBackdrops Corporate & Team Licensing',
    provider: {
      '@type': 'Organization',
      name: 'StreamBackdrops',
      url: 'https://streambackdrops.com',
    },
    serviceType: 'Corporate virtual background licensing',
    areaServed: 'Worldwide',
    description:
      'Licensed access to a curated library of studio-designed, 4K-upscaled virtual backgrounds for corporate video calls on Zoom, Teams, and Google Meet.',
  };

  return (
    <Layout
      title="Corporate & Team Licensing | StreamBackdrops Studio"
      description="License the full StreamBackdrops library for your team. Studio-designed, 4K virtual backgrounds for corporate video calls on Zoom, Teams, and Google Meet. Talk to the studio."
      canonical="https://streambackdrops.com/licensing"
      structuredData={structuredData}
    >
      <Head>
        <meta name="robots" content="index, follow" />
      </Head>

      <div style={{ background: '#fff', color: GRAPHITE }}>
        {/* HERO */}
        <section
          style={{
            background: GRAPHITE,
            color: '#fff',
            padding: '6rem 2rem 5rem',
            borderBottom: `2px solid ${WARM}`,
          }}
        >
          <div style={{ maxWidth: '960px', margin: '0 auto', textAlign: 'center' }}>
            <Eyebrow light>For Corporate &amp; Enterprise Teams</Eyebrow>
            <h1
              style={{
                fontFamily: SERIF,
                fontWeight: 600,
                letterSpacing: '-0.02em',
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                lineHeight: 1.05,
                margin: '0 auto 1.5rem',
                maxWidth: '900px',
              }}
            >
              License the studio behind every executive video call.
            </h1>
            <p
              style={{
                fontSize: '1.15rem',
                lineHeight: 1.7,
                color: '#d1d5db',
                maxWidth: '720px',
                margin: '0 auto 2.5rem',
              }}
            >
              A curated library of studio-designed virtual sets, built to stay
              sharp on Zoom, Teams, and Google Meet. Equip every executive, sales
              rep, and recruiter with the same on-brand backdrop.
            </p>
            <a
              href="#inquiry"
              style={{
                display: 'inline-block',
                padding: '1rem 2rem',
                background: '#fff',
                color: GRAPHITE,
                fontWeight: 600,
                fontSize: '0.85rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                border: '1px solid #fff',
                borderRadius: '2px',
                transition: 'background 0.2s ease, color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = WARM;
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.borderColor = WARM;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.color = GRAPHITE;
                e.currentTarget.style.borderColor = '#fff';
              }}
            >
              Request a Conversation →
            </a>
          </div>
        </section>

        {/* TRUST STRIP */}
        <section
          style={{
            background: PAPER,
            borderBottom: `1px solid ${RULE}`,
            padding: '2rem',
          }}
        >
          <div
            style={{
              maxWidth: '1100px',
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1.5rem',
              textAlign: 'center',
              fontSize: '0.8rem',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: GRAPHITE,
              fontWeight: 500,
            }}
          >
            <div>{TOTAL_IMAGES_FORMATTED} Environments</div>
            <div>21 Curated Categories</div>
            <div>4K Resolution</div>
            <div>Enterprise Provisioning Ready</div>
          </div>
        </section>

        {/* WHY LICENSE */}
        <section style={{ padding: '6rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <Eyebrow>Why teams license the studio</Eyebrow>
            <h2
              style={{
                fontFamily: SERIF,
                fontWeight: 600,
                letterSpacing: '-0.02em',
                fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
                lineHeight: 1.15,
                margin: 0,
                color: GRAPHITE,
                maxWidth: '780px',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              Stock photos look like stock. The studio looks like you.
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            <ValuePillar
              title="Brand consistency at scale"
              body="Your CEO on Bloomberg, your sales team on demos, your recruiters on Zoom interviews — all calling from the same studio-grade environments. One licensed library, every team, consistent on every call."
            />
            <ValuePillar
              title="Engineered for codec compression"
              body="Every environment is rendered at 4K and engineered for the codec compression Zoom and Teams put images through. Bookshelves stay sharp, details hold, edges don't smear — the way stock JPEGs do once the call platform is done with them."
            />
            <ValuePillar
              title="Off the stock-photo grid"
              body="Free stock libraries are where every brand defaults — and where every viewer has seen the photo before. Licensing puts your team on a small, curated set built for video, not the same Unsplash and Pexels grid every competitor pulls from."
            />
            <ValuePillar
              title="Curated, not catalog-dumped"
              body={`${TOTAL_IMAGES_FORMATTED} environments — offices, libraries, galleries, conference rooms, lounges, restaurants — each one composed for camera. Not a 50,000-thumbnail catalog where every search returns the same five photos.`}
            />
            <ValuePillar
              title="Procurement-ready"
              body="Annual term, single invoice, transparent seat pricing. SSO, SCIM provisioning, custom MSAs, and security review available on request — the boxes IT and legal need ticked before signature."
            />
            <ValuePillar
              title="Custom commissions"
              body="Need a virtual set that mirrors your HQ or matches a campaign? The studio designs custom environments under license for enterprise clients — built to your brief, delivered under a custom license."
            />
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section style={{ background: PAPER, padding: '5rem 2rem', borderTop: `1px solid ${RULE}`, borderBottom: `1px solid ${RULE}` }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <Eyebrow>Engagement model</Eyebrow>
              <h2
                style={{
                  fontFamily: SERIF,
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
                  margin: 0,
                  color: GRAPHITE,
                }}
              >
                A conversation, not a checkout.
              </h2>
            </div>

            <ol
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'grid',
                gap: '1.5rem',
              }}
            >
              {[
                {
                  n: '01',
                  t: 'Discovery call',
                  d: 'A 20-minute conversation about your team size, video stack, brand guidelines, and the specific roles that need a unified virtual presence.',
                },
                {
                  n: '02',
                  t: 'Tailored proposal',
                  d: 'A scoped license proposal — annual term, seat count, environment selection, and any custom commissions — sent within 2 business days.',
                },
                {
                  n: '03',
                  t: 'Rollout',
                  d: 'A curated download package, a branded internal landing page, or a single sign-on portal — whichever fits your stack. Onboarding materials for IT and end users included.',
                },
              ].map((s) => (
                <li
                  key={s.n}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr',
                    gap: '1.5rem',
                    alignItems: 'start',
                    padding: '1.5rem 0',
                    borderTop: `1px solid ${RULE}`,
                  }}
                >
                  <div
                    style={{
                      fontFamily: SERIF,
                      fontSize: '1.75rem',
                      fontWeight: 600,
                      color: WARM,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {s.n}
                  </div>
                  <div>
                    <h3
                      style={{
                        fontFamily: SERIF,
                        fontWeight: 600,
                        fontSize: '1.25rem',
                        margin: '0 0 0.5rem',
                        color: GRAPHITE,
                      }}
                    >
                      {s.t}
                    </h3>
                    <p style={{ color: MUTED, lineHeight: 1.7, margin: 0 }}>{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* INQUIRY FORM */}
        <section id="inquiry" style={{ padding: '6rem 2rem', maxWidth: '780px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <Eyebrow>Start a conversation</Eyebrow>
            <h2
              style={{
                fontFamily: SERIF,
                fontWeight: 600,
                letterSpacing: '-0.02em',
                fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
                margin: '0 0 1rem',
                color: GRAPHITE,
              }}
            >
              Tell us about your team.
            </h2>
            <p style={{ color: MUTED, lineHeight: 1.7, fontSize: '1rem', margin: 0 }}>
              Every inquiry gets a direct reply from the studio within one
              business day — not an auto-responder, not a sales sequence.
            </p>
          </div>

          {status === 'success' ? (
            <div
              style={{
                border: `1px solid ${RULE}`,
                borderTop: `2px solid ${WARM}`,
                padding: '3rem 2rem',
                textAlign: 'center',
                background: PAPER,
              }}
            >
              <h3
                style={{
                  fontFamily: SERIF,
                  fontWeight: 600,
                  fontSize: '1.5rem',
                  color: GRAPHITE,
                  margin: '0 0 0.75rem',
                }}
              >
                Inquiry received.
              </h3>
              <p style={{ color: MUTED, margin: 0, lineHeight: 1.7 }}>
                Thank you, {form.name.split(' ')[0] || 'there'}. The studio will reply
                to {form.workEmail} within one business day. In the meantime, feel free
                to <Link href="/" style={{ color: WARM, textDecoration: 'underline', textUnderlineOffset: '3px' }}>browse the collection</Link>.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '1.5rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div>
                  <label htmlFor="name" style={labelStyle}>
                    Full name <span style={{ color: WARM }}>*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    value={form.name}
                    onChange={update('name')}
                    style={inputStyle(!!errors.name)}
                  />
                  {errors.name && (
                    <div style={{ color: '#b00020', fontSize: '0.8rem', marginTop: '0.4rem' }}>
                      {errors.name}
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="workEmail" style={labelStyle}>
                    Work email <span style={{ color: WARM }}>*</span>
                  </label>
                  <input
                    id="workEmail"
                    type="email"
                    autoComplete="email"
                    value={form.workEmail}
                    onChange={update('workEmail')}
                    style={inputStyle(!!errors.workEmail)}
                  />
                  {errors.workEmail && (
                    <div style={{ color: '#b00020', fontSize: '0.8rem', marginTop: '0.4rem' }}>
                      {errors.workEmail}
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="company" style={labelStyle}>
                    Company <span style={{ color: WARM }}>*</span>
                  </label>
                  <input
                    id="company"
                    type="text"
                    autoComplete="organization"
                    value={form.company}
                    onChange={update('company')}
                    style={inputStyle(!!errors.company)}
                  />
                  {errors.company && (
                    <div style={{ color: '#b00020', fontSize: '0.8rem', marginTop: '0.4rem' }}>
                      {errors.company}
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="role" style={labelStyle}>
                    Your role
                  </label>
                  <input
                    id="role"
                    type="text"
                    autoComplete="organization-title"
                    placeholder="e.g. Head of Brand, IT Director"
                    value={form.role}
                    onChange={update('role')}
                    style={inputStyle(false)}
                  />
                </div>

                <div>
                  <label htmlFor="teamSize" style={labelStyle}>
                    Team size <span style={{ color: WARM }}>*</span>
                  </label>
                  <select
                    id="teamSize"
                    value={form.teamSize}
                    onChange={update('teamSize')}
                    style={inputStyle(!!errors.teamSize)}
                  >
                    <option value="">Select team size…</option>
                    <option value="1-10">1–10 people</option>
                    <option value="11-50">11–50 people</option>
                    <option value="51-200">51–200 people</option>
                    <option value="201-1000">201–1,000 people</option>
                    <option value="1000+">1,000+ people</option>
                  </select>
                  {errors.teamSize && (
                    <div style={{ color: '#b00020', fontSize: '0.8rem', marginTop: '0.4rem' }}>
                      {errors.teamSize}
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="timeline" style={labelStyle}>
                    Timeline
                  </label>
                  <select
                    id="timeline"
                    value={form.timeline}
                    onChange={update('timeline')}
                    style={inputStyle(false)}
                  >
                    <option value="">Select timeline…</option>
                    <option value="this-quarter">This quarter</option>
                    <option value="next-quarter">Next quarter</option>
                    <option value="next-6-months">Next 6 months</option>
                    <option value="exploring">Just exploring</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="useCase" style={labelStyle}>
                  How will the team use the library? <span style={{ color: WARM }}>*</span>
                </label>
                <textarea
                  id="useCase"
                  rows={4}
                  placeholder="e.g. Standardizing executive Zoom backgrounds, equipping our 200-person sales team for client calls, brand consistency for an upcoming earnings call…"
                  value={form.useCase}
                  onChange={update('useCase')}
                  style={{ ...inputStyle(!!errors.useCase), resize: 'vertical', fontFamily: 'inherit' }}
                />
                {errors.useCase && (
                  <div style={{ color: '#b00020', fontSize: '0.8rem', marginTop: '0.4rem' }}>
                    {errors.useCase}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label htmlFor="notes" style={labelStyle}>
                  Anything else? (Custom commissions, SSO, MSA requirements…)
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={form.notes}
                  onChange={update('notes')}
                  style={{ ...inputStyle(false), resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>

              {serverError && (
                <div
                  style={{
                    padding: '1rem',
                    border: '1px solid #b00020',
                    color: '#b00020',
                    marginBottom: '1.5rem',
                    fontSize: '0.9rem',
                  }}
                >
                  {serverError}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                style={{
                  width: '100%',
                  padding: '1.1rem 2rem',
                  background: status === 'submitting' ? '#374151' : GRAPHITE,
                  color: '#fff',
                  border: `1px solid ${GRAPHITE}`,
                  borderRadius: '2px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: status === 'submitting' ? 'wait' : 'pointer',
                  fontFamily: 'inherit',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (status !== 'submitting') e.currentTarget.style.background = '#000';
                }}
                onMouseLeave={(e) => {
                  if (status !== 'submitting') e.currentTarget.style.background = GRAPHITE;
                }}
              >
                {status === 'submitting' ? 'Sending…' : 'Submit Inquiry'}
              </button>

              <p style={{ color: MUTED, fontSize: '0.8rem', marginTop: '1.25rem', textAlign: 'center', lineHeight: 1.6 }}>
                Or email the studio directly at{' '}
                <a href="mailto:info@streambackdrops.com" style={{ color: WARM, textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                  info@streambackdrops.com
                </a>
                .
              </p>
            </form>
          )}
        </section>
      </div>
    </Layout>
  );
}
