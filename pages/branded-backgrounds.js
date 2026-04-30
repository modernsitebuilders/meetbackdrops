import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';

const SERIF = "'Fraunces', Georgia, 'Times New Roman', serif";
const GRAPHITE = '#111827';
const WARM = '#9a6a3a';
const RULE = '#e6e2dc';
const PAPER = '#fafaf7';
const MUTED = '#6b7280';
const INK = '#0b1220';

// Configure the four example slots here.
// `base` = an existing library webp (lives on R2 already).
// `branded` = the path to your Canva-baked composite. Drop the file at
// /public/branded-examples/<filename> and it will appear automatically.
// Until the file exists, the slot shows a "your composite goes here" placeholder.
const EXAMPLES = [
  {
    base: 'https://assets.streambackdrops.com/webp/art-galleries/art-gallery-01.webp',
    branded: '/branded-examples/art-gallery-01-meridian.png',
    placement: 'Wall print',
    note: 'Logo integrated into a framed print on the gallery wall',
  },
  {
    base: 'https://assets.streambackdrops.com/webp/art-galleries/art-gallery-26.webp',
    branded: '/branded-examples/art-gallery-26-meridian.png',
    placement: 'Wall plaque',
    note: 'Subtle wordmark on a wall plaque or signage panel',
  },
  {
    base: 'https://assets.streambackdrops.com/webp/art-galleries/art-gallery-28.webp',
    branded: '/branded-examples/art-gallery-28-meridian.png',
    placement: 'Featured artwork',
    note: 'Brand mark applied to a hero piece in the room',
  },
  {
    base: 'https://assets.streambackdrops.com/webp/art-galleries/art-gallery-33.webp',
    branded: '/branded-examples/art-gallery-33-meridian.png',
    placement: 'Object detail',
    note: 'Mark on a small surface — mug, monitor edge, book spine, etc.',
  },
];

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

const PLACEMENTS = [
  { label: 'Wall art & framed prints', detail: 'Largest, most prominent surface in most environments.' },
  { label: 'Book spines & shelves', detail: 'Subtle, repeated brand presence — works on bookshelves and wall shelves.' },
  { label: 'Frosted glass & signage', detail: 'Office and conference-room sets with door panels and wall signage.' },
  { label: 'Mugs, notebooks, monitor bezels', detail: 'Small object-level placement for understated branding.' },
  { label: 'Wall plaques & lobby panels', detail: 'Lobby and reception sets with naturally branded surfaces.' },
  { label: 'Custom — talk to us', detail: 'Unusual surface, multiple placements per scene, animated variants on request.' },
];

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

function ExamplePair({ base, branded, placement, note }) {
  const [brandedFailed, setBrandedFailed] = useState(false);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
        marginBottom: '2.5rem',
      }}
    >
      <figure style={{ margin: 0 }}>
        <div style={{
          aspectRatio: '16/9',
          background: '#000',
          borderRadius: '0.5rem',
          overflow: 'hidden',
          marginBottom: '0.5rem',
        }}>
          <img
            src={base}
            alt={`Library environment — ${placement} surface available for branding`}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
        <figcaption style={{
          fontSize: '0.7rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: MUTED,
          fontWeight: 600,
        }}>
          From the library
        </figcaption>
      </figure>

      <figure style={{ margin: 0 }}>
        <div style={{
          aspectRatio: '16/9',
          borderRadius: '0.5rem',
          overflow: 'hidden',
          marginBottom: '0.5rem',
          background: brandedFailed ? PAPER : '#000',
          border: brandedFailed ? `1px dashed ${RULE}` : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: brandedFailed ? '1.25rem' : 0,
        }}>
          {brandedFailed ? (
            <div style={{ color: MUTED, fontSize: '0.78rem', lineHeight: 1.5 }}>
              <div style={{
                fontSize: '0.65rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: WARM,
                fontWeight: 600,
                marginBottom: '0.5rem',
              }}>
                {placement}
              </div>
              <div style={{ marginBottom: '0.4rem', color: GRAPHITE, fontWeight: 500 }}>
                Branded composite goes here
              </div>
              <div style={{ fontSize: '0.7rem', color: MUTED }}>
                {note}
              </div>
              <div style={{
                fontSize: '0.65rem',
                color: MUTED,
                marginTop: '0.6rem',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              }}>
                {branded}
              </div>
            </div>
          ) : (
            <img
              src={branded}
              alt={`Branded composite — ${placement} with Meridian mark applied`}
              loading="lazy"
              onError={() => setBrandedFailed(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          )}
        </div>
        <figcaption style={{
          fontSize: '0.7rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: GRAPHITE,
          fontWeight: 700,
        }}>
          With your brand · {placement}
        </figcaption>
      </figure>
    </div>
  );
}

