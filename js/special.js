// Special pages module: AllPages, RecentChanges, Search, Export, Import.
// Registered into app.js router via register(specials, helpers).

export function register(specials, { store, renderText, escapeHtml, pageHref, fmtTime }) {
  const specialNav = () => `
    <nav class="special-nav" aria-label="Special pages navigation">
      <a href="#/special/AllPages">All pages</a> &bull;
      <a href="#/special/Categories">Categories</a> &bull;
      <a href="#/special/RecentChanges">Recent changes</a> &bull;
      <a href="#/special/Search">Search</a> &bull;
      <a href="#/special/WhatLinksHere">What links here</a> &bull;
      <a href="#/special/Export">Export</a> &bull;
      <a href="#/special/Import">Import</a> &bull;
      <a href="#/special/ImportArticle">Import an article</a>
    </nav>`;

  // --- Special:Categories ---
  function categoriesPage() {
    const cats = store.getAllCategories();
    let body;
    if (cats.length === 0) {
      body = '<p class="notice">No categories exist yet. Add <code>[[Category:Name]]</code> to any page to categorise it.</p>';
    } else {
      const items = cats.map(c => {
        const catTitle = 'Category:' + c.name;
        const pageExists = store.exists(catTitle);
        const cls = pageExists ? 'wikilink' : 'wikilink new';
        const tip = pageExists ? catTitle : catTitle + ' (page does not exist)';
        return `<li><a class="${cls}" href="${pageHref(catTitle)}" title="${escapeHtml(tip)}">${escapeHtml(c.name)}</a> <span class="category-member-count">(${c.count} page${c.count === 1 ? '' : 's'})</span></li>`;
      }).join('');
      body = `<p class="allpages-summary">Total categories: <strong>${cats.length}</strong></p>
              <ul class="allpages-list">${items}</ul>`;
    }
    return `<h1>Categories</h1>${specialNav()}${body}`;
  }

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
  function importPage() {
    return `
      <h1>Import Wiki</h1>
      ${specialNav()}
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
      </form>`;
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
  specials['Categories'] = categoriesPage;
  specials['RecentChanges'] = recentChangesPage;
  specials['Search'] = searchPage;
  specials['WhatLinksHere'] = whatLinksHerePage;
  specials['Export'] = exportPage;
  specials['Import'] = importPage;

  // Case-insensitive aliases
  specials['allpages'] = allPagesPage;
  specials['categories'] = categoriesPage;
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
      } else if (e.target.id === 'special-import-form') {
        e.preventDefault();
        handleImportSubmit(e.target);
      }
    });

    // Button clicks for Export
    document.addEventListener('click', e => {
      if (e.target.id === 'btn-export-download') {
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
