// data/collections/promptLinks.js
//
// Cross-site "related resource" links from a persona collection page to the
// matching occupation prompt library on PromptDynamos (a sister site).
//
// WHY THIS IS EDITORIAL, NOT A LINK SCHEME:
//   - Same buyer, same context: a lawyer setting up their video presence and a
//     lawyer building an AI workflow are the same professional. The link helps a
//     real user, which is the line between sister-site and doorway.
//   - One contextual link per page, placed BELOW the grid/HD upsell (out of the
//     conversion path) — never sitewide, never templated into the footer.
//   - Anchors are VARIED per persona (not exact-match repeated 12×) to avoid a
//     manufactured footprint.
//   - Links are FOLLOWED on purpose: MeetBackdrops is the older/stronger domain,
//     so this passes authority to the newer PromptDynamos site.
//   - Coverage is INTENTIONALLY PARTIAL: only personas with a genuine 1:1
//     occupation page on PromptDynamos appear here. Personas with no match
//     (consultants/executives, teachers, tech) render NOTHING — no forced
//     homepage link, which would be the spammy pattern.
//
// Keyed by persona collection slug (data/collections/personas.js).
// Each value: { url, anchor, blurb }. Add an entry only when PromptDynamos
// actually has a matching occupation page; otherwise leave it out.
//
// PromptDynamos' per-occupation pages are the PRODUCT PACKS at /prompts/{id}
// (the commercial occupation pages), NOT /category/{slug} — those are only 4
// broad hubs (business-finance, healthcare, creative-design, lifestyle-coaching).
// So each persona points at its matching pack; the healthcare persona points at
// the /category/healthcare hub since there is no single healthcare pack.

const PROMPT_LINKS = {
  'zoom-backgrounds-for-lawyers': {
    url: 'https://promptdynamo.com/prompts/attorney-pack',
    anchor: 'AI prompts for attorneys',
    blurb:
      'Speed up client intake, contract review, and case summaries with a prompt pack built for legal work.',
  },
  'zoom-backgrounds-for-therapists': {
    url: 'https://promptdynamo.com/prompts/therapist-pack',
    anchor: 'AI prompts for therapists',
    blurb:
      'Draft session notes, intake forms, and client communications faster with prompts written for mental-health practice.',
  },
  'zoom-backgrounds-for-realtors': {
    url: 'https://promptdynamo.com/prompts/real-estate-50',
    anchor: 'ChatGPT prompts for real estate agents',
    blurb:
      'Write listing descriptions, buyer follow-ups, and market updates in minutes with prompts tuned for real estate.',
  },
  'zoom-backgrounds-for-financial-advisors': {
    url: 'https://promptdynamo.com/prompts/financial-advisor-pack',
    anchor: 'AI prompts for financial advisors',
    blurb:
      'Turn client reviews, market commentary, and outreach into first drafts with prompts built for advisory work.',
  },
  'zoom-backgrounds-for-healthcare': {
    url: 'https://promptdynamo.com/category/healthcare',
    anchor: 'AI prompts for healthcare professionals',
    blurb:
      'Draft patient communications, documentation, and admin replies with prompts written for healthcare and telehealth.',
  },
  'zoom-backgrounds-for-recruiters': {
    url: 'https://promptdynamo.com/prompts/hr-prompt-pack',
    anchor: 'AI prompts for HR & hiring',
    blurb:
      'Speed up job descriptions, candidate screening, and performance reviews with a prompt pack made for HR teams.',
  },
  'zoom-backgrounds-for-sales': {
    url: 'https://promptdynamo.com/prompts/sales-professional-pack',
    anchor: 'AI prompts for sales professionals',
    blurb:
      'Build cold outreach, follow-up sequences, and call prep faster with prompts written for sales.',
  },
  'zoom-backgrounds-for-coaches': {
    url: 'https://promptdynamo.com/prompts/life-coach-pack',
    anchor: 'AI prompts for coaches',
    blurb:
      'Plan sessions, craft client exercises, and write follow-ups with a prompt pack built for coaching.',
  },
  'zoom-backgrounds-for-accountants': {
    url: 'https://promptdynamo.com/prompts/accountant-pack',
    anchor: 'AI prompts for accountants',
    blurb:
      'Draft client emails, explain filings in plain language, and streamline busy-season comms with accounting prompts.',
  },
};

function getPromptLink(slug) {
  return PROMPT_LINKS[slug] || null;
}

module.exports = { PROMPT_LINKS, getPromptLink };
