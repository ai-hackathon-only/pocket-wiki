---
name: pocket-wiki
description: A clean, distraction-free browser wiki with editorial typography and archival warmth
colors:
  primary: "#1b5e20"
  primary-hover: "#144718"
  primary-light: "#e8f5e9"
  accent: "#00695c"
  neutral-bg: "#fcfbf9"
  surface: "#ffffff"
  surface-dim: "#f4f1ea"
  surface-border: "#e0dcd3"
  text-primary: "#1c1c1a"
  text-secondary: "#5c5b56"
  text-muted: "#8c8a82"
  link: "#1565c0"
  link-hover: "#0d47a1"
  link-new: "#c62828"
  link-new-hover: "#8e0000"
  status-diff-add: "#2e7d32"
  status-diff-del: "#c62828"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  heading:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.005em"
  subheading:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "0"
  body:
    fontFamily: "Charter, Georgia, 'Times New Roman', serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "0"
  code:
    fontFamily: "ui-monospace, SFMono-Regular, Consolas, Menlo, monospace"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0"
  small:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "0"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
---

## Overview

`pocket-wiki` is designed for focused reading and frictionless personal knowledge authoring. Rather than mimicking the utilitarian, multi-column portal structure of Wikipedia (Vector skin), `pocket-wiki` presents an intimate, editorial reading surface inspired by well-crafted pocket field notebooks and literary journals.

**The Editorial Warmth Rule.** The UI avoids sterile clinical white backgrounds (#ffffff) in favor of warm paper tones (`neutral-bg`: #fcfbf9) with high-contrast, soft-black ink typography (`text-primary`: #1c1c1a) and subtle warm-gray borders (`surface-border`: #e0dcd3).

**The Anti-Vector Rule.** `pocket-wiki` must never imitate MediaWiki's Vector skin or Wikipedia's left sidebar navigation. It uses a modern, focused top navigation bar with clean tabs for View, Edit, History, and Special pages.

## Colors

Colors are organized strictly by functional role:

- **Primary / Brand:** Forest green (`primary`: `#1b5e20`, hover: `#144718`, tint: `#e8f5e9`). Represents growth, stability, and enduring local storage. Used for primary save actions, active tabs, and brand highlights.
- **Backgrounds & Surfaces:**
  - `neutral-bg` (`#fcfbf9`): Page canvas background providing warm, glare-free readability.
  - `surface` (`#ffffff`): Elevated card and content containers.
  - `surface-dim` (`#f4f1ea`): Subdued toolbars, tables of contents, and metadata sidecars.
  - `surface-border` (`#e0dcd3`): Soft structural dividing lines and form inputs.
- **Text & Content:**
  - `text-primary` (`#1c1c1a`): High-legibility deep charcoal for headers and article text.
  - `text-secondary` (`#5c5b56`): Timestamps, revision summaries, and meta descriptions.
  - `text-muted` (`#8c8a82`): Form placeholders and subtle hints.
- **Hyperlinks & Affordances:**
  - `link` (`#1565c0`, hover: `#0d47a1`): Classic clear blue for verified existing wiki pages and external references.
  - `link-new` (`#c62828`, hover: `#8e0000`): Classic wiki redlink for missing pages.

**The Redlink Affordance Rule.** Missing pages linked via `[[Page]]` are rendered in distinct crimson (`#c62828`) with an underline, explicitly signaling to the reader that activating the link will open the editor for that new page.

## Typography

Typography establishes an editorial hierarchy balancing literary body prose with clean UI controls:

- **Article Prose:** Serif typography using system-available classic book serifs (`Charter`, `Georgia`, `'Times New Roman'`) at `1.0625rem` (17px) with generous `1.65` line height.
- **Interface & Headings:** Sans-serif typography (`-apple-system`, `BlinkMacSystemFont`, `'Segoe UI'`, `Roboto`, sans-serif) for article headings (`H1`, `H2`, `H3`), tabs, buttons, search bars, and navigation labels.
- **Small Meta Text:** `0.875rem` sans for revision times, revision ids, status lines and the export/import JSON boxes.
- **Code & Wikitext Source:** Monospace stack (`ui-monospace`, `SFMono-Regular`, `Consolas`, `Menlo`, monospace) for edit mode textareas, code blocks, and JSON export/import displays.

## Layout

**The Single Column Center Rule.** Article content is centered within a maximum width of `54rem` (864px) with generous horizontal padding (`24px` on desktop, `16px` on mobile), and paragraphs and lists inside it are capped at `58ch` (1ch is the width of "0", so this holds about 72 serif characters) and paragraphs use `text-wrap: pretty` to avoid one-word last lines. Headings are not capped. The column alone would allow about 107.

**The Mobile Parity Rule.** The wiki layout must remain completely functional, readable, and touch-friendly at 390px mobile viewport with zero horizontal overflow:
- Top bar stacks or collapses neatly.
- Article actions (View, Edit, History) transform into a horizontal scrollable tabstrip or compact button group.
- Edit form textareas automatically span 100% of the viewport width.

## Elevation & Depth

**The Flat Paper Rule.** `pocket-wiki` relies on crisp 1px borders (`#e0dcd3`) and subtle background shifts (`surface-dim`) rather than heavy drop shadows. Surfaces feel like stacked, neatly bound stationery sheets. Subtle elevation is reserved for modals (such as the JSON import confirmation dialog) using `box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08)`.

## Shapes

- Small radius (`4px`) on badges, tags, and inline controls.
- Medium radius (`8px`) on buttons, inputs, cards, and modal containers.
- Generous touch targets (minimum `40px` height) on all interactive buttons and tabs.

## Components

- **Site Header:** Clean, single-row masthead featuring the `pocket-wiki` logotype, a quick-search input, and links to `Special:AllPages` and `Special:RecentChanges`.
- **Page Tabs:** Tab navigation positioned above the article title displaying `[Read]`, `[Edit]`, and `[History]`. The active tab is underlined with a 2px `primary` border.
- **Article Reader:** Rendered HTML from wikitext. Clear separation between headings (`== H2 ==` receives a subtle bottom divider), paragraphs, and bulleted/numbered lists.
- **Editor:** Full-width monospace editing area, accompanied by a required "Edit Summary" text input and a prominent "Save Page" button.
- **Revision History List:** Chronological revision list detailing timestamp, revision ID, author badge, and edit summary, with one-click links to view past revisions.
- **Special Pages & Search Results:** Clean tabular or list presentations for article listings, recent changes diff streams, and search match snippets.

## Do's and Don'ts

### Do:
- Do maintain high contrast and warm, paper-like background tones.
- Do keep the reading experience centered and free from distracting sidebars.
- Do display redlinks prominently for missing articles to encourage wiki creation.
- Do test all screens against 390px mobile viewports to prevent horizontal overflow.
- Do preserve strict HTML escaping on all rendered content.

### Don't:
- Don't use Wikipedia logos, puzzle globes, or the Wikipedia name.
- Don't imitate MediaWiki's Vector skin (no left sidebar, no sterile gray boxes).
- Don't add complex multi-level menus or modal clutter.
- Don't load external fonts, icons, or stylesheets from CDNs.
- Don't introduce heavy 3D skeuomorphism or harsh drop shadows.
