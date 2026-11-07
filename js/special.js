// Special pages module: AllPages, RecentChanges, Search, Export, Import.
// Registered into app.js router via register(specials, helpers).

export function register(specials, { store, renderText, escapeHtml, pageHref, fmtTime }) {
  const specialNav = () => `
    <nav class="special-nav" aria-label="Special pages navigation" style="margin-bottom: 1.5rem; font-size: 0.95rem;">
      <a href="#/special/AllPages">All pages</a> &bull;
      <a href="#/special/RecentChanges">Recent changes</a> &bull;
      <a href="#/special/Search">Search</a> &bull;
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
      body = `<p style="margin-bottom: 1rem;">Total pages: <strong>${titles.length}</strong></p>
              <ul class="allpages-list" style="columns: 2 16rem; gap: 1.5rem; list-style-type: none; padding-left: 0;">${items}</ul>`;
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
        const summary = c.summary ? escapeHtml(c.summary) : '<span style="opacity: 0.7; font-style: italic;">(no summary)</span>';
        return `<li style="margin-bottom: 0.5rem; line-height: 1.4;">
          <time datetime="${escapeHtml(c.ts)}" style="font-size: 0.85rem; opacity: 0.8;">${escapeHtml(fmtTime(c.ts))}</time> &mdash;
          <a class="wikilink" href="${pageHref(c.title)}" style="font-weight: 600;">${escapeHtml(c.title)}</a>
          <span style="font-size: 0.85rem;">(<a href="${revLink}">rev #${c.id}</a>)</span> &mdash;
          <span class="rc-summary">${summary}</span>
        </li>`;
      }).join('');
      body = `<ul class="recentchanges-list" style="list-style-type: none; padding-left: 0;">${items}</ul>`;
    }
    return `<h1>Recent Changes</h1>${specialNav()}${body}`;
  }

  // --- Special:Search ---
  function searchPage(params) {
    const q = (params.get('q') || '').trim();
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
          <div class="search-exact" style="background: #eef6ff; border-left: 4px solid #1a73e8; padding: 0.75rem 1rem; margin-bottom: 1.5rem;">
            Page title matches: <a class="wikilink" href="${pageHref(exactTitle)}" style="font-weight: 700; font-size: 1.1rem;">${escapeHtml(exactTitle)}</a>
          </div>`);
      }

      if (titleMatches.length > 0) {
        const list = titleMatches.map(t =>
          `<li><a class="wikilink" href="${pageHref(t)}">${escapeHtml(t)}</a></li>`
        ).join('');
        sections.push(`
          <div class="search-title-matches" style="margin-bottom: 1.5rem;">
            <h2>Page title matches (${titleMatches.length})</h2>
            <ul style="list-style-type: square; padding-left: 1.25rem;">${list}</ul>
          </div>`);
      }

      if (textMatches.length > 0) {
        const list = textMatches.map(m => {
          const safeSnippet = escapeHtml(m.snippet);
          // Highlight search term occurrences in snippet
          const regex = new RegExp(escapeRegex(escapeHtml(q)), 'gi');
          const highlighted = safeSnippet.replace(regex, match => `<mark>${match}</mark>`);
          return `<li style="margin-bottom: 0.75rem;">
            <div><a class="wikilink" href="${pageHref(m.title)}" style="font-weight: 600;">${escapeHtml(m.title)}</a></div>
            <div style="font-size: 0.9rem; opacity: 0.85; margin-top: 0.2rem;">${highlighted}</div>
          </li>`;
        }).join('');
        sections.push(`
          <div class="search-text-matches" style="margin-bottom: 1.5rem;">
            <h2>Page text matches (${textMatches.length})</h2>
            <ul style="list-style-type: none; padding-left: 0;">${list}</ul>
          </div>`);
      }

      if (totalMatches === 0) {
        sections.push(`<p class="notice">No pages matching &ldquo;<strong>${escapeHtml(q)}</strong>&rdquo; were found.</p>
                       <p>You can <a href="#/edit/${encodeURIComponent(q.replace(/ /g, '_'))}">create the page &ldquo;${escapeHtml(q)}&rdquo;</a>.</p>`);
      }

      resultsHtml = `
        <div class="search-results" style="margin-top: 1.5rem;">
          <p style="opacity: 0.8; font-size: 0.9rem;">Showing results for &ldquo;<strong>${escapeHtml(q)}</strong>&rdquo; (${totalMatches} match${totalMatches === 1 ? '' : 'es'}):</p>
          ${sections.join('')}
        </div>`;
    }

    return `
      <h1>Search</h1>
      ${specialNav()}
      <form class="special-search-form" id="special-search-page-form" role="search" style="display: flex; gap: 0.5rem; max-width: 32rem; margin-bottom: 1.5rem;">
        <input type="search" name="q" id="search-query-input" value="${escapeHtml(q)}" placeholder="Search wiki titles and text..." required style="flex: 1; padding: 0.5rem;">
        <button type="submit" style="padding: 0.5rem 1rem;">Search</button>
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
      <div style="background: #f7f9fa; border: 1px solid #d0d7de; border-radius: 6px; padding: 1rem; margin-bottom: 1.5rem;">
        <p style="margin-top: 0;">Pages available for export: <strong>${count}</strong></p>
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <button type="button" id="btn-export-download" style="padding: 0.5rem 1rem; font-weight: 600;">Download pocket-wiki.json</button>
          <button type="button" id="btn-export-copy" style="padding: 0.5rem 1rem;">Copy JSON to clipboard</button>
        </div>
        <div id="export-status-msg" style="margin-top: 0.5rem; font-size: 0.85rem; color: #1a7f37;" aria-live="polite"></div>
      </div>
      <details>
        <summary style="cursor: pointer; font-weight: 600; margin-bottom: 0.5rem;">Preview raw JSON</summary>
        <textarea id="export-preview-area" readonly rows="12" style="width: 100%; font-family: ui-monospace, monospace; font-size: 0.85rem; box-sizing: border-box;">${escapeHtml(jsonStr)}</textarea>
      </details>`;
  }

  // --- Special:Import ---
  function importPage() {
    return `
      <h1>Import Wiki</h1>
      ${specialNav()}
      <p style="color: #b32424; font-weight: 600;">Caution: Importing will overwrite all existing pages and revision history with data from the imported file.</p>
      <form id="special-import-form" style="display: grid; gap: 1rem; max-width: 38rem; margin-bottom: 1.5rem;">
        <div>
          <label for="import-file-input" style="display: block; font-weight: 600; margin-bottom: 0.25rem;">Select JSON export file:</label>
          <input type="file" id="import-file-input" accept=".json,application/json" style="display: block;">
        </div>
        <div>
          <label for="import-textarea" style="display: block; font-weight: 600; margin-bottom: 0.25rem;">Or paste exported JSON text:</label>
          <textarea id="import-textarea" rows="8" placeholder='{ "pages": { ... } }' style="width: 100%; font-family: ui-monospace, monospace; font-size: 0.85rem; box-sizing: border-box;"></textarea>
        </div>
        <div>
          <button type="submit" id="btn-submit-import" style="padding: 0.6rem 1.2rem; background: #b32424; color: #fff; border: none; border-radius: 4px; font-weight: 600; cursor: pointer;">Import and Replace Data</button>
        </div>
        <div id="import-error-msg" style="color: #b32424; font-weight: 600;" aria-live="assertive"></div>
      </form>`;
  }

  function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Register special page renderers
  specials['AllPages'] = allPagesPage;
  specials['RecentChanges'] = recentChangesPage;
  specials['Search'] = searchPage;
  specials['Export'] = exportPage;
  specials['Import'] = importPage;

  // Case-insensitive aliases
  specials['allpages'] = allPagesPage;
  specials['recentchanges'] = recentChangesPage;
  specials['search'] = searchPage;
  specials['export'] = exportPage;
  specials['import'] = importPage;

  // One-time delegated event listeners for special pages
  if (!window._pocketWikiSpecialListenersBound) {
    window._pocketWikiSpecialListenersBound = true;

    // Search page form submission
    document.addEventListener('submit', e => {
      if (e.target.id === 'special-search-page-form') {
        e.preventDefault();
        const input = e.target.querySelector('input[name="q"]');
        const q = (input ? input.value : '').trim();
        location.hash = '#/special/Search/' + encodeURIComponent('q=' + q);
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
        store.importAll(parsed);
        alert(`Successfully imported ${count} page(s)! Redirecting to Main Page.`);
        location.hash = '#/wiki/Main_Page';
      } catch (err) {
        showError('Import failed: ' + err.message);
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
