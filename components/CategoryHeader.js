// components/CategoryHeader.js
import styles from '../styles/CategoryHeader.module.css';

export default function CategoryHeader({ category }) {
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>
        {category.name} Virtual Backgrounds
      </h1>
      
      <p className={styles.description}>
        {category.description} Each background features professional lighting and 
        composition designed specifically for video calls—not repurposed stock photos.
      </p>
      
      <div className={styles.badges}>
        <span className={styles.badge}>✓ Video-Optimized Lighting</span>
        <span className={styles.badge}>✓ Perfect 16:9 Ratio</span>
        <span className={styles.badge}>✓ Instant Download</span>
        <span className={styles.badge}>✓ No Watermarks</span>
      </div>
    </div>
  );
}