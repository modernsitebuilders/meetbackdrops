// components/CategoryHeader.js
import styles from '../styles/CategoryHeader.module.css';

export default function CategoryHeader({ category }) {
  // Fallback styles in case CSS module is missing
  const fallbackStyles = {
    header: {
      textAlign: 'center',
      padding: '3rem 1rem 2rem',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      marginBottom: '2rem'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '1rem'
    },
    description: {
      fontSize: '1.125rem',
      color: '#6b7280',
      maxWidth: '600px',
      margin: '0 auto 1.5rem',
      lineHeight: '1.6'
    },
    badges: {
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: '0.75rem',
      maxWidth: '500px',
      margin: '0 auto'
    },
    badge: {
      background: 'white',
      color: '#059669',
      padding: '0.5rem 1rem',
      borderRadius: '2rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
    }
  };

  return (
    <div className={styles.header} style={fallbackStyles.header}>
      <h1 className={styles.title} style={fallbackStyles.title}>
        {category.name} Virtual Backgrounds
      </h1>
      
      <p className={styles.description} style={fallbackStyles.description}>
        {category.description} Each background features professional lighting and 
        composition designed specifically for video calls—not repurposed stock photos.
      </p>
      
      <div className={styles.badges} style={fallbackStyles.badges}>
        <span className={styles.badge} style={fallbackStyles.badge}>✓ Video-Optimized Lighting</span>
        <span className={styles.badge} style={fallbackStyles.badge}>✓ Perfect 16:9 Ratio</span>
        <span className={styles.badge} style={fallbackStyles.badge}>✓ Instant Download</span>
        <span className={styles.badge} style={fallbackStyles.badge}>✓ No Watermarks</span>
      </div>
    </div>
  );
}