function StepCard({ n, title, body }) {
  return (
    <div style={{
      background: '#fff',
      border: `1px solid ${RULE}`,
      padding: '1.75rem',
      borderRadius: '0.5rem',
    }}>
      <div style={{
        fontSize: '0.65rem',
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: WARM,
        fontWeight: 700,
        marginBottom: '0.6rem',
      }}>
        Step {n}
      </div>
      <h3 style={{
        fontFamily: SERIF,
        fontSize: '1.35rem',
        fontWeight: 600,
        color: GRAPHITE,
        margin: '0 0 0.6rem',
        letterSpacing: '-0.01em',
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: '0.92rem',
        color: MUTED,
        margin: 0,
        lineHeight: 1.55,
      }}>
        {body}
      </p>
    </div>
  );
}

function PlacementCard({ label, detail }) {
  return (
    <div style={{
      padding: '1.25rem 1.4rem',
      background: '#fff',
      border: `1px solid ${RULE}`,
      borderRadius: '0.5rem',
    }}>
      <div style={{
        fontSize: '0.95rem',
        fontWeight: 600,
        color: GRAPHITE,
        marginBottom: '0.4rem',
      }}>
        {label}
      </div>
      <div style={{ fontSize: '0.82rem', color: MUTED, lineHeight: 1.5 }}>
        {detail}
      </div>
    </div>
  );
}

