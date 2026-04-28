// components/TrustBadges.js
import styles from '../styles/TrustBadges.module.css';

export default function TrustBadges() {
  return (
    <div className={styles.container}>
      <div className={styles.badge}>
        <span className={styles.icon}>✦</span>
        <span>Designed in 4K</span>
      </div>
      <div className={styles.badge}>
        <span className={styles.icon}>✦</span>
        <span>Composed for Camera</span>
      </div>
      <div className={styles.badge}>
        <span className={styles.icon}>✦</span>
        <span>Licensable for Teams</span>
      </div>
      <div className={styles.badge}>
        <span className={styles.icon}>✦</span>
        <span>Used in 30+ Countries</span>
      </div>
    </div>
  );
}
