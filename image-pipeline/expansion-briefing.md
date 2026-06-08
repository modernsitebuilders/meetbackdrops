# MeetBackdrops — Library Expansion Briefing

**Purpose:** Hand-off spec for a prompt-writing AI. This document identifies the
background *types* the library should add to become the optimal SEO library for
working professionals on Zoom, Microsoft Teams, and Google Meet. It is **not**
restricted to existing categories — the image pipeline assigns category later.

**Brand guardrails (must hold for every prompt):** Corporate / executive video
presence. Never gamer/streamer/Twitch framing. Virtual sets *designed for camera*.
See `CLAUDE.md`.

---

## 1. What the library already has (June 2026)

1,200 images / 20 categories. Strong on generic interiors and major seasonals:

- **Interiors (well covered):** office-spaces (194), bookshelves (151),
  wall-shelves (90), home-office (82), coffee-shops (55), urban-lofts (54),
  living-rooms (45), libraries (31), kitchens (29), art-galleries (29),
  historic-spaces (24)
- **Outdoor/nature:** nature-landscapes (37), gardens-patios (32)
- **Seasonal:** christmas (89), easter (76), summer (66), spring (40),
  halloween (17), valentines (9)
- **Artistic:** bokeh (50)

### The strategic problem
The library is deep on *generic decor interiors* but thin-to-absent on the
**highest-intent professional search clusters** and has **glaring seasonal holes**.
Working professionals overwhelmingly search for *understated, role-specific, and
context-matched* backgrounds — exactly where we're weakest.

---

## 2. Production rules that apply to EVERY idea below

The prompt-writer must bake these into every prompt regardless of theme:

