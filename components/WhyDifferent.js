// components/WhyDifferent.js
import styles from '../styles/WhyDifferent.module.css';
import { TOTAL_IMAGES_FORMATTED } from '../lib/categories-config';

export default function WhyDifferent() {
  const features = [
    {
      icon: '📹',
      title: 'Video-Call Optimized',
      description: 'Every background features professional lighting and composition designed specifically for video calls—not repurposed stock photos'
    },
    {
      icon: '⚡',
      title: 'Instant Download',
      description: 'No signup, no email, no forms. Browse, click, and download. It\'s that simple.'
    },
    {
      icon: '🎨',
      title: `${TOTAL_IMAGES_FORMATTED} Professional Backgrounds`,
      description: 'Office spaces, libraries, bookshelves, and more—all in perfect 16:9 ratio for video platforms'
    },
    {
      icon: '💎',
      title: 'No Watermarks Ever',
      description: 'What you see is what you get. High-quality, free forever, no hidden costs or premium tiers.'
    }
  ];

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Why StreamBackdrops?</h2>
      <p className={styles.subtitle}>
        Unlike stock photo sites, our backgrounds are specifically designed for video calls
      </p>
      
      <div className={styles.grid}>
        {features.map((feature, index) => (
          <div key={index} className={styles.feature}>
            <div className={styles.icon}>{feature.icon}</div>
            <h3 className={styles.featureTitle}>{feature.title}</h3>
            <p className={styles.featureDesc}>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}