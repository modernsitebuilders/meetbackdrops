import Link from 'next/link';

export const hdVirtualBackgroundsContent = () => (
  <article style={{ background: '#f8fafc', minHeight: '100vh' }}>
    <div style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div style={{
          background: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>

          {/* HERO */}
          <header style={{
            background: 'linear-gradient(135deg, #4c1d95 0%, #3730a3 100%)',
            color: 'white',
            padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 3vw, 2rem)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '0.9rem', fontWeight: '600',
              letterSpacing: '0.05em', textTransform: 'uppercase',
              marginBottom: '1rem', opacity: '0.9'
            }}>
              Updated: March 2026
            </div>
            <h1 style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 'bold', marginBottom: '1rem', lineHeight: '1.2'
            }}>
              HD Virtual Backgrounds: Why Resolution Actually Matters for Video Calls
            </h1>
            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              opacity: '0.95', maxWidth: '700px',
              margin: '0 auto 1.5rem', lineHeight: '1.6'
            }}>
              Zoom, Teams, and Google Meet compress everything. Here's what "HD" really means for virtual backgrounds — and why 2912×1632 holds up when 1080p turns blurry.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', fontSize: '0.9rem', opacity: '0.85' }}>
              <span>8 min read</span>
              <span>·</span>
              <span>March 2026</span>
            </div>
          </header>

          {/* CONTENT */}
          <div style={{ padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 2rem)', maxWidth: '800px', margin: '0 auto' }}>

            {/* TL;DR box */}
            <div style={{
              background: '#f0fdf4', border: '1px solid #86efac',
              borderRadius: '0.5rem', padding: '1.25rem 1.5rem',
              marginBottom: '2.5rem'
            }}>
              <strong style={{ color: '#166534', display: 'block', marginBottom: '0.4rem' }}>Quick answer</strong>
              <p style={{ margin: 0, color: '#15803d', lineHeight: '1.6' }}>
                Standard 1080p backgrounds often look soft or pixelated after video compression.
                Backgrounds at 2912×1632 start with so much extra detail that even after Zoom or Teams
                compresses the stream, they still look sharp. That's the only reason resolution matters here.
              </p>
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem', color: '#111827' }}>
              Why your background looks blurry on video calls
            </h2>
            <p style={{ lineHeight: '1.8', color: '#374151', marginBottom: '1.5rem' }}>
              Every video platform — Zoom, Teams, Google Meet — compresses your stream before it
              reaches other participants. Even on a fast connection, the codec is constantly discarding
              detail to keep bandwidth manageable. Your background takes the hit hardest because
              motion detection treats it as low-priority.
            </p>
            <p style={{ lineHeight: '1.8', color: '#374151', marginBottom: '1.5rem' }}>
              A 1920×1080 background starts at a reasonable resolution, but once the encoder
              downsamples it to fit the stream, fine textures — wood grain on a bookshelf,
              fabric on a chair, print on book spines — smear into indistinct blocks.
              The result looks like a screenshot taken at 50% quality.
            </p>

            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem', color: '#111827' }}>
              What "2.5K" actually means for virtual backgrounds
            </h2>
            <p style={{ lineHeight: '1.8', color: '#374151', marginBottom: '1.5rem' }}>
              Our HD backgrounds are 2912×1632 pixels — roughly 2.5K horizontal resolution.
              That's about 2.3× the pixel count of a standard 1080p image. When Zoom compresses
              a 2.5K source down to stream quality, the result still has more surviving detail
              than a 1080p original at the same compression level.
            </p>

            {/* Comparison table */}
            <div style={{ overflowX: 'auto', marginBottom: '2.5rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6' }}>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb', color: '#111827' }}>Resolution</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb', color: '#111827' }}>Total pixels</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb', color: '#111827' }}>After stream compression</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb', color: '#111827' }}>Available at StreamBackdrops</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#374151' }}>1920×1080 (1080p)</td>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#374151' }}>~2.1 MP</td>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#6b7280' }}>Noticeable softness on fine detail</td>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#374151' }}>Free (1456×816)</td>
                  </tr>
                  <tr style={{ background: '#fdf4ff' }}>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#374151', fontWeight: '600' }}>2912×1632 (2.5K)</td>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#374151', fontWeight: '600' }}>~4.8 MP</td>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#15803d', fontWeight: '600' }}>Stays crisp — more headroom for the codec</td>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#374151', fontWeight: '600' }}>HD packs from $4.99</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem 1rem', color: '#374151' }}>3840×2160 (4K)</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#374151' }}>~8.3 MP</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#6b7280' }}>Diminishing returns — file sizes get large</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#6b7280' }}>Not offered (overkill for webcam use)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mid-post CTA — after comparison table */}
            <div style={{
              border: '2px solid #7c3aed',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              marginBottom: '2.5rem',
              background: '#faf5ff',
            }}>
              <p style={{ margin: '0 0 1rem', fontWeight: '700', color: '#4c1d95', fontSize: '1rem' }}>
                ⭐ StreamBackdrops HD Backgrounds — 2912×1632
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://assets.streambackdrops.com/webp/bookshelves-bright/bookshelves-bright-01.webp" alt="HD bright bookshelf virtual background" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: '6px' }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://assets.streambackdrops.com/webp/office-spaces/office-spaces-05.webp" alt="HD office space virtual background" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: '6px' }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://assets.streambackdrops.com/webp/bookshelves-dark/bookshelves-dark-09.webp" alt="HD dark bookshelf virtual background" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: '6px' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#6b21a8' }}>
                  Packs from $4.99 · PNG · Instant download · No subscription
                </span>
                <Link href="/hd" style={{
                  background: '#7c3aed', color: 'white',
                  padding: '0.6rem 1.25rem', borderRadius: '7px',
                  textDecoration: 'none', fontWeight: '700', fontSize: '0.95rem',
                  whiteSpace: 'nowrap',
                }}>
                  Browse HD Packs →
                </Link>
              </div>
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem', color: '#111827' }}>
              Why most "HD" background sites aren't actually HD for video calls
            </h2>
            <p style={{ lineHeight: '1.8', color: '#374151', marginBottom: '1.5rem' }}>
              Sites like Unsplash or Pexels offer multi-megapixel photos, but those images are
              shot for print and web — not framed for a webcam. A landscape photo downloaded from
              a stock site at 4000 pixels wide still won't look right as a Zoom background because
              the composition is wrong: the subject is off-center, there's no clear "person zone",
              and the depth of field doesn't suggest a real space behind you.
            </p>
            <p style={{ lineHeight: '1.8', color: '#374151', marginBottom: '1.5rem' }}>
              Every background on StreamBackdrops — free and HD — is composed specifically for
              video calls. The "camera" sits where your webcam sits. The depth is shallow enough
              to look realistic, but deep enough to show interesting detail. The lighting matches
              what you'd actually see in that kind of room.
            </p>

            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem', color: '#111827' }}>
              When does HD make a visible difference?
            </h2>
            <p style={{ lineHeight: '1.8', color: '#374151', marginBottom: '1rem' }}>
              HD matters most in these situations:
            </p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', lineHeight: '2', color: '#374151' }}>
              <li><strong>Large-screen calls</strong> — if participants are watching on 27"+ monitors, background pixelation is obvious</li>
              <li><strong>Conference presentations</strong> — when your video is displayed on a room TV or projector, quality is magnified</li>
              <li><strong>Job interviews</strong> — first impressions matter; a sharp background signals attention to detail</li>
              <li><strong>Client-facing calls</strong> — polished detail reinforces professional credibility</li>
              <li><strong>Bookshelves and textured backgrounds</strong> — these categories especially benefit; book spines and wood grain degrade badly at low resolution</li>
            </ul>

            {/* Second CTA — after "when HD makes a difference" */}
            <div style={{
              background: 'linear-gradient(135deg, #4c1d95, #3730a3)',
              borderRadius: '0.75rem',
              padding: '1.5rem 2rem',
              marginBottom: '2.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}>
              <div>
                <p style={{ color: 'white', fontWeight: '700', fontSize: '1.05rem', margin: '0 0 0.3rem' }}>
                  Ready to upgrade your background?
                </p>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.88rem', margin: 0 }}>
                  150+ HD backgrounds at 2912×1632 · from $4.99
                </p>
              </div>
              <Link href="/hd" style={{
                background: 'white', color: '#4c1d95',
                padding: '0.65rem 1.4rem', borderRadius: '7px',
                textDecoration: 'none', fontWeight: '700', fontSize: '0.95rem',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}>
                Browse HD Packs →
              </Link>
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem', color: '#111827' }}>
              How to set up a virtual background in HD
            </h2>
            <p style={{ lineHeight: '1.8', color: '#374151', marginBottom: '1rem' }}>
              The steps are the same regardless of resolution — the higher-res file just
              replaces the standard one:
            </p>
            <ol style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', lineHeight: '2.2', color: '#374151' }}>
              <li>Download your HD background from the <Link href="/hd" style={{ color: '#7c3aed', fontWeight: '600' }}>HD page</Link></li>
              <li><strong>Zoom:</strong> Settings → Background & Effects → Virtual Background → + to add image</li>
              <li><strong>Teams:</strong> Before a call → Apply background effects → Add new → select your file</li>
              <li><strong>Google Meet:</strong> In-call → More options → Apply visual effects → Upload background</li>
            </ol>
            <p style={{ lineHeight: '1.8', color: '#374151', marginBottom: '1.5rem' }}>
              All three platforms accept .PNG files. Our HD downloads are PNG — no conversion needed.
            </p>

            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem', color: '#111827' }}>
              File size: is HD too slow to download?
            </h2>
            <p style={{ lineHeight: '1.8', color: '#374151', marginBottom: '1.5rem' }}>
              HD backgrounds at 2912×1632 are typically 3–6 MB each as optimised PNGs.
              That's a one-time download of a few seconds on any broadband connection.
              Once the file is saved locally, Zoom or Teams loads it instantly — it never
              re-downloads during the call. File size is not a practical concern.
            </p>

            {/* CTA */}
            <div style={{
              background: 'linear-gradient(135deg, #4c1d95, #3730a3)',
              borderRadius: '0.75rem',
              padding: '2rem',
              textAlign: 'center',
              marginTop: '3rem',
              marginBottom: '2rem'
            }}>
              <h3 style={{ color: 'white', fontSize: '1.35rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                Ready to try HD?
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '1.25rem', lineHeight: '1.6' }}>
                Browse 150+ HD backgrounds at 2912×1632. Packs from $4.99 — or grab the free backgrounds first.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link
                  href="/hd"
                  style={{
                    background: 'white', color: '#4c1d95',
                    padding: '0.75rem 1.5rem', borderRadius: '8px',
                    textDecoration: 'none', fontWeight: '700', fontSize: '1rem'
                  }}
                >
                  Browse HD Backgrounds →
                </Link>
                <Link
                  href="/"
                  style={{
                    background: 'rgba(255,255,255,0.15)', color: 'white',
                    padding: '0.75rem 1.5rem', borderRadius: '8px',
                    textDecoration: 'none', fontWeight: '600', fontSize: '1rem',
                    border: '1px solid rgba(255,255,255,0.4)'
                  }}
                >
                  Browse Free Backgrounds
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </article>
);
