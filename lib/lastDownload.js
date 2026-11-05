// The image the visitor just downloaded, for the post-download card
// (ReviewModal → DownloadOffer). A module-level slot rather than a prop so the
// ten pages that render <ReviewModal> don't each have to thread it through.
// Client-only: useImageDownload writes it right before opening the modal.
let last = null;

export function setLastDownload(image, category) {
  last = image ? { filename: image.filename, category, folder: image.folder || null } : null;
}

export function getLastDownload() {
  return last;
}
