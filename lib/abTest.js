// lib/abTest.js
//
// Minimal sticky client-side A/B assignment. One experiment today:
//
//   hd_compare_hero — does the category-page "HD — See the Difference" promo
//   (components/HDComparisonHero.js) help or hurt HD intent? Holdout hides it.
//
// Assignment is per VISITOR (localStorage), not per session: a person who saw the
// promo on Monday must not lose it on Tuesday, or the arms contaminate each other.
// Control = promo shown, i.e. exactly the pre-experiment behaviour, so anything that
// fails (storage blocked, SSR, flag off) falls back to control and never to a hole.
//
// Both arms log `hd_compare_ab_exposure` (filename = 'hero_shown' | 'hero_hidden',
// category = slug) once per session per category, ONLY on pages where the promo
// would actually render. Analysis joins that to /hd visits, hd_checkout_initiated
// and hd_purchase on visitor_id. See analytics_events in Neon.

const STORAGE_KEY = 'mb_ab_hd_compare_hero';

// Kill switch: set NEXT_PUBLIC_HD_COMPARE_AB=0 to put the promo back for everyone.
const ENABLED = process.env.NEXT_PUBLIC_HD_COMPARE_AB !== '0';

export const HERO_SHOWN = 'hero_shown';
export const HERO_HIDDEN = 'hero_hidden';

export function getHeroVariant() {
  if (!ENABLED || typeof window === 'undefined') return HERO_SHOWN;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === HERO_SHOWN || stored === HERO_HIDDEN) return stored;
    const assigned = Math.random() < 0.5 ? HERO_HIDDEN : HERO_SHOWN;
    localStorage.setItem(STORAGE_KEY, assigned);
    return assigned;
  } catch {
    return HERO_SHOWN;
  }
}
