// components/ScoreDisplay.js
'use client';

import { getScoreBreakdown } from '../lib/imageScoring';

export default function ScoreDisplay({ image, metadata = {} }) {
  if (!image) return null;
  
  const imageData = {
    createdDate: metadata.firstSeen || image.createdDate,
    totalDownloads: image.downloads || 0,
    lastDownload: image.lastDownload || null
  };
  
  const breakdown = getScoreBreakdown(imageData);
  
  return (
    <div style={{
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '0.5rem',
      padding: '1rem',
      fontSize: '0.875rem',
      maxWidth: '300px'
    }}>
      <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>
        Score: <strong>{breakdown.total}</strong>/100
      </h4>
      
      <div style={{ display: 'grid', gap: '0.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Base score:</span>
          <span>+{breakdown.base}</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Download points:</span>
          <span style={{ color: '#10b981' }}>+{breakdown.downloadPoints}</span>
        </div>
        
        {breakdown.inactivityPenalty < 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Inactivity penalty:</span>
            <span style={{ color: '#ef4444' }}>{breakdown.inactivityPenalty}</span>
          </div>
        )}
        
        {breakdown.newImageBonus > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>New image bonus:</span>
            <span style={{ color: '#3b82f6' }}>+{breakdown.newImageBonus}</span>
          </div>
        )}
        
        {breakdown.recentDownloadBonus > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Recent download bonus:</span>
            <span style={{ color: '#8b5cf6' }}>+{breakdown.recentDownloadBonus}</span>
          </div>
        )}
        
        {breakdown.legacyAdjustment && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Legacy protection:</span>
            <span style={{ color: '#f59e0b' }}>+{breakdown.legacyAdjustment}</span>
          </div>
        )}
        
        {breakdown.capped && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Capped at 100:</span>
            <span style={{ color: '#6b7280' }}>-{breakdown.capped}</span>
          </div>
        )}
      </div>
      
      <div style={{ 
        marginTop: '0.75rem', 
        paddingTop: '0.75rem', 
        borderTop: '1px solid #e2e8f0',
        color: '#64748b',
        fontSize: '0.75rem'
      }}>
        <div>Downloads: {imageData.totalDownloads || 0}</div>
        <div>Last download: {imageData.lastDownload 
          ? new Date(imageData.lastDownload).toLocaleDateString() 
          : 'Never'}</div>
      </div>
    </div>
  );
}