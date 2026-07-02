// Pinterest API base. Trial apps must use the sandbox; production access requires approval.
// Override via env: PINTEREST_API_BASE=https://api.pinterest.com (after approval)
const PINTEREST_API_BASE =
  process.env.PINTEREST_API_BASE || 'https://api-sandbox.pinterest.com';
const PINTEREST_API_URL = `${PINTEREST_API_BASE}/v5/pins`;
const pinUrl = (id) => `${PINTEREST_API_URL}/${encodeURIComponent(id)}`;
const MAX_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 1000;
const DEFAULT_QUEUE_DELAY_MS = 500;
const MAX_RETRY_AFTER_MS = 60_000;

// TODO: concurrency option for publishQueue (promise pool) once batch sizes warrant it.
// TODO: OAuth refresh-token flow (POST /v5/oauth/token) for unattended long-running runs.

function getAccessToken() {
  const token = process.env.PINTEREST_ACCESS_TOKEN;
  if (!token) {
    throw new Error('Missing PINTEREST_ACCESS_TOKEN environment variable');
  }
  return token;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function validatePinInput({ board_id, title, description, link, image_url }) {
  const missing = [];
  if (!board_id) missing.push('board_id');
  if (!title) missing.push('title');
  if (!description) missing.push('description');
  if (!image_url) missing.push('image_url');
  if (missing.length > 0) {
    throw new Error(`Missing required pin fields: ${missing.join(', ')}`);
  }
  if (typeof link !== 'undefined' && link !== null && typeof link !== 'string') {
    throw new Error('link must be a string when provided');
  }
}

function buildRequestBody({ board_id, title, description, link, image_url }) {
  const body = {
    board_id,
    title,
    description,
    media_source: {
      source_type: 'image_url',
      url: image_url,
    },
  };
  if (link) {
    body.link = link;
  }
  return body;
}

async function sendPinRequest(body, token) {
  const response = await fetch(PINTEREST_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  let payload = null;
  const text = await response.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch (_err) {
      payload = { raw: text };
    }
  }

  const retryAfterMs = parseRetryAfter(response.headers.get('retry-after'));

  return { status: response.status, ok: response.ok, payload, retryAfterMs };
}

function parseRetryAfter(headerValue) {
  if (!headerValue) return null;
  const seconds = Number(headerValue);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.min(seconds * 1000, MAX_RETRY_AFTER_MS);
  }
  const dateMs = Date.parse(headerValue);
  if (!Number.isNaN(dateMs)) {
    const delta = dateMs - Date.now();
    if (delta > 0) return Math.min(delta, MAX_RETRY_AFTER_MS);
  }
  return null;
}

function isRetryableStatus(status) {
  if (status === 429) return true;
  if (status >= 500 && status < 600) return true;
  return false;
}

function extractErrorMessage(payload, status) {
  if (!payload) return `HTTP ${status}`;
  if (typeof payload === 'string') return payload;
  if (payload.message) return payload.message;
  if (payload.error_description) return payload.error_description;
  if (payload.error) {
    return typeof payload.error === 'string'
      ? payload.error
      : JSON.stringify(payload.error);
  }
  if (payload.raw) return payload.raw;
  return `HTTP ${status}`;
}

async function publishPin(pin) {
  let token;
  try {
    validatePinInput(pin);
    token = getAccessToken();
  } catch (err) {
    console.error('[publisher] invalid input or config:', err.message);
    return { success: false, error: err.message };
  }

  const body = buildRequestBody(pin);
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let retryAfterMs = null;
    try {
      const result = await sendPinRequest(body, token);
      const { status, ok, payload } = result;
      retryAfterMs = result.retryAfterMs;

      if (ok && payload && payload.id) {
        return { success: true, pin_id: payload.id };
      }

      const message = extractErrorMessage(payload, status);
      lastError = `Pinterest API error (status ${status}): ${message}`;
      console.error(
        `[publisher] attempt ${attempt}/${MAX_ATTEMPTS} failed for board ${pin.board_id}: ${lastError}`,
      );

      if (!isRetryableStatus(status)) {
        return { success: false, error: lastError };
      }
    } catch (err) {
      lastError = err && err.message ? err.message : String(err);
      console.error(
        `[publisher] attempt ${attempt}/${MAX_ATTEMPTS} threw for board ${pin.board_id}: ${lastError}`,
      );
    }

    if (attempt < MAX_ATTEMPTS) {
      const backoff = retryAfterMs != null ? retryAfterMs : RETRY_BASE_DELAY_MS * attempt;
      await sleep(backoff);
    }
  }

  return {
    success: false,
    error: lastError || 'Unknown publishing failure',
  };
}

// Reads a pin back from the v5 GET /pins/{id} endpoint. Used to show the reviewer
// that the just-created pin actually exists and is retrievable through the API —
// the sandbox equivalent of "displaying the newly created pin on Pinterest".
async function getPin(pinId) {
  let token;
  try {
    if (!pinId) throw new Error('getPin requires a pin id');
    token = getAccessToken();
  } catch (err) {
    return { success: false, error: err.message };
  }

  try {
    const response = await fetch(pinUrl(pinId), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    let payload = null;
    const text = await response.text();
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch (_err) {
        payload = { raw: text };
      }
    }

    if (response.ok && payload) {
      return { success: true, pin: payload };
    }
    return {
      success: false,
      error: `Pinterest API error (status ${response.status}): ${extractErrorMessage(payload, response.status)}`,
    };
  } catch (err) {
    return { success: false, error: err && err.message ? err.message : String(err) };
  }
}

async function publishQueue(pins, options = {}) {
  if (!Array.isArray(pins)) {
    const error = 'publishQueue expects an array of pins';
    console.error(`[publisher] ${error}`);
    return { total: 0, succeeded: 0, failed: 0, results: [], error };
  }

  const delayMs =
    typeof options.delayMs === 'number' && options.delayMs >= 0
      ? options.delayMs
      : DEFAULT_QUEUE_DELAY_MS;

  const results = [];
  let succeeded = 0;
  let failed = 0;

  for (let i = 0; i < pins.length; i++) {
    const pin = pins[i];
    const result = await publishPin(pin);
    results.push({ index: i, pin, result });
    if (result.success) {
      succeeded++;
      console.log(
        `[publisher] (${i + 1}/${pins.length}) published pin ${result.pin_id}`,
      );
    } else {
      failed++;
      console.error(
        `[publisher] (${i + 1}/${pins.length}) failed: ${result.error}`,
      );
    }

    if (delayMs > 0 && i < pins.length - 1) {
      await sleep(delayMs);
    }
  }

  return {
    total: pins.length,
    succeeded,
    failed,
    results,
  };
}

module.exports = {
  publishPin,
  publishQueue,
  getPin,
};
