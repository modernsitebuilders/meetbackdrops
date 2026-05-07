import { useState, useEffect } from 'react';
import Head from 'next/head';
import { isAdmin } from '../../lib/adminAuth';

export default function Timing() {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!isAdmin()) {
      window.location.href = '/';
      return;
    }
    fetch('/api/admin/timing-stats').then(r => r.json()).then(setData);
  }, []);

  if (!data) return <div style={{padding: '2rem'}}>Loading...</div>;

  return (
    <>
      <Head><title>Time Optimizer - Admin</title></Head>
      <div style={{padding: '2rem', maxWidth: '1200px', margin: '0 auto'}}>
        <h1>⏰ Time Optimizer</h1>
        
        <div style={{marginTop: '2rem', background: '#d1fae5', padding: '1.5rem', borderRadius: '8px'}}>
          <h3 style={{margin: 0, color: '#065f46'}}>🎯 Best Time to Post</h3>
          <div style={{marginTop: '1rem', fontSize: '1.5rem', fontWeight: 'bold', color: '#065f46'}}>
            {data.bestHour.hour}:00 EST - {data.bestHour.conversion}% conversion
          </div>
          <div style={{marginTop: '0.5rem', color: '#065f46'}}>
            Best day: {data.bestDay.day} ({data.bestDay.conversion}% conversion)
          </div>
        </div>

        <h2 style={{marginTop: '3rem'}}>Hourly Performance (EST)</h2>
        <div style={{marginTop: '1rem', overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{background: '#f3f4f6', textAlign: 'left'}}>
                <th style={{padding: '1rem'}}>Hour</th>
                <th style={{padding: '1rem'}}>Views</th>
                <th style={{padding: '1rem'}}>Downloads</th>
                <th style={{padding: '1rem'}}>Conversion</th>
              </tr>
            </thead>
            <tbody>
              {data.hours.map(h => (
                <tr key={h.hour} style={{
                  borderBottom: '1px solid #e5e7eb',
                  background: h.conversion > 30 ? '#fef3c7' : 'transparent'
                }}>
                  <td style={{padding: '1rem', fontWeight: 'bold'}}>{h.hour}:00</td>
                  <td style={{padding: '1rem'}}>{h.views}</td>
                  <td style={{padding: '1rem'}}>{h.downloads}</td>
                  <td style={{padding: '1rem', color: h.conversion > 30 ? '#92400e' : '#6b7280'}}>
                    {h.conversion}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 style={{marginTop: '3rem'}}>Daily Performance</h2>
        <div style={{marginTop: '1rem', overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{background: '#f3f4f6', textAlign: 'left'}}>
                <th style={{padding: '1rem'}}>Day</th>
                <th style={{padding: '1rem'}}>Views</th>
                <th style={{padding: '1rem'}}>Downloads</th>
                <th style={{padding: '1rem'}}>Conversion</th>
              </tr>
            </thead>
            <tbody>
              {data.days.map(d => (
                <tr key={d.day} style={{
                  borderBottom: '1px solid #e5e7eb',
                  background: d.conversion > 27 ? '#d1fae5' : 'transparent'
                }}>
                  <td style={{padding: '1rem', fontWeight: 'bold'}}>{d.day}</td>
                  <td style={{padding: '1rem'}}>{d.views}</td>
                  <td style={{padding: '1rem'}}>{d.downloads}</td>
                  <td style={{padding: '1rem', color: d.conversion > 27 ? '#065f46' : '#6b7280'}}>
                    {d.conversion}%
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