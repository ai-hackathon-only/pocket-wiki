# pocket-wiki

A personal wiki engine inspired by MediaWiki that runs entirely inside your browser with no server.

**Live Demo:** [https://ai-hackathon-only.github.io/pocket-wiki/](https://ai-hackathon-only.github.io/pocket-wiki/)

---

## Highlights

- **Serverless & Local-First:** All wiki pages, edit histories, and revisions are persisted locally in browser `localStorage`.
- **MediaWiki-Inspired Wikitext:** Supports headings (`== H2 ==`, `=== H3 ===`), bold (`'''bold'''`), italic (`''italic''`), internal links (`[[Page]]`, `[[Page|display]]`), redlinks for missing pages, external links (`[https://... label]`), and ordered/unordered lists.
- **Strict Content Security:** Strict Content Security Policy (CSP), zero external CDN requests, zero analytics, and HTML escaping on all rendered content.
- **Revision History:** Full page history tracking with timestamps, edit summaries, and past revision viewing.
- **Special Pages:** Built-in `Special:AllPages`, `Special:RecentChanges`, `Special:Search` (title and full-text), `Special:Export` (JSON download/copy), and `Special:Import` (with overwrite confirmation).
- **Export and Import:** Export your entire wiki to a single JSON file and import it into any browser.
- **Responsive Design System:** Warm editorial typography (Charter/Georgia body, sans headings), single-column reading focus, and mobile parity at 390px viewports (specified in [DESIGN.md](DESIGN.md)).

---

## System Architecture

```text
index.html       ── Semantic application shell, strict CSP, root mount point
css/style.css    ── Archival warmth design system (DESIGN.md)
js/
  app.js         ── Hash router (#/wiki/, #/edit/, #/history/, #/diff/, #/rev/, #/special/)
  diff.js        ── Dependency-free Myers diff between revisions
  storage.js     ── Unified localStorage persistence layer (pocket-wiki:v1)
  wikitext.js    ── XSS-safe wikitext parser & HTML sanitizer
  seed.js        ── Default starter articles (Main Page, Wikitext Guide, etc.)
  special.js     ── Pluggable special pages (AllPages, RecentChanges, Search, Export, Import)
```

No build step, no Node.js runtime, no npm packages, and no bundling required.

---

## Getting Started

### Local Development

Because pocket-wiki uses standard JavaScript ES modules (`type="module"`), run a local static HTTP server from the project directory:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000` in any modern web browser.

### Offline and install

After the first visit, a service worker (`sw.js`) keeps a copy of the app files, so pocket-wiki opens with no network. `manifest.webmanifest` lets browsers install it as an app. It asks the network first and uses the cached copy only when offline, so a new deploy shows on the next load without bumping a version. Add a new file to `FILES` in `sw.js` only if the app needs it on the very first offline load.

---

## AI Hackathon

`pocket-wiki` was collaboratively planned, designed, and developed by autonomous AI agents in a fully AI-run hackathon experiment.
See [GOALS.md](GOALS.md), [PRODUCT.md](PRODUCT.md), and [DESIGN.md](DESIGN.md) for full context.

---

## Licences

- **Code:** [MIT Licence](https://opensource.org/licenses/MIT)
- **Wiki Content & Seed Pages:** [Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/)
