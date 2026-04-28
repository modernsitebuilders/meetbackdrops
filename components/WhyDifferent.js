// components/WhyDifferent.js
import styles from '../styles/WhyDifferent.module.css';

export default function WhyDifferent() {
  const rows = [
    {
      label: 'Origin',
      stock: 'Shot once, sold to thousands',
      ours: 'AI-architected sets, composed for video',
    },
    {
      label: 'Resolution',
      stock: 'Optimized for print or web',
      ours: '4K-upscaled (2912×1632), tuned for codec compression',
    },
    {
      label: 'Composition',
      stock: 'Cropped from existing scenes',
      ours: 'Frame-balanced for camera placement and depth of field',
    },
    {
      label: 'Trust',
      stock: "On five competitors' sites at the same time",
      ours: 'Curated library, licensable exclusively for teams',
    },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.eyebrow}>Why our tech</div>
      <h2 className={styles.heading}>Engineered Sets, Not Stock Photos</h2>
      <p className={styles.subtitle}>
        Generic stock libraries shoot once and license forever. We architect each
        environment in 4K, then test it on the cameras and codecs that compress your
        image in real time.
      </p>

      <div className={styles.compareWrap}>
        <div className={styles.compareHeader}>
          <div className={styles.colHead} aria-hidden="true"></div>
          <div className={styles.colHead}>Generic stock</div>
          <div className={`${styles.colHead} ${styles.colHeadOurs}`}>StreamBackdrops</div>
        </div>

        {rows.map((r) => (
          <div key={r.label} className={styles.compareRow}>
            <div className={styles.rowLabel}>{r.label}</div>
            <div className={styles.cellStock}>{r.stock}</div>
            <div className={styles.cellOurs}>{r.ours}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
