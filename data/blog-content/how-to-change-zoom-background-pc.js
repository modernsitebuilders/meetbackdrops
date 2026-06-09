import Link from 'next/link';
import YoutubeEmbed from '../../components/YoutubeEmbed';

export const howToChangeZoomBackgroundPcContent = () => (
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
            background: 'linear-gradient(135deg, #0f4c81 0%, #1565c0 100%)',
            color: 'white',
            padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 3vw, 2rem)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '0.9rem', fontWeight: '600',
              letterSpacing: '0.05em', textTransform: 'uppercase',
              marginBottom: '1rem', opacity: '0.9'
            }}>
              Platform Guide · April 2026
            </div>
            <h1 style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 'bold', marginBottom: '1rem', lineHeight: '1.2'
            }}>
              How to Change Your Zoom Background on a PC (2026 Tutorial)
            </h1>
            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              opacity: '0.95', maxWidth: '700px',
              margin: '0 auto 1.5rem', lineHeight: '1.6'
            }}>
              Fix Zoom background issues and add a professional look in under 60 seconds — watch the video or follow the written steps below.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', fontSize: '0.9rem', opacity: '0.85' }}>
              <span>3 min read</span>
              <span>·</span>
              <span>April 2026</span>
            </div>
          </header>

          {/* CONTENT */}
          <div style={{ padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 2rem)', maxWidth: '800px', margin: '0 auto' }}>

            {/* TL;DR box */}
            <div style={{
              background: '#eff6ff', border: '1px solid #93c5fd',
              borderRadius: '0.5rem', padding: '1.25rem 1.5rem',
              marginBottom: '2.5rem'
            }}>
              <strong style={{ color: '#1d4ed8', display: 'block', marginBottom: '0.4rem' }}>Quick answer</strong>
              <p style={{ margin: 0, color: '#1e40af', lineHeight: '1.6' }}>
                Open Zoom → click the <strong>gear icon</strong> (Settings) → select <strong>Background &amp; Effects</strong> →
                click <strong>Virtual Background</strong> → click the <strong>+</strong> button → choose your image file.
                Your background is saved automatically for every future call.
              </p>
            </div>

            <p style={{ lineHeight: '1.8', color: '#374151', marginBottom: '2rem' }}>
              Zoom buries the virtual background setting in a non-obvious place, and the option is greyed out
              entirely if your account administrator has disabled it. The video below walks through the exact
              steps on a Windows PC — including how to fix it if the option isn't showing.
            </p>

            {/* VIDEO EMBED */}
            <div style={{ marginBottom: '2.5rem' }}>
              <YoutubeEmbed
                videoId="mBHIi4X8um0"
                title="How to Change Your Zoom Background on a PC (2026 Tutorial)"
              />
            </div>

            {/* WRITTEN STEPS */}
            <h2 style={{ fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.75rem', color: '#111827' }}>
              Step-by-step written guide
            </h2>
            <p style={{ lineHeight: '1.8', color: '#374151', marginBottom: '1rem' }}>
              Prefer to read? Here are the exact steps shown in the video.
            </p>

            <ol style={{ paddingLeft: '1.5rem', marginBottom: '2rem', lineHeight: '2.4', color: '#374151' }}>
              <li>
                <strong>Open Zoom</strong> on your PC and click the <strong>gear icon</strong> in the top-right
                corner to open Settings.
              </li>
              <li>
                In the left panel, click <strong>Background &amp; Effects</strong>.
              </li>
              <li>
                Make sure the <strong>Virtual Background</strong> tab is selected (not Filters).
              </li>
              <li>
                Click the <strong>+</strong> button (Add image or video) and select your background image from your computer.
              </li>
              <li>
                Click your newly added background thumbnail to apply it. Zoom saves it automatically — it will be
                active the next time you join a call.
              </li>
            </ol>

            {/* Troubleshooting box */}
            <div style={{
              background: '#fefce8', border: '1px solid #fde047',
              borderRadius: '0.5rem', padding: '1.25rem 1.5rem',
              marginBottom: '2.5rem'
            }}>
              <strong style={{ color: '#854d0e', display: 'block', marginBottom: '0.4rem' }}>
                If the option is greyed out or missing
              </strong>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#713f12', lineHeight: '1.9' }}>
                <li>
                  <strong>Personal/free account:</strong> Go to zoom.us → sign in → Settings → scroll to
                  <em> Virtual background</em> → toggle it on. Return to the desktop app and the option will appear.
                </li>
                <li>
                  <strong>Work/managed account:</strong> Your IT admin has disabled it. You'll need to ask them to
                  enable it in the Zoom admin console.
                </li>
              </ul>
            </div>

            {/* Background tips */}
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem', color: '#111827' }}>
              How to make your background look good
            </h2>
            <p style={{ lineHeight: '1.8', color: '#374151', marginBottom: '1rem' }}>
              The most common complaint after setting up a Zoom background is that it looks fake — edges
              flickering, hair disappearing, colours bleeding. The setup steps are rarely the issue. What matters is:
            </p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '2rem', lineHeight: '2.2', color: '#374151' }}>
              <li>
                <strong>Use a 16:9 image.</strong> Zoom expects landscape format — at least 1920×1080 pixels.
                Portrait photos and square images stretch or tile. Most phone camera photos are the wrong format.
              </li>
              <li>
                <strong>Avoid solid colours and flat gradients.</strong> AI background detection works by finding
                depth contrast. Real-looking spaces — offices, bookshelves, rooms with depth — look far more
                convincing than graphic backgrounds.
              </li>
              <li>
                <strong>Face a light source.</strong> Even lighting on your face (a window in front of you,
                or a desk lamp) dramatically improves how cleanly Zoom separates you from the background.
              </li>
            </ul>

            {/* Internal link section */}
            <div style={{
              background: '#f8fafc', border: '1px solid #e5e7eb',
              borderRadius: '0.5rem', padding: '1.25rem 1.5rem',
              marginBottom: '2.5rem'
            }}>
              <strong style={{ color: '#374151', display: 'block', marginBottom: '0.75rem' }}>
                Recommended Zoom background categories
              </strong>
              <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.75rem', lineHeight: '1.6' }}>
                All in 16:9 format, designed for video calls, free to download:
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '2.2' }}>
                <li><Link href="/category/office-spaces" style={{ color: '#1d4ed8', fontWeight: '500' }}>Office Spaces</Link> — clean, professional, works in any meeting context</li>
                <li><Link href="/category/bookshelves" style={{ color: '#1d4ed8', fontWeight: '500' }}>Bright Bookshelves</Link> — warm and credible for client-facing calls</li>
                <li><Link href="/category/office-spaces" style={{ color: '#1d4ed8', fontWeight: '500' }}>Conference Rooms</Link> — built-in authority for corporate meetings</li>
                <li><Link href="/category/home-office" style={{ color: '#1d4ed8', fontWeight: '500' }}>Home Offices</Link> — relaxed professional for remote teams</li>
              </ul>
            </div>

            {/* Related reading */}
            <div style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0',
              borderRadius: '0.5rem', padding: '1.25rem 1.5rem',
              marginBottom: '2.5rem'
            }}>
              <strong style={{ color: '#15803d', display: 'block', marginBottom: '0.75rem' }}>Related guides</strong>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '2.2' }}>
                <li>
                  <Link href="/blog/virtual-background-setup-by-platform" style={{ color: '#1d4ed8', fontWeight: '500' }}>
                    How to Set Up a Virtual Background on Teams, Meet &amp; Webex
                  </Link>
                  {' '}— step-by-step for every other major platform
                </li>
                <li>
                  <Link href="/blog/hd-virtual-backgrounds" style={{ color: '#1d4ed8', fontWeight: '500' }}>
                    Why HD Virtual Backgrounds Look Better After Compression
                  </Link>
                  {' '}— why resolution matters more than you'd expect
                </li>
                <li>
                  <Link href="/blog/background-mistakes" style={{ color: '#1d4ed8', fontWeight: '500' }}>
                    15 Virtual Background Mistakes That Ruin Your Professional Image
                  </Link>
                  {' '}— what to avoid once your background is set up
                </li>
              </ul>
            </div>

            {/* CTA */}
            <div style={{
              background: 'linear-gradient(135deg, #0f4c81, #1565c0)',
              borderRadius: '0.75rem',
              padding: '2rem',
              textAlign: 'center',
              marginTop: '3rem',
              marginBottom: '2rem'
            }}>
              <h3 style={{ color: 'white', fontSize: '1.35rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                Get a background worth setting up
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '1.25rem', lineHeight: '1.6' }}>
                1,300+ free backgrounds designed specifically for video calls — correct 16:9 format,
                real spaces with depth, ready to upload to Zoom in seconds.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link
                  href="/category/office-spaces"
                  style={{
                    background: 'white', color: '#0f4c81',
                    padding: '0.75rem 1.5rem', borderRadius: '8px',
                    textDecoration: 'none', fontWeight: '700', fontSize: '1rem'
                  }}
                >
                  Browse Office Backgrounds →
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
                  Browse All Backgrounds
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </article>
);
