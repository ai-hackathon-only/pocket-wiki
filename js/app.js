// App shell: hash router and the core pages (view, edit, history, old revision).
// Special pages register themselves through `specials` (see js/special.js).
import * as store from './storage.js';
import { render, escapeHtml, pageHref } from './wikitext.js';
import { seedIfEmpty } from './seed.js';
import { computeDiff, renderDiffHtml } from './diff.js';

const app = document.getElementById('app');
export const specials = {}; // name -> (params) => html

const renderText = text => render(text, { exists: t => t.startsWith('Special:') || store.exists(t), normalize: store.normalizeTitle });
const fmtTime = ts => new Date(ts).toLocaleString();
// A bad escape like '#/wiki/100%' must not throw; fall back to the raw text.
const safeDecode = s => { try { return decodeURIComponent(s || ''); } catch { return s || ''; } };
const titleFromPath = p => store.normalizeTitle(safeDecode(p));
const tabs = (title, active) => `
  <nav class="page-tabs" aria-label="Page">
    ${[['wiki', 'Read'], ['edit', 'Edit'], ['history', 'History'], ['rename', 'Rename'], ['delete', 'Delete']].map(([k, label]) =>
      `<a href="#/${k}/${encodeURIComponent(title.replace(/ /g, '_'))}"${k === active ? ' aria-current="page"' : ''}>${label}</a>`).join('')}
  </nav>`;

let flash = '';
const enc = title => encodeURIComponent(title.replace(/ /g, '_'));

// Follows up to 5 redirect hops ("#REDIRECT [[Target]]") and stops on a loop;
// '#/wiki/Old/noredirect' shows the redirect page itself.
function viewPage(title, noRedirect) {
  let rev = store.load(title);
  let from = null;
  const seen = new Set([title]);
  for (let target; rev && !noRedirect && seen.size <= 5 && (target = store.redirectTarget(rev.text)) && !seen.has(target);) {
    from = from || title;
    seen.add(target);
    title = target;
    rev = store.load(title);
  }
  const fromNote = from
    ? `<p class="redirect-note">Redirected from <a href="#/wiki/${enc(from)}/noredirect">${escapeHtml(from)}</a>.</p>` : '';
  if (!rev) {
    return `<h1>${escapeHtml(title)}</h1>${tabs(title, 'wiki')}${fromNote}
      <p class="notice">This page does not exist yet. <a href="#/edit/${encodeURIComponent(title.replace(/ /g, '_'))}">Create it</a>.</p>`;
  }
  return `<h1>${escapeHtml(title)}</h1>${tabs(title, 'wiki')}${fromNote}
    <article class="wiki-content">${renderText(rev.text)}</article>
    <p class="page-meta">Last edited ${escapeHtml(fmtTime(rev.ts))}.</p>`;
}

function renamePage(title) {
  if (!store.exists(title)) {
    return `<h1>Rename ${escapeHtml(title)}</h1>${tabs(title, 'rename')}<p class="notice">This page does not exist, so there is nothing to rename.</p>`;
  }
  return `<h1>Rename ${escapeHtml(title)}</h1>${tabs(title, 'rename')}
    <form class="edit-form" id="rename-form">
      <p>The page keeps its full history under the new title.</p>
      <label for="rename-to">New title</label>
      <input id="rename-to" name="to" type="text" maxlength="200" value="${escapeHtml(title)}" required>
      <label for="rename-summary">Reason</label>
      <input id="rename-summary" name="summary" type="text" maxlength="200" placeholder="Why rename this page?">
      <label class="check"><input type="checkbox" name="redirect" checked> Leave a redirect at the old title, so links to it keep working. Without it, those links turn red.</label>
      <p class="notice" id="rename-error" role="alert" hidden></p>
      <div class="edit-actions">
        <button type="submit">Rename page</button>
        <a href="${pageHref(title)}">Cancel</a>
      </div>
    </form>`;
}

