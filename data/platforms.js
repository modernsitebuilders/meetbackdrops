// data/platforms.js
//
// PLATFORM VOCABULARY — the "where will you use it" axis of discovery.
//
// A platform is NOT an image filter. Every background is a 16:9 PNG that works
// identically on Zoom, Teams, Meet, and Webex, so the platform dimension never
// changes which images appear — it changes the INTENT and the COPY:
//   - a unique title/description/H1 targeting "{platform} backgrounds" queries
//   - platform-specific setup steps (rendered visibly AND as HowTo schema)
//   - platform-specific FAQs
//
// This is what makes /zoom-backgrounds/office and /google-meet-backgrounds/office
// legitimately distinct pages rather than duplicates: they answer different
// searches ("zoom office background" ≠ "google meet office background") with
// genuinely different setup guidance, while sharing the same curated image grid.
//
// Field contract:
//   slug        URL segment (/{slug}) + /{slug}/{theme}. Matches the head query.
//   name        Full product name. ("Microsoft Teams")
//   shortName   Compact name for tight UI. ("Teams")
//   queryWord   How the platform appears in a title before "Backgrounds".
//   eyebrow     Uppercase kicker.
//   title       Landing-page <title>. 20–65 chars (validated).
//   description Landing-page meta description. 110–160 chars (validated).
//   h1          Landing-page H1.
//   intro       Array of platform-specific body paragraphs (landing page).
//   setupHeading / setupSteps   Rendered how-to + HowTo schema.
//   faqs        Platform-specific Q&A (visible + FAQPage schema).
//   featuredCategories  Category slugs surfaced as "works great for {platform}".

