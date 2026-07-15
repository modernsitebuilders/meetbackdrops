import { trackEvent } from '../lib/trackEvent';
import { useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { FREE_SAMPLES, webpUrl } from '../lib/freeSamples';

const trackAnalytics = (eventType, filename, category, extra) => trackEvent(eventType, filename, category, extra);

export default function FreeSamplePage() {
  const [selectedId, setSelectedId] = useState(null);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [downloadedSample, setDownloadedSample] = useState(null);

  const handleSelect = (id) => {
    if (downloadedSample) return;
    setSelectedId(id);
    setErrorMsg('');
    trackAnalytics('free_sample_selected', id, 'free_sample_page');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedId) {
      setErrorMsg('Pick a background first.');
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/free-hd-sample', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, sampleId: selectedId }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setErrorMsg(data.error || 'Something went wrong. Try again.');
        setSubmitting(false);
        return;
      }
      const a = document.createElement('a');
      a.href = data.url;
      a.download = `${selectedId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      try { localStorage.setItem('sb_hd_sample_used', '1'); } catch {}
      try { localStorage.setItem('sb_hd_sample_email', email); } catch {}
      trackAnalytics('free_sample_download', selectedId, 'free_sample_page');
      setDownloadedSample(FREE_SAMPLES.find((s) => s.id === selectedId));
    } catch {
      setErrorMsg('Network error. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout
      title="Free 4K Virtual Background Sample | MeetBackdrops"
      description="Pick one of three studio-designed 4K virtual backgrounds. See the quality on your own Zoom, Teams, or Google Meet call before you buy any HD Editions."
      canonical="https://meetbackdrops.com/free-sample"
      keywords="free 4k virtual background, free hd zoom background, sample virtual background, free professional zoom background, studio backdrop sample"
      image="https://assets.streambackdrops.com/webp/bookshelves-bright/light-green-room-bookshelf-framed-art-wall-cozy-seating-area-a5bf616e.webp"
    >
      <section style={{
        background: '#111827',
        color: 'white',
        padding: '4rem 1.5rem 3rem',
        textAlign: 'center',
        borderBottom: '2px solid #9a6a3a',
      }}>
        <div style={{
          fontSize: '0.7rem',
          fontWeight: 600,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: '#c79a6b',
          marginBottom: '1.25rem',
        }}>
          Free 4K Sample · No card required
        </div>
        <h1 style={{
          fontFamily: "'Fraunces', Georgia, 'Times New Roman', serif",
          fontWeight: 600,
          letterSpacing: '-0.02em',
          fontSize: 'clamp(2rem, 4.5vw, 3.25rem)',
          margin: '0 0 1rem',
          maxWidth: '880px',
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: 1.15,
        }}>
          Try a 4K background on your next call.
        </h1>
        <p style={{
          fontSize: '1.05rem',
          color: '#d1d5db',
          maxWidth: '640px',
          margin: '0 auto',
          lineHeight: 1.55,
        }}>
          Pick one. Use it on Zoom, Teams, or Google Meet. See the quality before
          you buy any HD Editions.
        </p>
      </section>

      <section style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '3rem 1.5rem 4rem',
      }}>
        {downloadedSample ? (
          <PostDownloadState sample={downloadedSample} />
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2.5rem',
            }}>
              {FREE_SAMPLES.map((sample) => (
                <SampleCard
                  key={sample.id}
                  sample={sample}
                  selected={selectedId === sample.id}
                  onSelect={() => handleSelect(sample.id)}
                />
              ))}
            </div>

            <form onSubmit={handleSubmit} style={{
              maxWidth: '460px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}>
              <label htmlFor="email" style={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#111827',
                textAlign: 'center',
              }}>
                {selectedId ? 'Where should we send it?' : 'Pick a background above to continue.'}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrorMsg(''); }}
                placeholder="you@company.com"
                disabled={!selectedId || submitting}
                style={{
                  padding: '0.75rem 1rem',
                  border: errorMsg ? '1.5px solid #ef4444' : '1.5px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                  background: selectedId ? 'white' : '#f3f4f6',
                  color: '#111827',
                }}
              />
              {errorMsg && (
                <span style={{ fontSize: '0.85rem', color: '#dc2626', textAlign: 'center' }}>{errorMsg}</span>
              )}
              <button
                type="submit"
                disabled={!selectedId || submitting}
                style={{
                  padding: '0.85rem 1.25rem',
                  background: !selectedId || submitting ? '#9ca3af' : '#111827',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: !selectedId || submitting ? 'default' : 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                {submitting ? 'Preparing your download…' : 'Get my free 4K background'}
              </button>
              <p style={{
                fontSize: '0.78rem',
                color: '#6b7280',
                textAlign: 'center',
                margin: '0.25rem 0 0',
                lineHeight: 1.5,
              }}>
                One download per email. No spam — we&apos;ll only contact you about new HD Editions.
              </p>
            </form>
          </>
        )}
      </section>
    </Layout>
  );
}

function SampleCard({ sample, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        background: 'white',
        border: selected ? '3px solid #E0A82E' : '3px solid transparent',
        borderRadius: '0.875rem',
        padding: 0,
        overflow: 'hidden',
        textAlign: 'left',
        cursor: 'pointer',
        boxShadow: selected
          ? '0 12px 32px rgba(224, 168, 46, 0.25)'
          : '0 4px 14px rgba(0, 0, 0, 0.08)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
        transform: selected ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 9',
        background: '#f3f4f6',
      }}>
        <img
          src={webpUrl(sample)}
          alt={`${sample.label} virtual background — ${sample.id}`}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
        {selected && (
          <div style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            background: '#E0A82E',
            color: '#111827',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '0.35rem 0.65rem',
            borderRadius: '999px',
          }}>
            Selected
          </div>
        )}
      </div>
      <div style={{ padding: '1rem 1.1rem 1.15rem' }}>
        <div style={{
          fontSize: '0.95rem',
          fontWeight: 700,
          color: '#111827',
          marginBottom: '0.3rem',
        }}>
          {sample.label}
        </div>
        <div style={{
          fontSize: '0.83rem',
          color: '#6b7280',
          lineHeight: 1.45,
        }}>
          {sample.blurb}
        </div>
      </div>
    </button>
  );
}

function PostDownloadState({ sample }) {
  return (
    <div style={{
      maxWidth: '620px',
      margin: '0 auto',
      textAlign: 'center',
      padding: '2rem 1.5rem',
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '1rem',
      boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
    }}>
      <div style={{
        fontSize: '0.7rem',
        fontWeight: 600,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: '#9a6a3a',
        marginBottom: '0.85rem',
      }}>
        ✓ Downloading
      </div>
      <h2 style={{
        fontFamily: "'Fraunces', Georgia, 'Times New Roman', serif",
        fontWeight: 600,
        fontSize: '1.6rem',
        color: '#111827',
        margin: '0 0 0.75rem',
        lineHeight: 1.25,
      }}>
        Your 4K background is downloading.
      </h2>
      <p style={{
        fontSize: '0.98rem',
        color: '#4b5563',
        lineHeight: 1.55,
        margin: '0 0 1.75rem',
      }}>
        Use it on your next Zoom, Teams, or Google Meet call. When you want more,
        HD Editions start at&nbsp;$4.99.
      </p>
      <Link
        href="/hd"
        style={{
          display: 'inline-block',
          padding: '0.85rem 1.6rem',
          background: '#111827',
          color: 'white',
          borderRadius: '0.5rem',
          fontSize: '0.98rem',
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        See HD Editions
      </Link>
      <div style={{ marginTop: '1.5rem', fontSize: '0.82rem', color: '#9ca3af' }}>
        Saved as <code style={{ background: '#f3f4f6', padding: '0.1rem 0.4rem', borderRadius: '0.25rem' }}>{sample.id}.png</code>
      </div>
    </div>
  );
}
