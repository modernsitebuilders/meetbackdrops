import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function ScoresAdmin() {
  const [scores, setScores] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('score');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterCategory, setFilterCategory] = useState('all');
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (localStorage.getItem('streambackdrops_admin') !== 'true') {
      window.location.href = '/';
      return;
    }
    fetchScores();
  }, []);

  const fetchScores = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/calculate-scores');
      const data = await response.json();
      setScores(data.scores);
      setSummary(data.summary);
    } catch (error) {
      console.error('Error fetching scores:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <p>Loading image scores...</p>
        </div>
      </div>
    );
  }

  if (!scores) {
    return <div style={{ padding: '2rem' }}>Error loading scores</div>;
  }

  const categories = ['all', ...new Set(Object.values(scores).map(s => s.categorySlug))];

  let filteredScores = Object.entries(scores)
    .filter(([filename, data]) => {
      if (filterCategory === 'all') return true;
      return data.categorySlug === filterCategory;
    });

  filteredScores.sort((a, b) => {
    const aVal = a[1][sortBy] || 0;
    const bVal = b[1][sortBy] || 0;
    return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
  });

  const getStatusColor = (score) => {
    if (score === 0) return '#fee2e2';
    if (score < 20) return '#fef3c7';
    return '#d1fae5';
  };

  const getStatusTextColor = (score) => {
    if (score === 0) return '#991b1b';
    if (score < 20) return '#92400e';
    return '#065f46';
  };

  const getStatusText = (score) => {
    if (score === 0) return '⚠️ REMOVE';
    if (score < 20) return '⚡ WARNING';
    return '✅ HEALTHY';
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  return (
    <>
      <Head><title>Image Scores - Admin</title></Head>

      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: '0 0 0.5rem 0' }}>📊 Image Scoring Dashboard</h1>
            <p style={{ margin: 0, color: '#6b7280' }}>Monitor performance and identify removal candidates</p>
          </div>
          <Link href="/admin" style={{ padding: '0.75rem 1.5rem', background: '#2563eb', color: 'white', borderRadius: '6px', textDecoration: 'none' }}>
            ← Back to Hub
          </Link>
        </div>

        {summary && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: '#f3f4f6', padding: '1.5rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Images</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>{summary.totalImages}</div>
            </div>
            <div style={{ background: '#fef3c7', padding: '1.5rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.875rem', color: '#92400e' }}>Zero Downloads</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem', color: '#92400e' }}>{summary.zeroDownloads}</div>
            </div>
            <div style={{ background: '#fee2e2', padding: '1.5rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.875rem', color: '#991b1b' }}>Flagged for Removal</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem', color: '#991b1b' }}>{summary.flaggedForRemoval}</div>
            </div>
            <div style={{ background: '#e0e7ff', padding: '1.5rem', borderRadius: '8px' }}>
              <button 
                onClick={fetchScores}
                style={{ width: '100%', padding: '0.75rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                🔄 Refresh Scores
              </button>
            </div>
          </div>
        )}

        <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', display: 'block' }}>Category</label>
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem' }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: '0.875rem', color: '#6b7280' }}>
            Showing {filteredScores.length} images
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Image</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Filename</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Category</th>
                  <th 
                    onClick={() => handleSort('score')}
                    style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none' }}
                  >
                    Score {sortBy === 'score' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </th>
                  <th 
                    onClick={() => handleSort('downloads')}
                    style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none' }}
                  >
                    Downloads {sortBy === 'downloads' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </th>
                  <th 
                    onClick={() => handleSort('daysOld')}
                    style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none' }}
                  >
                    Days Old {sortBy === 'daysOld' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredScores.map(([filename, data]) => (
                  <tr key={filename} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '1rem' }}>
                      <img 
                        src={`https://assets.streambackdrops.com/webp/${data.categorySlug}/${filename}`}
                        alt={filename}
                        style={{ height: '48px', width: '64px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#111827', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {filename}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                      {data.category}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 'bold' }}>
                      {data.score}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                      {data.downloads}
                      {data.recentDownloads > 0 && (
                        <span style={{ marginLeft: '0.25rem', fontSize: '0.75rem', color: '#059669' }}>
                          (+{data.recentDownloads})
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                      {data.daysOld} days
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        borderRadius: '12px',
                        background: getStatusColor(data.score),
                        color: getStatusTextColor(data.score)
                      }}>
                        {getStatusText(data.score)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}