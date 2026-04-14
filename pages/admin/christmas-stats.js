import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function ChristmasStats() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (localStorage.getItem('streambackdrops_admin') !== 'true') {
      window.location.href = '/';
      return;
    }
    setIsAdmin(true);
    loadStats();
  }, []);

  const loadStats = async () => {
    const res = await fetch('/api/admin/christmas-stats');
    const data = await res.json();
    setStats(data);
  };

  if (!isAdmin || !stats) return <div style={{padding: '2rem'}}>Loading...</div>;

  return (
    <>
      <Head><title>Christmas Stats - Admin</title></Head>
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>🎄 Christmas Analytics</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '2rem' }}>
          <div style={{ background: '#f3f4f6', padding: '1.5rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>127</div>
            <div>Total Images</div>
          </div>
          <div style={{ background: '#f3f4f6', padding: '1.5rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.pageViews}</div>
            <div>Page Views</div>
          </div>
          <div style={{ background: '#f3f4f6', padding: '1.5rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.downloads}</div>
            <div>Downloads</div>
          </div>
          <div style={{ background: '#f3f4f6', padding: '1.5rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.conversionRate}%</div>
            <div>Conversion</div>
          </div>
        </div>
        
        <div style={{ marginTop: '2rem', background: '#fef3c7', padding: '1.5rem', borderRadius: '8px' }}>
          <h3>📊 Recommendation</h3>
          <p><strong>Add 50-75 more images</strong> (target: 175-200 total)</p>
          <p>31.3% conversion is excellent. Only Dec 5 - expect 3-5x more traffic by Dec 25.</p>
          <p>Current: 127/700 images (18%). Target: 200/700 (29%)</p>
        </div>

        <h2 style={{ marginTop: '3rem' }}>Top Performing Images</h2>
        <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f3f4f6', textAlign: 'left' }}>
                <th style={{ padding: '1rem' }}>Image</th>
                <th style={{ padding: '1rem' }}>Filename</th>
                <th style={{ padding: '1rem' }}>Downloads</th>
              </tr>
            </thead>
            <tbody>
              {stats.topImages.map(img => (
                <tr key={img.filename} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '1rem' }}>
                    <img 
                      src={`https://assets.streambackdrops.com/webp/christmas-backgrounds/${img.filename}`}
                      alt={img.filename}
                      style={{ height: '60px', width: '80px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                  </td>
                  <td style={{ padding: '1rem' }}>{img.filename}</td>
                  <td style={{ padding: '1rem', fontWeight: 'bold', color: '#059669' }}>{img.downloads}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 style={{ marginTop: '3rem' }}>Zero Downloads</h2>
        <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fee2e2', textAlign: 'left' }}>
                <th style={{ padding: '1rem' }}>Image</th>
                <th style={{ padding: '1rem' }}>Filename</th>
                <th style={{ padding: '1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.zeroDownloads.map(img => (
                <tr key={img.filename} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '1rem' }}>
                    <img 
                      src={`https://assets.streambackdrops.com/webp/christmas-backgrounds/${img.filename}`}
                      alt={img.filename}
                      style={{ height: '60px', width: '80px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                  </td>
                  <td style={{ padding: '1rem' }}>{img.filename}</td>
                  <td style={{ padding: '1rem', color: '#dc2626' }}>⚠️ No downloads</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}