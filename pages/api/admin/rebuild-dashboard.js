/**
 * /api/admin/rebuild-dashboard
 *
 * Reads all Analytics data and writes computed stats directly to the Dashboard tab.
 * No spreadsheet formulas — avoids parse errors and COUNTIF matching issues.
 *
 * POST /api/admin/rebuild-dashboard
 */

import { google } from 'googleapis';
import { resolveByAnyExtension } from '../../../lib/manifest';
import { normalizeAnalyticsCategory, isDownloadEvent } from '../../../lib/analyticsNormalize';

const SOURCES = ['bing', 'google', 'chatgpt', 'duckduckgo', 'yahoo', 'direct'];
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

// Resolve a dashboard row's category: manifest lookup by filename first,
// falling back to the shared analytics normalizer when the filename is
// missing or unknown. Never infers from filename shape.
function resolveRowCategory(filename, rawCategory) {
  if (filename) {
    const entry = resolveByAnyExtension(filename);
    if (entry) return entry.category;
  }
  return normalizeAnalyticsCategory(rawCategory);
}

function classifySource(raw) {
  if (!raw) return 'other';
  const s = raw.toLowerCase();
  if (s.includes('bing')) return 'bing';
  if (s.includes('chatgpt') || s.includes('chat.openai')) return 'chatgpt';
  if (s.includes('google')) return 'google';
  if (s.includes('duckduckgo')) return 'duckduckgo';
  if (s.includes('yahoo')) return 'yahoo';
  if (s === 'direct' || s === '') return 'direct';
  return 'other';
}

function parseRowDate(timestamp) {
  if (!timestamp) return null;
  try {
    const d = new Date(timestamp);
    if (!isNaN(d)) return d;
  } catch (_) {}
  return null;
}

function pct(num, denom) {
  if (!denom) return '0.00%';
  return ((num / denom) * 100).toFixed(2) + '%';
}