1. **Center "talking-head" safe zone.** The middle third of the frame (where the
   speaker's head and shoulders sit) must be calm and uncluttered. Push all visual
   interest — shelves, windows, plants, art — to the left/right edges and the
   upper corners.
2. **Webcam eye-line.** Compose at seated eye level, as a webcam sees it. Not a
   wide architectural hero shot, not a ceiling/floor-heavy frame.
3. **Realistic depth.** Slight background depth-of-field blur reads as a real room,
   not a poster. Avoid perfectly flat, edge-to-edge sharpness.
4. **16:9 horizontal**, high resolution, photographic (not illustration, not 3D
   render look) unless the theme is explicitly artistic/abstract.
5. **No people. No readable text, brand names, or logos.** No legible book spines
   that resolve to real titles/brands. No clocks showing a time.
6. **Codec-friendly.** Avoid heavy fine-grain noise, busy micro-patterns, or
   tight repeating textures near center — they compress badly on video calls.
7. **Tasteful and neutral-professional** by default; quirky/casual only where the
   theme calls for it.

Across each theme, **vary these axes** to maximize coverage from one brief:
lighting (bright daylight ↔ warm moody evening), color temperature (cool ↔ warm),
palette (neutral/greige ↔ richer accent), density (minimalist ↔ styled), and
left- vs right-weighted composition.

---

## 3. TIER 1 — Highest priority (big search volume × clear pro intent × missing)

These are the biggest ROI additions. Build these first.

### 1.1 Neutral / minimalist plain-wall backgrounds  ⭐ #1 GAP
- **Why:** Every "what's the best background" guide in 2026 lands on the same
  answer — *understated and neutral wins.* This is the single largest professional
  keyword cluster and we have almost nothing purpose-built for it.
- **Target keywords:** neutral zoom background, plain professional background,
  simple zoom background, minimalist virtual background, off-white wall background,
  gray wall video call background, taupe / greige background.
- **Visual direction:** Soft solid or subtly-textured walls — off-white, warm
  greige, light gray, muted taupe, soft sage. Gentle, even, slightly directional
  light with a soft natural shadow gradient (not flat). Optional *single* restrained
  element far to one side: one framed print, one sconce, a sliver of plant. Plaster,
  limewash, matte paint, fine linen-textured wall, subtle vertical paneling.
- **Suggested count:** 50–70 (this is a flagship, high-traffic page).

### 1.2 Job-interview backgrounds
- **Why:** Job seekers are a massive, high-intent, recurring audience ("zoom
  background for interview" is a perennial top query). Distinct search intent from
  1.1 even though visuals overlap.
- **Target keywords:** zoom background for job interview, professional interview
  background, background for video interview, interview zoom background, remote
  interview backdrop.
- **Visual direction:** Clean desk corner + soft off-white/light-gray wall + simple
  floating shelf with 2–3 styled objects + one plant. "Intentional but understated."
  Convey competence and order. Slightly warmer/home-credible than a corporate tower.
- **Suggested count:** 25–35.

### 1.3 Telehealth — therapy / counseling office
- **Why:** Behavioral-health telehealth is a booming, durable vertical with
  providers who do *every* session on camera and actively search for backdrops.
- **Target keywords:** telehealth background, therapist office background,
  counseling office zoom background, teletherapy background, mental health
  virtual background, psychologist office background.
- **Visual direction:** Warm, calming, safe. Soft armchair / two-chair setup at the
  edge, bookcase with a lamp, healthy houseplant, soft textiles, framed (non-legible)
  credentials, muted earthy palette. Soft warm light. Nothing clinical-cold.
- **Suggested count:** 25–35.

### 1.4 Telehealth — medical / clinical office
- **Why:** Telemedicine for physicians, NPs, dentists, specialists. Different
  aesthetic from therapy (clinical credibility, not coziness).
- **Target keywords:** telemedicine background, doctor office virtual background,
  medical office background, telehealth doctor background, clinical office backdrop.
- **Visual direction:** Tidy clinical desk, clean light walls, a discreet anatomical
  or eye-chart hint to one side, framed diplomas (non-legible), subtle medical-cabinet
  glassware, cool-neutral palette, crisp even light. Professional, sterile-adjacent
  but warm enough to be reassuring.
- **Suggested count:** 20–30.

### 1.5 Conference room / boardroom (dedicated push)
- **Why:** "Conference room background" and "boardroom background" are high-intent
  meeting queries. We have these inside office-spaces but should go deep — context
  congruence (look like you're *in a meeting*) is the stated 2026 golden rule.
- **Target keywords:** conference room background, boardroom zoom background,
  meeting room virtual background, executive boardroom backdrop.
- **Visual direction:** Long table edge leading out of frame, upholstered chairs,
  a (blank) wall display or whiteboard to the side, glass partition, city or warm
  wood backdrop. Vary scale: intimate huddle room ↔ formal boardroom.
- **Suggested count:** 25–35.

### 1.6 City skyline / floor-to-ceiling window office  ⭐
- **Why:** Validated high-demand "executive" look — skyscraper office, panoramic
  city view. Aspirational, sells the "important person" frame. Currently scattered,
  not a real collection.
- **Target keywords:** city view zoom background, skyline office background, high
  rise office window background, executive office city view, downtown office backdrop.
- **Visual direction:** Floor-to-ceiling windows with a soft-focus city skyline
  (generic, no identifiable landmarks/brands), sleek desk edge, daytime *and* dusk/
  golden-hour *and* night-lights variants. Keep the bright window off-center so the
  speaker isn't backlit into silhouette.
- **Suggested count:** 30–40.

### 1.7 Fall / Autumn + Thanksgiving  ⭐ SEASONAL HOLE
- **Why:** We have spring and summer but **no fall** — a glaring gap given autumn is
  one of the most-loved seasonal aesthetics and Thanksgiving drives a big Q4 spike.
- **Target keywords:** fall zoom background, autumn virtual background, thanksgiving
  zoom background, cozy autumn office background, fall foliage video call background.
- **Visual direction:** Warm rust/amber/ochre palette. Two streams: (a) **subtle
  professional fall** — warm-lit office/home-office with autumn foliage through a
  window, pumpkins/gourds styled discreetly to the side; (b) **cozy autumn** — fireside
  den, blankets, warm cabin. Keep most of the set professional-appropriate.
- **Suggested count:** 40–55 (closes the seasonal calendar and lands the Q4 spike).

---

## 4. TIER 2 — Strong professional verticals (role-specific, durable demand)

### 2.1 Law office / attorney
- **Keywords:** law office background, attorney zoom background, lawyer virtual
  background, legal office backdrop.
- **Direction:** Wood-paneled walls, rows of (non-legible) law reporters, leather
  chair, brass lamp, framed diploma wall, restrained scales-of-justice motif.
  Authority, tradition, gravitas. Suggested: 20–30.

### 2.2 Classroom / teacher / educator
- **Keywords:** teacher zoom background, virtual classroom background, classroom
  zoom background for teachers, online teaching background, educator backdrop.
- **Direction:** Friendly real-classroom feel — blank whiteboard, tidy bookshelves,
  reading nook, world map / supplies to the side, bright welcoming light. Keep it
  professional-warm, not childish-cartoon. Suggested: 25–35.

### 2.3 Plant / biophilic / greenery
- **Keywords:** plant zoom background, greenery virtual background, indoor plants
  background, biophilic office background, jungle plant backdrop.
- **Direction:** Lush but composed — monstera, fiddle-leaf fig, trailing pothos,
  green plant wall, against neutral wall with a calm center zone. Fresh, modern,
  "this person has their life together." Suggested: 25–35.

### 2.4 Executive / luxury / corner office
- **Keywords:** executive office background, luxury office zoom background, CEO
  office backdrop, corner office virtual background.
- **Direction:** Walnut and leather, brass accents, curated art, sculptural lamp,
  premium materials, moody warm light. The high-end of the office spectrum.
  Suggested: 20–30.

### 2.5 Modern tech / startup / collaborative office
- **Keywords:** startup office background, modern tech office zoom background,
  creative office backdrop, collaborative workspace background.
- **Direction:** Glass partitions, blank whiteboards, soft breakout seating, warm
  wood + plants + concrete, bright airy light. Younger, energetic-but-tidy.
  Suggested: 20–30.

### 2.6 Podcast / studio / interview set
- **Keywords:** podcast background, studio zoom background, interview set
  background, recording studio backdrop, content creator background.
- **Direction:** Acoustic panels (geometric, tasteful), warm accent/RGB-free
  ambient lighting, a (non-brand) mic hint to the edge, shelf of styled objects,
  moody-but-clean. *Keep it corporate-creator, not gamer.* Suggested: 20–25.

### 2.7 Hotel lobby / boutique luxury / lounge
- **Keywords:** hotel lobby background, luxury lounge zoom background, boutique
  hotel backdrop, upscale lounge virtual background.
- **Direction:** Designer lobby/lounge — sculptural seating, statement lighting,
  marble + brass, art. Sophisticated networking/sales vibe. Suggested: 15–25.

### 2.8 Newsroom / broadcast / commentator desk
- **Keywords:** newsroom background, broadcast zoom background, news desk backdrop,
  expert commentator background, TV interview background.
- **Direction:** Out-of-focus newsroom/bullpen, world clocks (blank faces), screens
  with abstract data (no text), desk edge. For pundits, analysts, spokespeople.
  Suggested: 15–20.

---

## 5. TIER 3 — Close the seasonal/holiday calendar

We currently cover Christmas, Halloween, Valentine's, Easter, Spring, Summer.
Each item below is a recurring annual traffic spike we're missing. Keep most
variants *professional-appropriate* (subtle holiday cues, not party kitsch).

| Theme | Spike | Keywords | Suggested |
|---|---|---|---|
| **Winter (non-Christmas)** | Jan–Feb | winter zoom background, snowy office background, cozy winter backdrop | 25–35 |
| **New Year's** | late Dec–Jan | new year zoom background, NYE virtual background | 12–18 |
| **Lunar New Year** | Jan–Feb | lunar new year background, chinese new year zoom background | 12–18 |
| **St. Patrick's Day** | March | st patricks day zoom background, green clover backdrop | 8–12 |
| **4th of July / Patriotic** | June–July | 4th of july zoom background, patriotic virtual background | 10–15 |
| **Hanukkah** | Dec | hanukkah zoom background, menorah virtual background | 8–12 |
| **Diwali** | Oct–Nov | diwali zoom background, festival of lights backdrop | 10–15 |
| **Graduation** | May–June | graduation zoom background, commencement backdrop | 8–12 |

> Diwali / Lunar New Year / Hanukkah also matter for corporate DEI calendars —
> companies actively look for inclusive seasonal backdrops.

---

## 6. TIER 4 — Lifestyle / aesthetic (broad appeal, secondary intent)

High search volume but lower direct "professional" intent. Add after Tiers 1–3.

- **Mountain cabin / lodge / fireside** — cozy, warm wood, fireplace. WFH casual.
- **Mid-century modern interior** — strong aesthetic-search term ("mid century
  modern zoom background").
- **Scandinavian / Japandi minimalist interior** — clean, on-trend, neutral.
- **Beach / tropical / coastal** (extends summer) — perennial casual favorite.
- **Rooftop terrace / sky lounge** — networking, golden hour.
- **Travel destinations** (generic Tuscany / Paris café / Kyoto, no landmarks).
- **Wellness / spa / yoga studio** — for coaches, wellness pros, instructors.
- **Fitness / gym studio** — for online trainers and physios.

Suggested: 12–20 each, prioritized by which adjacent professional audience they serve.

---

## 7. Recommended build order & rough volume target

1. **Tier 1 (≈215–290 images)** — neutral, interview, both telehealth, conference,
   skyline, fall/Thanksgiving. *Biggest SEO unlock; do first.*
2. **Tier 3 fall-adjacent + winter** — land the Q4→Q1 seasonal calendar while
   you're producing fall.
3. **Tier 2 verticals** — law, classroom, biophilic, executive, podcast, etc.
4. **Tier 3 remaining holidays** — batched ahead of each spike.
5. **Tier 4 lifestyle** — fill out aesthetic long-tail.

A fully built-out Tier 1–3 roughly doubles category breadth and targets the
professional + seasonal head-terms the current library misses.

---

## 8. Handoff note to the prompt-writing AI

For each theme above, generate a set of distinct prompts that:
- Hold **all of Section 2's production rules** (center safe zone, webcam eye-line,
  no people, no legible text, codec-friendly, 16:9 photographic).
- **Vary** lighting, color temperature, palette, density, and left/right weighting
  so the set doesn't look repetitive.
- Stay inside MeetBackdrops brand voice — corporate/executive, *designed sets*,
  never gamer/streamer/Twitch language anywhere in prompt text or implied styling.
- Avoid identifiable real places, brands, logos, faces, and readable text.

Deliver prompts grouped by theme with the suggested counts as targets.
