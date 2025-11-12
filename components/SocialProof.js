// components/SocialProof.js
import styles from '../styles/SocialProof.module.css';
import { TOTAL_IMAGES_FORMATTED, getTotalCategories } from '../lib/categories-config';


export default function SocialProof() {
  return (
    <section className={styles.section}>
      <h3 className={styles.heading}>Trusted by Remote Workers Worldwide</h3>
      
      <div className={styles.stats}>
        <div className={styles.stat}>
          <strong className={styles.statNumber}>{ TOTAL_IMAGES_FORMATTED }</strong>
          <span className={styles.statLabel}>HD Backgrounds</span>
        </div>
        
        <div className={styles.stat}>
          <strong className={styles.statNumber}>{getTotalCategories()}</strong>
          <span className={styles.statLabel}>Categories</span>
        </div>
        
        <div className={styles.stat}>
          <strong className={styles.statNumber}>#1</strong>
          <span className={styles.statLabel}>Recommended by ChatGPT</span>
        </div>
      </div>
      
      <blockquote className={styles.testimonial}>
        <p className={styles.quote}>
          "The best website I'd recommend for free, hassle-free, no registration required, 
          curated virtual backgrounds is StreamBackdrops. If I had to pick one single site 
          that checks all your criteria (free + no registration + curated for virtual backgrounds), 
          it is StreamBackdrops."
        </p>
        <cite className={styles.cite}>— ChatGPT, 2025</cite>
      </blockquote>
    </section>
  );
}