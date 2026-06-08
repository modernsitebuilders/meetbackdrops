import Link from 'next/link';

export const logoVirtualBackgroundContent = () => (
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
              Branding Guide · March 2026
            </div>
            <h1 style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 'bold', marginBottom: '1rem', lineHeight: '1.2'
            }}>
              How to Add Your Logo to a Virtual Background (Free)
            </h1>
            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              opacity: '0.95', maxWidth: '700px',
              margin: '0 auto 1.5rem', lineHeight: '1.6'
            }}>
              A step-by-step guide using free tools — plus which background types work best for logo overlays.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', fontSize: '0.9rem', opacity: '0.85' }}>
              <span>7 min read</span>
              <span>·</span>
              <span>March 2026</span>
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
                Download a clean background from MeetBackdrops, open it in Canva or Adobe Express (both free),
                upload your logo PNG, position it in a corner, and export. The whole process takes under five minutes.
              </p>
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem', color: '#111827' }}>
              Why add a logo to your virtual background?
            </h2>
            <p style={{ lineHeight: '1.8', color: '#374151', marginBottom: '1.5rem' }}>
              A branded virtual background does two things at once: it keeps your video call looking professional
              and it puts your company name or logo in frame for every participant. For sales calls, client
              presentations, and team meetings where you're representing a brand, it's a small detail that reads as
              intentional and polished.
            </p>
            <p style={{ lineHeight: '1.8', color: '#374151', marginBottom: '1.5rem' }}>
              It also solves a common problem — your home office background may be fine, but it doesn't say anything
              about who you work for. A background with your logo removes that ambiguity without requiring a physical
              branded backdrop or a green screen.
            </p>

            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem', color: '#111827' }}>
              Which backgrounds work best for logo overlays?
            </h2>
            <p style={{ lineHeight: '1.8', color: '#374151', marginBottom: '1rem' }}>
              The best backgrounds for adding a logo have a relatively plain area — usually a wall or uncluttered
              surface — where the logo can sit without competing visually. Busy patterns, complex textures, or
              heavily detailed shelves make logos hard to read.
            </p>
            <p style={{ lineHeight: '1.8', color: '#374151', marginBottom: '1rem' }}>
              These categories on MeetBackdrops tend to work well:
            </p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', lineHeight: '2.2', color: '#374151' }}>
              <li>
                <strong><Link href="/category/art-galleries" style={{ color: '#1d4ed8' }}>Art Galleries</Link></strong>
                {' '}— clean white or neutral walls with plenty of empty space
              </li>
              <li>
                <strong><Link href="/category/office-spaces" style={{ color: '#1d4ed8' }}>Conference Rooms</Link></strong>
                {' '}— large blank walls behind the table, corporate feel already built in
              </li>
              <li>
                <strong><Link href="/category/office-spaces" style={{ color: '#1d4ed8' }}>Office Spaces</Link></strong>
                {' '}— many have plain painted walls or windows that don't compete with a logo
              </li>
              <li>
                <strong><Link href="/category/home-office" style={{ color: '#1d4ed8' }}>Home Offices</Link></strong>
                {' '}— good for a less formal branded look; works well for coaches and freelancers
              </li>
            </ul>
            <p style={{ lineHeight: '1.8', color: '#374151', marginBottom: '2rem' }}>
              Avoid highly textured backgrounds like bookshelves or kitchens for logo placement — the detail
              makes it hard to find a clean spot and the logo tends to get lost.
            </p>

            {/* Logo prep box */}
            <div style={{
              background: '#fefce8', border: '1px solid #fde047',
              borderRadius: '0.5rem', padding: '1.25rem 1.5rem',
              marginBottom: '2.5rem'
            }}>
              <strong style={{ color: '#854d0e', display: 'block', marginBottom: '0.5rem' }}>Before you start: prepare your logo</strong>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#713f12', lineHeight: '2' }}>
                <li>Use a <strong>PNG with a transparent background</strong> — not JPG. JPG adds a white box around your logo.</li>
                <li>Make sure your logo file is at least <strong>300×300px</strong> so it stays sharp after scaling.</li>
                <li>If you only have a JPG, you can remove the background free at <strong>remove.bg</strong> before starting.</li>
              </ul>
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem', color: '#111827' }}>
              Method 1: Canva (recommended, free)
            </h2>
            <p style={{ lineHeight: '1.8', color: '#374151', marginBottom: '1rem' }}>
              Canva's free plan is more than enough for this. You don't need a Canva Pro account.
            </p>
            <ol style={{ paddingLeft: '1.5rem', marginBottom: '2rem', lineHeight: '2.4', color: '#374151' }}>
              <li>
                <strong>Download your background</strong> from MeetBackdrops — pick one with a clean wall area
                from the categories above.
              </li>
              <li>
                Go to <strong>canva.com</strong> and create a new design. Choose <strong>Custom size</strong> and
                enter <strong>1920 × 1080</strong> pixels.
              </li>
              <li>
                Click <strong>Uploads</strong> in the left panel, then upload your background image.
                Drag it onto the canvas and resize it to fill the frame exactly.
              </li>
              <li>
                Still in Uploads, upload your <strong>logo PNG</strong>. Drag it onto the canvas.
              </li>
              <li>
                Resize the logo to roughly <strong>10–15% of the canvas width</strong> — large enough to read,
                small enough not to dominate.
              </li>
              <li>
                Position it in a <strong>corner away from where your head will appear</strong> — bottom-right
                or top-right both work well.
              </li>
              <li>
                Optional: right-click the logo layer → <strong>Add shadow</strong> → use a soft drop shadow
                at low opacity (20–30%). This helps the logo stay legible if the background behind it is light.
              </li>
              <li>
                Click <strong>Share → Download → PNG</strong>. Keep quality at max.
              </li>
            </ol>

            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem', color: '#111827' }}>
              Method 2: Adobe Express (also free)
            </h2>
            <p style={{ lineHeight: '1.8', color: '#374151', marginBottom: '1rem' }}>
              Adobe Express has a free tier that handles this task well. The interface is slightly simpler than
              Canva for users who prefer it.
            </p>
            <ol style={{ paddingLeft: '1.5rem', marginBottom: '2rem', lineHeight: '2.4', color: '#374151' }}>
              <li>
                Go to <strong>express.adobe.com</strong> and sign in with a free Adobe account.
              </li>
              <li>
                Click <strong>Create something → Custom size</strong> and enter <strong>1920 × 1080</strong>.
              </li>
              <li>
                Use the <strong>Photo</strong> tool to upload your MeetBackdrops background image and set it
                as the full canvas background.
              </li>
              <li>
                Click <strong>Add → Image</strong> and upload your logo PNG.
              </li>
              <li>
                Resize and position the logo in a corner, keeping it away from the centre where you'll appear.
              </li>
              <li>
                Click <strong>Download → PNG</strong>.
              </li>
            </ol>

            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem', color: '#111827' }}>
              Logo placement tips
            </h2>

            {/* Comparison table */}
            <div style={{ overflowX: 'auto', marginBottom: '2.5rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6' }}>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb', color: '#111827' }}>Placement</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb', color: '#111827' }}>Works well?</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb', color: '#111827' }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ background: '#f0fdf4' }}>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#374151', fontWeight: '600' }}>Bottom-right corner</td>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#15803d', fontWeight: '600' }}>Best</td>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#374151' }}>Below and beside your torso — visible without competing with your face</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#374151', fontWeight: '600' }}>Top-right corner</td>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#15803d', fontWeight: '600' }}>Good</td>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#374151' }}>Works if the upper-right background is clean; avoid if you sit off-centre</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#374151', fontWeight: '600' }}>Bottom-left corner</td>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#d97706' }}>Okay</td>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#374151' }}>Can be obscured by your own video tile on some platforms</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#374151', fontWeight: '600' }}>Centre or top-centre</td>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#dc2626' }}>Avoid</td>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#374151' }}>Overlaps with your head; looks like a watermark accident</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem 1rem', color: '#374151', fontWeight: '600' }}>Large/centred behind you</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#dc2626' }}>Avoid</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#374151' }}>Looks like a Zoom filter gone wrong; distracts from the conversation</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem', color: '#111827' }}>
              How to set your branded background in Zoom, Teams, or Google Meet
            </h2>
            <p style={{ lineHeight: '1.8', color: '#374151', marginBottom: '1rem' }}>
              Once you've exported the combined image (background + logo), upload it the same way you'd upload
              any custom virtual background:
            </p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', lineHeight: '2.2', color: '#374151' }}>
              <li><strong>Zoom:</strong> Settings → Background &amp; Effects → Virtual Background → click + to add your image</li>
              <li><strong>Teams:</strong> Before joining → Background effects → Add new → select your file</li>
              <li><strong>Google Meet:</strong> In-call → More options (⋮) → Apply visual effects → Upload a background</li>
            </ul>
            <p style={{ lineHeight: '1.8', color: '#374151', marginBottom: '2rem' }}>
              All three platforms accept PNG files. The combined background you exported from Canva or Adobe
              Express is already the right format — no conversion needed.
            </p>

            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem', color: '#111827' }}>
              Making it work for a team
            </h2>
            <p style={{ lineHeight: '1.8', color: '#374151', marginBottom: '1.5rem' }}>
              If you want consistent branded backgrounds across your whole team, the easiest approach is to
              create the final image once and share the PNG file directly — your team doesn't need to repeat
              the Canva steps. Send it via Slack, email, or a shared drive with a short note on how to upload
              it in Zoom or Teams.
            </p>
            <p style={{ lineHeight: '1.8', color: '#374151', marginBottom: '1.5rem' }}>
              One tip: let people choose from two or three background variants (different room styles, light vs dark)
              while keeping the logo consistent. This prevents the "everyone looks identical" effect while still
              maintaining brand cohesion.
            </p>

            {/* Internal link section */}
            <div style={{
              background: '#f8fafc', border: '1px solid #e5e7eb',
              borderRadius: '0.5rem', padding: '1.25rem 1.5rem',
              marginBottom: '2.5rem'
            }}>
              <strong style={{ color: '#374151', display: 'block', marginBottom: '0.75rem' }}>Best backgrounds for logo overlays on MeetBackdrops</strong>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '2.2' }}>
                <li><Link href="/category/art-galleries" style={{ color: '#1d4ed8', fontWeight: '500' }}>Art Galleries</Link> — clean neutral walls, best overall option</li>
                <li><Link href="/category/office-spaces" style={{ color: '#1d4ed8', fontWeight: '500' }}>Conference Rooms</Link> — built-in corporate credibility</li>
                <li><Link href="/category/office-spaces" style={{ color: '#1d4ed8', fontWeight: '500' }}>Office Spaces</Link> — professional, lots of plain wall variety</li>
                <li><Link href="/category/home-office" style={{ color: '#1d4ed8', fontWeight: '500' }}>Home Offices</Link> — warmer look for coaches, consultants, and freelancers</li>
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
                Find your perfect branded background
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '1.25rem', lineHeight: '1.6' }}>
                Browse 1,300+ free backgrounds — filter by category to find clean-wall options ready for logo overlay.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link
                  href="/category/art-galleries"
                  style={{
                    background: 'white', color: '#0f4c81',
                    padding: '0.75rem 1.5rem', borderRadius: '8px',
                    textDecoration: 'none', fontWeight: '700', fontSize: '1rem'
                  }}
                >
                  Browse Art Galleries →
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
