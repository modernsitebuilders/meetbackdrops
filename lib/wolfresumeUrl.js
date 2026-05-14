// Helper for outbound links to wolfresume.com.
//
// All cross-brand links from MeetBackdrops should go through this so we
// can attribute traffic in WolfResume analytics by placement.
//
// UTM convention:
//   source   = meetbackdrops        (origin site)
//   medium   = referral             (cross-domain editorial link)
//   campaign = cross_brand          (the operator-level relationship)
//   content  = {placement}          (which specific link was clicked)
//
// Pass `content` as a short snake_case identifier unique to the
// surface — examples already in use:
//   about_studio              → /about "Behind the Studio" section
//   blog_interview_callout    → mid-article callout in job-interview post
//   blog_interview_related    → related-articles card in job-interview post
//   footer_global             → sitewide footer link
//
// When adding a new placement, pick a new identifier and add it to the
// list above so analytics has a single registry to consult.

export function wolfresumeUrl(content) {
  const params = new URLSearchParams({
    utm_source: 'meetbackdrops',
    utm_medium: 'referral',
    utm_campaign: 'cross_brand',
    utm_content: content,
  });
  return `https://wolfresume.com/?${params.toString()}`;
}
