# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Plain HTML5, CSS3, and JavaScript ES modules with zero external dependencies, no build step, no frameworks, and no CDNs. Client-side storage via the browser's `localStorage` with full JSON backup/restore. Published via GitHub Pages at `https://ai-hackathon-only.github.io/pocket-wiki/`.

## Users

Primary users are personal note-takers, knowledge workers, researchers, and offline-first writers who want an instant, private, distraction-free wiki without account signups, server setup, or database hosting.

## Product Purpose

`pocket-wiki` provides a lightweight, MediaWiki-inspired personal wiki experience running 100% inside the user's web browser. Your pages stay in this browser: pages, edit histories, and revisions remain completely in local browser storage, with easy export and import as a single portable JSON file.

## Positioning

Unlike Wikipedia or server-hosted wikis, `pocket-wiki` requires zero server infrastructure, makes zero external network requests, and tracks no user telemetry, while delivering a faithful core wikitext authoring experience (`== Headings ==`, `'''bold'''`, `''italic''`, `[[Page]]` internal links with redlink detection, external links, and revision history). It is distinctly its own product and does not adopt Wikipedia branding, logos, or Vector theme.

## Operating Context

- Used in desktop and mobile web browsers (responsive down to 390px mobile viewports).
- Offline-first: works without network access once loaded into the browser cache.
- Published at `https://ai-hackathon-only.github.io/pocket-wiki/`.

## Capabilities and Constraints

- **Capabilities:**
  - View, create, and edit pages with mandatory edit summaries.
  - Wikitext rendering: `== H2 ==`, `=== H3 ===`, `'''bold'''`, `''italic''`, `[[Page]]` and `[[Page|label]]` links, `[https://example.org label]` external links, nested `*` / `#` lists, blank line paragraph separation.
  - Page revision history: viewing timestamped revisions with summaries and inspecting past states.
  - Special pages: `Special:AllPages` and `Special:RecentChanges`.
  - Search: instantaneous title matching and full-text search across all revisions/pages.
  - Import/Export: whole-wiki single-file JSON export and safe import with confirmation modal before replacement.
  - Seeded initial state: Main Page explaining browser storage, AI hackathon provenance, and example wikitext pages.
- **Constraints:**
  - Strict Content Security Policy (CSP): no external network calls, no inline scripts, no unsafe-eval.
  - Absolute HTML escaping on all page content and imported JSON to eliminate XSS.
  - No build step, no npm runtime dependencies.
  - Must not use Wikipedia name, logo, or Vector skin.

## Brand Commitments

- **Name:** `pocket-wiki`
- **Tagline:** "A wiki in your pocket — zero server, 100% in your browser."
- **Identity & Aesthetic:** Purposeful, editorial, warm archival paper tones, high typographic clarity.
- **Licensing:** Engine code released under MIT License; seeded wiki content released under CC BY-SA 4.0.

## Evidence on Hand

- Core storage architecture (`js/storage.js`) under key `pocket-wiki:v1`.
- Safe wikitext rendering engine (`js/wikitext.js`) with escape-first parsing.
- Seed content in `js/seed.js` including Main Page, Markdown vs Wikitext guide, and Pocket-Wiki Architecture.

## Product Principles

- **The Local-Only Data Principle:** The user owns all data. Nothing ever leaves the browser unless explicitly exported by the user.
- **The Zero-Friction Editing Principle:** Instant navigation and editing with standard wikitext markup, predictable link resolution, and transparent revision trails.
- **The Uncompromising Safety Principle:** All user-supplied content and imported JSON must be strictly sanitized and HTML-escaped before rendering.
- **The Clean Utility Principle:** Clear typography, high-contrast readable prose, and zero clutter or extraneous chrome.

## Accessibility & Inclusion

- Meets WCAG AA contrast standards across light and dark elements.
- Semantic HTML (`<nav>`, `<header>`, `<main>`, `<article>`, `<form>`) with full keyboard navigability.
- Responsive design tailored for mobile (390px) and desktop layouts without horizontal scrolling.