function deletePage(title) {
  if (!store.exists(title)) {
    return `<h1>Delete ${escapeHtml(title)}</h1>${tabs(title, 'delete')}<p class="notice">This page does not exist, so there is nothing to delete.</p>`;
  }
  const n = store.history(title).length;
  return `<h1>Delete ${escapeHtml(title)}</h1>${tabs(title, 'delete')}
    <form class="edit-form" id="delete-form">
      <p>This removes the page and its history (${n} revision${n === 1 ? '' : 's'}) from this browser. Links to it will turn red. It cannot be undone, so export the wiki first if you may want it back.</p>
      <div class="edit-actions">
        <button type="submit">Delete page</button>
        <a href="${pageHref(title)}">Cancel</a>
      </div>
    </form>`;
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
  if (!revs.length) {
    return `<h1>History of ${escapeHtml(title)}</h1>${tabs(title, 'history')}
      <p class="notice">No revisions yet.</p>`;
  }

  const rows = revs.map((r, i) => {
    const prev = revs[i + 1];
    const diffLink = prev
      ? `<a href="#/diff/${enc}/${prev.id}...${r.id}" class="history-diff-link">diff</a>`
      : `<span class="history-diff-empty">cur</span>`;
    const radioOld = revs.length > 1
      ? `<input type="radio" name="oldid" value="${r.id}" aria-label="Compare older revision ${r.id}"${i === 1 ? ' checked' : ''}>`
      : '';
    const radioNew = revs.length > 1
      ? `<input type="radio" name="newid" value="${r.id}" aria-label="Compare newer revision ${r.id}"${i === 0 ? ' checked' : ''}>`
      : '';
    return `<li>
      ${revs.length > 1 ? `<span class="history-radios">${radioOld}${radioNew}</span>` : ''}
      <span class="history-diff-cell">(${diffLink})</span>
      <a href="#/rev/${enc}/${r.id}">${escapeHtml(fmtTime(r.ts))}</a>
      <span class="summary">${escapeHtml(r.summary || '(no summary)')}</span>
    </li>`;
  }).join('');

  const compareControls = revs.length > 1 ? `
    <div class="history-compare-controls">
      <button type="submit" class="btn-compare">Compare selected revisions</button>
      <span class="history-legend" aria-hidden="true">(older / newer)</span>
    </div>` : '';

  return `<h1>History of ${escapeHtml(title)}</h1>${tabs(title, 'history')}
    <form id="history-form" class="history-form">
      ${compareControls}
      <ol class="history" reversed>${rows}</ol>
    </form>`;
}

function revisionPage(title, id) {
  const rev = store.revision(title, id);
  if (!rev) return `<h1>${escapeHtml(title)}</h1><p class="notice">Revision not found.</p>`;
  const enc = encodeURIComponent(title.replace(/ /g, '_'));
  const revs = store.history(title);
  const idx = revs.findIndex(r => r.id === Number(id));
  const prevRev = idx >= 0 && idx < revs.length - 1 ? revs[idx + 1] : null;

  return `<h1>${escapeHtml(title)}</h1>${tabs(title, 'history')}
    <p class="notice">Old revision from ${escapeHtml(fmtTime(rev.ts))}: ${escapeHtml(rev.summary || '(no summary)')}.
      <a href="${pageHref(title)}">View the current version</a>
      ${prevRev ? ` · <a href="#/diff/${enc}/${prevRev.id}...${rev.id}">Diff with previous</a>` : ''}
      · <a href="#/history/${enc}">History</a>.
    </p>
    <article class="wiki-content">${renderText(rev.text)}</article>`;
}

