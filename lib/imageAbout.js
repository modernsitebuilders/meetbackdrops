/**
 * "About this background" copy for individual image pages.
 *
 * Built from two per-image sources, so no two pages read the same:
 *   - the manifest entry (alt text = what's in the frame; tags = mood,
 *     materials, use cases), and
 *   - data/imageVisualFacts.json — measured from the image's own pixels by
 *     scripts/generate-image-visual-facts.js (brightness, colour temperature,
 *     dominant colours, how busy the centre of the frame is).
 *
 * The on-camera advice (what to wear, how to light yourself, whether the
 * centre competes with your face) follows from those measurements. Runs in
 * getStaticProps only, so the facts file never reaches the client bundle.
 * CommonJS to match lib/imagePageMeta.js.
 */

let FACTS = null;
function facts() {
  if (!FACTS) {
    try { FACTS = require('../data/imageVisualFacts.json'); } catch { FACTS = {}; }
  }
  return FACTS;
}

// Tags that describe the listing rather than the room — never shown.
const NOISE = new Set([
  'composition', 'interior', 'lighting', 'professional', 'studio-designed',
  'high-fidelity', 'video call background', 'color palette', 'decor',
  'interior design', 'design', 'light', 'background', 'virtual background',
]);
const USE_CASE = /meeting|call|standup|presentation|remote work|interview|webinar|conference|teach|class|lecture|podcast|recording|work from home|hybrid/;
const MOOD = new Set([
  'cozy', 'serene', 'calm', 'elegant', 'sophisticated', 'inviting', 'relaxed',
  'minimalist', 'modern', 'contemporary', 'rustic', 'industrial', 'luxurious',
  'luxury', 'clean', 'tranquil', 'peaceful', 'warm', 'bright', 'airy',
  'stylish', 'refined', 'polished', 'festive', 'moody', 'dramatic', 'classic',
  'traditional', 'timeless', 'welcoming', 'comfortable', 'spacious', 'corporate',
  'executive', 'natural', 'organic', 'playful', 'vibrant', 'zen', 'scandinavian',
  'mid-century', 'bohemian', 'coastal', 'urban',
]);
const LIGHT = /light|lit|shadow|bokeh|glow|sun|lamp|candle/;
// Colour/feel words: covered by the measured colours and the Style row, so
// they'd only repeat themselves under "In the scene".
const NOT_A_FEATURE = /tone|palette|atmosphere|ambiance|ambience|texture|textured|neutral|colou?rs?$|warmth|feel|vibe/;

// "dark brown" and "brown" in one list reads as a stutter; keep the first.
function dedupeColours(colours = []) {
  const out = [];
  for (const c of colours) {
    const base = c.split(' ').pop();
    if (!out.some((o) => o.split(' ').pop() === base)) out.push(c);
  }
  return out;
}

function listify(items) {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

function cap(s) { return s ? s[0].toUpperCase() + s.slice(1) : s; }

function sceneSentence(f) {
  const tone =
    f.brightness < 80 ? 'a dark, low-key scene'
    : f.brightness < 120 ? 'a deep mid-tone scene'
    : f.brightness < 170 ? 'a balanced mid-tone scene'
    : 'a bright, high-key scene';
  const cast =
    f.warmth > 40 ? 'a warm, golden cast'
    : f.warmth > 12 ? 'a slightly warm cast'
    : f.warmth < -12 ? 'a cool cast'
    : 'neutral color';
  const colours = f.colours?.length ? `, mostly ${listify(f.colours)}` : '';
  return `${cap(tone)} with ${cast}${colours}.`;
}

function wearSentence(f) {
  if (f.brightness >= 170) {
    return 'Navy, charcoal, or a saturated color separates you from the bright wall; white or pale tops tend to blend into it.';
  }
  if (f.brightness < 80) {
    return 'Lighter or brighter tops stand out against the dark scene; black or very dark clothing can make your shoulders fade into it.';
  }
  const main = f.colours?.[0];
  return main
    ? `Most clothing works against it. Just avoid matching the ${main} that fills most of the frame.`
    : 'Most clothing works against it.';
}

function lightSentence(f) {
  const level = f.brightness < 80
    ? 'Softer, lower light on your face matches this scene better than a bright ring light, which can make you look pasted on.'
    : f.brightness >= 170
      ? 'Bright, even light from the front matches this scene; if you sit in shadow, the contrast with the wall gives the composite away.'
      : 'Even, moderate front light matches this scene.';
  const temp = f.warmth > 25
    ? ' A warm-white lamp suits its color better than cool daylight LEDs.'
    : f.warmth < -12
      ? ' Daylight or cool-white light suits its color better than a warm bulb.'
      : '';
  return level + temp;
}

function centreSentence(f) {
  if (f.centreDetail <= 12) {
    return 'The centre of the frame, where you sit, is plain, so nothing competes with your face.';
  }
  if (f.centreDetail >= 45) {
    return 'The centre of the frame is detailed, which gives the scene depth right behind you. Pick a plainer background if you want nothing competing with your face.';
  }
  return null;
}

function buildImageAbout(image, categoryName) {
  const raw = facts()[image.slug] || null;
  const f = raw && { ...raw, colours: dedupeColours(raw.colours) };
  const tags = (image.tags || []).map((t) => t.toLowerCase().trim()).filter((t) => t && !NOISE.has(t));

  const useCases = tags.filter((t) => USE_CASE.test(t));
  const moods = tags.filter((t) => MOOD.has(t));
  const lightTags = tags.filter((t) => !USE_CASE.test(t) && !MOOD.has(t) && LIGHT.test(t));
  const features = tags.filter((t) => !USE_CASE.test(t) && !MOOD.has(t) && !LIGHT.test(t) && !NOT_A_FEATURE.test(t));

  const details = [];
  details.push(['Category', categoryName]);
  if (moods.length) details.push(['Style', listify(moods.slice(0, 4))]);
  if (lightTags.length) details.push(['Light', listify(lightTags.slice(0, 3))]);
  if (f?.colours?.length) details.push(['Main colors', listify(f.colours)]);
  if (features.length) details.push(['In the scene', listify(features.slice(0, 5))]);
  if (useCases.length) details.push(['Suits', listify(useCases.slice(0, 3))]);

  const onCamera = f ? [wearSentence(f), lightSentence(f), centreSentence(f)].filter(Boolean) : [];

  return {
    inFrame: image.alt || null,
    scene: f ? sceneSentence(f) : null,
    onCamera,
    details,
  };
}

module.exports = { buildImageAbout };
