import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Sessions() {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (localStorage.getItem('streambackdrops_admin') !== 'true') {
      window.location.href = '/';
      return;
    }
    fetch('/api/admin/session-stats').then(r => r.json()).then(setData);
  }, []);

  if (!data) return <div style={{padding: '2rem'}}>Loading...</div>;

  return (
    <>
      <Head><title>Session Insights - Admin</title></Head>
      <div style={{padding: '2rem', maxWidth: '1200px', margin: '0 auto'}}>
        <h1>🎯 Session Insights</h1>
        
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '2rem'}}>
          <div style={{background: '#f3f4f6', padding: '1.5rem', borderRadius: '8px'}}>
            <div style={{fontSize: '0.875rem', color: '#6b7280'}}>Total Sessions</div>
            <div style={{fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem'}}>{data.totalSessions}</div>
          </div>
          
          <div style={{background: '#d1fae5', padding: '1.5rem', borderRadius: '8px'}}>
            <div style={{fontSize: '0.875rem', color: '#065f46'}}>Sessions w/ Download</div>
            <div style={{fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem', color: '#065f46'}}>
              {data.sessionsWithDownload}
            </div>
            <div style={{fontSize: '0.875rem', marginTop: '0.5rem', color: '#065f46'}}>
              {data.conversionRate}% conversion
            </div>
          </div>
          
          <div style={{background: '#f3f4f6', padding: '1.5rem', borderRadius: '8px'}}>
            <div style={{fontSize: '0.875rem', color: '#6b7280'}}>Avg Pages/Session</div>
            <div style={{fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem'}}>{data.avgPagesPerSession}</div>
          </div>
          
          <div style={{background: '#fef3c7', padding: '1.5rem', borderRadius: '8px'}}>
            <div style={{fontSize: '0.875rem', color: '#92400e'}}>Pages Before Download</div>
            <div style={{fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem', color: '#92400e'}}>
              {data.avgPagesBeforeDownload}
            </div>
          </div>
        </div>

        <div style={{marginTop: '2rem', background: '#e0e7ff', padding: '1.5rem', borderRadius: '8px'}}>
          <h3 style={{margin: 0}}>Multi-Download Behavior</h3>
          <div style={{marginTop: '1rem', fontSize: '1.25rem'}}>
            <strong>{data.multiDownloadSessions}</strong> sessions ({data.multiDownloadPercent}% of downloaders) 
            grabbed multiple images
          </div>
          <p style={{marginTop: '0.5rem', color: '#4338ca'}}>
            💡 Over half your downloaders want more than one image - optimize for batch downloads
          </p>
        </div>

        <div style={{marginTop: '2rem', background: '#fee2e2', padding: '1.5rem', borderRadius: '8px'}}>
          <h3 style={{margin: 0}}>Optimization Opportunity</h3>
          <p style={{marginTop: '0.5rem', color: '#991b1b'}}>
            Users browse {data.avgPagesBeforeDownload} pages before downloading. 
            Reducing this to ~4 pages could increase conversion from {data.conversionRate}% to 35%+
          </p>
        </div>
      </div>
    </>
  );
}