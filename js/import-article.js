// Special:ImportArticle: paste one article's wikitext from another wiki and save it
// as a page here, with a CC BY-SA 4.0 credit line. Nothing is fetched: the reader pastes the text.

// Remove a balanced block that starts with `open` and ends with `close` (handles nesting).
function stripBalanced(text, open, close, keep = () => false) {
  let out = '';
  let i = 0;
  while (i < text.length) {
    if (text.startsWith(open, i)) {
      let depth = 0;
      let j = i;
      while (j < text.length) {
        if (text.startsWith(open, j)) { depth++; j += open.length; }
        else if (text.startsWith(close, j)) { depth--; j += close.length; if (depth === 0) break; }
        else j++;
      }
      const block = text.slice(i, j);
      out += keep(block) ? block : '';
      i = j;
    } else {
      out += text[i++];
    }
  }
  return out;
}

// Turn source wikitext into the subset pocket-wiki renders. Tables `{| |}` stay; templates,
// references, comments, files and HTML tags are dropped, because they would show as raw text.
export function cleanWikitext(src) {
  let t = String(src).replace(/\r\n?/g, '\n');
  t = t.replace(/<!--[\s\S]*?-->/g, '');
  t = t.replace(/<ref[^>]*\/>/gi, '').replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, '');
  t = stripBalanced(t, '{{', '}}');
  t = stripBalanced(t, '[[', ']]', b => !/^\[\[\s*(File|Image|Category)\s*:/i.test(b));
  t = t.replace(/<\/?[a-z][^>]*>/gi, '');
  return t.replace(/\n{3,}/g, '\n\n').trim();
}

const SOURCE_RE = /^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)+\/[^\s\]]*$/i;

export function register(specials, { store, pageHref }) {
  function importArticlePage() {
    return `
      <h1>Import an Article</h1>
      <p>Paste the wikitext of one article from another wiki, for example from its "Edit source" box. Nothing is downloaded: the text goes straight into this browser.</p>
      <p>Text from most public wikis is under the <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a> licence. The new page gets a line that names the source and the licence, and the edit summary records it too.</p>
      <form id="import-article-form" class="edit-form">
        <label for="ia-title">Page title here</label>
        <input id="ia-title" name="title" type="text" maxlength="200" required>
        <label for="ia-source">Link to the original article (https)</label>
        <input id="ia-source" name="source" type="text" inputmode="url" maxlength="500" required placeholder="https://en.example.org/wiki/Article">
        <label for="ia-text">Article wikitext</label>
        <textarea id="ia-text" name="text" rows="14" required></textarea>
        <p>Templates, references, images and HTML tags are removed, because pocket-wiki can't show them. Headings, links, lists and tables stay.</p>
        <p class="notice" id="ia-msg" role="alert" hidden></p>
        <div class="edit-actions"><button type="submit">Import article</button></div>
      </form>`;
  }

  specials['ImportArticle'] = importArticlePage;
  specials['importarticle'] = importArticlePage;

  if (typeof window === 'undefined' || window._pocketWikiImportArticleBound) return;
  window._pocketWikiImportArticleBound = true;

  document.addEventListener('submit', e => {
    if (e.target.id !== 'import-article-form') return;
    e.preventDefault();
    const f = e.target;
    const msg = document.getElementById('ia-msg');
    const fail = text => { msg.textContent = text; msg.hidden = false; };
    const title = store.normalizeTitle(f.elements.title.value || '');
    const source = f.elements.source.value.trim();
    const body = cleanWikitext(f.elements.text.value);
    if (!title || /^Special:/i.test(title)) { fail('Please enter a page title (not a Special: page).'); return; }
    if (!SOURCE_RE.test(source)) { fail('The source must be a full https:// link to the original article.'); return; }
    if (!body) { fail('There is no text left to import after cleaning. Check the pasted wikitext.'); return; }
    if (store.exists(title) && !confirm(`"${title}" already exists. Add the imported text as a new revision?`)) return;
    const credit = `\n\n''This page uses text from [${source} the original article], licensed under [https://creativecommons.org/licenses/by-sa/4.0/ CC BY-SA 4.0]. The original authors are listed in that article's history. Templates, references and images were removed on import.''`;
    try {
      store.save(title, body + credit, `Imported from ${source} (CC BY-SA 4.0)`);
      location.hash = pageHref(title);
    } catch (err) {
      fail('Import failed, nothing was saved: ' + (err.message || String(err)));
    }
  });
}
