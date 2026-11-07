// Storage module: the only code that touches localStorage.
// Shape: { pages: { [title]: { revisions: [{ id, ts, text, summary }] } } }
const KEY = 'pocket-wiki:v1';

function read() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY));
    if (data && typeof data === 'object' && data.pages) return data;
  } catch { /* fall through to empty */ }
  return { pages: {} };
}

function write(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function normalizeTitle(title) {
  const t = String(title || '').replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
  return t ? t[0].toUpperCase() + t.slice(1) : '';
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
  // A target that is only a redirect back to the source (left by an earlier rename) may be replaced, so a rename can be undone.
  const existing = data.pages[t];
  if (existing && !(existing.revisions.length === 1 && redirectTarget(existing.revisions[0].text) === f)) {
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
  return read();
}

// Replace everything. Throws if the shape is wrong.
export function importAll(data) {
  if (!data || typeof data !== 'object' || !data.pages || typeof data.pages !== 'object') {
    throw new Error('Not a pocket-wiki export file');
  }
  const clean = { pages: {} };
  for (const [title, page] of Object.entries(data.pages)) {
    if (!page || !Array.isArray(page.revisions)) continue;
    const t = normalizeTitle(title);
    if (!t) continue;
    clean.pages[t] = {
      revisions: page.revisions.map((r, i) => ({
        id: i + 1,
        ts: String(r.ts || new Date().toISOString()),
        text: String(r.text ?? ''),
        summary: String(r.summary ?? ''),
      })),
    };
  }
  write(clean);
}

export function isEmpty() {
  return Object.keys(read().pages).length === 0;
}
