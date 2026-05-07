'use client';

import { useMemo } from 'react';
import { HD_BASE_IDS } from '../../lib/hdImages';
import styles from '../../styles/CategoryHub.module.css';

const HD_PREFIX_BY_SLUG = {
  'office-spaces': 'office-spaces-',
  'wall-shelves': 'wall-shelves-',
};

export default function SocialProofBand({ slug, images = [], lastUpdated = 'April 2026' }) {
  const freeCount = images.length;

  const hdCount = useMemo(() => {
    const prefix = HD_PREFIX_BY_SLUG[slug];
    if (!prefix) return 0;
    let count = 0;
    HD_BASE_IDS.forEach((id) => {
      if (id.startsWith(prefix)) count += 1;
    });
    return count;
  }, [slug]);

  return (
    <section className={styles.socialProof} aria-label="Trust and catalog stats">
      <p className={styles.socialProofClaim}>
        Professional-grade backgrounds used by remote teams since 2023.
      </p>
      <div className={styles.socialProofStats}>
        <div className={styles.socialProofStat}>
          <span className={styles.socialProofStatValue}>{freeCount}</span>
          <span className={styles.socialProofStatLabel}>Free backgrounds</span>
        </div>
        <div className={styles.socialProofStat}>
          <span className={styles.socialProofStatValue}>{hdCount}</span>
          <span className={styles.socialProofStatLabel}>HD-ready backgrounds</span>
        </div>
        <div className={styles.socialProofStat}>
          <span className={styles.socialProofStatValue}>{lastUpdated}</span>
          <span className={styles.socialProofStatLabel}>Updated</span>
        </div>
      </div>
    </section>
  );
}
