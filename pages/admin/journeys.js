import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Journeys() {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (localStorage.getItem('streambackdrops_admin') !== 'true') {
      window.location.href = '/';
      return;
    }
    fetch('/api/admin/journey-stats').then(r => r.json()).then(setData);
  }, []);

  if (!data) return <div style={{padding: '2rem'}}>Loading...</div>;

  return (
    <>
      <Head><title>User Journeys - Admin</title></Head>
      <div style={{padding: '2rem', maxWidth: '1200px', margin: '0 auto'}}>
        <h1>🗺️ User Journey Map</h1>
        
        <div style={{marginTop: '2rem'}}>
          <h2>Top Landing Pages</h2>
          <div style={{marginTop: '1rem', overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{background: '#f3f4f6', textAlign: 'left'}}>
                  <th style={{padding: '1rem'}}>Landing Page</th>
                  <th style={{padding: '1rem'}}>Sessions</th>
                  <th style={{padding: '1rem'}}>Downloads</th>
                  <th style={{padding: '1rem'}}>Conversion</th>
                </tr>
              </thead>
              <tbody>
                {data.landingPages.map(lp => (
                  <tr key={lp.page} style={{borderBottom: '1px solid #e5e7eb'}}>
                    <td style={{padding: '1rem'}}>{lp.page}</td>
                    <td style={{padding: '1rem'}}>{lp.sessions}</td>
                    <td style={{padding: '1rem'}}>{lp.downloads}</td>
                    <td style={{padding: '1rem', color: lp.conversion > 30 ? '#059669' : '#6b7280'}}>
                      {lp.conversion}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{marginTop: '3rem'}}>
          <h2>Common Paths to Download</h2>
          <div style={{marginTop: '1rem'}}>
            {data.commonPaths.map((path, i) => (
              <div key={i} style={{
                padding: '1rem',
                background: '#f3f4f6',
                borderRadius: '8px',
                marginBottom: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>{path.path}</div>
                <div style={{fontWeight: 'bold', color: '#2563eb'}}>{path.count} users</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{marginTop: '3rem', background: '#fef3c7', padding: '1.5rem', borderRadius: '8px'}}>
          <h3 style={{margin: 0}}>Drop-off Analysis</h3>
          <div style={{marginTop: '1rem'}}>
            <div style={{marginBottom: '0.5rem'}}>
              <strong>{data.dropoff.homepageOnly}</strong> sessions viewed only homepage (no category visit)
            </div>
            <div>
              <strong>{data.dropoff.categoryNoDL}</strong> sessions visited categories but didn't download
            </div>
          </div>
        </div>
      </div>
    </>
  );
}