const PLATFORMS = [
  {
    slug: 'zoom-backgrounds',
    name: 'Zoom',
    shortName: 'Zoom',
    queryWord: 'Zoom',
    eyebrow: 'For Zoom',
    title: 'Zoom Virtual Backgrounds — Studio-Designed | MeetBackdrops',
    description:
      'Studio-designed virtual backgrounds for Zoom, composed for camera and tuned for codec compression so they stay crisp on calls. Free samples, instant download.',
    h1: 'Virtual Backgrounds for Zoom',
    intro: [
      'Zoom’s virtual background feature is only as good as the image you feed it — a flat stock photo gives you away the moment you move, while an environment composed for camera holds its depth and looks like a real room behind you. Every background here is studio-designed and 4K-upscaled specifically so it survives Zoom’s compression and its automatic edge-detection.',
      'Zoom applies a custom background without a green screen on most modern machines, so you can drop any of these images straight into Settings and be on-brand in seconds. Browse by the kind of space you need below, or pick a look tailored to your profession.',
    ],
    setupHeading: 'How to add a background on Zoom',
    setupSteps: [
      'Download any background as a PNG (free — no signup).',
      'Open Zoom and go to Settings → Backgrounds & Effects.',
      'Under Virtual Backgrounds, click the + and choose Add Image.',
      'Select the PNG you downloaded — it applies instantly.',
      'For the sharpest result, use a plain wall behind you and even, front-facing light.',
    ],
    faqs: [
      {
        question: 'How do I add a virtual background on Zoom?',
        answer:
          'Download the background as a PNG, then in Zoom open Settings → Backgrounds & Effects, click the + next to Virtual Backgrounds, choose Add Image, and select the file. It applies immediately and stays available for future calls. No green screen is needed on most computers made in the last few years.',
      },
      {
        question: 'What size should a Zoom background be?',
        answer:
          'Zoom recommends a 16:9 image, ideally 1920×1080 or larger. Every free background here is delivered at 1456×816 (16:9) and the HD editions at 2912×1632, both of which fill a Zoom call cleanly. Matching 16:9 avoids the stretching or cropping you get from square or portrait images.',
      },
      {
        question: 'Why does my Zoom background look blurry?',
        answer:
          'Blur usually comes from a low-resolution source image or a weak connection forcing Zoom to compress harder. Start with a properly sized 16:9 image (these are), improve your lighting, and if you present on a large monitor or record calls, use the HD edition — the extra resolution is what stays sharp after compression.',
      },
      {
        question: 'Are these Zoom backgrounds free?',
        answer:
          'Yes. The full library is free to download and use, with no signup and no watermark. Higher-resolution HD editions are available to buy for large monitors, recordings, and print, but the free versions are ready for everyday Zoom calls.',
      },
    ],
    featuredCategories: ['office-spaces', 'bookshelves', 'home-office', 'neutral-backgrounds'],
  },
  {
    slug: 'google-meet-backgrounds',
    name: 'Google Meet',
    shortName: 'Meet',
    queryWord: 'Google Meet',
    eyebrow: 'For Google Meet',
    title: 'Google Meet Virtual Backgrounds | MeetBackdrops',
    description:
      'Studio-designed virtual backgrounds for Google Meet, composed for camera so they stay crisp on calls. Free samples, no signup, instant PNG download.',
    h1: 'Virtual Backgrounds for Google Meet',
    intro: [
      'Google Meet lets you replace your background right from the browser, but it leans hard on a clean, high-quality source image to keep your edges sharp. These environments are studio-designed and 4K-upscaled so Meet’s in-browser segmentation has something crisp to work with, instead of the soft halo you get from a random stock photo.',
      'Meet accepts custom background images through its visual-effects panel on desktop Chrome. Download any PNG below and upload it once — it stays in your Meet effects for every future call. Browse by space or by profession to find the right fit.',
    ],
    setupHeading: 'How to add a background on Google Meet',
    setupSteps: [
      'Download any background as a PNG (free — no signup).',
      'Join or start a Google Meet call in Chrome on desktop.',
      'Click the visual-effects icon at the bottom-right of your self-view.',
      'Open the Backgrounds tab and click the + to upload your PNG.',
      'Select it to apply — Meet remembers it for future calls.',
    ],
    faqs: [
      {
        question: 'How do I change my background on Google Meet?',
        answer:
          'In a Meet call on desktop Chrome, click the visual-effects icon at the bottom-right of your self-view, open the Backgrounds tab, and use the + button to upload the PNG you downloaded. Select it and it applies instantly. Uploaded backgrounds stay available in your effects panel for later calls.',
      },
      {
        question: 'Can I upload a custom background to Google Meet?',
        answer:
          'Yes, on desktop Chrome you can upload your own image through the Backgrounds tab in the visual-effects panel. Custom uploads are more limited on mobile and are sometimes restricted by Google Workspace admins, so if you don’t see the option, check with your organization’s admin.',
      },
      {
        question: 'What size should a Google Meet background be?',
        answer:
          'Use a 16:9 image at 1920×1080 or higher for the best result. The free backgrounds here are 1456×816 (16:9) and HD editions are 2912×1632 — both fill a Meet call without stretching. A correctly proportioned image is what keeps your edges clean.',
      },
      {
        question: 'Are these Google Meet backgrounds free?',
        answer:
          'Yes — the whole library is free, with no signup and no watermark. Optional HD editions add resolution for large monitors and recordings, but the free PNGs are ready to upload to Meet as-is.',
      },
    ],
    featuredCategories: ['office-spaces', 'home-office', 'neutral-backgrounds', 'bookshelves'],
  },
  {
    slug: 'microsoft-teams-backgrounds',
    name: 'Microsoft Teams',
    shortName: 'Teams',
    queryWord: 'Teams',
    eyebrow: 'For Microsoft Teams',
    title: 'Microsoft Teams Virtual Backgrounds | MeetBackdrops',
    description:
      'Studio-designed virtual backgrounds for Microsoft Teams, composed for camera and tuned for compression. Free samples, no signup, instant PNG download.',
    h1: 'Virtual Backgrounds for Microsoft Teams',
    intro: [
      'Microsoft Teams applies background effects with no green screen, but it rewards a clean, well-composed source image — the difference between a background that looks intentional and one that flickers at your shoulders. These environments are studio-designed and 4K-upscaled so they hold up under Teams’ processing on both the desktop app and Teams on the web.',
      'Adding a custom background to Teams takes one upload and it stays in your effects list for good. Download any PNG below, add it once, and reuse it on every call. Browse by the kind of space you want or by what you do for a living.',
    ],
    setupHeading: 'How to add a background on Microsoft Teams',
    setupSteps: [
      'Download any background as a PNG (free — no signup).',
      'Before joining, click Background filters on the pre-join screen — or in a call, open More → Apply background effects.',
      'Click Add new and select the PNG you downloaded.',
      'Choose the uploaded image to apply it.',
      'Use even, front-facing light and a simple real background for the cleanest edges.',
    ],
    faqs: [
      {
        question: 'How do I add a custom background in Microsoft Teams?',
        answer:
          'On the pre-join screen click Background filters, or in a call open More → Apply background effects. Click Add new, upload the PNG you downloaded, and select it. Teams keeps custom uploads in your effects list, so you only add each background once.',
      },
      {
        question: 'Where does Teams store uploaded backgrounds?',
        answer:
          'Teams saves custom uploads to your local Uploads folder for the effects panel, so once you add a background it appears every time you open background effects on that device. If you switch computers you’ll need to upload it again.',
      },
      {
        question: 'What size should a Microsoft Teams background be?',
        answer:
          'A 16:9 image at 1920×1080 or larger works best. The free backgrounds here are 1456×816 (16:9) and HD editions are 2912×1632 — both fit a Teams call without cropping. Sticking to 16:9 avoids the letterboxing you get from off-ratio images.',
      },
      {
        question: 'Are these Microsoft Teams backgrounds free?',
        answer:
          'Yes. Every background is free to download and use with no signup or watermark. HD editions are available for large displays, recordings, and Teams Premium scenarios, but the free PNGs are ready for standard Teams calls.',
      },
    ],
    featuredCategories: ['office-spaces', 'bookshelves', 'home-office', 'conference-room'],
  },
  {
    slug: 'webex-backgrounds',
    name: 'Webex',
    shortName: 'Webex',
    queryWord: 'Webex',
    eyebrow: 'For Webex',
    title: 'Webex Virtual Backgrounds — Studio-Designed | MeetBackdrops',
    description:
      'Studio-designed virtual backgrounds for Cisco Webex, composed for camera so they stay crisp on calls. Free samples, no signup, instant PNG download.',
    h1: 'Virtual Backgrounds for Webex',
    intro: [
      'Cisco Webex supports custom virtual backgrounds across its desktop and mobile apps, and like every platform it looks best with a clean, purpose-composed image behind you. These environments are studio-designed and 4K-upscaled so they read as a real space on Webex rather than a pasted-on photo.',
      'Adding your own background to Webex takes a single upload from the video preview. Download any PNG below, add it once, and it’s ready for every meeting. Browse by the type of space you need or by your profession.',
    ],
    setupHeading: 'How to add a background on Webex',
    setupSteps: [
      'Download any background as a PNG (free — no signup).',
      'In Webex, open the video preview before joining, or Video options in a meeting.',
      'Choose Change background.',
      'Click Add and select the PNG you downloaded.',
      'Apply it — Webex keeps it available for later meetings.',
    ],
    faqs: [
      {
        question: 'How do I add a virtual background in Webex?',
        answer:
          'From the Webex video preview before a meeting (or Video options during one), choose Change background, click Add, and select the PNG you downloaded. Apply it and Webex stores it for future meetings. No green screen is required on supported devices.',
      },
      {
        question: 'What size should a Webex background be?',
        answer:
          'Use a 16:9 image at 1920×1080 or higher. The free backgrounds here are 1456×816 (16:9) and HD editions are 2912×1632 — both fill a Webex call cleanly. A 16:9 source prevents stretching or cropping.',
      },
      {
        question: 'Do these work on Webex mobile as well as desktop?',
        answer:
          'Yes — the images are standard 16:9 PNGs, which Webex accepts as custom backgrounds on both desktop and its mobile apps. The exact menu wording varies by version, but the upload step is the same: add the image, then select it.',
      },
      {
        question: 'Are these Webex backgrounds free?',
        answer:
          'Yes. The full library is free to download and use, with no signup and no watermark. HD editions add resolution for large monitors and recordings, but the free PNGs are ready for everyday Webex meetings.',
      },
    ],
    featuredCategories: ['office-spaces', 'bookshelves', 'home-office', 'neutral-backgrounds'],
  },
];

