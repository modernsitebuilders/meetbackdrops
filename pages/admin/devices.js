import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Devices() {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (localStorage.getItem('streambackdrops_admin') !== 'true') {
      window.location.href = '/';
      return;
    }
    fetch('/api/admin/device-stats').then(r => r.json()).then(setData);
  }, []);

  if (!data) return <div style={{padding: '2rem'}}>Loading...</div>;

  return (
    <>
      <Head><title>Device & Browser - Admin</title></Head>
      <div style={{padding: '2rem', maxWidth: '1200px', margin: '0 auto'}}>
        <h1>📱 Device & Browser Analysis</h1>
        
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '2rem'}}>
          <div style={{background: '#f3f4f6', padding: '1.5rem', borderRadius: '8px'}}>
            <div style={{fontSize: '0.875rem', color: '#6b7280'}}>Desktop</div>
            <div style={{fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem'}}>
              {data.devices.desktop.percent}%
            </div>
            <div style={{fontSize: '0.875rem', marginTop: '0.5rem', color: '#6b7280'}}>
              {data.devices.desktop.conversion}% conversion
            </div>
          </div>
          
          <div style={{background: '#f3f4f6', padding: '1.5rem', borderRadius: '8px'}}>
            <div style={{fontSize: '0.875rem', color: '#6b7280'}}>Mobile</div>
            <div style={{fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem'}}>
              {data.devices.mobile.percent}%
            </div>
            <div style={{fontSize: '0.875rem', marginTop: '0.5rem', color: '#6b7280'}}>
              {data.devices.mobile.conversion}% conversion
            </div>
          </div>
        </div>

        <h2 style={{marginTop: '3rem'}}>Browser Performance</h2>
        <div style={{marginTop: '1rem', overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{background: '#f3f4f6', textAlign: 'left'}}>
                <th style={{padding: '1rem'}}>Browser</th>
                <th style={{padding: '1rem'}}>Sessions</th>
                <th style={{padding: '1rem'}}>Downloads</th>
                <th style={{padding: '1rem'}}>Conversion</th>
              </tr>
            </thead>
            <tbody>
              {data.browsers.map(b => (
                <tr key={b.name} style={{borderBottom: '1px solid #e5e7eb'}}>
                  <td style={{padding: '1rem', fontWeight: 'bold'}}>{b.name}</td>
                  <td style={{padding: '1rem'}}>{b.sessions}</td>
                  <td style={{padding: '1rem'}}>{b.downloads}</td>
                  <td style={{padding: '1rem', color: b.conversion > 25 ? '#059669' : '#6b7280'}}>
                    {b.conversion}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 style={{marginTop: '3rem'}}>Operating Systems</h2>
        <div style={{marginTop: '1rem', overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{background: '#f3f4f6', textAlign: 'left'}}>
                <th style={{padding: '1rem'}}>OS</th>
                <th style={{padding: '1rem'}}>Sessions</th>
                <th style={{padding: '1rem'}}>Downloads</th>
                <th style={{padding: '1rem'}}>Conversion</th>
              </tr>
            </thead>
            <tbody>
              {data.os.map(o => (
                <tr key={o.name} style={{borderBottom: '1px solid #e5e7eb'}}>
                  <td style={{padding: '1rem', fontWeight: 'bold'}}>{o.name}</td>
                  <td style={{padding: '1rem'}}>{o.sessions}</td>
                  <td style={{padding: '1rem'}}>{o.downloads}</td>
                  <td style={{padding: '1rem'}}>{o.conversion}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}