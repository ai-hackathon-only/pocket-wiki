// Special pages module: AllPages, RecentChanges, Search, Export, Import.
// Registered into app.js router via register(specials, helpers).

export function register(specials, { store, renderText, escapeHtml, pageHref, fmtTime }) {
  const specialNav = () => `
    <nav class="special-nav" aria-label="Special pages navigation">
      <a href="#/special/AllPages">All pages</a> &bull;
      <a href="#/special/RecentChanges">Recent changes</a> &bull;
      <a href="#/special/Search">Search</a> &bull;
      <a href="#/special/WhatLinksHere">What links here</a> &bull;
      <a href="#/special/Export">Export</a> &bull;
      <a href="#/special/Import">Import</a>
    </nav>`;

  // --- Special:AllPages ---
  function allPagesPage() {
    const titles = store.list();
    let body;
    if (titles.length === 0) {
      body = '<p class="notice">No pages exist yet. <a href="#/edit/Main_Page">Create the Main Page</a>.</p>';
    } else {
      const items = titles.map(t =>
        `<li><a class="wikilink" href="${pageHref(t)}">${escapeHtml(t)}</a></li>`
      ).join('');
      body = `<p class="allpages-summary">Total pages: <strong>${titles.length}</strong></p>
              <ul class="allpages-list">${items}</ul>`;
    }
    return `<h1>All Pages</h1>${specialNav()}${body}`;
  }

  // --- Special:RecentChanges ---
  function recentChangesPage() {
    const changes = store.recentChanges(50);
    let body;
    if (changes.length === 0) {
      body = '<p class="notice">No recent changes found.</p>';
    } else {
      const items = changes.map(c => {
        const encTitle = encodeURIComponent(c.title.replace(/ /g, '_'));
        const revLink = `#/rev/${encTitle}/${c.id}`;
        const summary = c.summary ? escapeHtml(c.summary) : '<span class="rc-empty-summary">(no summary)</span>';
        return `<li class="rc-item">
          <time datetime="${escapeHtml(c.ts)}" class="rc-time">${escapeHtml(fmtTime(c.ts))}</time> &mdash;
          <a class="wikilink rc-title" href="${pageHref(c.title)}">${escapeHtml(c.title)}</a>
          <span class="rc-rev">(<a href="${revLink}">rev #${c.id}</a>)</span> &mdash;
          <span class="rc-summary">${summary}</span>
        </li>`;
      }).join('');
      body = `<ul class="recentchanges-list">${items}</ul>`;
    }
    return `<h1>Recent Changes</h1>${specialNav()}${body}`;
  }

  // --- Special:Search ---
  function searchPage(params) {
    const q = ((params && params.get('q')) || '').trim();
    const qLower = q.toLowerCase();

    let resultsHtml = '';
    if (q) {
      const allTitles = store.list();
      const exactTitle = allTitles.find(t => t.toLowerCase() === qLower);

      // Title matches (excluding exact match to avoid duplication)
      const titleMatches = allTitles.filter(t => t.toLowerCase().includes(qLower) && t !== exactTitle);

      // Full text search
      const textMatches = [];
      for (const t of allTitles) {
        const rev = store.load(t);
        if (!rev || !rev.text) continue;
        const textLower = rev.text.toLowerCase();
        const idx = textLower.indexOf(qLower);
        if (idx !== -1) {
          // Extract a context snippet around the match
          const start = Math.max(0, idx - 40);
          const end = Math.min(rev.text.length, idx + q.length + 60);
          let snippet = rev.text.slice(start, end).replace(/\s+/g, ' ');
          if (start > 0) snippet = '...' + snippet;
          if (end < rev.text.length) snippet = snippet + '...';
          textMatches.push({ title: t, snippet });
        }
      }

      const totalMatches = (exactTitle ? 1 : 0) + titleMatches.length + textMatches.length;

      let sections = [];
      if (exactTitle) {
        sections.push(`
          <div class="search-exact">
            Page title matches: <a class="wikilink search-exact-title" href="${pageHref(exactTitle)}">${escapeHtml(exactTitle)}</a>
          </div>`);
      }

      if (titleMatches.length > 0) {
        const list = titleMatches.map(t =>
          `<li><a class="wikilink" href="${pageHref(t)}">${escapeHtml(t)}</a></li>`
        ).join('');
        sections.push(`
          <div class="search-title-matches">
            <h2>Page title matches (${titleMatches.length})</h2>
            <ul>${list}</ul>
          </div>`);
      }

      if (textMatches.length > 0) {
        const list = textMatches.map(m => {
          const safeSnippet = escapeHtml(m.snippet);
          // Highlight search term occurrences in snippet
          const regex = new RegExp(escapeRegex(escapeHtml(q)), 'gi');
          const highlighted = safeSnippet.replace(regex, match => `<mark>${match}</mark>`);
          return `<li class="search-text-item">
            <div><a class="wikilink search-match-title" href="${pageHref(m.title)}">${escapeHtml(m.title)}</a></div>
            <div class="search-match-snippet">${highlighted}</div>
          </li>`;
        }).join('');
        sections.push(`
          <div class="search-text-matches">
            <h2>Page text matches (${textMatches.length})</h2>
            <ul>${list}</ul>
          </div>`);
      }

      if (totalMatches === 0) {
        sections.push(`<p class="notice">No pages matching &ldquo;<strong>${escapeHtml(q)}</strong>&rdquo; were found.</p>
                       <p>You can <a href="#/edit/${encodeURIComponent(q.replace(/ /g, '_'))}">create the page &ldquo;${escapeHtml(q)}&rdquo;</a>.</p>`);
      }

      resultsHtml = `
        <div class="search-results">
          <p class="search-results-summary">Showing results for &ldquo;<strong>${escapeHtml(q)}</strong>&rdquo; (${totalMatches} match${totalMatches === 1 ? '' : 'es'}):</p>
          ${sections.join('')}
        </div>`;
    }

    return `
      <h1>Search</h1>
      ${specialNav()}
      <form class="special-search-form" id="special-search-page-form" role="search">
        <label for="search-query-input" class="visually-hidden">Search wiki titles and text</label>
        <input type="search" name="q" id="search-query-input" value="${escapeHtml(q)}" placeholder="Search wiki titles and text..." required>
        <button type="submit">Search</button>
      </form>
      ${resultsHtml}`;
  }

  // --- Special:Export ---
  function exportPage() {
    const data = store.exportAll();
    const count = Object.keys(data.pages || {}).length;
    const jsonStr = JSON.stringify(data, null, 2);

    return `
      <h1>Export Wiki</h1>
      ${specialNav()}
      <p>Export the entire wiki including all pages, revisions, and edit history into a single JSON file.</p>
      <div class="export-panel">
        <p>Pages available for export: <strong>${count}</strong></p>
        <div class="export-actions">
          <button type="button" id="btn-export-download" class="btn-export btn-export-primary">Download pocket-wiki.json</button>
          <button type="button" id="btn-export-copy" class="btn-export">Copy JSON to clipboard</button>
        </div>
        <div id="export-status-msg" class="export-status" aria-live="polite"></div>
      </div>
      <details class="export-details">
        <summary class="export-summary">Preview raw JSON</summary>
        <label for="export-preview-area" class="visually-hidden">Preview raw JSON export</label>
        <textarea id="export-preview-area" class="export-textarea" readonly rows="12">${escapeHtml(jsonStr)}</textarea>
      </details>`;
  }

  // --- Special:Import ---
  const SAMPLE_ARTICLE = {
    title: 'Apollo 11',
    source: 'https://en.wikipedia.org/wiki/Apollo_11',
    wikitext: `'''Apollo 11''' (July 16–24, 1969) was the American spaceflight that first landed humans on the [[Moon]]. Commander [[Neil Armstrong]] and Lunar Module Pilot [[Buzz Aldrin]] landed the Apollo Lunar Module ''Eagle'' on July 20, 1969, at 20:17 UTC, and Armstrong became the first person to step onto the Moon's surface six hours and 39 minutes later, on July 21 at 02:56 UTC.

Aldrin joined him 19 minutes later, and they spent two hours and 15 minutes exploring the site they had named Tranquility Base upon landing. Armstrong and Aldrin collected 47.5 pounds (21.5 kg) of lunar material to bring back to Earth. Command Module Pilot [[Michael Collins]] flew the Command Module ''Columbia'' alone in lunar orbit while they were on the surface. Armstrong and Aldrin were on the Moon's surface for 21 hours and 36 minutes before lifting off to rejoin ''Columbia''.

== Mission Details ==

Apollo 11 was launched by a [[Saturn V]] rocket from [[Kennedy Space Center]] on Merritt Island, Florida, on July 16 at 13:32 UTC. It was the fifth crewed mission of NASA's Apollo program. The Apollo spacecraft had three parts:
* A '''command module''' (CM) with a cabin for the three astronauts, the only part that returned to Earth;
* A '''service module''' (SM), which supported the command module with propulsion, electrical power, oxygen, and water;
* A '''lunar module''' (LM) with two stages—a descent stage for landing on the Moon and an ascent stage to place the astronauts back into lunar orbit.

== Mission Crew ==

{| class="wikitable"
|+ Apollo 11 Flight Crew
|-
! Position !! Astronaut
|-
| Commander || [[Neil Armstrong]]
|-
| Command Module Pilot || [[Michael Collins]]
|-
| Lunar Module Pilot || [[Buzz Aldrin]]
|}

== First Lunar Landing ==

The landing occurred at 20:17:40 UTC on Sunday, July 20, 1969. Armstrong confirmed touchdown with the words:
: ''"Houston, Tranquility Base here. The Eagle has landed."''

Armstrong stepped onto the lunar surface at 02:56 UTC on July 21, describing the event as:
: ''"That's one small step for [a] man, one giant leap for mankind."''

The mission effectively met the national goal proposed in 1961 by President [[John F. Kennedy]]: "before this decade is out, of landing a man on the Moon and returning him safely to the Earth."

== See Also ==
* [[Artemis Program]]
* [[James Webb Space Telescope]]
* [[Voyager Interstellar Mission]]`
  };

  function importPage() {
    return `
      <h1>Import</h1>
      ${specialNav()}

      <section class="import-section" aria-labelledby="import-article-heading">
        <h2 id="import-article-heading" class="import-section-title">Import Article from Wikitext</h2>
        <p class="import-help">Import an individual article by pasting wikitext with source attribution under CC BY-SA 4.0.</p>
        <form id="special-import-article-form" class="special-import-form">
          <div>
            <label for="import-article-title" class="import-field-label">Article title:</label>
            <input type="text" id="import-article-title" class="import-input-text" placeholder="e.g. Apollo 11" required>
          </div>
          <div>
            <label for="import-article-source" class="import-field-label">Source attribution URL:</label>
            <input type="url" id="import-article-source" class="import-input-text" placeholder="https://en.wikipedia.org/wiki/..." value="https://en.wikipedia.org/wiki/Apollo_11">
          </div>
          <div>
            <label for="import-article-wikitext" class="import-field-label">Wikitext content:</label>
            <textarea id="import-article-wikitext" class="import-textarea" rows="10" placeholder="Paste wikitext here..." required></textarea>
          </div>
          <div class="import-options">
            <label class="import-checkbox-label">
              <input type="checkbox" id="import-article-attr-check" checked>
              <span>Include CC BY-SA 4.0 attribution section</span>
            </label>
          </div>
          <div class="import-actions">
            <button type="submit" id="btn-submit-article-import" class="btn-primary">Import Article</button>
            <button type="button" id="btn-load-sample-article" class="btn-secondary">Load sample article (Apollo 11)</button>
          </div>
          <div id="import-article-msg" class="import-status" aria-live="polite"></div>
        </form>
      </section>

      <hr class="import-divider">

      <section class="import-section" aria-labelledby="import-full-heading">
        <h2 id="import-full-heading" class="import-section-title">Import Full Wiki (JSON Backup)</h2>
        <p class="import-warning">Caution: Importing will overwrite all existing pages and revision history with data from the imported file.</p>
        <form id="special-import-form" class="special-import-form">
          <div>
            <label for="import-file-input" class="import-field-label">Select JSON export file:</label>
            <input type="file" id="import-file-input" class="import-file-input" accept=".json,application/json">
          </div>
          <div>
            <label for="import-textarea" class="import-field-label">Or paste exported JSON text:</label>
            <textarea id="import-textarea" class="import-textarea" rows="8" placeholder='{ "pages": { ... } }'></textarea>
          </div>
          <div>
            <button type="submit" id="btn-submit-import" class="btn-import-danger">Import and Replace Data</button>
          </div>
          <div id="import-error-msg" class="import-error" aria-live="assertive"></div>
        </form>
      </section>`;
  }

  function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // --- Special:WhatLinksHere ---
  function whatLinksHerePage(params, rawSubpath) {
    const targetParam = params?.get('target');
    let rawTarget = targetParam !== null && targetParam !== undefined ? targetParam : (rawSubpath || '');
    if (rawTarget.startsWith('target=')) {
      rawTarget = rawTarget.slice(7);
    }
    const target = rawTarget.replace(/_/g, ' ').trim();
    let body = `
      <form class="whatlinkshere-form" id="special-whatlinkshere-form" role="search" aria-label="What links here search">
        <label for="whatlinkshere-target">Page title:</label>
        <div class="whatlinkshere-input-row">
          <input id="whatlinkshere-target" name="target" type="text" value="${escapeHtml(target)}" placeholder="Enter page title">
          <button type="submit">Show links</button>
        </div>
      </form>`;

    if (!target) {
      body += '<p class="notice">Enter a page title above to see which pages link to it.</p>';
      return `<h1>What Links Here</h1>${specialNav()}${body}`;
    }

    const normTarget = store.normalizeTitle(target);
    const targetExists = store.exists(normTarget);
    const allTitles = store.list();
    const referringPages = [];

    for (const t of allTitles) {
      if (t === normTarget) continue;
      const rev = store.load(t);
      if (!rev || !rev.text) continue;

      const redirTarget = store.redirectTarget(rev.text);
      if (redirTarget === normTarget) {
        referringPages.push({ title: t, isRedirect: true });
        continue;
      }

      const linkRegex = /\[\[([^\[\]|]+)(?:\|[^\[\]]*)?\]\]/g;
      let m;
      let linksToTarget = false;
      while ((m = linkRegex.exec(rev.text)) !== null) {
        if (store.normalizeTitle(m[1]) === normTarget) {
          linksToTarget = true;
          break;
        }
      }
      if (linksToTarget) {
        referringPages.push({ title: t, isRedirect: false });
      }
    }

    const targetLink = `<a class="${targetExists ? 'wikilink' : 'wikilink new'}" href="${pageHref(normTarget)}">${escapeHtml(normTarget)}</a>${targetExists ? '' : ' (page does not exist)'}`;

    if (referringPages.length === 0) {
      body += `<div class="whatlinkshere-results">
        <h2>Pages linking to ${targetLink}</h2>
        <p class="notice">No pages link to <strong>${escapeHtml(normTarget)}</strong>.</p>
      </div>`;
    } else {
      const items = referringPages.map(item => `
        <li class="whatlinkshere-item">
          <a class="wikilink" href="${pageHref(item.title)}">${escapeHtml(item.title)}</a>
          ${item.isRedirect ? ' <span class="whatlinkshere-redirect">(redirect page)</span>' : ''}
        </li>
      `).join('');
      body += `<div class="whatlinkshere-results">
        <h2>Pages linking to ${targetLink}</h2>
        <p class="whatlinkshere-count">Found <strong>${referringPages.length}</strong> page(s) linking here:</p>
        <ul class="whatlinkshere-list">${items}</ul>
      </div>`;
    }

    return `<h1>What Links Here</h1>${specialNav()}${body}`;
  }

  // Register special page renderers
  specials['AllPages'] = allPagesPage;
  specials['RecentChanges'] = recentChangesPage;
  specials['Search'] = searchPage;
  specials['WhatLinksHere'] = whatLinksHerePage;
  specials['Export'] = exportPage;
  specials['Import'] = importPage;

  // Case-insensitive aliases
  specials['allpages'] = allPagesPage;
  specials['recentchanges'] = recentChangesPage;
  specials['search'] = searchPage;
  specials['whatlinkshere'] = whatLinksHerePage;
  specials['export'] = exportPage;
  specials['import'] = importPage;

  // One-time delegated event listeners for special pages
  if (typeof window !== 'undefined' && !window._pocketWikiSpecialListenersBound) {
    window._pocketWikiSpecialListenersBound = true;

    // Search page form submission
    document.addEventListener('submit', e => {
      if (e.target.id === 'special-search-page-form') {
        e.preventDefault();
        const input = e.target.querySelector('input[name="q"]');
        const q = (input ? input.value : '').trim();
        location.hash = '#/special/Search/q=' + encodeURIComponent(q);
      } else if (e.target.id === 'special-whatlinkshere-form') {
        e.preventDefault();
        const input = e.target.querySelector('input[name="target"]');
        const q = (input ? input.value : '').trim();
        location.hash = '#/special/WhatLinksHere/' + encodeURIComponent(q.replace(/ /g, '_'));
      } else if (e.target.id === 'special-import-article-form') {
        e.preventDefault();
        handleArticleImportSubmit(e.target);
      } else if (e.target.id === 'special-import-form') {
        e.preventDefault();
        handleImportSubmit(e.target);
      }
    });

    // Button clicks for Export and Article Import
    document.addEventListener('click', e => {
      if (e.target.id === 'btn-load-sample-article') {
        e.preventDefault();
        loadSampleArticle();
      } else if (e.target.id === 'btn-export-download') {
        e.preventDefault();
        try {
          const exportData = JSON.stringify(store.exportAll(), null, 2);
          const blob = new Blob([exportData], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          const dateStr = new Date().toISOString().slice(0, 10);
          a.href = url;
          a.download = `pocket-wiki-export-${dateStr}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          const status = document.getElementById('export-status-msg');
          if (status) status.textContent = 'File download initiated.';
        } catch (err) {
          alert('Download failed: ' + err.message);
        }
      } else if (e.target.id === 'btn-export-copy') {
        e.preventDefault();
        try {
          const exportData = JSON.stringify(store.exportAll(), null, 2);
          navigator.clipboard.writeText(exportData).then(() => {
            const btn = e.target;
            const originalText = btn.textContent;
            btn.textContent = 'Copied!';
            const status = document.getElementById('export-status-msg');
            if (status) status.textContent = 'JSON copied to clipboard.';
            setTimeout(() => {
              btn.textContent = originalText;
              if (status) status.textContent = '';
            }, 2500);
          }).catch(err => {
            alert('Clipboard write failed: ' + err.message);
          });
        } catch (err) {
          alert('Copy failed: ' + err.message);
        }
      }
    });
  }

  function loadSampleArticle() {
    const titleInput = document.getElementById('import-article-title');
    const sourceInput = document.getElementById('import-article-source');
    const wikitextInput = document.getElementById('import-article-wikitext');
    const msgEl = document.getElementById('import-article-msg');
    if (titleInput) titleInput.value = SAMPLE_ARTICLE.title;
    if (sourceInput) sourceInput.value = SAMPLE_ARTICLE.source;
    if (wikitextInput) wikitextInput.value = SAMPLE_ARTICLE.wikitext;
    if (msgEl) {
      msgEl.className = 'import-status import-status-info';
      msgEl.textContent = 'Sample article loaded. Review the wikitext and click "Import Article" to save.';
    }
  }

  function handleArticleImportSubmit(form) {
    const msgEl = document.getElementById('import-article-msg');
    const showMsg = (text, isError = false) => {
      if (msgEl) {
        msgEl.className = isError ? 'import-status import-status-error' : 'import-status import-status-success';
        msgEl.textContent = text;
      }
    };

    const titleInput = form.querySelector('#import-article-title');
    const sourceInput = form.querySelector('#import-article-source');
    const wikitextInput = form.querySelector('#import-article-wikitext');
    const attrCheck = form.querySelector('#import-article-attr-check');

    const rawTitle = (titleInput?.value || '').trim();
    if (!rawTitle) {
      showMsg('Please enter an article title.', true);
      titleInput?.focus();
      return;
    }

    if (rawTitle.toLowerCase().startsWith('special:')) {
      showMsg('Special pages cannot be imported as articles.', true);
      titleInput?.focus();
      return;
    }

    const normTitle = store.normalizeTitle(rawTitle);
    const rawWikitext = (wikitextInput?.value || '').trim();
    if (!rawWikitext) {
      showMsg('Please paste wikitext for the article.', true);
      wikitextInput?.focus();
      return;
    }

    const source = (sourceInput?.value || '').trim();
    let finalWikitext = rawWikitext;

    if (attrCheck?.checked) {
      const sourceUrl = source.startsWith('http://') || source.startsWith('https://')
        ? source
        : `https://en.wikipedia.org/wiki/${encodeURIComponent(normTitle.replace(/ /g, '_'))}`;
      const sourceLabel = `${normTitle} on Wikipedia`;
      const attributionText = `\n\n== Source Attribution ==\n''This article incorporates text from [${sourceUrl} ${sourceLabel}], available under the [https://creativecommons.org/licenses/by-sa/4.0/ Creative Commons Attribution-ShareAlike 4.0 International License].''`;

      if (!finalWikitext.includes('Creative Commons Attribution-ShareAlike')) {
        finalWikitext += attributionText;
      }
    }

    const existingRevision = store.load(normTitle);
    if (existingRevision) {
      const revCount = store.history(normTitle)?.length || 1;
      const confirmOverwrite = window.confirm(
        `A page titled "${normTitle}" already exists with ${revCount} revision(s).\n\nDo you want to import this as a new revision?`
      );
      if (!confirmOverwrite) return;
    }

    const summarySource = source ? (source.startsWith('http') ? 'Wikipedia URL' : source) : 'Wikipedia';
    const summary = `Imported article from ${summarySource} under CC BY-SA 4.0`;

    try {
      store.save(normTitle, finalWikitext, summary);
      showMsg(`Article "${normTitle}" imported successfully! Loading page…`);
      setTimeout(() => {
        location.hash = pageHref(normTitle);
      }, 500);
    } catch (err) {
      showMsg('Failed to save article: ' + (err && err.message || err), true);
    }
  }

  function handleImportSubmit(form) {
    const errorEl = document.getElementById('import-error-msg');
    const showError = msg => { if (errorEl) errorEl.textContent = msg; };
    showError('');

    const fileInput = form.querySelector('#import-file-input');
    const textarea = form.querySelector('#import-textarea');
    const file = fileInput?.files?.[0];

    const doImport = jsonString => {
      let parsed;
      try {
        parsed = JSON.parse(jsonString);
      } catch (err) {
        showError('Invalid JSON format: ' + err.message);
        return;
      }

      if (!parsed || typeof parsed !== 'object' || !parsed.pages) {
        showError('Import failed: File does not contain a valid pocket-wiki export object (missing "pages").');
        return;
      }

      const count = Object.keys(parsed.pages).length;
      const confirmed = window.confirm(
        `Are you sure you want to replace all wiki content with ${count} page(s) from this file?\n\nThis will completely overwrite current data.`
      );

      if (!confirmed) return;

      try {
        const imported = store.importAll(parsed);
        alert(`Imported ${imported} page(s). Opening the Main Page.`);
        location.hash = '#/wiki/Main_Page';
      } catch (err) {
        showError('Import failed, nothing was changed: ' + err.message);
      }
    };

    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        doImport(ev.target.result);
      };
      reader.onerror = () => {
        showError('Failed to read selected file.');
      };
      reader.readAsText(file);
    } else if (textarea?.value?.trim()) {
      doImport(textarea.value.trim());
    } else {
      showError('Please choose a JSON file or paste JSON content to import.');
    }
  }
}
