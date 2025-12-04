import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function ScoresAdmin() {
  const [scores, setScores] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('score'); // score, downloads, daysOld
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterCategory, setFilterCategory] = useState('all');
  const [summary, setSummary] = useState(null);

  useEffect(() => {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading image scores...</p>
        </div>
      </div>
    );
  }

  if (!scores) {
    return <div className="p-8">Error loading scores</div>;
  }

  // Get unique categories
  const categories = ['all', ...new Set(Object.values(scores).map(s => s.categorySlug))];

  // Filter and sort
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
    if (score === 0) return 'bg-red-100 text-red-800';
    if (score < 20) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (score) => {
    if (score === 0) return 'REMOVE';
    if (score < 20) return 'WARNING';
    return 'HEALTHY';
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
      <Head>
        <title>Image Scores Admin - StreamBackdrops</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Image Scoring Dashboard</h1>
            <p className="text-gray-600">Monitor image performance and identify candidates for removal</p>
          </div>

          {/* Summary Stats */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-600">Total Images</div>
                <div className="text-3xl font-bold text-gray-900">{summary.totalImages}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-600">Zero Downloads</div>
                <div className="text-3xl font-bold text-yellow-600">{summary.zeroDownloads}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-600">Flagged for Removal</div>
                <div className="text-3xl font-bold text-red-600">{summary.flaggedForRemoval}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <button 
                  onClick={fetchScores}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  Refresh Scores
                </button>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex gap-4 items-center flex-wrap">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-sm text-gray-600 ml-auto">
                Showing {filteredScores.length} images
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Filename
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th 
                      onClick={() => handleSort('score')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      Score {sortBy === 'score' && (sortOrder === 'desc' ? '↓' : '↑')}
                    </th>
                    <th 
                      onClick={() => handleSort('downloads')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      Downloads {sortBy === 'downloads' && (sortOrder === 'desc' ? '↓' : '↑')}
                    </th>
                    <th 
                      onClick={() => handleSort('daysOld')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      Days Old {sortBy === 'daysOld' && (sortOrder === 'desc' ? '↓' : '↑')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredScores.map(([filename, data]) => (
                    <tr key={filename} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img 
                          src={`/images/${data.categorySlug}/${filename}`}
                          alt={filename}
                          className="h-12 w-20 object-cover rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {filename}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {data.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                        {data.score}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {data.downloads}
                        {data.recentDownloads > 0 && (
                          <span className="ml-1 text-xs text-green-600">
                            (+{data.recentDownloads} recent)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {data.daysOld} days
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(data.score)}`}>
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
      </div>
    </>
  );
}