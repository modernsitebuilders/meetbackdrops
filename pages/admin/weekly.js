import { useState, useEffect } from 'react';
import Head from 'next/head';
import { isAdmin } from '../../lib/adminAuth';

export default function Weekly() {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!isAdmin()) {
      window.location.href = '/';
      return;
    }
    fetch('/api/admin/weekly-stats').then(r => r.json()).then(setData);
  }, []);

  if (!data) return <div style={{padding: '2rem'}}>Loading...</div>;

  return (
    <>
      <Head><title>Weekly Overview - Admin</title></Head>
      <div style={{padding: '2rem', maxWidth: '1200px', margin: '0 auto'}}>
        <h1>📅 Weekly Overview</h1>
        
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '2rem'}}>
          <div style={{background: '#f3f4f6', padding: '1.5rem', borderRadius: '8px'}}>
            <div style={{fontSize: '0.875rem', color: '#6b7280'}}>This Week Views</div>
            <div style={{fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem'}}>{data.thisWeek.views}</div>
            <div style={{fontSize: '0.875rem', marginTop: '0.5rem', color: data.growth.views > 0 ? '#059669' : '#dc2626'}}>
              {data.growth.views > 0 ? '↑' : '↓'} {Math.abs(data.growth.views)}% vs last week
            </div>
          </div>
          
          <div style={{background: '#f3f4f6', padding: '1.5rem', borderRadius: '8px'}}>
            <div style={{fontSize: '0.875rem', color: '#6b7280'}}>This Week Downloads</div>
            <div style={{fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem'}}>{data.thisWeek.downloads}</div>
            <div style={{fontSize: '0.875rem', marginTop: '0.5rem', color: data.growth.downloads > 0 ? '#059669' : '#dc2626'}}>
              {data.growth.downloads > 0 ? '↑' : '↓'} {Math.abs(data.growth.downloads)}% vs last week
            </div>
          </div>
          
          <div style={{background: '#f3f4f6', padding: '1.5rem', borderRadius: '8px'}}>
            <div style={{fontSize: '0.875rem', color: '#6b7280'}}>Conversion Rate</div>
            <div style={{fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem'}}>{data.thisWeek.conversion}%</div>
            <div style={{fontSize: '0.875rem', marginTop: '0.5rem', color: data.growth.conversion > 0 ? '#059669' : '#dc2626'}}>
              {data.growth.conversion > 0 ? '↑' : '↓'} {Math.abs(data.growth.conversion)}% vs last week
            </div>
          </div>
          
          <div style={{background: '#f3f4f6', padding: '1.5rem', borderRadius: '8px'}}>
            <div style={{fontSize: '0.875rem', color: '#6b7280'}}>Avg Daily Downloads</div>
            <div style={{fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem'}}>{data.thisWeek.avgDaily}</div>
            <div style={{fontSize: '0.875rem', marginTop: '0.5rem', color: '#6b7280'}}>
              {data.thisWeek.downloads} total / 7 days
            </div>
          </div>
        </div>

        <h2 style={{marginTop: '3rem'}}>Daily Breakdown</h2>
        <div style={{marginTop: '1rem', overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{background: '#f3f4f6', textAlign: 'left'}}>
                <th style={{padding: '1rem'}}>Date</th>
                <th style={{padding: '1rem'}}>Views</th>
                <th style={{padding: '1rem'}}>Downloads</th>
                <th style={{padding: '1rem'}}>Conversion</th>
              </tr>
            </thead>
            <tbody>
              {data.daily.map(d => (
                <tr key={d.date} style={{borderBottom: '1px solid #e5e7eb'}}>
                  <td style={{padding: '1rem'}}>{d.date}</td>
                  <td style={{padding: '1rem'}}>{d.views}</td>
                  <td style={{padding: '1rem'}}>{d.downloads}</td>
                  <td style={{padding: '1rem'}}>{d.conversion}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}