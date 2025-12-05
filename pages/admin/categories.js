import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Categories() {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (localStorage.getItem('streambackdrops_admin') !== 'true') {
      window.location.href = '/';
      return;
    }
    fetch('/api/admin/category-stats').then(r => r.json()).then(setData);
  }, []);

  if (!data) return <div style={{padding: '2rem'}}>Loading...</div>;

  return (
    <>
      <Head><title>Categories - Admin</title></Head>
      <div style={{padding: '2rem', maxWidth: '1200px', margin: '0 auto'}}>
        <h1>📊 Category Performance</h1>
        
        <div style={{marginTop: '2rem', overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{background: '#f3f4f6', textAlign: 'left'}}>
                <th style={{padding: '1rem'}}>Category</th>
                <th style={{padding: '1rem'}}>Views</th>
                <th style={{padding: '1rem'}}>Downloads</th>
                <th style={{padding: '1rem'}}>Conversion</th>
                <th style={{padding: '1rem'}}>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.categories.map(c => (
                <tr key={c.name} style={{borderBottom: '1px solid #e5e7eb'}}>
                  <td style={{padding: '1rem', fontWeight: 'bold'}}>{c.name}</td>
                  <td style={{padding: '1rem'}}>{c.views}</td>
                  <td style={{padding: '1rem'}}>{c.downloads}</td>
                  <td style={{padding: '1rem', color: c.conversion > 25 ? '#059669' : c.conversion < 10 ? '#dc2626' : '#6b7280'}}>
                    {c.conversion}%
                  </td>
                  <td style={{padding: '1rem'}}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.875rem',
                      background: c.conversion > 25 ? '#d1fae5' : c.conversion < 10 ? '#fee2e2' : '#fef3c7',
                      color: c.conversion > 25 ? '#065f46' : c.conversion < 10 ? '#991b1b' : '#92400e'
                    }}>
                      {c.conversion > 25 ? '🔥 Hot' : c.conversion < 10 ? '⚠️ Low' : '📊 OK'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}