export default function BrandedBackgroundsPage() {
  const [form, setForm] = useState({
    name: '',
    workEmail: '',
    company: '',
    role: '',
    teamSize: '',
    timeline: '',
    useCase: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
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
    if (!form.teamSize) next.teamSize = 'Select a set size';
    if (!form.useCase.trim()) next.useCase = 'Tell us about your brand and the set you have in mind';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus('submitting');
    setServerError('');
    try {
      const res = await fetch('/api/branded-inquiry', {
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

  return (
    <>
      <Head>
        <title>Branded Virtual Backgrounds — Custom Studio Sets for Your Brand | StreamBackdrops</title>
        <meta
          name="description"
          content="Studio-designed virtual environments with your company logo integrated into the scene — wall prints, signage, book spines, objects. Custom-licensed sets for corporate teams."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <Layout>
        {/* HERO */}
        <section style={{
          background: INK,
          color: '#fff',
          padding: '6rem 2rem 5rem',
          textAlign: 'center',
        }}>
          <div style={{ maxWidth: '880px', margin: '0 auto' }}>
            <Eyebrow light>Branded virtual environments</Eyebrow>
            <h1 style={{
              fontFamily: SERIF,
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              lineHeight: 1.05,
              margin: '0 0 1.5rem',
            }}>
              Your brand on every video call.
            </h1>
            <p style={{
              fontSize: '1.1rem',
              lineHeight: 1.6,
              color: '#cbd2dc',
              maxWidth: '640px',
              margin: '0 auto 2.5rem',
            }}>
              We take environments from our existing studio library and integrate your logo
              into the scene — a wall print, a book spine, a frosted-glass sign, a mug on
              the desk. Your team calls in from a backdrop that quietly carries your brand.
            </p>
            <Link
              href="#request"
              style={{
                display: 'inline-block',
                background: '#fff',
                color: GRAPHITE,
                padding: '1rem 2rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                borderBottom: `2px solid ${WARM}`,
              }}
            >
              Request a custom set →
            </Link>
          </div>
        </section>

        {/* THE TRANSFORMATION */}
        <section style={{ padding: '6rem 2rem', background: '#fff' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <Eyebrow>The transformation</Eyebrow>
              <h2 style={{
                fontFamily: SERIF,
                fontSize: 'clamp(1.9rem, 3.2vw, 2.6rem)',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: GRAPHITE,
                margin: '0 0 1rem',
              }}>
                Same studio environment. Your brand woven in.
              </h2>
              <p style={{
                fontSize: '0.98rem',
                color: MUTED,
                maxWidth: '620px',
                margin: '0 auto',
                lineHeight: 1.6,
              }}>
                Each pair below shows a library environment on the left and the same scene
                with a placeholder brand mark integrated on the right. Your composites
                replace these once produced.
              </p>
            </div>

            {EXAMPLES.map((ex, i) => (
              <ExamplePair key={i} {...ex} />
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section style={{
          padding: '5rem 2rem',
          background: PAPER,
          borderTop: `1px solid ${RULE}`,
          borderBottom: `1px solid ${RULE}`,
        }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <Eyebrow>How it works</Eyebrow>
              <h2 style={{
                fontFamily: SERIF,
                fontSize: 'clamp(1.9rem, 3.2vw, 2.6rem)',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: GRAPHITE,
                margin: 0,
              }}>
                Three steps, one custom-licensed set.
              </h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.5rem',
            }}>
              <StepCard
                n="01"
                title="Pick your environments"
                body="Browse the library and flag the scenes that fit your brand — offices, libraries, galleries, conference rooms. We help you narrow the set."
              />
              <StepCard
                n="02"
                title="Send your brand assets"
                body="Logo, brand colors, any specific guidelines. We confirm placement zones and turnaround per image before production."
              />
              <StepCard
                n="03"
                title="Receive a licensed set"
                body="Each composite is delivered as a high-resolution image with your brand integrated. Licensed for your team's use, with a clear set of terms."
              />
            </div>
          </div>
        </section>

        {/* WHERE THE BRAND CAN GO */}
        <section style={{ padding: '6rem 2rem', background: '#fff' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <Eyebrow>Placement options</Eyebrow>
              <h2 style={{
                fontFamily: SERIF,
                fontSize: 'clamp(1.9rem, 3.2vw, 2.6rem)',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: GRAPHITE,
                margin: '0 0 1rem',
              }}>
                Surfaces we integrate brands onto.
              </h2>
              <p style={{
                fontSize: '0.98rem',
                color: MUTED,
                maxWidth: '620px',
                margin: '0 auto',
                lineHeight: 1.6,
              }}>
                The library is full of natural surfaces that can carry a logo without
                turning the room into a billboard.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.25rem',
            }}>
              {PLACEMENTS.map((p) => (
                <PlacementCard key={p.label} {...p} />
              ))}
            </div>
          </div>
        </section>

        {/* LICENSE NOTE */}
        <section style={{
          padding: '5rem 2rem',
          background: PAPER,
          borderTop: `1px solid ${RULE}`,
          borderBottom: `1px solid ${RULE}`,
        }}>
          <div style={{ maxWidth: '780px', margin: '0 auto' }}>
            <Eyebrow>Plain-English license terms</Eyebrow>
            <h2 style={{
              fontFamily: SERIF,
              fontSize: 'clamp(1.7rem, 2.8vw, 2.2rem)',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: GRAPHITE,
              margin: '0 0 1.5rem',
            }}>
              What's yours, what stays in the library.
            </h2>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'grid',
              gap: '1rem',
            }}>
              <li style={{ display: 'flex', gap: '0.85rem' }}>
                <span style={{ color: WARM, fontWeight: 700 }}>·</span>
                <span style={{ color: GRAPHITE, lineHeight: 1.55 }}>
                  <strong>The branded composite is yours.</strong> The image of your specific
                  logo applied to the scene is delivered under a custom license for your team's use.
                </span>
              </li>
              <li style={{ display: 'flex', gap: '0.85rem' }}>
                <span style={{ color: WARM, fontWeight: 700 }}>·</span>
                <span style={{ color: GRAPHITE, lineHeight: 1.55 }}>
                  <strong>The base environment stays in the library.</strong> The underlying
                  scene remains part of the StreamBackdrops catalog and may carry other
                  brands for other customers in separate composites.
                </span>
              </li>
              <li style={{ display: 'flex', gap: '0.85rem' }}>
                <span style={{ color: WARM, fontWeight: 700 }}>·</span>
                <span style={{ color: GRAPHITE, lineHeight: 1.55 }}>
                  <strong>Need true exclusivity?</strong> A fully bespoke environment built
                  for your brand and not added to the public library is available as a custom
                  commission — talk to us.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* INQUIRY FORM */}
        <section
          id="request"
          style={{
            padding: '6rem 2rem',
            background: PAPER,
            borderTop: `1px solid ${RULE}`,
          }}
        >
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <Eyebrow>Start a conversation</Eyebrow>
              <h2 style={{
                fontFamily: SERIF,
                fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: GRAPHITE,
                margin: '0 0 1.25rem',
              }}>
                Bring your brand into the studio.
              </h2>
              <p style={{
                fontSize: '1.05rem',
                color: MUTED,
                lineHeight: 1.6,
                maxWidth: '560px',
                margin: '0 auto',
              }}>
                Send your logo and the kind of set you have in mind. We'll come back with a
                proposed image list, placement plan, and quote within two business days.
              </p>
            </div>

            {status === 'success' ? (
              <div
                style={{
                  border: `1px solid ${RULE}`,
                  borderTop: `2px solid ${WARM}`,
                  padding: '3rem 2rem',
                  textAlign: 'center',
                  background: '#fff',
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
              <form onSubmit={onSubmit} noValidate style={{ background: '#fff', padding: '2.5rem', border: `1px solid ${RULE}` }}>
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
                      <div style={{ color: '#b00020', fontSize: '0.8rem', marginTop: '0.4rem' }}>{errors.name}</div>
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
                      <div style={{ color: '#b00020', fontSize: '0.8rem', marginTop: '0.4rem' }}>{errors.workEmail}</div>
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
                      <div style={{ color: '#b00020', fontSize: '0.8rem', marginTop: '0.4rem' }}>{errors.company}</div>
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
                      placeholder="e.g. Head of Brand, Marketing Director"
                      value={form.role}
                      onChange={update('role')}
                      style={inputStyle(false)}
                    />
                  </div>

                  <div>
                    <label htmlFor="teamSize" style={labelStyle}>
                      Set size <span style={{ color: WARM }}>*</span>
                    </label>
                    <select
                      id="teamSize"
                      value={form.teamSize}
                      onChange={update('teamSize')}
                      style={inputStyle(!!errors.teamSize)}
                    >
                      <option value="">How many environments?</option>
                      <option value="5-10">5–10 environments</option>
                      <option value="11-20">11–20 environments</option>
                      <option value="21-50">21–50 environments</option>
                      <option value="50+">50+ environments</option>
                      <option value="not-sure">Not sure yet</option>
                    </select>
                    {errors.teamSize && (
                      <div style={{ color: '#b00020', fontSize: '0.8rem', marginTop: '0.4rem' }}>{errors.teamSize}</div>
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
                      <option value="">When do you need it?</option>
                      <option value="this-month">This month</option>
                      <option value="this-quarter">This quarter</option>
                      <option value="next-quarter">Next quarter</option>
                      <option value="exploring">Just exploring</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label htmlFor="useCase" style={labelStyle}>
                    Brand &amp; set brief <span style={{ color: WARM }}>*</span>
                  </label>
                  <textarea
                    id="useCase"
                    rows={4}
                    placeholder="Tell us about your brand and the kind of set you have in mind — what environments, what surfaces should carry your logo, any campaign or moment driving the request…"
                    value={form.useCase}
                    onChange={update('useCase')}
                    style={{ ...inputStyle(!!errors.useCase), resize: 'vertical', fontFamily: 'inherit' }}
                  />
                  {errors.useCase && (
                    <div style={{ color: '#b00020', fontSize: '0.8rem', marginTop: '0.4rem' }}>{errors.useCase}</div>
                  )}
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <label htmlFor="notes" style={labelStyle}>
                    Anything else? (Custom commission, exclusivity, brand guidelines…)
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
                >
                  {status === 'submitting' ? 'Sending…' : 'Request a Custom Set'}
                </button>

                <p style={{ color: MUTED, fontSize: '0.8rem', marginTop: '1.25rem', textAlign: 'center', lineHeight: 1.6 }}>
                  Or email the studio directly at{' '}
                  <a href="mailto:info@streambackdrops.com" style={{ color: WARM, textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                    info@streambackdrops.com
                  </a>.
                </p>
              </form>
            )}
          </div>
        </section>
      </Layout>
    </>
  );
}