// Self-policing meta budgets, mirroring data/collections/personas.js. Any
// platform whose title/description falls outside the indexable budget throws at
// module load, failing the build loudly rather than shipping a bad <title>.
function validatePlatforms(defs) {
  const seen = new Set();
  for (const d of defs) {
    if (!d.slug || seen.has(d.slug)) {
      throw new Error(`platforms: missing or duplicate slug "${d.slug}"`);
    }
    seen.add(d.slug);
    if (typeof d.title !== 'string' || d.title.length < 20 || d.title.length > 65) {
      throw new Error(`platforms: "${d.slug}" title length ${d.title?.length} outside 20–65`);
    }
    if (typeof d.description !== 'string' || d.description.length < 110 || d.description.length > 160) {
      throw new Error(`platforms: "${d.slug}" description length ${d.description?.length} outside 110–160`);
    }
    if (!d.h1 || !Array.isArray(d.intro) || d.intro.length === 0) {
      throw new Error(`platforms: "${d.slug}" missing h1/intro`);
    }
    if (!Array.isArray(d.setupSteps) || d.setupSteps.length < 3) {
      throw new Error(`platforms: "${d.slug}" needs at least 3 setupSteps`);
    }
  }
  return defs;
}

module.exports = { PLATFORMS: validatePlatforms(PLATFORMS) };