function diffPage(title, oldParam, newParam) {
  let oldId, newId;
  if (oldParam && oldParam.includes('...')) {
    [oldId, newId] = oldParam.split('...');
  } else {
    oldId = oldParam;
    newId = newParam;
  }
  const enc = encodeURIComponent(title.replace(/ /g, '_'));
  const revOld = store.revision(title, oldId);
  const revNew = store.revision(title, newId);
  if (!revOld || !revNew) {
    return `<h1>Difference for ${escapeHtml(title)}</h1>${tabs(title, 'history')}
      <p class="notice">One or both revisions could not be found.</p>
      <p><a href="#/history/${enc}">Back to page history</a></p>`;
  }

  const diffRows = computeDiff(revOld.text, revNew.text);
  const { rowsHtml, additions, deletions } = renderDiffHtml(diffRows, escapeHtml);

  return `<h1>Difference between revisions of ${escapeHtml(title)}</h1>${tabs(title, 'history')}
    <div class="diff-header">
      <div class="diff-header-col">
        <strong>Older revision</strong>
        <div><a href="#/rev/${enc}/${revOld.id}">Revision as of ${escapeHtml(fmtTime(revOld.ts))}</a></div>
        <div class="summary">${escapeHtml(revOld.summary || '(no summary)')}</div>
      </div>
      <div class="diff-header-col">
        <strong>Newer revision</strong>
        <div><a href="#/rev/${enc}/${revNew.id}">Revision as of ${escapeHtml(fmtTime(revNew.ts))}</a></div>
        <div class="summary">${escapeHtml(revNew.summary || '(no summary)')}</div>
      </div>
    </div>
    ${additions === 0 && deletions === 0
      ? '<p class="notice">The two revisions have identical page text.</p>'
      : `<p class="diff-stats" aria-label="Diff summary">
          <span class="diff-stat-add">+${additions} ${additions === 1 ? 'line' : 'lines'}</span>,
          <span class="diff-stat-del">−${deletions} ${deletions === 1 ? 'line' : 'lines'}</span>
        </p>
        <div class="diff-container" role="region" aria-label="Differences table">
          <table class="diff-table">
            <thead>
              <tr>
                <th scope="col" class="diff-num-col"><span class="visually-hidden">Old line number</span></th>
                <th scope="col" class="diff-num-col"><span class="visually-hidden">New line number</span></th>
                <th scope="col" class="diff-marker-col"><span class="visually-hidden">Operation</span></th>
                <th scope="col" class="diff-content-col">Line content</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>`}
    <p class="diff-footer"><a href="#/history/${enc}">← Back to page history</a></p>`;
}

function route() {
  const [, kind = 'wiki', a, b, c] = (location.hash || '#/wiki/Main_Page').split('/');
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
      : kind === 'diff' ? diffPage(title, b, c)
      : kind === 'rename' ? renamePage(title)
      : kind === 'delete' ? deletePage(title)
      : viewPage(title, b === 'noredirect');
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
    } else if (kind === 'rename') {
      queueMicrotask(() => document.getElementById('rename-form')?.addEventListener('submit', e => {
        e.preventDefault();
        const f = new FormData(e.target);
        const out = document.getElementById('rename-error');
        try {
          const to = store.rename(title, f.get('to'), f.get('summary').trim(), f.get('redirect') === 'on');
          location.hash = pageHref(to);
        } catch (err) {
          out.textContent = err && err.name === 'QuotaExceededError'
            ? 'Not renamed: browser storage is full. Export the wiki, then delete or shorten pages.'
            : 'Not renamed: ' + (err && err.message || err);
          out.hidden = false;
          out.focus?.();
        }
      }));
    } else if (kind === 'delete') {
      queueMicrotask(() => document.getElementById('delete-form')?.addEventListener('submit', e => {
        e.preventDefault();
        store.remove(title);
        flash = `Deleted "${title}" and its history.`;
        location.hash = '#/special/AllPages';
      }));
    } else if (kind === 'history') {
      queueMicrotask(() => document.getElementById('history-form')?.addEventListener('submit', e => {
        e.preventDefault();
        const f = new FormData(e.target);
        const oldId = f.get('oldid');
        const newId = f.get('newid');
        if (!oldId || !newId) return;
        const enc = encodeURIComponent(title.replace(/ /g, '_'));
        location.hash = `#/diff/${enc}/${oldId}...${newId}`;
      }));
    }
  }
  // One-time message from the previous action (e.g. a delete), read out by screen readers via role=status.
  if (flash) { html = `<p class="notice" role="status">${escapeHtml(flash)}</p>` + html; flash = ''; }
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

const skinSelect = document.getElementById('skin-select');
if (skinSelect) {
  const currentSkin = localStorage.getItem('pocket-wiki-skin') || 'paper';
  skinSelect.value = currentSkin;
  skinSelect.addEventListener('change', e => {
    const skin = e.target.value;
    document.documentElement.setAttribute('data-skin', skin);
    try {
      localStorage.setItem('pocket-wiki-skin', skin);
    } catch {}
  });
}

seedIfEmpty(store);
// Load optional special pages, then start routing.
import('./special.js').then(m => m.register?.(specials, { store, renderText, escapeHtml, pageHref, fmtTime }))
  .catch(() => {}).finally(() => { window.addEventListener('hashchange', route); route(); });

// Offline support: the service worker caches the app files after the first visit.
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('./sw.js').catch(err => console.warn('Service worker not registered:', err));
}
