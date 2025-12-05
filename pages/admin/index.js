import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function AdminHub() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('streambackdrops_admin') !== 'true') {
      window.location.href = '/';
      return;
    }
    setIsAdmin(true);
  }, []);

  if (!isAdmin) return null;

  const adminLinks = [
    { href: '/admin/scores', title: '📊 Image Scores', desc: 'Performance rankings, removal candidates' },
    { href: '/admin/christmas-stats', title: '🎄 Christmas Stats', desc: 'Holiday category analytics' },
    { href: '/admin/traffic', title: '🌐 Traffic Sources', desc: 'Which sources drive best conversions' },
    { href: '/admin/categories', title: '📊 Category Performance', desc: 'Top/bottom performing categories' },
    { href: '/admin/weekly', title: '📅 Weekly Overview', desc: 'Last 7 days trends & growth' },
    { href: '/admin/sessions', title: '🎯 Session Insights', desc: 'User behavior & conversion patterns' },
    { href: '/admin/timing', title: '⏰ Time Optimizer', desc: 'Best hours/days to post content' },
    { href: '/admin/journeys', title: '🗺️ User Journeys', desc: 'Common paths & drop-off points' },
    { href: '/admin/devices', title: '📱 Device & Browser', desc: 'Mobile vs desktop performance' },
    { href: '/analytics', title: '📈 Full Analytics', desc: 'Complete site analytics dashboard' }
  ];

  const adminActions = [
    { action: () => window.open('/api/consolidate-analytics', '_blank'), title: '🔄 Consolidate Analytics', desc: 'Compress old analytics data' },
    { action: () => window.open('/api/cache-popular', '_blank'), title: '⚡ Cache Popular Images', desc: 'Refresh popular images cache' }
  ];

  return (
    <>
      <Head><title>Admin Hub - StreamBackdrops</title></Head>
      <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <h1>🔧 Admin Hub</h1>
        
        <h2 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Dashboards</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {adminLinks.map(link => (
            <Link key={link.href} href={link.href} style={{ 
              padding: '1.5rem', 
              background: '#f3f4f6', 
              borderRadius: '8px',
              textDecoration: 'none',
              color: '#111',
              display: 'block',
              transition: 'all 0.2s'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{link.title}</h3>
              <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280', fontSize: '0.9rem' }}>{link.desc}</p>
            </Link>
          ))}
        </div>

        <h2 style={{ marginTop: '3rem', marginBottom: '1rem' }}>Actions</h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {adminActions.map((action, i) => (
            <button key={i} onClick={action.action} style={{ 
              padding: '1.5rem', 
              background: '#e0e7ff', 
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s'
            }}>
              <h3 style={{ margin: 0 }}>{action.title}</h3>
              <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280' }}>{action.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}