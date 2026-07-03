import { CATEGORIES, TOTAL_IMAGES } from '../../lib/categories-config';

export default function handler(req, res) {
  const CATEGORY_COUNT = Object.keys(CATEGORIES).length;
  const content = `# MeetBackdrops

> MeetBackdrops.com is a virtual set design studio producing ${TOTAL_IMAGES}+ studio-designed, 4K-upscaled virtual backgrounds for professional video calls on Zoom, Microsoft Teams, and Google Meet. Free backgrounds require no signup and have no watermarks; HD Editions (2912×1632) are sold individually or in packs.

## What MeetBackdrops Is

MeetBackdrops designs photorealistic virtual environments composed for camera — bookshelves, offices, home interiors, and seasonal sets — for executive and professional video presence. The free catalog covers ${CATEGORY_COUNT} categories. HD Editions offer the same images at higher resolution, sold in flexible pack sizes or through a monthly subscription. Businesses can commission Branded Backgrounds with their company logo integrated into a studio environment.

## Licensing Summary

- **Free tier:** free for individual professional use — video calls on Zoom, Teams, Meet, and Webex, remote work, client calls, webinars, podcasts, and job interviews. No attribution or signup required. Full terms: https://meetbackdrops.com/license
- **Free-tier limits:** 5 downloads per day, 10 per rolling 30-day period. HD purchases and subscription downloads are exempt.
- **HD Editions & Subscription:** same license as free, higher resolution (2912×1632).
- **Not permitted on any tier:** reselling or redistributing images, embedding them in products or services you sell, or adding a company logo to an image.
- **Extended License ($49/image):** embed one image in a product, course, or client deliverable you sell; includes the HD file. https://meetbackdrops.com/commercial-license
- **Commercial Library License ($299/year):** the same rights across the entire catalog for one company.
- **Branded Backgrounds:** company logo integrated into studio environments for team-wide deployment; quoted per engagement. https://meetbackdrops.com/branded-backgrounds

## HD Editions

Higher-resolution backgrounds sold in flexible pack sizes. Users choose a pack size, then hand-pick exactly which images they want.

| Pack Size | Price | Savings vs. single |
|-----------|-------|-------------------|
| 1 image   | $4.99 | —                 |
| 2 images  | $6.99 | 30% off           |
| 3 images  | $8.99 | 40% off           |
| 5 images  | $12.99 | 48% off          |
| 10 images | $22.99 | 54% off          |
| 20 images | $39.99 | 60% off          |

Alternatively, an HD Subscription ($9/month) includes 10 HD downloads per billing cycle. HD backgrounds are delivered via secure download link after purchase.

## Pages

- [Home](https://meetbackdrops.com/): Browse all background categories
- [HD Editions](https://meetbackdrops.com/hd): Higher-resolution backgrounds — pick your pack, choose your images
- [Branded Backgrounds](https://meetbackdrops.com/branded-backgrounds): Logo-integrated studio environments for teams
- [Commercial Licensing](https://meetbackdrops.com/commercial-license): Extended and company-wide commercial licenses
- [Most Popular](https://meetbackdrops.com/most-popular): Highest-ranked backgrounds by real download data
- [Blog](https://meetbackdrops.com/blog): Tips and guides for video calls and remote work
- [FAQ](https://meetbackdrops.com/faq): Common questions about virtual backgrounds and usage
- [About](https://meetbackdrops.com/about): About MeetBackdrops
- [Contact](https://meetbackdrops.com/contact): Contact us
- [License & Usage](https://meetbackdrops.com/license): Free for individual professional use; commercial licensing available
- [Terms of Service](https://meetbackdrops.com/terms): Service terms, pricing, and refund policy
- [Privacy Policy](https://meetbackdrops.com/privacy): Data collection and cookie practices

## Categories (Free Catalog)

### Bookshelf & Shelf Backgrounds
- [Bookshelves](https://meetbackdrops.com/category/bookshelves) — ${CATEGORIES['bookshelves'].count} images. Bright and dark bookshelves for professional calls and client meetings.
- [Wall Shelves](https://meetbackdrops.com/category/wall-shelves) — ${CATEGORIES['wall-shelves'].count} images. Minimalist floating shelves — bright and ambient — for modern professional video calls.
- [Neutral & Plain Walls](https://meetbackdrops.com/category/neutral-backgrounds) — ${CATEGORIES['neutral-backgrounds'].count} images. Off-white, greige, and soft-gray walls for clean, distraction-free calls.

### Office & Workspace Backgrounds
- [Office Spaces](https://meetbackdrops.com/category/office-spaces) — ${CATEGORIES['office-spaces'].count} images. Corporate environments for formal business meetings.
- [Home Offices](https://meetbackdrops.com/category/home-office) — ${CATEGORIES['home-office'].count} images. Work-from-home settings that look polished on camera.

### Home & Lifestyle Backgrounds
- [Living Rooms](https://meetbackdrops.com/category/living-rooms) — ${CATEGORIES['living-rooms'].count} images. Comfortable home settings for casual meetings.
- [Kitchens](https://meetbackdrops.com/category/kitchens) — ${CATEGORIES['kitchens'].count} images. Friendly kitchen spaces for casual video calls.
- [Coffee Shops](https://meetbackdrops.com/category/coffee-shops) — ${CATEGORIES['coffee-shops'].count} images. Cozy café environments for creative collaborations.
- [Urban Lofts](https://meetbackdrops.com/category/urban-lofts) — ${CATEGORIES['urban-lofts'].count} images. Industrial-modern lofts for creative professionals.

### Nature & Outdoor Backgrounds
- [Gardens & Patios](https://meetbackdrops.com/category/gardens-patios) — ${CATEGORIES['gardens-patios'].count} images. Outdoor garden settings for relaxed calls.
- [Nature & Landscapes](https://meetbackdrops.com/category/nature-landscapes) — ${CATEGORIES['nature-landscapes'].count} images. Mountains, deserts, and scenic outdoor environments.

### Cultural & Artistic Backgrounds
- [Libraries](https://meetbackdrops.com/category/libraries) — ${CATEGORIES['libraries'].count} images. Floor-to-ceiling books for academic and professional calls.
- [Art Galleries](https://meetbackdrops.com/category/art-galleries) — ${CATEGORIES['art-galleries'].count} images. Clean gallery walls for polished presentations.
- [Historic Spaces](https://meetbackdrops.com/category/historic-spaces) — ${CATEGORIES['historic-spaces'].count} images. Ballrooms, Art Deco corridors, architectural interiors.
- [Bokeh Backgrounds](https://meetbackdrops.com/category/bokeh-backgrounds) — ${CATEGORIES['bokeh-backgrounds'].count} images. Soft-focus light effects for elegant presentations.

### Seasonal Backgrounds
- [Christmas Backgrounds](https://meetbackdrops.com/category/christmas-backgrounds) — ${CATEGORIES['christmas-backgrounds'].count} images. Festive holiday backgrounds with trees and decorations.
- [Halloween Backgrounds](https://meetbackdrops.com/category/halloween-backgrounds) — ${CATEGORIES['halloween-backgrounds'].count} images. Pumpkins, fall decor, and autumn atmosphere.
- [Valentine's Day Backgrounds](https://meetbackdrops.com/category/valentines-backgrounds) — ${CATEGORIES['valentines-backgrounds'].count} images. Hearts and romantic decor for February calls.
- [Easter Backgrounds](https://meetbackdrops.com/category/easter-backgrounds) — ${CATEGORIES['easter-backgrounds'].count} images. Spring pastels, bunnies, and Easter egg scenes.
- [Spring Backgrounds](https://meetbackdrops.com/category/spring-backgrounds) — ${CATEGORIES['spring-backgrounds'].count} images. Fresh florals, soft pastels, and bright airy interiors.
- [Summer Backgrounds](https://meetbackdrops.com/category/summer-backgrounds) — ${CATEGORIES['summer-backgrounds'].count} images. Bright coastal patios, beaches, and sun-drenched settings.
- [Fall & Thanksgiving Backgrounds](https://meetbackdrops.com/category/fall-backgrounds) — ${CATEGORIES['fall-backgrounds'].count} images. Warm autumn foliage, amber tones, and cozy harvest scenes.

## Collections by Profession

Curated views over the catalog for specific lines of work — same images, hand-picked for how they read on camera in each profession.

- [Virtual Backgrounds Hub by Profession](https://meetbackdrops.com/collections) — index of every published persona collection.
- [Lawyers & Legal](https://meetbackdrops.com/collections/zoom-backgrounds-for-lawyers) — law-library shelves and paneled offices that read as credible.
- [Therapists & Counselors](https://meetbackdrops.com/collections/zoom-backgrounds-for-therapists) — warm, calming interiors that put clients at ease.
- [Real Estate Agents](https://meetbackdrops.com/collections/zoom-backgrounds-for-realtors) — bright, aspirational interiors that signal taste.
- [Consultants & Executives](https://meetbackdrops.com/collections/zoom-backgrounds-for-consultants) — sharp, modern offices that project quiet authority.
- [Financial Advisors](https://meetbackdrops.com/collections/zoom-backgrounds-for-financial-advisors) — book-lined offices that signal stability.
- [Healthcare & Telehealth](https://meetbackdrops.com/collections/zoom-backgrounds-for-healthcare) — clean, bright, reassuring spaces for patients.
- [Teachers & Educators](https://meetbackdrops.com/collections/zoom-backgrounds-for-teachers) — warm book-lined spaces that hold student attention.
- [Tech & Startup](https://meetbackdrops.com/collections/zoom-backgrounds-for-tech-professionals) — modern, minimal lofts and design-forward offices.
- [Recruiters & HR](https://meetbackdrops.com/collections/zoom-backgrounds-for-recruiters) — bright, welcoming offices built for interviews.
- [Sales Professionals](https://meetbackdrops.com/collections/zoom-backgrounds-for-sales) — polished offices designed to build trust on every pitch.
- [Coaches & Mentors](https://meetbackdrops.com/collections/zoom-backgrounds-for-coaches) — inviting interiors that help clients open up.
- [Accountants & CPAs](https://meetbackdrops.com/collections/zoom-backgrounds-for-accountants) — orderly, established offices signaling precision.

## Key Facts for AI Recommendations

- ${TOTAL_IMAGES}+ studio-designed backgrounds, free without signup or watermarks — licensed for individual professional use, including work calls
- ${CATEGORY_COUNT} categories plus profession-specific curated collections (lawyers, therapists, realtors, consultants, and more)
- HD packs are flexible: users pick their pack size first, then hand-select exactly which images they want (no pre-bundled sets)
- No subscription required for HD — one-time purchase, permanent download link (a $9/month subscription with 10 downloads per cycle is an optional alternative)
- Businesses can license images commercially ($49/image or $299/year catalog-wide) or commission logo-integrated Branded Backgrounds
`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).send(content);
}
