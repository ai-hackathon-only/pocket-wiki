// App shell: hash router and the core pages (view, edit, history, old revision).
// Special pages register themselves through `specials` (see js/special.js).
import * as store from './storage.js';
import { render, escapeHtml, pageHref } from './wikitext.js';
import { seedIfEmpty } from './seed.js';
import { computeDiff, renderDiffHtml } from './diff.js';
import { compressPageData, decompressPageData, makeShareUrl } from './share.js';

const app = document.getElementById('app');
export const specials = {}; // name -> (params) => html

const renderText = text => render(text, { exists: t => t.startsWith('Special:') || store.exists(t), normalize: store.normalizeTitle });
const fmtTime = ts => new Date(ts).toLocaleString();
// A bad escape like '#/wiki/100%' must not throw; fall back to the raw text.
const safeDecode = s => { try { return decodeURIComponent(s || ''); } catch { return s || ''; } };
const titleFromPath = p => store.normalizeTitle(safeDecode(p));
let flash = '';
const enc = title => encodeURIComponent(title.replace(/ /g, '_'));
let editingTitle = null;
let editingRevId = null;

const tabs = (title, active) => {
  const isTalk = title.startsWith('Talk:');
  const subjectTitle = isTalk ? title.slice(5) : title;
  const talkTitle = isTalk ? title : `Talk:${title}`;
  const subjectExists = store.exists(subjectTitle);
  const talkExists = store.exists(talkTitle);

  const subjectHref = `#/wiki/${enc(subjectTitle)}`;
  const talkHref = `#/wiki/${enc(talkTitle)}`;
  const whatLinksHref = `#/special/WhatLinksHere/${enc(title)}`;

  const actions = [['wiki', 'Read'], ['edit', 'Edit'], ['history', 'History'], ['rename', 'Rename'], ['delete', 'Delete'], ['share', 'Share']];

  return `
  <nav class="page-tabs" aria-label="Page tools and navigation">
    <div class="tab-group tab-group-namespaces">
      <a href="${subjectHref}" class="tab-item tab-namespace${!subjectExists ? ' new' : ''}"${(!isTalk && active === 'wiki') ? ' aria-current="page"' : ''}>${isTalk ? 'Article' : 'Page'}</a>
      <a href="${talkHref}" class="tab-item tab-namespace${!talkExists ? ' new' : ''}"${(isTalk && active === 'wiki') ? ' aria-current="page"' : ''}>Discussion</a>
    </div>
    <div class="tab-group tab-group-actions">
      ${actions.map(([k, label]) =>
        `<a href="#/${k}/${enc(title)}"${k === active ? ' aria-current="page"' : ''} class="tab-item">${label}</a>`).join('')}
      <a href="${whatLinksHref}" class="tab-item tab-whatlinkshere">What links here</a>
    </div>
  </nav>`;
};

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

function sharePage(title) {
  if (!store.exists(title)) {
    return `<h1>Share ${escapeHtml(title)}</h1>${tabs(title, 'share')}<p class="notice">This page does not exist yet, so there is nothing to share.</p>`;
  }
  const rev = store.load(title);
  const isOversized = rev && rev.text.length > 100 * 1024;
  return `<h1>Share ${escapeHtml(title)}</h1>${tabs(title, 'share')}
    <div class="share-page">
      <p>Share this page directly without a server. Anyone opening the link receives a compressed copy of the latest version and can import it into their browser.</p>
      ${isOversized ? `
        <p class="notice" role="alert"><strong>Page too large:</strong> This page is ${(rev.text.length / 1024).toFixed(0)} KB. Serverless link sharing is limited to pages under 100 KB so links are not truncated by browsers or chat apps. Use JSON Export from Special:AllPages to share large pages.</p>
      ` : `
        <div class="share-box">
          <label for="share-url-input">Shareable link</label>
          <div class="share-url-row">
            <input id="share-url-input" type="text" readonly value="Generating link..." aria-label="Shareable link">
            <button id="btn-copy-share" type="button">Copy link</button>
          </div>
          <p id="share-copy-status" role="status" class="notice" hidden></p>
          <div class="share-details" id="share-details" hidden>
            <span class="share-metric" id="share-token-metric"></span>
          </div>
        </div>
      `}
    </div>`;
}

