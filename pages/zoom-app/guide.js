import Layout from '../../components/Layout';
import Link from 'next/link';

export default function ZoomAppGuide() {
  return (
    <Layout
      title="MeetBackdrops for Zoom — Setup Guide"
      description="How to add, use, and remove the MeetBackdrops Zoom App. Browse 1,000+ studio-designed virtual backgrounds inside Zoom and apply in one click."
    >
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.breadcrumb}>
            <Link href="/" style={styles.breadcrumbLink}>MeetBackdrops</Link>
            <span style={styles.sep}> / </span>
            <span>Zoom App Guide</span>
          </div>

          <h1 style={styles.h1}>MeetBackdrops for Zoom</h1>
          <p style={styles.lead}>
            Browse over 1,000 studio-designed virtual backgrounds and apply them to your Zoom call in one click — without leaving the app.
          </p>

          <hr style={styles.rule} />

          <section style={styles.section}>
            <h2 style={styles.h2}>Adding the App</h2>
            <ol style={styles.ol}>
              <li>Open Zoom on your desktop (Windows or Mac).</li>
              <li>Click the <strong>Apps</strong> tab in the left sidebar, then search for <strong>MeetBackdrops</strong>.</li>
              <li>Click <strong>Add</strong> on the MeetBackdrops listing.</li>
              <li>Review the permissions and click <strong>Allow</strong> to authorize the app.</li>
              <li>MeetBackdrops will open automatically in the Zoom sidebar.</li>
            </ol>
            <p style={styles.note}>
              <strong>Note:</strong> You must be signed in to a Zoom account and using the Zoom desktop client (version 5.10 or later). The app is not available on mobile or the web client.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.h2}>Using the App</h2>
            <ol style={styles.ol}>
              <li>Open MeetBackdrops from the <strong>Apps</strong> tab in Zoom, or launch it during a meeting from the toolbar.</li>
              <li>Use the category pills at the top to filter by type — Office Spaces, Bookshelves, Nature, and 18 more.</li>
              <li>Click any background thumbnail to apply it to your video instantly.</li>
              <li>A green checkmark confirms the background is active.</li>
              <li>Click a different background at any time to switch.</li>
              <li>To remove your virtual background, go to Zoom <strong>Settings → Background &amp; Effects</strong> and select <strong>None</strong>.</li>
            </ol>
            <p style={styles.note}>
              <strong>HD Editions:</strong> Cards marked <em>HD Edition →</em> have a 2912×1632 high-resolution version available at{' '}
              <Link href="/hd" style={styles.link}>meetbackdrops.com/hd</Link> for maximum sharpness on high-resolution displays.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.h2}>Removing the App</h2>
            <ol style={styles.ol}>
              <li>In Zoom, click the <strong>Apps</strong> tab in the left sidebar.</li>
              <li>Find MeetBackdrops under <strong>My Apps</strong>.</li>
              <li>Click the <strong>···</strong> menu next to the app and select <strong>Remove</strong>.</li>
              <li>Confirm removal. No data is stored on MeetBackdrops servers — your Zoom account is unaffected.</li>
            </ol>
          </section>

          <section style={styles.section}>
            <h2 style={styles.h2}>Privacy &amp; Data</h2>
            <p style={styles.p}>
              MeetBackdrops does not store any personal information. The app uses a short-lived session to authenticate with Zoom and reads only the permissions required to set your virtual background. No meeting data, video, or audio is accessed. See our full{' '}
              <Link href="/privacy" style={styles.link}>Privacy Policy</Link>.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.h2}>Troubleshooting</h2>
            <dl style={styles.dl}>
              <dt style={styles.dt}>Background doesn't apply</dt>
              <dd style={styles.dd}>Make sure your Zoom client is version 5.10 or later. Virtual backgrounds also require a compatible GPU or green screen — check Zoom's system requirements.</dd>

              <dt style={styles.dt}>App shows "Preview mode" instead of "Connected"</dt>
              <dd style={styles.dd}>You're viewing the app outside of Zoom (e.g. in a browser). Open it from inside the Zoom desktop client to apply backgrounds.</dd>

              <dt style={styles.dt}>Can't find the app after adding it</dt>
              <dd style={styles.dd}>Click the <strong>Apps</strong> tab in the Zoom sidebar and look under <strong>My Apps</strong>. You can also access it during a meeting from the <strong>Apps</strong> button in the meeting toolbar.</dd>
            </dl>
          </section>

          <section style={styles.section}>
            <h2 style={styles.h2}>Support</h2>
            <p style={styles.p}>
              Questions or issues? Reach us at{' '}
              <Link href="/contact" style={styles.link}>meetbackdrops.com/contact</Link>.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}

const styles = {
  page: { background: '#F5F5F5', minHeight: '100vh', padding: '40px 20px' },
  container: { maxWidth: 760, margin: '0 auto', background: '#fff', borderRadius: 12, padding: '40px 48px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' },
  breadcrumb: { fontSize: 13, color: '#6b7280', marginBottom: 24 },
  breadcrumbLink: { color: '#6b7280', textDecoration: 'none' },
  sep: { margin: '0 6px' },
  h1: { fontSize: 28, fontWeight: 800, color: '#111827', marginBottom: 12, letterSpacing: -0.5 },
  lead: { fontSize: 16, color: '#374151', lineHeight: 1.6, marginBottom: 0 },
  rule: { border: 'none', borderTop: '1px solid #e5e7eb', margin: '32px 0' },
  section: { marginBottom: 40 },
  h2: { fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 14 },
  ol: { paddingLeft: 20, color: '#374151', lineHeight: 1.9, fontSize: 15 },
  p: { fontSize: 15, color: '#374151', lineHeight: 1.7 },
  note: { fontSize: 13, color: '#6b7280', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 16px', marginTop: 16, lineHeight: 1.6 },
  dl: { margin: 0 },
  dt: { fontWeight: 700, color: '#111827', fontSize: 15, marginTop: 16 },
  dd: { marginLeft: 0, color: '#374151', fontSize: 14, lineHeight: 1.7, marginTop: 4 },
  link: { color: '#9a6a3a', textDecoration: 'underline' },
};
