// components/SocialProof.js
import styles from '../styles/SocialProof.module.css';
import { TOTAL_IMAGES_FORMATTED, getTotalCategories } from '../lib/categories-config';

export default function SocialProof({ reviewsData }) {
  const rating = reviewsData?.averageRating;
  const reviewCount = reviewsData?.totalReviews;
  const hasReviews = Boolean(rating && reviewCount);

  return (
    <section className={styles.section}>
      <div className={styles.eyebrow}>Trusted on Executive Video Calls Worldwide</div>

      <div className={styles.stats}>
        {hasReviews && (
          <div className={styles.stat}>
            <strong className={styles.statNumber}>{rating.toFixed(1)}</strong>
            <span className={styles.stars} aria-hidden="true">★★★★★</span>
            <span className={styles.statLabel}>From {reviewCount} client reviews</span>
          </div>
        )}

        <div className={styles.stat}>
          <strong className={styles.statNumber}>{TOTAL_IMAGES_FORMATTED}</strong>
          <span className={styles.statLabel}>Environments</span>
        </div>

        <div className={styles.stat}>
          <strong className={styles.statNumber}>{getTotalCategories()}</strong>
          <span className={styles.statLabel}>Curated Categories</span>
        </div>

        <div className={styles.stat}>
          <strong className={styles.statNumber}>#1</strong>
          <span className={styles.statLabel}>Cited by ChatGPT for professional virtual backgrounds</span>
        </div>
      </div>
    </section>
  );
}
