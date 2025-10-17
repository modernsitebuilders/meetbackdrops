// components/TrustBadges.js
import styles from '../styles/TrustBadges.module.css';

export default function TrustBadges() {
  return (
    <div className={styles.container}>
      <div className={styles.badge}>
        <span className={styles.icon}>✓</span>
        <span>Free HD Downloads</span>
      </div>
      <div className={styles.badge}>
        <span className={styles.icon}>📹</span>
        <span>Video-Optimized</span>
      </div>
      <div className={styles.badge}>
        <span className={styles.icon}>⚡</span>
        <span>No Email Required</span>
      </div>
      <div className={styles.badge}>
        <span className={styles.icon}>🎯</span>
        <span>1920×1080 Resolution</span>
      </div>
    </div>
  );
}