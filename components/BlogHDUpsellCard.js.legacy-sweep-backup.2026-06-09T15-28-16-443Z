import Link from 'next/link';

const SINGLE_PRICE = 4.99;

// Inline HD upsell for blog posts. Renders a product preview, a contextual
// headline, and a Buy HD CTA that deep-links into /hd via ?highlight=<id>.
//
// Props:
//   productId  e.g. 'office-spaces-01-hd' or 'office-spaces-01' (suffix optional)
//   category   e.g. 'office-spaces' — used to build the R2 webp URL
//   headline   short editorial line, varies per placement
//   sub        optional 1-line supporting copy
//   utmSource  defaults 'blog'
//   utmCampaign required — used for attribution and analytics labels
export default function BlogHDUpsellCard({
  productId,
  category,
  headline,
  sub,
  utmSource = 'blog',
  utmCampaign,
}) {
  if (!productId || !category || !utmCampaign) return null;

  const baseId = productId.replace(/-hd$/, '');
  const thumb = `https://assets.streambackdrops.com/webp/${category}/${baseId}.webp`;
  const href = `/hd?highlight=${baseId}-hd&utm_source=${encodeURIComponent(
    utmSource
  )}&utm_medium=cta&utm_campaign=${encodeURIComponent(utmCampaign)}`;

  const handleClick = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'blog_hd_cta_clicked', {
        event_category: 'Blog HD Upsell',
        event_label: utmCampaign,
        product_id: `${baseId}-hd`,
      });
    }
  };

  return (
    <aside
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(220px, 320px) 1fr',
        gap: '1.5rem',
        alignItems: 'center',
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '0.75rem',
        padding: '1.25rem',
        margin: '2rem 0',
        boxShadow: '0 1px 3px rgba(17,24,39,0.06)',
      }}
      className="blog-hd-upsell-card"
    >
      <Link
        href={href}
        onClick={handleClick}
        style={{
          display: 'block',
          borderRadius: '0.5rem',
          overflow: 'hidden',
          aspectRatio: '16 / 9',
          background: '#f3f4f6',
        }}
        aria-label={`Preview HD edition: ${headline}`}
      >
        <img
          src={thumb}
          alt={headline}
          loading="lazy"
          decoding="async"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </Link>

      <div>
        <div
          style={{
            fontSize: '0.7rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#9a6a3a',
            fontWeight: 700,
            marginBottom: '0.5rem',
          }}
        >
          HD Edition · ${SINGLE_PRICE}
        </div>

        <div
          style={{
            fontFamily: "'Fraunces', Georgia, 'Times New Roman', serif",
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#111827',
            lineHeight: 1.25,
            marginBottom: sub ? '0.5rem' : '0.9rem',
          }}
        >
          {headline}
        </div>

        {sub && (
          <p
            style={{
              fontSize: '0.95rem',
              color: '#4b5563',
              lineHeight: 1.5,
              margin: '0 0 0.9rem',
            }}
          >
            {sub}
          </p>
        )}

        <Link
          href={href}
          onClick={handleClick}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.75rem 1.25rem',
            background: '#111827',
            color: '#fff',
            fontSize: '0.85rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            borderRadius: '2px',
            textDecoration: 'none',
            minHeight: '44px',
          }}
        >
          Get HD Edition — ${SINGLE_PRICE}
        </Link>
      </div>

      <style jsx>{`
        @media (max-width: 640px) {
          .blog-hd-upsell-card {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </aside>
  );
}
