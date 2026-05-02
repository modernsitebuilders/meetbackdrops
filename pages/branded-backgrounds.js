import { useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';

const SERIF = "'Fraunces', Georgia, 'Times New Roman', serif";
const GRAPHITE = '#111827';
const WARM = '#9a6a3a';
const RULE = '#e6e2dc';
const PAPER = '#fafaf7';
const MUTED = '#6b7280';
const INK = '#0b1220';

// Three branded composites. Files live at /public/branded-examples/<filename>.
// Captions describe the placement story shown in each composite.
const EXAMPLES = [
  {
    branded: '/branded-examples/branded-image-01.png',
    placement: 'Office wall plaque',
    note: 'Mark mounted on a wood-panel feature wall in a working office',
  },
  {
    branded: '/branded-examples/branded-image-02.png',
    placement: 'Branded gallery print',
    note: 'Mark presented as a framed studio print on a curated shelf',
  },
  {
    branded: '/branded-examples/branded-image-03.png',
    placement: 'Executive boardroom',
    note: 'Dimensional brand installation on a marble feature wall — premium C-suite setting',
  },
];

const PILLARS = [
  {
    title: 'Brand consistency across distributed teams',
    body: 'Your CEO on Bloomberg, your sales reps on customer demos, your recruiters on candidate interviews — every employee shows up in the same on-brand environment. One company presence across every meeting, regardless of where the call originates.',
  },
  {
    title: 'Engineered for video compression',
    body: 'Every environment is rendered at 4K and engineered for the codec compression Zoom, Microsoft Teams, and Google Meet apply to live video. Logos stay sharp, edges hold, brand colors do not smear — the way stock JPEGs do once the call platform is done with them.',
  },
  {
    title: 'Not the same backdrop your competitor is on',
    body: 'Free stock photography is where every brand defaults — and where every viewer has seen the same backdrop a dozen times. Branded environments put your team on a curated set built for video, not the same Unsplash and Pexels grid every competitor pulls from.',
  },
  {
    title: 'Curated environments, not infinite catalogs',
    body: 'A focused set of about 1,000 studio-built environments — offices, libraries, galleries, conference rooms, lounges, restaurants — each composed for camera. No 50,000-thumbnail asset dump to wade through and no two backdrops that look identical.',
  },
  {
    title: 'Procurement-ready',
    body: 'Annual term, single invoice, transparent seat pricing. SSO, SCIM provisioning, custom MSAs, and security review available on request — the boxes IT, legal, and procurement need ticked before signature.',
  },
  {
    title: 'Custom branded environments',
    body: 'For organizations that need a virtual set mirroring their headquarters, matching a product launch, or staying exclusive to their brand — the studio designs custom branded environments built to brief, available only to your team.',
  },
];

const PLACEMENTS = [
  { label: 'Wall art and framed prints', detail: 'The largest, most prominent surface in most environments — high-impact placement.' },
  { label: 'Book spines and shelves', detail: 'Subtle, repeated brand presence across bookshelves and wall-shelf environments.' },
  { label: 'Frosted glass and signage', detail: 'Office and conference-room sets with door panels, wall signage, and lobby plaques.' },
  { label: 'Mugs, notebooks, monitor bezels', detail: 'Small object-level placements for understated, considered branding.' },
  { label: 'Wall plaques and lobby panels', detail: 'Lobby and reception sets with surfaces engineered to carry institutional marks.' },
  { label: 'Custom — talk to the studio', detail: 'Unusual surface, multiple placements per scene, or animated variants on request.' },
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

function PillarCard({ title, body }) {
  return (
    <div
      style={{
        padding: '1.75rem',
        background: '#fff',
        border: `1px solid ${RULE}`,
        borderRadius: '0.5rem',
      }}
    >
      <h3
        style={{
          fontFamily: SERIF,
          fontSize: '1.2rem',
          fontWeight: 600,
          color: GRAPHITE,
          margin: '0 0 0.75rem',
          letterSpacing: '-0.01em',
          lineHeight: 1.25,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: '0.92rem',
          color: MUTED,
          margin: 0,
          lineHeight: 1.6,
        }}
      >
        {body}
      </p>
    </div>
  );
}

function BrandedExample({ branded, placement, note }) {
  return (
    <figure style={{ margin: 0 }}>
      <div
        style={{
          aspectRatio: '16/9',
          background: '#000',
          borderRadius: '0.5rem',
          overflow: 'hidden',
          marginBottom: '0.85rem',
        }}
      >
        <img
          src={branded}
          alt={`Branded environment — ${placement}`}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
      <figcaption>
        <div
          style={{
            fontSize: '0.7rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: GRAPHITE,
            fontWeight: 700,
            marginBottom: '0.35rem',
          }}
        >
          {placement}
        </div>
        <div style={{ fontSize: '0.85rem', color: MUTED, lineHeight: 1.5 }}>{note}</div>
      </figcaption>
    </figure>
  );
}

function StepCard({ n, title, body }) {
  return (
    <div
      style={{
        background: '#fff',
        border: `1px solid ${RULE}`,
        padding: '1.75rem',
        borderRadius: '0.5rem',
      }}
    >
      <div
        style={{
          fontSize: '0.65rem',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: WARM,
          fontWeight: 700,
          marginBottom: '0.6rem',
        }}
      >
        Step {n}
      </div>
      <h3
        style={{
          fontFamily: SERIF,
          fontSize: '1.35rem',
          fontWeight: 600,
          color: GRAPHITE,
          margin: '0 0 0.6rem',
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: '0.92rem', color: MUTED, margin: 0, lineHeight: 1.55 }}>{body}</p>
    </div>
  );
}

function PlacementCard({ label, detail }) {
  return (
    <div
      style={{
        padding: '1.25rem 1.4rem',
        background: '#fff',
        border: `1px solid ${RULE}`,
        borderRadius: '0.5rem',
      }}
    >
      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: GRAPHITE, marginBottom: '0.4rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '0.82rem', color: MUTED, lineHeight: 1.5 }}>{detail}</div>
    </div>
  );
}

function CustomTierCard({ title, body }) {
  return (
    <div
      style={{
        padding: '2rem',
        background: '#fff',
        border: `1px solid ${RULE}`,
        borderTop: `2px solid ${WARM}`,
        borderRadius: '0.5rem',
      }}
    >
      <h3
        style={{
          fontFamily: SERIF,
          fontSize: '1.25rem',
          fontWeight: 600,
          color: GRAPHITE,
          margin: '0 0 0.75rem',
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: '0.92rem', color: MUTED, margin: 0, lineHeight: 1.6 }}>{body}</p>
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
      <Layout
        title="Branded Virtual Backgrounds for Teams | MeetBackdrops"
        description="Studio-built virtual environments with your brand integrated for Zoom, Teams, and Google Meet. Consistent video presence for distributed teams."
        canonical="https://meetbackdrops.com/branded-backgrounds"
      >
        {/* HERO */}
        <section
          style={{
            background: INK,
            color: '#fff',
            padding: '6rem 2rem 5rem',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <Eyebrow light>Brand presence infrastructure for video</Eyebrow>
            <h1
              style={{
                fontFamily: SERIF,
                fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                lineHeight: 1.05,
                margin: '0 0 1.5rem',
              }}
            >
              Branded Virtual Backgrounds for Teams
            </h1>
            <p
              style={{
                fontSize: '1.1rem',
                lineHeight: 1.6,
                color: '#cbd2dc',
                maxWidth: '680px',
                margin: '0 auto 2.5rem',
              }}
            >
              Studio-built environments with your company brand integrated into the scene —
              deployed across every executive, sales rep, and recruiter on Zoom, Microsoft
              Teams, and Google Meet. One unified video presence for distributed teams,
              consistent in every meeting your company shows up in.
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '2rem',
                flexWrap: 'wrap',
              }}
            >
              <Link
                href="#request"
                style={{
                  display: 'inline-block',
                  background: '#fff',
                  color: GRAPHITE,
                  padding: '1rem 2.25rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  borderBottom: `2px solid ${WARM}`,
                }}
              >
                Request a proposal →
              </Link>
              <Link
                href="/"
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                  color: '#9aa3b0',
                  textDecoration: 'underline',
                  textUnderlineOffset: '4px',
                }}
              >
                Browse the studio catalog
              </Link>
            </div>
          </div>
        </section>

        {/* VALUE PILLARS */}
        <section style={{ padding: '6rem 2rem', background: PAPER, borderBottom: `1px solid ${RULE}` }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <Eyebrow>Why teams deploy branded environments</Eyebrow>
              <h2
                style={{
                  fontFamily: SERIF,
                  fontSize: 'clamp(1.9rem, 3.2vw, 2.6rem)',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  color: GRAPHITE,
                  margin: 0,
                }}
              >
                Operational outcomes, not aesthetic upgrades.
              </h2>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {PILLARS.map((p) => (
                <PillarCard key={p.title} {...p} />
              ))}
            </div>
          </div>
        </section>

        {/* THE TRANSFORMATION */}
        <section style={{ padding: '6rem 2rem', background: '#fff' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <Eyebrow>The transformation</Eyebrow>
              <h2
                style={{
                  fontFamily: SERIF,
                  fontSize: 'clamp(1.9rem, 3.2vw, 2.6rem)',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  color: GRAPHITE,
                  margin: '0 0 1rem',
                }}
              >
                Studio environments, your brand integrated.
              </h2>
              <p
                style={{
                  fontSize: '0.98rem',
                  color: MUTED,
                  maxWidth: '640px',
                  margin: '0 auto',
                  lineHeight: 1.6,
                }}
              >
                A range of placement treatments — from operational office settings to
                executive boardrooms — each showing how a brand can sit naturally inside
                a studio-built environment.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '2rem',
              }}
            >
              {EXAMPLES.map((ex, i) => (
                <BrandedExample key={i} {...ex} />
              ))}
            </div>
          </div>
        </section>

        {/* BRANDED VIDEO PRESENCE SYSTEM */}
        <section
          style={{
            padding: '6rem 2rem',
            background: INK,
            color: '#fff',
          }}
        >
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <Eyebrow light>The video presence system</Eyebrow>
              <h2
                style={{
                  fontFamily: SERIF,
                  fontSize: 'clamp(1.9rem, 3.2vw, 2.6rem)',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  margin: 0,
                }}
              >
                Every video call is a brand surface.
              </h2>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '2rem',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '0.7rem',
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: '#c79a6b',
                    fontWeight: 700,
                    marginBottom: '0.75rem',
                  }}
                >
                  01 · The reality
                </div>
                <p style={{ color: '#cbd2dc', lineHeight: 1.65, margin: 0, fontSize: '0.98rem' }}>
                  On any given workday, your company shows up in hundreds of video calls —
                  sales demos, customer support, candidate interviews, board updates. Most
                  of those calls happen against unmanaged backdrops: cluttered home offices,
                  generic stock photos, default platform blurs.
                </p>
              </div>

              <div>
                <div
                  style={{
                    fontSize: '0.7rem',
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: '#c79a6b',
                    fontWeight: 700,
                    marginBottom: '0.75rem',
                  }}
                >
                  02 · The cost
                </div>
                <p style={{ color: '#cbd2dc', lineHeight: 1.65, margin: 0, fontSize: '0.98rem' }}>
                  Every one of those calls is a brand impression. Inconsistent backdrops
                  dilute the impression — a candidate sees a different company on every
                  panelist screen, a customer sees a different company across two product
                  demos run by the same team.
                </p>
              </div>

              <div>
                <div
                  style={{
                    fontSize: '0.7rem',
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: '#c79a6b',
                    fontWeight: 700,
                    marginBottom: '0.75rem',
                  }}
                >
                  03 · The system
                </div>
                <p style={{ color: '#cbd2dc', lineHeight: 1.65, margin: 0, fontSize: '0.98rem' }}>
                  A branded environment program treats the backdrop as a managed brand
                  surface — the same way your email signature, deck template, and customer
                  email are managed. Every employee, every call, the same on-brand context.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section
          style={{
            padding: '5rem 2rem',
            background: PAPER,
            borderTop: `1px solid ${RULE}`,
            borderBottom: `1px solid ${RULE}`,
          }}
        >
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <Eyebrow>How it works</Eyebrow>
              <h2
                style={{
                  fontFamily: SERIF,
                  fontSize: 'clamp(1.9rem, 3.2vw, 2.6rem)',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  color: GRAPHITE,
                  margin: 0,
                }}
              >
                From kickoff to deployed brand presence.
              </h2>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1.5rem',
              }}
            >
              <StepCard
                n="01"
                title="Pick your environments"
                body="Browse studio environments and flag the scenes that fit your brand — offices, libraries, galleries, conference rooms. The studio narrows the set with you and recommends placements per image."
              />
              <StepCard
                n="02"
                title="Send your brand assets"
                body="Logo, brand colors, any guidelines. The studio confirms placement zones, surface treatments, and turnaround per image before production starts."
              />
              <StepCard
                n="03"
                title="Deploy across the team"
                body="Each composite is delivered as a high-resolution image with your brand integrated, ready for company-wide distribution. Annual term, single invoice, IT-friendly delivery."
              />
            </div>
          </div>
        </section>

        {/* WHERE THE BRAND INTEGRATES */}
        <section style={{ padding: '6rem 2rem', background: '#fff' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <Eyebrow>Placement options</Eyebrow>
              <h2
                style={{
                  fontFamily: SERIF,
                  fontSize: 'clamp(1.9rem, 3.2vw, 2.6rem)',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  color: GRAPHITE,
                  margin: '0 0 1rem',
                }}
              >
                Surfaces that carry the brand without becoming a billboard.
              </h2>
              <p
                style={{
                  fontSize: '0.98rem',
                  color: MUTED,
                  maxWidth: '620px',
                  margin: '0 auto',
                  lineHeight: 1.6,
                }}
              >
                Studio environments are full of natural surfaces — wall art, signage,
                objects on a desk — that can carry a logo at the level of detail your
                brand calls for.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {PLACEMENTS.map((p) => (
                <PlacementCard key={p.label} {...p} />
              ))}
            </div>
          </div>
        </section>

        {/* CUSTOM BRAND ENVIRONMENTS — premium tier */}
        <section
          style={{
            padding: '6rem 2rem',
            background: PAPER,
            borderTop: `1px solid ${RULE}`,
            borderBottom: `1px solid ${RULE}`,
          }}
        >
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <Eyebrow>The custom tier</Eyebrow>
              <h2
                style={{
                  fontFamily: SERIF,
                  fontSize: 'clamp(1.9rem, 3.2vw, 2.6rem)',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  color: GRAPHITE,
                  margin: '0 0 1rem',
                }}
              >
                Custom brand environments — built for you alone.
              </h2>
              <p
                style={{
                  fontSize: '0.98rem',
                  color: MUTED,
                  maxWidth: '640px',
                  margin: '0 auto',
                  lineHeight: 1.6,
                }}
              >
                For organizations that need an environment fully exclusive to their brand.
                These are built from scratch to your brief, never added to the public
                catalog, and used only by your team.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
                marginBottom: '3rem',
              }}
            >
              <CustomTierCard
                title="HQ replication environments"
                body="A virtual set that mirrors your actual headquarters, executive boardroom, or flagship office — so executives call in from a digital twin of the real space, fully under your brand."
              />
              <CustomTierCard
                title="Campaign-specific sets"
                body="A branded environment built around a specific moment — product launch, earnings cycle, partnership announcement, recruiting season. Yours for the campaign window, never re-used elsewhere."
              />
              <CustomTierCard
                title="Fully bespoke environments"
                body="An original environment designed end-to-end for your brand — composition, surfaces, lighting, brand integration. Exclusive to your team, never available to other organizations."
              />
            </div>

            <div style={{ textAlign: 'center' }}>
              <Link
                href="#request"
                style={{
                  display: 'inline-block',
                  background: GRAPHITE,
                  color: '#fff',
                  padding: '1rem 2rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  borderBottom: `2px solid ${WARM}`,
                }}
              >
                Talk to the studio →
              </Link>
            </div>
          </div>
        </section>

        {/* OPERATIONAL TERMS */}
        <section style={{ padding: '5rem 2rem', background: '#fff', borderBottom: `1px solid ${RULE}` }}>
          <div style={{ maxWidth: '780px', margin: '0 auto' }}>
            <Eyebrow>Operational terms</Eyebrow>
            <h2
              style={{
                fontFamily: SERIF,
                fontSize: 'clamp(1.7rem, 2.8vw, 2.2rem)',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: GRAPHITE,
                margin: '0 0 1.5rem',
              }}
            >
              What's deployed to your team, what stays in the studio.
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '1rem' }}>
              <li style={{ display: 'flex', gap: '0.85rem' }}>
                <span style={{ color: WARM, fontWeight: 700 }}>·</span>
                <span style={{ color: GRAPHITE, lineHeight: 1.55 }}>
                  <strong>Branded composites are deployed to your team.</strong> Each
                  environment with your brand integrated is delivered for organization-wide
                  use across Zoom, Microsoft Teams, Google Meet, and other meeting platforms.
                </span>
              </li>
              <li style={{ display: 'flex', gap: '0.85rem' }}>
                <span style={{ color: WARM, fontWeight: 700 }}>·</span>
                <span style={{ color: GRAPHITE, lineHeight: 1.55 }}>
                  <strong>Underlying environments remain part of the studio catalog.</strong>{' '}
                  The base scenes — without your brand applied — stay in the studio's
                  curated set and may carry other companies' brands in separate composites.
                </span>
              </li>
              <li style={{ display: 'flex', gap: '0.85rem' }}>
                <span style={{ color: WARM, fontWeight: 700 }}>·</span>
                <span style={{ color: GRAPHITE, lineHeight: 1.55 }}>
                  <strong>For full exclusivity, see the custom tier.</strong> Custom brand
                  environments are built from scratch for one organization and never added
                  to the public catalog — the only path to a fully exclusive set.
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
              <Eyebrow>Enterprise inquiry</Eyebrow>
              <h2
                style={{
                  fontFamily: SERIF,
                  fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  color: GRAPHITE,
                  margin: '0 0 1.25rem',
                }}
              >
                Bring your brand into the studio.
              </h2>
              <p
                style={{
                  fontSize: '1.05rem',
                  color: MUTED,
                  lineHeight: 1.6,
                  maxWidth: '560px',
                  margin: '0 auto',
                }}
              >
                Send your logo and the kind of set you have in mind. The studio comes back
                with a proposed environment list, placement plan, and quote within two
                business days.
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
                  Thank you, {form.name.split(' ')[0] || 'there'}. The studio will reply to{' '}
                  {form.workEmail} within one business day. In the meantime, feel free to{' '}
                  <Link
                    href="/"
                    style={{ color: WARM, textDecoration: 'underline', textUnderlineOffset: '3px' }}
                  >
                    browse the environments
                  </Link>
                  .
                </p>
              </div>
            ) : (
              <form
                onSubmit={onSubmit}
                noValidate
                style={{ background: '#fff', padding: '2.5rem', border: `1px solid ${RULE}` }}
              >
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
                      placeholder="e.g. Head of Brand, Marketing Director, IT Director"
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
                    <div style={{ color: '#b00020', fontSize: '0.8rem', marginTop: '0.4rem' }}>
                      {errors.useCase}
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <label htmlFor="notes" style={labelStyle}>
                    Anything else? (Custom environment, exclusivity, IT/SSO, brand guidelines…)
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
                  {status === 'submitting' ? 'Sending…' : 'Submit Inquiry'}
                </button>

                <p
                  style={{
                    color: MUTED,
                    fontSize: '0.8rem',
                    marginTop: '1.25rem',
                    textAlign: 'center',
                    lineHeight: 1.6,
                  }}
                >
                  Or email the studio directly at{' '}
                  <a
                    href="mailto:info@streambackdrops.com"
                    style={{ color: WARM, textDecoration: 'underline', textUnderlineOffset: '3px' }}
                  >
                    info@streambackdrops.com
                  </a>
                  .
                </p>
              </form>
            )}
          </div>
        </section>
      </Layout>
    </>
  );
}