function getAuth() {
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  privateKey = privateKey.replace(/\\n/g, '\n');
  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_EMAIL,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // ── 1. Read Analytics + Analytics_Archive ─────────────────────────────
    const [mainResp, archiveResp] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Analytics!A:P' }),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Analytics_Archive!A:P' }).catch(() => ({ data: { values: [] } })),
    ]);

    const allRows = [
      ...(mainResp.data.values || []).slice(1),      // skip header
      ...(archiveResp.data.values || []).slice(1),   // skip header
    ];
    const now = new Date();
    const thirtyDaysAgo = new Date(now - THIRTY_DAYS_MS);

    // ── 2. Compute stats ────────────────────────────────────────────────────
    let totalDownloads = 0;
    let totalPageViews = 0;
    let earliestDate = null;

    // source → { views, downloads, sessions: Set, views30, downloads30, sessions30: Set, sessionDownloads: {} }
    const sourceStats = {};
    // category → downloads count
    const categoryStats = {};
    // source → { category → downloads } for top-category-per-source
    const sourceCategory = {};

    for (const row of allRows) {
      const timestamp = row[0];
      const eventType = row[1];
      const source = row[2] || 'direct';
      const filename = row[3];
      const category = resolveRowCategory(filename, row[4]);
      const sessionId = row[9];

      const date = parseRowDate(timestamp);
      const isRecent = date && date >= thirtyDaysAgo;

      if (date && (!earliestDate || date < earliestDate)) {
        earliestDate = date;
      }

      const src = classifySource(source);

      if (!sourceStats[src]) {
        sourceStats[src] = {
          views: 0, downloads: 0, sessions: new Set(),
          views30: 0, downloads30: 0, sessions30: new Set(),
          sessionDownloads: {},
        };
      }
      if (!sourceCategory[src]) sourceCategory[src] = {};

      if (eventType === 'page_view') {
        totalPageViews++;
        sourceStats[src].views++;
        if (sessionId) sourceStats[src].sessions.add(sessionId);
        if (isRecent) {
          sourceStats[src].views30++;
          if (sessionId) sourceStats[src].sessions30.add(sessionId);
        }
      } else if (isDownloadEvent(eventType)) {
        totalDownloads++;
        sourceStats[src].downloads++;
        if (sessionId) {
          sourceStats[src].sessionDownloads[sessionId] =
            (sourceStats[src].sessionDownloads[sessionId] || 0) + 1;
        }
        if (isRecent) {
          sourceStats[src].downloads30++;
          if (sessionId) sourceStats[src].sessions30.add(sessionId);
        }
        if (category) {
          categoryStats[category] = (categoryStats[category] || 0) + 1;
          if (!sourceCategory[src]) sourceCategory[src] = {};
          sourceCategory[src][category] = (sourceCategory[src][category] || 0) + 1;
        }
      }
    }

    const sortedCategories = Object.entries(categoryStats).sort((a, b) => b[1] - a[1]);

    function multiDLCount(src) {
      const sd = sourceStats[src]?.sessionDownloads || {};
      return Object.values(sd).filter(c => c >= 2).length;
    }

    function powerUserPct(src) {
      const s = sourceStats[src] || {};
      const total = s.sessions.size;
      if (!total) return '0.00%';
      return pct(multiDLCount(src), total);
    }

    function topCategory(src) {
      const cats = sourceCategory[src] || {};
      const entries = Object.entries(cats).sort((a, b) => b[1] - a[1]);
      if (!entries.length) return ['—', '—'];
      const [cat, count] = entries[0];
      return [cat, pct(count, sourceStats[src]?.downloads || 0)];
    }

    const dataSince = earliestDate
      ? earliestDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
      : 'No data';
    const convRate = pct(totalDownloads, totalPageViews);
    const lastUpdated = `Last updated: ${now.toLocaleString('en-US', { timeZone: 'America/New_York' })} ET`;
    const totalMultiDL = Object.keys(sourceStats)
      .reduce((sum, src) => sum + multiDLCount(src), 0);

    // ── 3. Build left pane (A1 downward) ────────────────────────────────────
    const leftRows = [
      [lastUpdated],                                           // A1
      [''],                                                    // A2
      ['ALL-TIME PERFORMANCE'],                               // A3
      [''],                                                    // A4
      ['Total Downloads (All Time):', totalDownloads],        // A5
      ['Total Page Views (All Time):', totalPageViews],       // A6
      ['Conversion Rate:', convRate],                         // A7
      ['Data Since:', dataSince],                             // A8
      [''],                                                    // A9
      ['SOURCE PERFORMANCE'],                                 // A10
      [''],                                                    // A11
      ['Source', 'Page Views', 'Downloads', 'Conv Rate'],    // A12
    ];
    for (const src of SOURCES) {
      const s = sourceStats[src] || {};
      leftRows.push([src, s.views || 0, s.downloads || 0, pct(s.downloads || 0, s.views || 0)]);
    }
    leftRows.push(['']);                                       // A19
    leftRows.push(['CATEGORY DOWNLOADS (ALL TIME)']);         // A20
    leftRows.push(['']);                                       // A21
    leftRows.push(['Category', 'Downloads']);                 // A22
    for (const [cat, count] of sortedCategories) {
      leftRows.push([cat, count]);
    }

    // ── 4. Build right pane (F3 downward) ───────────────────────────────────
    const rightRows = [
      ['LAST 30 DAYS'],                                                            // F3
      [`(Data from ${thirtyDaysAgo.toLocaleDateString('en-US')} to today)`],      // F4
      [''],                                                                         // F5
      ['Source', 'Page Views', 'Downloads', 'Conv Rate'],                         // F6
    ];
    for (const src of SOURCES) {
      const s = sourceStats[src] || {};
      rightRows.push([src, s.views30 || 0, s.downloads30 || 0, pct(s.downloads30 || 0, s.views30 || 0)]);
    }
    rightRows.push(['']);                                                           // F13
    rightRows.push(['Multi-Download Sessions (all time)', totalMultiDL]);          // F14
    rightRows.push(['']);                                                           // F15
    rightRows.push(['POWER USERS BY SOURCE']);                                     // F16
    rightRows.push(['']);                                                           // F17
    rightRows.push(['Source', 'Total Sessions', 'Multi-DL Sessions', '% Power Users']); // F18
    for (const src of SOURCES) {
      const s = sourceStats[src] || {};
      rightRows.push([src, s.sessions.size, multiDLCount(src), powerUserPct(src)]);
    }
    rightRows.push(['']);                                                           // F25
    rightRows.push(['TOP CATEGORY BY SOURCE']);                                    // F26
    rightRows.push(['(Top category preference for each source)']);                 // F27
    rightRows.push(['']);                                                           // F28
    rightRows.push(['Source', 'Top Category', '% of Downloads']);                 // F29
    for (const src of SOURCES) {
      const [cat, pctVal] = topCategory(src);
      rightRows.push([src, cat, pctVal]);
    }

    // ── 5. Write both panes in a single batchUpdate call ────────────────────
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      resource: {
        valueInputOption: 'USER_ENTERED',
        data: [
          { range: 'Dashboard!A1', values: leftRows },
          { range: 'Dashboard!F3', values: rightRows },
        ],
      },
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalDownloads,
        totalPageViews,
        conversionRate: convRate,
        dataSince,
        categoriesTracked: sortedCategories.length,
        lastUpdated: now.toISOString(),
      },
    });
  } catch (error) {
    console.error('rebuild-dashboard error:', error);
    return res.status(500).json({ error: error.message });
  }
}
