// Free HD sample images offered at /free-sample.
//
// Each entry must:
//   - have its HD PNG uploaded to the streambackdrops-premium S3 bucket
//     at `{id}.png` (same convention as paid HD Editions)
//   - have its webp thumbnail live on R2 at
//     `https://assets.streambackdrops.com/webp/{folder}/{id}.webp`
//
// To swap a sample for A/B testing, just change one entry here. Keep the
// array length at 3 unless you also update the page layout.
export const FREE_SAMPLES = [
  {
    id: 'bookshelves-bright-07',
    folder: 'bookshelves-bright',
    label: 'Warm & credible',
    blurb: 'Bookshelves with a doorway sightline. Reads as a real room, not a flat backdrop.',
  },
  {
    id: 'office-spaces-28',
    folder: 'office-spaces',
    label: 'Modern & polished',
    blurb: 'Reclaimed-wood office with natural light. Clean, professional, executive-ready.',
  },
  {
    id: 'living-room-10',
    folder: 'living-rooms',
    label: 'Bright & personal',
    blurb: 'Coastal living room with ocean light. Warm without feeling staged.',
  },
];

export const FREE_SAMPLE_IDS = new Set(FREE_SAMPLES.map((s) => s.id));

export function webpUrl(sample) {
  return `https://assets.streambackdrops.com/webp/${sample.folder}/${sample.id}.webp`;
}
