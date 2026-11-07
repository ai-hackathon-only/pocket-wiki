// Seed pages for a fresh browser session.
// Code licence: MIT. Content licence: Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0).

export const SEED_PAGES = {
  'Main Page': `== Welcome to pocket-wiki ==
'''pocket-wiki''' is a standalone personal wiki engine inspired by MediaWiki that runs entirely inside your web browser. There is no server, no account creation, and no cloud database: every page, revision, and edit summary lives safely within your browser's local storage.

=== Core Highlights ===
* '''Local Sovereignty:''' Your notes and knowledge stay on your device under your complete control.
* '''Wikitext Authoring:''' Familiar wiki syntax including headings, bold, italic, internal wikilinks, and lists.
* '''Full Revision History:''' Track changes over time with per-save edit summaries and past revision viewing.
* '''Instant Portability:''' Export and backup your entire wiki into a single JSON file via [[Special:Export]], or restore an existing backup using [[Special:Import]].
* '''Zero Dependencies:''' Built with plain HTML, CSS, and modern JavaScript ES modules without external frameworks or CDNs.

=== Explore Example Pages ===
To discover how pocket-wiki works, explore these starter articles:
* [[Wikitext Guide]] — Examples of formatting, headings, links, and lists.
* [[Local Sovereignty]] — Privacy, offline persistence, and browser data storage.
* [[Architecture]] — How the hash router, storage module, and renderer function together.
* [[Nonexistent Page]] — An example of a wiki redlink that prompts you to create a new page.

=== Built by AI Agents ===
pocket-wiki was collaboratively designed, specified, and coded by autonomous AI agents (Claude Code and Antigravity agy) during a public AI hackathon. Learn more at [https://github.com/ai-hackathon-only/pocket-wiki the GitHub repository].`,

  'Wikitext Guide': `== Wikitext Formatting Guide ==
pocket-wiki implements an intuitive subset of classic wikitext syntax. All rendered HTML is strictly escaped to ensure that page content can never execute malicious scripts.

=== Text Formatting ===
* Enclose text in three single quotes for '''bold text'''.
* Enclose text in two single quotes for ''italic text''.
* Combine them for '''''bold italic text'''''.

=== Headings ===
Headings structure your documents into clear thematic sections:
* \`== Section Heading ==\` produces a primary level-2 heading with an underline.
* \`=== Subsection Heading ===\` produces a level-3 subsection heading.

=== Links ===
* '''Internal Wikilinks:''' Use double brackets like \`[[Main Page]]\` to link to [[Main Page]].
* '''Piped Wikilinks:''' Provide custom link text with a pipe, like \`[[Architecture|System Architecture]]\` to display as [[Architecture|System Architecture]].
* '''Redlinks:''' Links to pages that do not exist yet, such as [[Sandbox Article]], appear in distinct red. Clicking a redlink opens the editor to create that page immediately!
* '''External Links:''' Use single brackets with a space between URL and label, such as [https://github.com/ai-hackathon-only/pocket-wiki Project Repository]. Only secure \`http://\` and \`https://\` protocols are permitted.

=== Lists ===
Create unordered lists using asterisks:
* First bullet point
** Nested sub-bullet point
* Second bullet point

Create ordered numbered lists using hash symbols:
# Step one: Draft your thoughts
# Step two: Add an edit summary
# Step three: Save the revision`,

  'Local Sovereignty': `== Local Sovereignty & Privacy ==
In modern web software, personal notes and knowledge bases are frequently locked inside proprietary clouds, vulnerable to subscription paywalls, server outages, and data mining.

'''pocket-wiki''' is built on the principle of ''local data sovereignty'':
# '''Browser-Native Storage:''' All content resides exclusively in your browser's \`localStorage\`.
# '''Strict Isolation:''' The application enforces a strict Content Security Policy (CSP). It makes zero external network calls, loads zero remote fonts or analytics, and connects to no third-party APIs.
# '''Complete Portability:''' You own your data. Use [[Special:Export]] at any time to download your entire wiki as a structured JSON file. You can import that JSON file into pocket-wiki on any other device or browser using [[Special:Import]].
# '''Longevity:''' Because pocket-wiki is a single static web application with no server runtime requirements, it can run directly from GitHub Pages or locally from your own filesystem for decades.`,

  'Architecture': `== System Architecture ==
pocket-wiki is designed around small, single-purpose ES modules following clean web standards:

=== Module Overview ===
* '''\`index.html\`''': Single static entrypoint defining semantic shell structure, strict CSP headers, and mounting point \`#app\`.
* '''\`css/style.css\`''': Responsive design system specified in \`DESIGN.md\`, honoring archival warmth, single-column reading, and mobile 390px parity.
* '''\`js/storage.js\`''': Encapsulates all \`localStorage\` interactions under key \`pocket-wiki:v1\`. Handles loading, saving, listing, revision history, and JSON export/import.
* '''\`js/wikitext.js\`''': Lightweight wikitext parser that escapes raw HTML first before safely transforming headings, inline styles, wikilinks, and nested lists.
* '''\`js/app.js\`''': Hash-based client router supporting routes:
** \`#/wiki/:title\` — Read view
** \`#/edit/:title\` — Editor with required change summary
** \`#/history/:title\` — Full revision log
** \`#/rev/:title/:id\` — Old revision view
** \`#/special/:name\` — Modular special pages
* '''\`js/special.js\`''': Extensible registry powering [[Special:AllPages]], [[Special:RecentChanges]], [[Special:Search]], [[Special:Export]], and [[Special:Import]].`
};

export function seedIfEmpty(store) {
  if (!store.isEmpty()) return;
  for (const [title, text] of Object.entries(SEED_PAGES)) {
    store.save(title, text, 'Initial seed revision');
  }
}
