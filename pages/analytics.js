import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/popular-downloads')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', fontFamily: 'system-ui' }}>
        <h1>Loading analytics...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', fontFamily: 'system-ui' }}>
        <h1>Error loading data</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Download Analytics - StreamBackdrops</title>
      </Head>
      
      <div style={{ 
        padding: '40px', 
        fontFamily: 'system-ui',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h1 style={{ marginBottom: '10px' }}>Download Analytics</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          Showing unique downloads (one download per user per file)
        </p>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <div style={{
            padding: '20px',
            background: '#f5f5f5',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827' }}>
              {data.totalDownloads.toLocaleString()}
            </div>
            <div style={{ color: '#666', marginTop: '5px' }}>Unique Downloads</div>
          </div>
          
          <div style={{
            padding: '20px',
            background: '#f5f5f5',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#059669' }}>
              {data.uniqueFiles.toLocaleString()}
            </div>
            <div style={{ color: '#666', marginTop: '5px' }}>Unique Files</div>
          </div>

          <div style={{
            padding: '20px',
            background: '#f5f5f5',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#dc2626' }}>
              {data.seasonalDownloads.toLocaleString()}
            </div>
            <div style={{ color: '#666', marginTop: '5px' }}>Seasonal Downloads</div>
          </div>
        </div>

        <h2 style={{ marginBottom: '20px' }}>Top 50 Downloaded Backgrounds</h2>
        
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          background: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Rank</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Filename</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Category</th>
              <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Downloads</th>
            </tr>
          </thead>
          <tbody>
            {data.topDownloads.map((item, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px' }}>#{index + 1}</td>
                <td style={{ 
                  padding: '12px',
                  fontSize: '14px',
                  wordBreak: 'break-word',
                  maxWidth: '500px'
                }}>
                  {item.filename}
                </td>
                <td style={{ padding: '12px', color: '#666' }}>{item.category}</td>
                <td style={{ 
                  padding: '12px', 
                  textAlign: 'right',
                  fontWeight: '600',
                  color: '#111827'
                }}>
                  {item.count.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: '40px', padding: '20px', background: '#f9fafb', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '10px' }}>Export Data</h3>
          <button
            onClick={() => {
              const dataStr = JSON.stringify(data.allDownloads, null, 2);
              const dataBlob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(dataBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'download-analytics.json';
              link.click();
            }}
            style={{
              padding: '10px 20px',
              background: '#111827',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Download Full Report (JSON)
          </button>
        </div>
      </div>
    </>
  );
}