function shareImportPage() {
  return `<div id="share-import-container">
    <h1>Shared Page</h1>
    <p class="notice" id="share-import-status">Loading the shared page…</p>
    <div id="share-import-content" hidden></div>
  </div>`;
}

function editPage(title) {
  const rev = store.load(title);
  editingTitle = title;
  editingRevId = rev ? rev.id : 0;
  return `<h1>${rev ? 'Editing' : 'Creating'} ${escapeHtml(title)}</h1>${tabs(title, 'edit')}
    <form class="edit-form" id="edit-form">
      <div id="edit-conflict-notice" role="region" aria-live="polite"></div>
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
      <fieldset class="history-fieldset">
        <legend class="visually-hidden">Revision list and selection</legend>
        <ol class="history" reversed>${rows}</ol>
      </fieldset>
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
        <div class="diff-container" role="region" aria-label="Differences table" tabindex="0">
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

function route(options = {}) {
  const [, kind = 'wiki', a, b, c] = (location.hash || '#/wiki/Main_Page').split('/');
  if (kind !== 'edit') {
    editingTitle = null;
    editingRevId = null;
  }
  let html, docTitle;
  if (kind === 'special') {
    const name = safeDecode(a);
    const fn = specials[name];
    const subpath = safeDecode(b);
    html = fn ? fn(new URLSearchParams(b || ''), subpath) : `<h1>Special:${escapeHtml(name)}</h1><p class="notice">No such special page.</p>`;
    docTitle = 'Special:' + name;
  } else if (kind === 'share-import') {
    docTitle = 'Shared Page';
    html = shareImportPage();
    queueMicrotask(async () => {
      const statusEl = document.getElementById('share-import-status');
      const contentEl = document.getElementById('share-import-content');
      if (!statusEl || !contentEl) return;
      try {
        const data = await decompressPageData(a);
        statusEl.hidden = true;
        const exists = store.exists(data.title);
        contentEl.innerHTML = `
          <h2>Import shared page: ${escapeHtml(data.title)}</h2>
          <div class="share-import-banner">
            <p>This page was shared with you. It contains a revision from ${escapeHtml(fmtTime(data.ts))}.</p>
            ${exists
              ? `<p class="notice"><strong>Note:</strong> You already have a page titled "${escapeHtml(data.title)}" in your local wiki. Importing will save this as a new revision in its history.</p>`
              : `<p class="notice">Importing will add this page to your local wiki.</p>`}
            <div class="edit-actions">
              <button type="button" id="btn-import-confirm">Import into wiki</button>
              <a href="${pageHref('Main Page')}">Cancel</a>
            </div>
          </div>
          <hr>
          <h3>Preview</h3>
          <article class="wiki-content">${renderText(data.text)}</article>
        `;
        contentEl.hidden = false;
        document.getElementById('btn-import-confirm')?.addEventListener('click', () => {
          try {
            const cleanTitle = store.normalizeTitle(data.title);
            if (!cleanTitle || cleanTitle.startsWith('Special:')) {
              throw new Error('Choose a valid page title. Special pages cannot be imported.');
            }
            store.save(cleanTitle, data.text, 'Imported from shared link');
            flash = `Imported "${cleanTitle}" successfully into your wiki.`;
            location.hash = pageHref(cleanTitle);
          } catch (err) {
            alert('Failed to import page: ' + (err && err.message || err));
          }
        });
      } catch (err) {
        statusEl.textContent = 'Could not load shared page: ' + (err && err.message || err);
        statusEl.hidden = false;
      }
    });
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
      : kind === 'share' ? sharePage(title)
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
    } else if (kind === 'share') {
      queueMicrotask(async () => {
        const input = document.getElementById('share-url-input');
        const details = document.getElementById('share-details');
        const metric = document.getElementById('share-token-metric');
        const copyBtn = document.getElementById('btn-copy-share');
        const copyStatus = document.getElementById('share-copy-status');
        const rev = store.load(title);
        if (!rev || !input) return;
        try {
          const token = await compressPageData({ title, text: rev.text, ts: rev.ts, summary: rev.summary });
          const url = makeShareUrl(token);
          input.value = url;
          if (metric && details) {
            const origBytes = new TextEncoder().encode(rev.text).length;
            let note = `Payload compressed from ${origBytes.toLocaleString()} bytes to ${token.length.toLocaleString()} chars.`;
            if (url.length > 32768) {
              note += ' Note: This link is longer than 32 KB and may be truncated by some chat apps or browsers.';
            }
            metric.textContent = note;
            details.hidden = false;
          }
        } catch (err) {
          input.value = 'Failed to generate link: ' + (err && err.message || err);
        }
        copyBtn?.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(input.value);
          } catch {
            input.select();
            document.execCommand('copy');
          }
          if (copyStatus) {
            copyStatus.textContent = 'Link copied.';
            copyStatus.hidden = false;
            setTimeout(() => { copyStatus.hidden = true; }, 3000);
          }
        });
      });
    }
  }
  // One-time message from the previous action (e.g. a delete), read out by screen readers via role=status.
  if (flash) { html = `<p class="notice" role="status">${escapeHtml(flash)}</p>` + html; flash = ''; }
  app.innerHTML = html;
  document.title = `${docTitle} · pocket-wiki`;
  const a11yStatus = document.getElementById('a11y-status');
  if (a11yStatus) a11yStatus.textContent = `Navigated to ${docTitle}`;
  if (!options.preserveScroll) {
    app.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
}

const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
if (searchForm) {
  searchForm.addEventListener('submit', e => {
    e.preventDefault();
    const q = new FormData(e.target).get('q').trim();
    if (q) location.hash = '#/special/Search/q=' + encodeURIComponent(q);
  });
}
if (searchInput) {
  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      searchInput.value = '';
      searchInput.blur();
    }
  });
}

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

// Synchronize open tabs when another tab modifies pages
store.subscribe(() => {
  const [, kind = 'wiki'] = (location.hash || '#/wiki/Main_Page').split('/');
  if (kind === 'edit') {
    if (editingTitle) {
      const rev = store.load(editingTitle);
      const revId = rev ? rev.id : 0;
      if (revId !== editingRevId) {
        const banner = document.getElementById('edit-conflict-notice');
        if (banner) {
          banner.innerHTML = `<div class="notice edit-conflict-banner">
            <strong>Notice:</strong> This page was updated in another tab (revision ${revId}${rev?.ts ? ` at ${escapeHtml(fmtTime(rev.ts))}` : ''}). You can keep editing to save a new revision, or <a href="${pageHref(editingTitle)}">view the latest version</a>.
          </div>`;
        }
      }
    }
  } else if (kind === 'rename' || kind === 'delete') {
    const input = document.getElementById('rename-to');
    if (!input || !input.value || input.value === editingTitle) {
      route({ preserveScroll: true });
    }
  } else {
    route({ preserveScroll: true });
  }
});

// Synchronize skin selection across open tabs without requiring page reload
if (typeof window !== 'undefined') {
  window.addEventListener('storage', e => {
    if (e.key === 'pocket-wiki-skin') {
      const newSkin = e.newValue || 'paper';
      document.documentElement.setAttribute('data-skin', newSkin);
      const sel = document.getElementById('skin-select');
      if (sel) sel.value = newSkin;
    }
  });
}

// Offline support: the service worker caches the app files after the first visit.
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('./sw.js').catch(err => console.warn('Service worker not registered:', err));
}
