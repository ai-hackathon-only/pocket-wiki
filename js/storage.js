// Storage module: the only code that touches localStorage.
// Shape: { pages: { [title]: { revisions: [{ id, ts, text, summary }] } } }
const KEY = 'pocket-wiki:v1';

// Parsed copy of the stored wiki. Parsing a 500-page wiki on every
// exists()/load() call made link rendering and search slow, so we parse once
// and drop the copy on every write and when another tab changes storage.
let cache = null;
if (typeof window !== 'undefined') {
  window.addEventListener('storage', e => { if (e.key === KEY || e.key === null) cache = null; });
}

function read() {
  if (cache) return cache;
  try {
    const data = JSON.parse(localStorage.getItem(KEY));
    if (data && typeof data === 'object' && data.pages && typeof data.pages === 'object') {
      let migrated = false;
      for (const k of Object.keys(data.pages)) {
        const norm = normalizeTitle(k);
        if (norm && norm !== k && !data.pages[norm]) {
          data.pages[norm] = data.pages[k];
          delete data.pages[k];
          migrated = true;
        }
      }
      if (migrated) write(data);
      return (cache = data);
    }
  } catch { /* fall through to empty */ }
  return (cache = { pages: {} });
}

// Thrown when the browser refuses to store more. Nothing was written,
// so the data from before the failed save is still there.
export class StorageFullError extends Error {
  constructor() {
    super('Browser storage is full. Nothing was saved. Export the wiki, then delete or shorten pages.');
    this.name = 'QuotaExceededError';
  }
}

