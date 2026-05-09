import Link from 'next/link';

export const whyZoomBackgroundBlurryContent = () => (
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
            background: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)',
            color: 'white',
            padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 3vw, 2rem)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '0.9rem', fontWeight: '600',
              letterSpacing: '0.05em', textTransform: 'uppercase',
              marginBottom: '1rem', opacity: '0.9'
            }}>
              Updated: May 2026
            </div>
            <h1 style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 'bold', marginBottom: '1rem', lineHeight: '1.2'
            }}>
              Why Does My Zoom Background Look Blurry? (And How to Fix It)
            </h1>
            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              opacity: '0.95', maxWidth: '720px',
              margin: '0 auto 1.5rem', lineHeight: '1.6'
            }}>
              Three reasons your virtual background looks soft on Zoom, Teams, and Google Meet — and the one that almost nobody tells you about.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', fontSize: '0.9rem', opacity: '0.85' }}>
              <span>6 min read</span>
              <span>·</span>
              <span>May 2026</span>
            </div>
          </header>

          {/* CONTENT */}
          <div style={{ padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 2rem)', maxWidth: '800px', margin: '0 auto' }}>

            {/* TL;DR */}
            <div style={{
              background: '#eff6ff', border: '1px solid #93c5fd',
              borderRadius: '0.5rem', padding: '1.25rem 1.5rem',
              marginBottom: '2.5rem'
            }}>
              <strong style={{ color: '#1e40af', display: 'block', marginBottom: '0.4rem' }}>Quick answer</strong>
              <p style={{ margin: 0, color: '#1e3a8a', lineHeight: '1.6' }}>
                Most free virtual backgrounds are 1920×1080 or smaller. Many are below that — common downloads run 1280×720 or 1456×816, both below the 1080p Zoom uses. When the source is already low-resolution, video compression and your monitor scaling stack on top, and the result looks soft. The fix: start from a higher-resolution source.
              </p>
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem', color: '#111827' }}>
              Reason 1: Your background source is below 1080p
            </h2>
            <p style={{ lineHeight: '1.8', color: '#374151', marginBottom: '1.5rem' }}>
              Most free virtual background sites — including ours, for the free tier — distribute images at sub-1080p resolutions to keep file sizes small for fast downloads. A typical free background is 1456×816 pixels, which is about 1.18 megapixels. A 1080p video stream is 2.07 megapixels. The math is uncomfortable: your background starts at <strong>57% of the resolution your call is rendering at</strong>. Even before any compression happens, the platform has to scale your image up — and upscaling never adds detail.
            </p>

            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem', color: '#111827' }}>
              Reason 2: Video conferencing aggressively compresses your stream
            </h2>
            <p style={{ lineHeight: '1.8', color: '#374151', marginBottom: '1.5rem' }}>
              Zoom, Teams, and Google Meet all compress your video before it reaches the other participants. The codec strips detail to save bandwidth, and motion-detection treats your background as low-priority — so it gets compressed harder than your face. Fine textures (book spines, wood grain, fabric, plant leaves) collapse into vague color blocks. The lower the source resolution, the less detail there is to lose before things start looking visibly soft.
            </p>

            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem', color: '#111827' }}>
              Reason 3 (the one nobody mentions): Your monitor is bigger than your background
            </h2>
            <p style={{ lineHeight: '1.8', color: '#374151', marginBottom: '1.5rem' }}>
              When you preview your call in Zoom or Teams, the app scales your background to fill the window. If you're on a 27" QHD monitor (2560×1440), the platform is stretching a 1456×816 image to fill 2.5× more pixels horizontally. On a 4K display, it's roughly 2.6× — close to 7× more total pixels than the source has. Your viewers see the compressed-stream version, but <em>you</em> see the upscaled-on-your-monitor version every time you check yourself in the self-view, which is why so many people think "my background looks fine on my screen, but blurry on theirs." The truth is closer to <em>"it looks blurry on both — you've just gotten used to your own screen."</em>
            </p>

            {/* Resolution table */}
            <div style={{ overflowX: 'auto', marginBottom: '2.5rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6' }}>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb', color: '#111827' }}>Image source</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb', color: '#111827' }}>Resolution</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb', color: '#111827' }}>Megapixels</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb', color: '#111827' }}>Holds up on a 27" QHD monitor?</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#374151' }}>Typical free download</td>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#374151' }}>1456×816</td>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#374151' }}>1.18 MP</td>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#b91c1c', fontWeight: '600' }}>No — visibly soft</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#374151' }}>Standard 1080p source</td>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#374151' }}>1920×1080</td>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#374151' }}>2.07 MP</td>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#b45309', fontWeight: '600' }}>Marginal — slight upscale</td>
                  </tr>
                  <tr style={{ background: '#f0fdf4' }}>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#374151', fontWeight: '600' }}>MeetBackdrops HD</td>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#374151', fontWeight: '600' }}>2912×1632</td>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#374151', fontWeight: '600' }}>4.75 MP</td>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#15803d', fontWeight: '600' }}>Yes — sharp at native size</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem', color: '#111827' }}>
              How to fix a blurry Zoom background
            </h2>
            <p style={{ lineHeight: '1.8', color: '#374151', marginBottom: '1rem' }}>
              In rough order of effort:
            </p>
            <ol style={{ lineHeight: '1.8', color: '#374151', marginBottom: '1.5rem', paddingLeft: '1.5rem' }}>
              <li style={{ marginBottom: '0.6rem' }}>
                <strong>Re-upload the image.</strong> Zoom, Teams, and Google Meet sometimes cache a downscaled thumbnail. Removing and re-adding the background image can refresh it.
              </li>
              <li style={{ marginBottom: '0.6rem' }}>
                <strong>Check that your call is set to HD video.</strong> In Zoom: Settings → Video → "HD". In Teams Premium and recent Google Meet: this is on by default for paid tiers but can be off for free accounts.
              </li>
              <li style={{ marginBottom: '0.6rem' }}>
                <strong>Use better lighting.</strong> Bad lighting forces the codec to spend bits cleaning up noise on your face — leaving less for the background. A simple ring light helps.
              </li>
              <li style={{ marginBottom: '0.6rem' }}>
                <strong>Start from a higher-resolution background.</strong> The single biggest factor. A 2.5K source (2912×1632) holds up after compression and on big monitors in a way that a sub-1080p source can't.
              </li>
            </ol>

            {/* Mid-post CTA */}
            <div style={{
              border: '2px solid #1e40af',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              marginBottom: '2.5rem',
              background: '#eff6ff',
            }}>
              <p style={{ margin: '0 0 1rem', fontWeight: '700', color: '#1e3a8a', fontSize: '1rem' }}>
                Skip the blur — start with a sharp source
              </p>
              <p style={{ margin: '0 0 1rem', color: '#1e40af', fontSize: '0.95rem', lineHeight: 1.6 }}>
                MeetBackdrops HD Editions are 2912×1632 — sized for QHD monitors, executive cameras, and Teams Premium calls. PNG, instant download, no subscription.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#1e40af' }}>
                  Packs from $4.99
                </span>
                <Link href="/hd" style={{
                  background: '#1e40af', color: 'white',
                  padding: '0.6rem 1.25rem', borderRadius: '7px',
                  textDecoration: 'none', fontWeight: '700', fontSize: '0.95rem',
                  whiteSpace: 'nowrap',
                }}>
                  Browse HD Editions →
                </Link>
              </div>
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem', color: '#111827' }}>
              "But my background looked fine last year"
            </h2>
            <p style={{ lineHeight: '1.8', color: '#374151', marginBottom: '1.5rem' }}>
              You probably bought a bigger monitor. Most virtual backgrounds were sized in 2020-2021, when 13" laptop screens dominated remote work. The same image on a 14" MacBook self-view looks roughly the same as it always did. On a 27" external display — much less so. The image didn't get worse; the surface you're previewing it on got bigger.
            </p>

            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem', color: '#111827' }}>
              Does HD make a difference your audience can see?
            </h2>
            <p style={{ lineHeight: '1.8', color: '#374151', marginBottom: '1.5rem' }}>
              Yes, and the reason is non-obvious. Even though the receiver's stream is being compressed down to ~720p in most cases, codecs preserve detail far better when there's <em>more source detail to work with</em>. A 4.75 MP source compressed to a 720p output retains visibly sharper textures than a 1.18 MP source compressed to the same target — because the encoder has more headroom and fewer painful tradeoffs to make.
            </p>
            <p style={{ lineHeight: '1.8', color: '#374151', marginBottom: '1.5rem' }}>
              For a 1:1 sales call, the difference is subtle. For a webinar, recorded panel, or any call that gets played back later (on a bigger screen, by people not on the original call), the difference is obvious — and unflattering for whoever shows up looking soft.
            </p>

            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem', color: '#111827' }}>
              The bottom line
            </h2>
            <p style={{ lineHeight: '1.8', color: '#374151', marginBottom: '2rem' }}>
              If your Zoom background looks blurry, the source is almost certainly below 1080p. The free MeetBackdrops library is great for laptop-sized self-views and 1:1 calls. For 27"+ monitors, recordings, or anything you want to look intentional rather than incidental, start from a 2.5K source. The math is on your side either way.
            </p>

            {/* Final CTA */}
            <div style={{
              background: '#111827', color: '#fff',
              borderRadius: '0.75rem',
              padding: '2rem 1.75rem',
              textAlign: 'center',
              marginBottom: '2rem',
            }}>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 700 }}>
                Sharp on every screen
              </h3>
              <p style={{ margin: '0 0 1.25rem', color: '#cbd5e1', fontSize: '0.95rem' }}>
                MeetBackdrops HD Editions — 2912×1632, designed as virtual sets, engineered for codec compression.
              </p>
              <Link href="/hd" style={{
                display: 'inline-block',
                background: '#facc15', color: '#111827',
                padding: '0.75rem 1.75rem', borderRadius: '8px',
                textDecoration: 'none', fontWeight: 700, fontSize: '1rem',
              }}>
                Browse HD Editions →
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  </article>
);
