// data/collections/themeFaqs.js
//
// Genuine, theme-specific FAQs for the standalone theme collection pages
// (/backgrounds/{theme}). Rendered visibly via FaqAccordion AND emitted as
// FAQPage schema (lib/collections/themeEngine.js → themeCollectionSeo), so the
// visible-content ↔ structured-data cross-check matches.
//
// These are NOT templated. Each answers a real question a searcher for that
// style would ask — the point of the theme page is quality curation + genuine
// guidance, not another generated URL. CommonJS so the engine can read it.

const THEME_FAQS = {
  office: [
    {
      question: 'What makes a good office virtual background for video calls?',
      answer: 'The best office backgrounds have real depth — a sense of a room receding behind you rather than a flat wall — and enough visual calm that they don’t compete with your face. These are composed and lit for exactly that, so they read as a genuine workspace on camera instead of a pasted-in photo.',
    },
    {
      question: 'Are office backgrounds too formal for casual team calls?',
      answer: 'A clean office reads as professional without being stuffy, which is why it’s the safe default for almost any call. If you want something warmer for internal or one-to-one meetings, the home office and cozy collections dial the formality down while staying tidy.',
    },
    {
      question: 'Do these office backgrounds work without a green screen?',
      answer: 'Yes. Zoom, Teams, Google Meet, and Webex all separate you from your real background without a green screen on most recent computers. Even, front-facing light and a simple real wall behind you give the cleanest edges.',
    },
  ],
  bookshelf: [
    {
      question: 'Why are bookshelf backgrounds so popular for professional calls?',
      answer: 'A wall of books reads as knowledgeable and established the instant a call connects, without pulling focus the way a busy scene does. That quiet credibility is why bookshelves are the single most requested professional backdrop for lawyers, academics, advisors, and executives.',
    },
    {
      question: 'Will the book titles look blurry or distracting on camera?',
      answer: 'These shelves are arranged and lit so the spines stay legible-but-calm and hold their detail through webcam compression. For large monitors or recorded calls where softness shows most, the HD editions keep the shelves crisp.',
    },
    {
      question: 'What’s the difference between the bookshelf and library themes?',
      answer: 'Bookshelf backgrounds frame a wall or section of shelving close behind you; the library theme uses full rooms of floor-to-ceiling shelves for a grander, more academic feel. Both signal expertise — pick by how much room you want behind you.',
    },
  ],
  'home-office': [
    {
      question: 'How do I look professional on a work-from-home call?',
      answer: 'A home office background threads the needle: it looks like a real, tidy workspace rather than a corporate set, so you come across as professional but human. These pair a genuine desk-and-shelf sense of place with clean sightlines and no clutter.',
    },
    {
      question: 'Are home office backgrounds good for client meetings?',
      answer: 'Yes, especially for freelancers, consultants, and hybrid workers where a warm, personal workspace builds rapport. If the client is more formal, the office or executive themes lean more corporate.',
    },
    {
      question: 'Do these hide a messy real room behind me?',
      answer: 'That’s exactly what a virtual background is for — it replaces whatever is actually behind you with a clean, composed scene. For the sharpest edges, sit in front of a plain section of wall with even light on your face.',
    },
  ],
  executive: [
    {
      question: 'What virtual background projects authority on a call?',
      answer: 'Refined, senior-level spaces — paneled offices, established boardrooms, quietly expensive interiors — read as in-command before you say a word. These executive environments are composed to feel authoritative without being showy, which is what actually signals seniority.',
    },
    {
      question: 'Are executive backgrounds right for board and investor calls?',
      answer: 'Yes — they’re built for exactly the moments where the room behind you is part of the message: boards, buyers, investors, and senior stakeholders. The look is deliberately restrained so it reinforces credibility rather than trying too hard.',
    },
    {
      question: 'What’s the difference between executive and office backgrounds?',
      answer: 'Every executive background is an office, but not every office is executive. The executive theme filters to the most senior, refined spaces; the office theme is the broader, more everyday professional set.',
    },
  ],
  minimalist: [
    {
      question: 'Why choose a minimalist virtual background?',
      answer: 'A minimalist background keeps every bit of attention on you — clean lines, neutral walls, and negative space give the eye nothing to wander toward. It’s the strongest choice for high-stakes calls where you want zero distraction, and it compresses cleanly on any connection.',
    },
    {
      question: 'Is a minimalist background too plain or boring?',
      answer: 'Minimal isn’t empty — these use subtle architecture, texture, and light to stay interesting while remaining calm. If you want a touch more warmth or character, the modern and neutral themes are close neighbours.',
    },
    {
      question: 'Do minimalist backgrounds flatter you on camera?',
      answer: 'Yes — uncluttered, evenly-toned backgrounds help your webcam expose your face correctly and keep skin tones natural, rather than fighting a busy or high-contrast scene behind you.',
    },
  ],
  modern: [
    {
      question: 'What is a modern virtual background?',
      answer: 'Modern backgrounds use contemporary architecture, clean design, and good light to read as current and intentional. Think design-forward offices and lofts — the visual language of a team that cares about how things are made, which is why they suit tech, product, and creative work.',
    },
    {
      question: 'Will a modern background look dated in a year?',
      answer: 'These lean on timeless contemporary design rather than trend-of-the-moment gimmicks, so they age well. If you want something even more neutral and future-proof, the minimalist theme strips it back further.',
    },
    {
      question: 'Do modern backgrounds work for non-tech professionals?',
      answer: 'Absolutely — anyone who wants to look current and considered benefits from a clean, design-forward space. They’re a strong default for sales, consulting, and any client-facing role.',
    },
  ],
  'conference-room': [
    {
      question: 'When should I use a conference room background?',
      answer: 'A conference-room background frames you as if you’ve stepped into a real meeting space, which is useful for group calls, presentations, and any moment you want to feel institutionally backed rather than home-alone. The architectural depth makes a solo call look like a workplace.',
    },
    {
      question: 'Are conference room backgrounds good for presentations and webinars?',
      answer: 'Yes — they lend a sense of a real, staffed office behind you, which adds authority when you’re presenting or hosting a webinar. Pair with even lighting so the room’s depth reads without softening your edges.',
    },
    {
      question: 'Do these look convincing or obviously fake?',
      answer: 'They carry enough real architectural depth to read as a genuine boardroom rather than a flat backdrop, while staying calm enough not to distract. A plain real wall and steady light behind you make the effect most convincing.',
    },
  ],
  library: [
    {
      question: 'Who should use a library virtual background?',
      answer: 'Library backgrounds read as academic, thoughtful, and deeply credentialed, which makes them a favourite of educators, researchers, authors, and anyone whose authority rests on expertise. Full rooms of floor-to-ceiling shelving signal “well-read” at a glance.',
    },
    {
      question: 'Are library backgrounds good for teaching and lectures online?',
      answer: 'Very — a calm, book-lined room keeps students focused on the lesson while quietly reinforcing your subject authority. Warm lighting keeps it inviting rather than austere.',
    },
    {
      question: 'Library vs bookshelf — which should I pick?',
      answer: 'The library theme uses whole rooms of shelving for a grander, more scholarly feel; the bookshelf theme frames a closer wall or section of shelves. Choose the library look when you want more room and gravitas behind you.',
    },
  ],
  neutral: [
    {
      question: 'What is a neutral virtual background?',
      answer: 'Neutral backgrounds are plain, softly-toned walls — off-white, greige, soft gray — that give you a clean, distraction-free frame. They’re the closest thing to a physical seamless studio backdrop and never compete with what you’re saying.',
    },
    {
      question: 'Are neutral backgrounds the most professional choice?',
      answer: 'They’re the safest, most universally appropriate option — impossible to read as too casual or too flashy — which is why they suit interviews, healthcare, and formal calls. If you want a little more character, the minimalist and office themes add subtle detail.',
    },
    {
      question: 'Do plain backgrounds help with bad lighting or small rooms?',
      answer: 'Yes — a plain, even-toned background is the most forgiving on a webcam and hides a cramped or messy real room completely. Add front-facing light and you’ll look clean on almost any setup.',
    },
  ],
  cozy: [
    {
      question: 'When is a cozy background the right choice?',
      answer: 'Cozy backgrounds lower the temperature of a call — warm light, natural materials, lived-in comfort — so you come across as approachable rather than formal. They’re ideal for coaching, counselling, mentoring, and any conversation where you want the other person to relax and open up.',
    },
    {
      question: 'Are cozy backgrounds professional enough for work calls?',
      answer: 'For client-facing warmth, coaching, and internal calls, yes — approachable is a strength there. For board-level or first-impression formal meetings, the office or executive themes set a more corporate tone.',
    },
    {
      question: 'What makes a background feel cozy on camera?',
      answer: 'Warm colour temperature, soft light, wood and textile textures, and a lived-in (not cluttered) sense of home. These are curated for that feel while keeping your sightlines clean so you still stand out clearly.',
    },
  ],
  bright: [
    {
      question: 'Why use a bright, airy background?',
      answer: 'Bright backgrounds make you look more awake and energetic by surrounding you with light — big windows, pale palettes, open sightlines lift the whole frame. They’re a strong choice for early calls, sales, and any time you want to project optimism and momentum.',
    },
    {
      question: 'Will a bright background wash me out on camera?',
      answer: 'Not if your own lighting matches — keep a light source on your face so you’re as well-lit as the scene behind you. When your foreground and background brightness are balanced, a bright backdrop is very flattering.',
    },
    {
      question: 'Are bright backgrounds good for morning meetings?',
      answer: 'They’re perfect for them — a light-filled room reads as fresh and energetic, which sets the right tone first thing. They also help on gloomy days when your real room feels dark.',
    },
  ],
  creative: [
    {
      question: 'What is a creative studio background?',
      answer: 'Creative backgrounds trade corporate polish for character — exposed brick, gallery walls, studio light, spaces that say the work is interesting. They suit designers, agencies, artists, and founders who’d rather look original than institutional.',
    },
    {
      question: 'Are creative backgrounds appropriate for client calls?',
      answer: 'For creative and design-led work they’re an asset — they signal taste and originality to the right clients. If a particular client is conservative, keep the office or minimalist themes on hand for those calls.',
    },
    {
      question: 'Do busy creative backgrounds distract from what I’m saying?',
      answer: 'These are chosen to have character without chaos — texture and interest, but composed so they hold together on camera and don’t pull focus from you. Good lighting on your face keeps you as the clear subject.',
    },
  ],
};

function getThemeFaqs(slug) {
  return THEME_FAQS[slug] || [];
}

module.exports = { THEME_FAQS, getThemeFaqs };