function isQuota(err) {
  return err && (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED' || err.code === 22 || err.code === 1014);
}

function write(data) {
  const json = JSON.stringify(data);
  try {
    localStorage.setItem(KEY, json);
    cache = data;
  } catch (err) {
    cache = null; // the in-memory copy may hold the change that failed
    throw isQuota(err) ? new StorageFullError() : err;
  }
}

export function normalizeTitle(title) {
  const t = String(title || '').replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
  if (!t) return '';
  if (t.toLowerCase().startsWith('talk:')) {
    const sub = t.slice(5).trim();
    return 'Talk:' + (sub ? sub[0].toUpperCase() + sub.slice(1) : '');
  }
  return t[0].toUpperCase() + t.slice(1);
}

export function exists(title) {
  return Boolean(read().pages[normalizeTitle(title)]);
}

// Latest revision of a page, or null.
export function load(title) {
  const page = read().pages[normalizeTitle(title)];
  return page ? page.revisions[page.revisions.length - 1] : null;
}

export function save(title, text, summary) {
  const data = read();
  const t = normalizeTitle(title);
  const page = data.pages[t] || (data.pages[t] = { revisions: [] });
  const rev = { id: page.revisions.length + 1, ts: new Date().toISOString(), text: String(text), summary: String(summary || '') };
  page.revisions.push(rev);
  write(data);
  return rev;
}

// Move a page and all its revisions to a new title, adding one revision that records the move.
// With leaveRedirect, the old title becomes a one-line redirect page so old links keep working;
// without it, links to the old title turn red.
export function rename(from, to, summary, leaveRedirect = true) {
  const data = read();
  const f = normalizeTitle(from), t = normalizeTitle(to);
  if (!data.pages[f]) throw new Error(`There is no page called "${f}".`);
  if (!t || t.startsWith('Special:')) throw new Error('Choose a valid new title.');
  if (t === f) throw new Error('The new title is the same as the old one.');
  // A target that has only ever been a redirect, and now points back to the source, may be replaced,
  // so a rename can be undone (also after A -> B -> C, where A holds two redirect revisions).
  const existing = data.pages[t];
  const onlyRedirectHere = existing && existing.revisions.every(r => redirectTarget(r.text))
    && redirectTarget(existing.revisions[existing.revisions.length - 1].text) === f;
  if (existing && !onlyRedirectHere) {
    throw new Error(`A page called "${t}" already exists. Rename or delete it first.`);
  }
  const page = data.pages[t] = data.pages[f];
  delete data.pages[f];
  const ts = new Date().toISOString();
  const last = page.revisions[page.revisions.length - 1];
  const note = `Renamed from ${f}` + (summary ? `: ${summary}` : '');
  page.revisions.push({ id: page.revisions.length + 1, ts, text: last.text, summary: note });
  // Point older redirects at the new title, so A -> B -> C never leaves a two-hop chain.
  for (const [name, p] of Object.entries(data.pages)) {
    const r = p.revisions[p.revisions.length - 1];
    if (name !== t && redirectTarget(r.text) === f) {
      p.revisions.push({ id: p.revisions.length + 1, ts, text: `#REDIRECT [[${t}]]`, summary: `Redirect now points to ${t} after rename` });
    }
  }
  if (leaveRedirect) {
    data.pages[f] = { revisions: [{ id: 1, ts, text: `#REDIRECT [[${t}]]`, summary: `Redirect to ${t} after rename` }] };
  }
  // If moving an article, also move its associated talk page if one exists
  if (!f.startsWith('Talk:') && !t.startsWith('Talk:')) {
    const talkFrom = `Talk:${f}`;
    const talkTo = `Talk:${t}`;
    if (data.pages[talkFrom] && !data.pages[talkTo]) {
      const talkPage = (data.pages[talkTo] = data.pages[talkFrom]);
      delete data.pages[talkFrom];
      const talkLast = talkPage.revisions[talkPage.revisions.length - 1];
      talkPage.revisions.push({
        id: talkPage.revisions.length + 1,
        ts,
        text: talkLast.text,
        summary: `Renamed from ${talkFrom}` + (summary ? `: ${summary}` : '')
      });
      if (leaveRedirect) {
        data.pages[talkFrom] = {
          revisions: [{ id: 1, ts, text: `#REDIRECT [[${talkTo}]]`, summary: `Redirect to ${talkTo} after rename` }]
        };
      }
    }
  }
  write(data);
  return t;
}

// Delete a page and its history. Links to it turn red.
export function remove(title) {
  const data = read();
  const t = normalizeTitle(title);
  if (!data.pages[t]) return false;
  delete data.pages[t];
  write(data);
  return true;
}

// Target title if this text is a redirect page ("#REDIRECT [[Target]]"), else null.
export function redirectTarget(text) {
  const m = /^\s*#REDIRECT\s*\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/i.exec(String(text || ''));
  return m ? normalizeTitle(m[1]) : null;
}

// All page titles, sorted.
export function list() {
  return Object.keys(read().pages).sort((a, b) => a.localeCompare(b));
}

// Revisions of one page, newest first.
export function history(title) {
  const page = read().pages[normalizeTitle(title)];
  return page ? [...page.revisions].reverse() : [];
}

export function revision(title, id) {
  const page = read().pages[normalizeTitle(title)];
  return page ? page.revisions.find(r => r.id === Number(id)) || null : null;
}

// Every revision of every page, newest first: [{ title, ...rev }].
export function recentChanges(limit = 50) {
  const all = [];
  for (const [title, page] of Object.entries(read().pages)) {
    for (const rev of page.revisions) all.push({ title, ...rev });
  }
  return all.sort((a, b) => b.ts.localeCompare(a.ts)).slice(0, limit);
}

export function exportAll() {
  return JSON.parse(JSON.stringify(read()));
}

const str = v => (typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '');
const validTs = v => typeof v === 'string' && !Number.isNaN(Date.parse(v));

// Replace everything. Throws (and changes nothing) if the file is not a
// pocket-wiki export, holds no usable page, or does not fit in storage.
// Only strings are kept: text stays text and is escaped when shown.
export function importAll(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data) || !data.pages || typeof data.pages !== 'object' || Array.isArray(data.pages)) {
    throw new Error('This is not a pocket-wiki export file (no "pages" object).');
  }
  const now = new Date().toISOString();
  const clean = { pages: {} };
  for (const [title, page] of Object.entries(data.pages)) {
    if (!page || typeof page !== 'object' || !Array.isArray(page.revisions)) continue;
    const t = normalizeTitle(title).slice(0, 255);
    if (!t || Object.prototype.hasOwnProperty.call(clean.pages, t)) continue;
    const revisions = page.revisions
      .filter(r => r && typeof r === 'object')
      .map((r, i) => ({ id: i + 1, ts: validTs(r.ts) ? r.ts : now, text: str(r.text), summary: str(r.summary) }));
    if (revisions.length) clean.pages[t] = { revisions };
  }
  if (!Object.keys(clean.pages).length) {
    throw new Error('The file has no pages that pocket-wiki can read. Nothing was changed.');
  }
  write(clean);
  return Object.keys(clean.pages).length;
}

export function isEmpty() {
  return Object.keys(read().pages).length === 0;
}
