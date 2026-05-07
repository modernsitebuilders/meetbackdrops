// Admin gate helper. Accepts the new `meetbackdrops_admin` localStorage
// flag as well as the legacy `streambackdrops_admin` flag carried over
// from the pre-rebrand domain. When the legacy flag is found, it is
// migrated forward to the new key so future calls don't depend on it.
const NEW_KEY = 'meetbackdrops_admin';
const LEGACY_KEY = 'streambackdrops_admin';

export function isAdmin() {
  if (typeof window === 'undefined') return false;
  try {
    if (window.localStorage.getItem(NEW_KEY) === 'true') return true;
    if (window.localStorage.getItem(LEGACY_KEY) === 'true') {
      window.localStorage.setItem(NEW_KEY, 'true');
      return true;
    }
  } catch {
    return false;
  }
  return false;
}
