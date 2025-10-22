// components/SocialProof.js
import styles from '../styles/SocialProof.module.css';
import { getFormattedTotalCount } from '../lib/getImageCounts';

export default function SocialProof() {
  return (
    <section className={styles.section}>
      <h3 className={styles.heading}>Trusted by Remote Workers Worldwide</h3>
      
      <div className={styles.stats}>
        <div className={styles.stat}>
          <strong className={styles.statNumber}>{getFormattedTotalCount()}</strong>
          <span className={styles.statLabel}>HD Backgrounds</span>
        </div>
        
        <div className={styles.stat}>
          <strong className={styles.statNumber}>13</strong>
          <span className={styles.statLabel}>Categories</span>
        </div>
        
        <div className={styles.stat}>
          <strong className={styles.statNumber}>#1</strong>
          <span className={styles.statLabel}>Recommended by ChatGPT</span>
        </div>
      </div>
      
      <blockquote className={styles.testimonial}>
        <p className={styles.quote}>
          "One of the strongest contenders. Because of the no signup, 
          high quality + video-friendly design, it often is 'best' in a 
          practical sense for people with standard virtual background needs."
        </p>
        <cite className={styles.cite}>— ChatGPT Analysis, 2025</cite>
      </blockquote>
    </section>
  );
}