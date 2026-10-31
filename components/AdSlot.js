import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { ADSENSE_CLIENT, adsAllowedOn } from '../lib/adsense';

// One responsive display unit. Renders nothing until its slot ID exists, so
// placements are inert until the unit is created in AdSense.
export default function AdSlot({ slot, style }) {
  const { pathname, asPath } = useRouter();
  const pushedFor = useRef(null);
  const enabled = Boolean(slot) && adsAllowedOn(pathname);

  useEffect(() => {
    // Client-side navigation remounts the <ins> (keyed on asPath), so fill once per page.
    if (!enabled || pushedFor.current === asPath) return;
    pushedFor.current = asPath;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // Ad blockers and unfilled slots land here; never break the page.
    }
  }, [enabled, asPath]);

  if (!enabled) return null;

  return (
    <aside
      aria-label="Advertisement"
      style={{ margin: '2.5rem auto', maxWidth: 970, minHeight: 100, textAlign: 'center', ...style }}
    >
      <ins
        key={asPath}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
