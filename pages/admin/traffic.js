import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Traffic() {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (localStorage.getItem('streambackdrops_admin') !== 'true') {
      window.location.href = '/';
      return;
    }
    fetch('/api/admin/traffic-stats').then(r => r.json()).then(setData);
  }, []);

  if (!data) return <div style={{padding: '2rem'}}>Loading...</div>;

  return (
    <>
      <Head><title>Traffic Sources - Admin</title></Head>
      <div style={{padding: '2rem', maxWidth: '1200px', margin: '0 auto'}}>
        <h1>🌐 Traffic Sources</h1>
        
        <div style={{marginTop: '2rem', overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{background: '#f3f4f6', textAlign: 'left'}}>
                <th style={{padding: '1rem'}}>Source</th>
                <th style={{padding: '1rem'}}>Views</th>
                <th style={{padding: '1rem'}}>Downloads</th>
                <th style={{padding: '1rem'}}>Conversion</th>
                <th style={{padding: '1rem'}}>Sessions</th>
              </tr>
            </thead>
            <tbody>
              {data.sources.map(s => (
                <tr key={s.source} style={{borderBottom: '1px solid #e5e7eb'}}>
                  <td style={{padding: '1rem', fontWeight: 'bold'}}>{s.source}</td>
                  <td style={{padding: '1rem'}}>{s.views}</td>
                  <td style={{padding: '1rem'}}>{s.downloads}</td>
                  <td style={{padding: '1rem', color: s.conversion > 30 ? '#059669' : '#6b7280'}}>
                    {s.conversion}%
                  </td>
                  <td style={{padding: '1rem'}}>{s.sessions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}