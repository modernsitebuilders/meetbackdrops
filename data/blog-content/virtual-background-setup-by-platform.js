import Link from 'next/link';

export const virtualBackgroundSetupByPlatformContent = () => (
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
              Platform Guide · March 2026
            </div>
            <h1 style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 'bold', marginBottom: '1rem', lineHeight: '1.2'
            }}>
              How to Set Up a Virtual Background — Step-by-Step for Every Platform
            </h1>
            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              opacity: '0.95', maxWidth: '700px',
              margin: '0 auto 1.5rem', lineHeight: '1.6'
            }}>
              Exact steps for Zoom, Microsoft Teams, Google Meet, Webex, and more — plus why most setup guides miss the thing that actually makes your background look good.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', fontSize: '0.9rem', opacity: '0.85' }}>
              <span>9 min read</span>
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
                Download your background image, then: <strong>Zoom</strong> → Settings → Background &amp; Effects → + button.
                {' '}<strong>Teams</strong> → Before joining a call → Background effects → Add new.
                {' '}<strong>Google Meet</strong> → In-call → More options → Apply visual effects → Upload.
                Each platform accepts PNG or JPG. The background image itself matters more than the platform settings.
              </p>
            </div>

            <p style={{ lineHeight: '1.8', color: '#374151', marginBottom: '2rem' }}>
              Every platform buries the virtual background setting somewhere slightly different, which is why
              "how to set up a virtual background" is one of the most-searched video call questions — even
              among people who use these apps every day. Below are exact step-by-step instructions for each
              major platform, followed by the one factor that most guides skip entirely.
            </p>

            {/* Platform nav */}
            <div style={{
              background: '#f8fafc', border: '1px solid #e5e7eb',
              borderRadius: '0.5rem', padding: '1.25rem 1.5rem',
              marginBottom: '2.5rem'
            }}>
              <strong style={{ color: '#374151', display: 'block', marginBottom: '0.75rem', fontSize: '0.95rem' }}>Jump to your platform</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {[
                  ['#zoom', 'Zoom'],
                  ['#teams', 'Microsoft Teams'],
                  ['#google-meet', 'Google Meet'],
                  ['#webex', 'Cisco Webex'],
                  ['#background-tips', 'Background tips']
                ].map(([href, label]) => (
                  <a key={href} href={href} style={{
                    background: 'white', border: '1px solid #d1d5db',
                    borderRadius: '0.375rem', padding: '0.375rem 0.875rem',
                    color: '#1d4ed8', textDecoration: 'none',
                    fontSize: '0.9rem', fontWeight: '500'
                  }}>
                    {label}
                  </a>
                ))}
              </div>
            </div>

            {/* ── ZOOM ── */}
            <h2 id="zoom" style={{ fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.5rem', color: '#111827', paddingTop: '1rem' }}>
              Zoom
            </h2>
            <p style={{ lineHeight: '1.8', color: '#374151', marginBottom: '1rem' }}>
              Zoom has the most mature virtual background feature and the most placement options.
              These steps work for Zoom desktop (Windows and Mac). Mobile steps are at the end of this section.
            </p>

            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1f2937' }}>
              Before a call (recommended)
            </h3>
            <ol style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', lineHeight: '2.4', color: '#374151' }}>
              <li>Open Zoom and click the <strong>gear icon</strong> (Settings) in the top-right corner.</li>
              <li>In the left panel, select <strong>Background &amp; Effects</strong>.</li>
              <li>Click the <strong>Virtual Background</strong> tab if it isn't already selected.</li>
              <li>Click the <strong>+</strong> button (Add image or video) and select your downloaded background file.</li>
              <li>Click your newly added background to apply it — it will be used for your next call automatically.</li>
            </ol>

            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1f2937' }}>
              During a call
            </h3>
            <ol style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', lineHeight: '2.4', color: '#374151' }}>
              <li>Click the <strong>^</strong> arrow next to your video button in the toolbar.</li>
              <li>Select <strong>Choose Virtual Background</strong>.</li>
              <li>Click <strong>+</strong> to add a new image, or click an existing one to apply it immediately.</li>
            </ol>

            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1f2937' }}>
              On Zoom mobile (iOS/Android)
            </h3>
            <ol style={{ paddingLeft: '1.5rem', marginBottom: '2rem', lineHeight: '2.4', color: '#374151' }}>
              <li>While in a call, tap <strong>More</strong> (three dots) in the toolbar.</li>
              <li>Tap <strong>Virtual Background</strong>.</li>
              <li>Tap <strong>+</strong> to upload an image from your camera roll or files.</li>
            </ol>

            {/* Zoom note box */}
            <div style={{
              background: '#fefce8', border: '1px solid #fde047',
              borderRadius: '0.5rem', padding: '1.25rem 1.5rem',
              marginBottom: '2.5rem'
            }}>
              <strong style={{ color: '#854d0e', display: 'block', marginBottom: '0.4rem' }}>Zoom: if the option is greyed out</strong>
              <p style={{ margin: 0, color: '#713f12', lineHeight: '1.6' }}>
                Your account administrator may have disabled virtual backgrounds. On a personal or free account,
                go to <strong>zoom.us/profile/setting</strong> → scroll to <em>Virtual background</em> → toggle it on.
                On a managed work account, you'll need to ask your IT admin.
              </p>
            </div>

            {/* ── TEAMS ── */}
            <h2 id="teams" style={{ fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.5rem', color: '#111827', paddingTop: '1rem' }}>
              Microsoft Teams
            </h2>
            <p style={{ lineHeight: '1.8', color: '#374151', marginBottom: '1rem' }}>
              Teams calls these "background effects" rather than virtual backgrounds. The upload path
              changed slightly in the New Teams (2024) client — both versions are covered below.
            </p>

            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1f2937' }}>
              Before joining a call (join screen)
            </h3>
            <ol style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', lineHeight: '2.4', color: '#374151' }}>
              <li>On the pre-join screen, look for <strong>Background effects</strong> (below your video preview).</li>
              <li>The panel opens on the right side. Scroll down to find <strong>Add new</strong>.</li>
              <li>Click <strong>Add new</strong>, select your image file, and it will appear in the panel.</li>
              <li>Click your uploaded image to apply it, then click <strong>Join now</strong>.</li>
            </ol>

            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1f2937' }}>
              During a call
            </h3>
            <ol style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', lineHeight: '2.4', color: '#374151' }}>
              <li>Click the <strong>three-dot menu</strong> (More) in the call toolbar.</li>
              <li>Select <strong>Video effects and avatars</strong> (or <strong>Background effects</strong> in older Teams).</li>
              <li>Click <strong>Add new</strong> and upload your image.</li>
              <li>Click your background to apply it — the change takes effect immediately.</li>
            </ol>

            {/* Teams note box */}
            <div style={{
              background: '#fefce8', border: '1px solid #fde047',
              borderRadius: '0.5rem', padding: '1.25rem 1.5rem',
              marginBottom: '2.5rem'
            }}>
              <strong style={{ color: '#854d0e', display: 'block', marginBottom: '0.4rem' }}>Teams: image requirements</strong>
              <p style={{ margin: 0, color: '#713f12', lineHeight: '1.6' }}>
                Teams accepts <strong>JPG and PNG</strong> files. Maximum file size is <strong>5 MB</strong>.
                Recommended resolution is at least 1920×1080. Files outside this range may be
                rejected or displayed with reduced quality.
              </p>
            </div>

            {/* ── GOOGLE MEET ── */}
            <h2 id="google-meet" style={{ fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.5rem', color: '#111827', paddingTop: '1rem' }}>
              Google Meet
            </h2>
            <p style={{ lineHeight: '1.8', color: '#374151', marginBottom: '1rem' }}>
              Google Meet added persistent custom backgrounds in 2023 — you no longer need to re-upload
              each call. Custom backgrounds are available on personal Google accounts and Google Workspace accounts.
            </p>

            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1f2937' }}>
              Before joining a call
            </h3>
            <ol style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', lineHeight: '2.4', color: '#374151' }}>
              <li>On the pre-join screen, click <strong>Apply visual effects</strong> (below your video preview).</li>
              <li>Scroll to the bottom of the backgrounds panel and click <strong>Upload a background</strong> (the + icon).</li>
              <li>Select your image file. It will appear in your backgrounds panel.</li>
              <li>Click your uploaded background to apply it before joining.</li>
            </ol>

            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1f2937' }}>
              During a call
            </h3>
            <ol style={{ paddingLeft: '1.5rem', marginBottom: '2rem', lineHeight: '2.4', color: '#374151' }}>
              <li>Click <strong>More options</strong> (⋮) in the call toolbar.</li>
              <li>Select <strong>Apply visual effects</strong>.</li>
              <li>Scroll to the bottom of the panel and click the <strong>+ upload</strong> icon to add a new image.</li>
              <li>Click your background to apply it — it changes immediately without interrupting the call.</li>
            </ol>

            {/* ── WEBEX ── */}
            <h2 id="webex" style={{ fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.5rem', color: '#111827', paddingTop: '1rem' }}>
              Cisco Webex
            </h2>
            <p style={{ lineHeight: '1.8', color: '#374151', marginBottom: '1rem' }}>
              Webex supports custom virtual backgrounds on the desktop app (Windows and Mac). The setting
              is found in your profile preferences rather than during call setup.
            </p>
            <ol style={{ paddingLeft: '1.5rem', marginBottom: '2rem', lineHeight: '2.4', color: '#374151' }}>
              <li>Open Webex and click your <strong>profile picture</strong> (top-right), then <strong>Settings</strong>.</li>
              <li>Click <strong>Video</strong> in the left panel.</li>
              <li>Under <em>Virtual background</em>, click <strong>+</strong> or <strong>Add</strong> and select your image.</li>
              <li>Your uploaded background is now available at the start of each call via the background selector.</li>
            </ol>

            {/* Comparison table */}
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem', color: '#111827', paddingTop: '0.5rem' }}>
              Platform comparison at a glance
            </h2>
            <div style={{ overflowX: 'auto', marginBottom: '2.5rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6' }}>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb', color: '#111827' }}>Platform</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb', color: '#111827' }}>Formats accepted</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb', color: '#111827' }}>Max file size</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb', color: '#111827' }}>Backgrounds saved?</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#374151', fontWeight: '600' }}>Zoom</td>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#374151' }}>JPG, PNG, GIF, MP4</td>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#374151' }}>5 MB (image), 15 MB (video)</td>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#15803d', fontWeight: '600' }}>Yes, persist between calls</td>
                  </tr>
                  <tr style={{ background: '#f9fafb' }}>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#374151', fontWeight: '600' }}>Microsoft Teams</td>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#374151' }}>JPG, PNG</td>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#374151' }}>5 MB</td>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#15803d', fontWeight: '600' }}>Yes, persist between calls</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#374151', fontWeight: '600' }}>Google Meet</td>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#374151' }}>JPG, PNG</td>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#374151' }}>~5 MB</td>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#15803d', fontWeight: '600' }}>Yes (since 2023)</td>
                  </tr>
                  <tr style={{ background: '#f9fafb' }}>
                    <td style={{ padding: '0.75rem 1rem', color: '#374151', fontWeight: '600' }}>Cisco Webex</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#374151' }}>JPG, PNG</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#374151' }}>~5 MB</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#15803d', fontWeight: '600' }}>Yes, set in preferences</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ── BACKGROUND TIPS ── */}
            <h2 id="background-tips" style={{ fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.75rem', color: '#111827', paddingTop: '0.5rem' }}>
              Why the background image matters more than the settings
            </h2>
            <p style={{ lineHeight: '1.8', color: '#374151', marginBottom: '1.5rem' }}>
              The most common complaint after setting up a virtual background is that it looks fake, pixelated,
              or that parts of the person keep disappearing. The setup steps are rarely the cause — the issue
              is almost always the background image itself.
            </p>
            <p style={{ lineHeight: '1.8', color: '#374151', marginBottom: '1rem' }}>
              Here's what makes a virtual background work well technically:
            </p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', lineHeight: '2.2', color: '#374151' }}>
              <li>
                <strong>Correct aspect ratio.</strong> All four platforms expect a <strong>16:9 image</strong>.
                Use a 1920×1080 or higher image — never a portrait-orientation photo or a square image.
                Wrong ratios cause the background to stretch, crop, or tile.
              </li>
              <li>
                <strong>Depth cues.</strong> Images that look like a real physical space (depth of field, ambient
                lighting, perspective) look far more convincing than flat illustrations, gradient patterns, or
                stock photo composites. Your camera's AI blurs the edges of your silhouette, and a flat
                background makes that blurring immediately obvious.
              </li>
              <li>
                <strong>Neutral, non-distracting content.</strong> Busy backgrounds — lots of movement, text,
                bright colours, complex patterns — fight for attention. The best backgrounds read as a coherent
                space and then fade into the background of people's awareness.
              </li>
              <li>
                <strong>Resolution.</strong> Platforms compress your video stream before sending it.
                A higher-resolution source image (2912×1632 or higher) retains more visible detail after
                compression compared to a standard 1080p image.
              </li>
            </ul>
            <p style={{ lineHeight: '1.8', color: '#374151', marginBottom: '2rem' }}>
              Stock photo sites were built for print and marketing, not video calls. Their images are often
              square or portrait format, overly bright, or compositionally wrong for appearing behind a person.
              Backgrounds designed specifically for video calls — composed at 16:9 with appropriate depth and
              lighting — consistently look better without any other changes to your setup.
            </p>

            {/* Internal link section */}
            <div style={{
              background: '#f8fafc', border: '1px solid #e5e7eb',
              borderRadius: '0.5rem', padding: '1.25rem 1.5rem',
              marginBottom: '2.5rem'
            }}>
              <strong style={{ color: '#374151', display: 'block', marginBottom: '0.75rem' }}>Best background categories for each platform</strong>
              <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.75rem', lineHeight: '1.6' }}>
                These work well across Zoom, Teams, and Google Meet — correct 16:9 format, real spaces with depth:
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '2.2' }}>
                <li><Link href="/category/office-spaces" style={{ color: '#1d4ed8', fontWeight: '500' }}>Office Spaces</Link> — professional look for corporate calls</li>
                <li><Link href="/category/bookshelves-bright" style={{ color: '#1d4ed8', fontWeight: '500' }}>Bright Bookshelves</Link> — warm, credible, works in any meeting context</li>
                <li><Link href="/category/office-spaces" style={{ color: '#1d4ed8', fontWeight: '500' }}>Conference Rooms</Link> — built-in authority without looking staged</li>
                <li><Link href="/category/home-office" style={{ color: '#1d4ed8', fontWeight: '500' }}>Home Offices</Link> — relaxed professional for remote-first teams</li>
                <li><Link href="/category/art-galleries" style={{ color: '#1d4ed8', fontWeight: '500' }}>Art Galleries</Link> — clean walls, good for branded backgrounds</li>
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
                  <Link href="/blog/zoom-teams-google" style={{ color: '#1d4ed8', fontWeight: '500' }}>
                    Zoom vs Teams vs Google Meet — Full Virtual Background Comparison
                  </Link>
                  {' '}— which platform renders backgrounds most accurately
                </li>
                <li>
                  <Link href="/blog/hd-virtual-backgrounds" style={{ color: '#1d4ed8', fontWeight: '500' }}>
                    Why HD Virtual Backgrounds Look Better on Compressed Streams
                  </Link>
                  {' '}— the resolution detail that makes a difference after compression
                </li>
                <li>
                  <Link href="/blog/background-mistakes" style={{ color: '#1d4ed8', fontWeight: '500' }}>
                    15 Virtual Background Mistakes That Ruin Your Professional Image
                  </Link>
                  {' '}— what to avoid once you've got the background set up
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
                real spaces with depth, ready to upload to any platform.
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
