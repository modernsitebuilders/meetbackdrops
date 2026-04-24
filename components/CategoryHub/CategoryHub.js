'use client';

import { useEffect, useRef } from 'react';
import { getOrCreateSession, getVisitorType } from '../../lib/sessionTracking';
import HubHero from './HubHero';
import SocialProofBand from './SocialProofBand';
import HDConversionModule from './HDConversionModule';
import HubRelatedCategories from './HubRelatedCategories';
import { getFreeImages, getPremiumImages } from '../../lib/images-access';
import styles from '../../styles/CategoryHub.module.css';

const HD_MODULE_ID = 'hub-hd-module';

function trackHubEvent(eventType, slug, extra = {}) {
  if (typeof window === 'undefined') return;
  if (window.gtag) {
    window.gtag('event', eventType, {
      event_category: 'Category Hub v2',
      event_label: slug,
      ...extra,
    });
  }
  const session = getOrCreateSession?.() || null;
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventType,
      filename: extra.filename || 'hub',
      category: slug,
      source: 'category_hub_v2',
      sessionId: session?.id || 'unknown',
      visitorId: session?.visitorId || 'unknown',
      visitorType: getVisitorType?.() || 'unknown',
      landingPage: session?.landingPage || '',
      ...extra,
    }),
  }).catch(() => {});
}

function scrollToHdModule() {
  const el = document.getElementById(HD_MODULE_ID);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function CategoryHub({
  slug,
  featuredImages,
  scores = {},
  onImageClick,
}) {
  const firedDepths = useRef(new Set());

  const freeImages = getFreeImages(slug);
  const premiumImages = getPremiumImages(slug);

  const heroImages = (featuredImages && featuredImages.length
    ? featuredImages
    : freeImages
  ).slice(0, 5);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const pct = Math.round((scrollTop / docHeight) * 100);
      [25, 50, 75, 100].forEach((threshold) => {
        if (pct >= threshold && !firedDepths.current.has(threshold)) {
          firedDepths.current.add(threshold);
          trackHubEvent(`hub_scroll_depth_${threshold}`, slug);
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [slug]);

  const handleHeroCta = () => {
    trackHubEvent('hub_hero_cta_click', slug);
    scrollToHdModule();
  };

  const handleHdCompareClick = (filename) => {
    trackHubEvent('hub_hd_compare_click', slug, { filename });
  };

  return (
    <div className={styles.hub}>
      <HubHero
        slug={slug}
        images={heroImages}
        onCtaClick={handleHeroCta}
        onImageClick={onImageClick}
      />

      <SocialProofBand slug={slug} images={freeImages} />

      <div id={HD_MODULE_ID}>
        <HDConversionModule
          slug={slug}
          premiumImages={premiumImages}
          scores={scores}
          onCompareClick={handleHdCompareClick}
        />
      </div>

      <HubRelatedCategories />
    </div>
  );
}
