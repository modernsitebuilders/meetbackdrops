'use client';

import { useEffect, useMemo, useRef } from 'react';
import { isHdOnlyFilename } from '../../lib/hdOnly';
import { getOrCreateSession, getVisitorType } from '../../lib/sessionTracking';
import HubHero from './HubHero';
import SocialProofBand from './SocialProofBand';
import UseCaseSection from './UseCaseSection';
import HDConversionModule from './HDConversionModule';
import HubRelatedCategories from './HubRelatedCategories';
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
  images,
  scores = {},
  onImageClick,
  onDownload,
  downloadingImage,
}) {
  const firedDepths = useRef(new Set());

  // Top free images by score (hero + use-case pool). HD-only images must be
  // excluded — they surface free Download buttons in UseCaseSection otherwise.
  const topImages = useMemo(() => {
    return images
      .filter((img) => !isHdOnlyFilename(img.filename))
      .map((img) => ({
        ...img,
        score: scores[img.filename] ?? 0,
      }))
      .sort((a, b) => b.score - a.score);
  }, [images, scores]);

  const heroImages = topImages.slice(0, 5);
  const pool = topImages.slice(0, 12);

  // Distribute top-scored images across 3 use-cases with a stride so each section
  // gets a distinct mix rather than a contiguous chunk.
  const corporateImages = [pool[0], pool[3], pool[6], pool[9]].filter(Boolean);
  const homeOfficeImages = [pool[1], pool[4], pool[7], pool[10]].filter(Boolean);
  const streamingImages = [pool[2], pool[5], pool[8], pool[11]].filter(Boolean);

  // Scroll depth tracking
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

  const handleUseCaseCta = (useCase) => {
    trackHubEvent('hub_usecase_cta_click', slug, { useCase });
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

      <SocialProofBand slug={slug} images={images} />

      <UseCaseSection
        slug={slug}
        icon="💼"
        heading="Corporate Meetings"
        copy="Look polished on every client call. Clean, neutral office backdrops that signal professionalism without distracting from what you're saying."
        ctaLabel="See HD Options"
        images={corporateImages}
        onImageClick={onImageClick}
        onDownload={onDownload}
        downloadingImage={downloadingImage}
        onCtaClick={() => handleUseCaseCta('corporate')}
      />

      <UseCaseSection
        slug={slug}
        icon="🏠"
        heading="Home Office Setup"
        copy="Replace the clutter behind you with a workspace that looks intentional. Great for daily standups, interviews, and client pitches from home."
        ctaLabel="See HD Options"
        images={homeOfficeImages}
        onImageClick={onImageClick}
        onDownload={onDownload}
        downloadingImage={downloadingImage}
        onCtaClick={() => handleUseCaseCta('home_office')}
      />

      <UseCaseSection
        slug={slug}
        icon="🎥"
        heading="Streaming & Creator Setup"
        copy="Sharp, on-brand backgrounds for YouTube, Twitch, and podcast recordings. High resolution holds up when your camera's cranked up."
        ctaLabel="See HD Options"
        images={streamingImages}
        onImageClick={onImageClick}
        onDownload={onDownload}
        downloadingImage={downloadingImage}
        onCtaClick={() => handleUseCaseCta('streaming')}
      />

      <div id={HD_MODULE_ID}>
        <HDConversionModule
          slug={slug}
          images={images}
          scores={scores}
          onCompareClick={handleHdCompareClick}
        />
      </div>

      <HubRelatedCategories />
    </div>
  );
}
