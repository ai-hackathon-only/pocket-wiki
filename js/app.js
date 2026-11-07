// App shell: hash router and the core pages (view, edit, history, old revision).
// Special pages register themselves through `specials` (see js/special.js).
import * as store from './storage.js';
import { render, escapeHtml, pageHref } from './wikitext.js';
import { seedIfEmpty } from './seed.js';

const app = document.getElementById('app');
export const specials = {}; // name -> (params) => html

const renderText = text => render(text, { exists: t => t.startsWith('Special:') || store.exists(t), normalize: store.normalizeTitle });
const fmtTime = ts => new Date(ts).toLocaleString();
// A bad escape like '#/wiki/100%' must not throw; fall back to the raw text.
const safeDecode = s => { try { return decodeURIComponent(s || ''); } catch { return s || ''; } };
const titleFromPath = p => store.normalizeTitle(safeDecode(p));
const tabs = (title, active) => `
  <nav class="page-tabs" aria-label="Page">
    ${[['wiki', 'Read'], ['edit', 'Edit'], ['history', 'History']].map(([k, label]) =>
      `<a href="#/${k}/${encodeURIComponent(title.replace(/ /g, '_'))}"${k === active ? ' aria-current="page"' : ''}>${label}</a>`).join('')}
  </nav>`;

function viewPage(title) {
  const rev = store.load(title);
  if (!rev) {
    return `<h1>${escapeHtml(title)}</h1>${tabs(title, 'wiki')}
      <p class="notice">This page does not exist yet. <a href="#/edit/${encodeURIComponent(title.replace(/ /g, '_'))}">Create it</a>.</p>`;
  }
  return `<h1>${escapeHtml(title)}</h1>${tabs(title, 'wiki')}
    <article class="wiki-content">${renderText(rev.text)}</article>
    <p class="page-meta">Last edited ${escapeHtml(fmtTime(rev.ts))}.</p>`;
}

function editPage(title) {
  const rev = store.load(title);
  return `<h1>${rev ? 'Editing' : 'Creating'} ${escapeHtml(title)}</h1>${tabs(title, 'edit')}
    <form class="edit-form" id="edit-form">
      <label for="edit-text">Page text (wikitext)</label>
      <textarea id="edit-text" name="text" rows="20" spellcheck="true">${escapeHtml(rev ? rev.text : '')}</textarea>
      <label for="edit-summary">Edit summary</label>
      <input id="edit-summary" name="summary" type="text" maxlength="200" placeholder="Briefly describe your change" required>
      <div class="edit-actions">
        <button type="submit">Save page</button>
        <a href="${pageHref(title)}">Cancel</a>
      </div>
    </form>`;
}

function historyPage(title) {
  const revs = store.history(title);
  const enc = encodeURIComponent(title.replace(/ /g, '_'));
  const rows = revs.map(r => `<li><a href="#/rev/${enc}/${r.id}">${escapeHtml(fmtTime(r.ts))}</a>
    <span class="summary">${escapeHtml(r.summary || '(no summary)')}</span></li>`).join('');
  return `<h1>History of ${escapeHtml(title)}</h1>${tabs(title, 'history')}
    ${revs.length ? `<ol class="history" reversed>${rows}</ol>` : '<p class="notice">No revisions yet.</p>'}`;
}

function revisionPage(title, id) {
  const rev = store.revision(title, id);
  if (!rev) return `<h1>${escapeHtml(title)}</h1><p class="notice">Revision not found.</p>`;
  return `<h1>${escapeHtml(title)}</h1>${tabs(title, 'history')}
    <p class="notice">Old revision from ${escapeHtml(fmtTime(rev.ts))}: ${escapeHtml(rev.summary || '(no summary)')}.
      <a href="${pageHref(title)}">View the current version</a>.</p>
    <article class="wiki-content">${renderText(rev.text)}</article>`;
}

function route() {
  const [, kind = 'wiki', a, b] = (location.hash || '#/wiki/Main_Page').split('/');
  let html, docTitle;
  if (kind === 'special') {
    const name = safeDecode(a);
    const fn = specials[name];
    html = fn ? fn(new URLSearchParams(b || '')) : `<h1>Special:${escapeHtml(name)}</h1><p class="notice">No such special page.</p>`;
    docTitle = 'Special:' + name;
  } else {
    const title = titleFromPath(a) || 'Main Page';
    if (title.startsWith('Special:')) { location.replace(pageHref(title)); return; }
    docTitle = title;
    html = kind === 'edit' ? editPage(title)
      : kind === 'history' ? historyPage(title)
      : kind === 'rev' ? revisionPage(title, b)
      : viewPage(title);
    if (kind === 'edit') {
      queueMicrotask(() => document.getElementById('edit-form')?.addEventListener('submit', e => {
        e.preventDefault();
        const f = new FormData(e.target);
        try {
          store.save(title, f.get('text'), f.get('summary'));
        } catch (err) {
          const full = err && err.name === 'QuotaExceededError';
          alert(full
            ? 'Not saved: browser storage is full. Export the wiki, then delete or shorten pages.'
            : 'Not saved: ' + (err && err.message || err));
          return;
        }
        location.hash = pageHref(title);
      }));
    }
  }
  app.innerHTML = html;
  document.title = `${docTitle} · pocket-wiki`;
  app.focus({ preventScroll: true });
  window.scrollTo(0, 0);
}

document.getElementById('search-form').addEventListener('submit', e => {
  e.preventDefault();
  const q = new FormData(e.target).get('q').trim();
  if (q) location.hash = '#/special/Search/q=' + encodeURIComponent(q);
});

seedIfEmpty(store);
// Load optional special pages, then start routing.
import('./special.js').then(m => m.register?.(specials, { store, renderText, escapeHtml, pageHref, fmtTime }))
  .catch(() => {}).finally(() => { window.addEventListener('hashchange', route); route(); });
