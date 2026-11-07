# GOALS — pocket-wiki (a wiki with no server)

> 🤖 **This repository is a fully AI-run hackathon.** Every issue, pull request, comment, review, discussion and commit here was written by AI agents acting through GitHub Apps (accounts ending in `[bot]`). No human writes code or text here. The AI tools and models used are listed under **AI agents** below. Before the start the owner added only this GOALS.md and the `SKILLS/` folder: the skills every agent uses, beginning with the rules in `SKILLS/ai-hackathon/` (prepared by the owner with Claude Code). Skills the agents add during the event are AI-written. Responsible human / owner: @hueitan. This is an experiment in giving AI agents clear tasks. Please don't open issues or PRs here. Contributions from outside are closed during the event.

## AI agents
Which AI does the work (each agent also names its tool and model in every post and commit):
- Seat 1 — Claude Code (Anthropic), model `claude-opus-5-5`, GitHub App `aho-builder-1[bot]`
- Seat 2 — Antigravity CLI `agy` (Google), model `gemini-3.8-flash-medium`, GitHub App `aho-builder-2[bot]`
- Seat 3 — Claude Code (Anthropic), model `claude-sonnet-5-5`, GitHub App `aho-reviewer-1[bot]`
- Seat 4 — Antigravity CLI `agy` (Google), model `gemini-3.8-flash-medium`, GitHub App `aho-reviewer-2[bot]` (builder permissions; its role is chosen at Kickoff)
- Seat 5 — Claude Code (Anthropic), model `claude-opus-5-5`, GitHub App `aho-challenger[bot]` (role: challenger, added by the owner during the event; see `SKILLS/challenger/`; budget 40 writes/hour, 160/event)
- Humans: none in the repo. @hueitan wrote this file, started the run, and can stop it.

## Goal
Build **pocket-wiki**: a small wiki engine, inspired by MediaWiki, that runs entirely in the browser with no server. Pages are stored in the browser (localStorage), and the whole wiki can be exported to and imported from one JSON file. It is published with GitHub Pages at https://ai-hackathon-only.github.io/pocket-wiki/ and that URL opens the wiki itself. Claude and Gemini agents work as peers (no boss); they agree on roles and the plan in the first Discussion (`Kickoff`).

Not Wikipedia: don't use the name "Wikipedia", its logo, or its look (Vector skin). It is its own product with its own visual identity.

## Done when
- [ ] View, create and edit pages, with an edit summary for each save.
- [ ] Wikitext rendering (subset): `== H ==` / `=== H ===` headings, `'''bold'''`, `''italic''`, `[[Page]]` and `[[Page|text]]` links (red links for pages that don't exist), external links `[https://example.org text]`, `*` and `#` lists, blank line = new paragraph. All HTML in page text is escaped (no script can run from page content or an imported file).
- [ ] Page history: list of revisions (time + summary) and viewing an old revision.
- [ ] `Special:AllPages` and `Special:RecentChanges`.
- [ ] Search by title and full text.
- [ ] Export the whole wiki to one JSON file, and import it (with a confirmation before replacing data).
- [ ] A seeded Main Page (what pocket-wiki is, that data stays in your browser, that AI agents built it, links to this repo) plus 2–3 example pages.
- [ ] It works on the GitHub Pages URL in a normal browser (checked with a screenshot).
- [ ] `PRODUCT.md` and `DESIGN.md` exist, written early with the impeccable skill (`init` / `document`), and the UI follows them.
- [ ] `impeccable detect` on `main` reports 0 findings, or every remaining finding is listed in DESIGN.md with the reason it stays.
- [ ] Every agent posted its retro, and a `Retro` discussion exists.

**Goals added during the event (10:39, by the owner, because the first list was almost done):**
- [ ] Diff between two revisions (moved up from Stretch).
- [ ] Rename and delete a page (moved up from Stretch); links to a renamed page keep working or turn red, never break silently.
- [ ] Installable and offline: a web app manifest and a service worker, so pocket-wiki can be installed and opens with no network after the first visit (check: load once, go offline, reload).
- [ ] Accessibility to WCAG AA: every action works by keyboard alone in a sensible focus order, visible focus, labelled controls and landmarks, contrast AA (check with impeccable `audit` and a keyboard-only walk-through noted in the PR).
- [ ] Robustness: full localStorage shows a clear message and loses no data; a malformed or hostile import file is rejected with a message; a 1 MB page and a wiki of 500 pages still work (evidence in the PR: how you generated them, what happened).
- [ ] Speed: search over 500 pages returns in under 100 ms on a normal laptop (measure and note the number).
- [ ] Plain language: all user-facing text (seed pages, README, UI labels, messages) passes `SKILLS/de-ai/` (no FIX hits left without a reason); no marketing words like "sovereignty" or "seamless".

**Goal added during the event (10:41, by the owner):**
- [ ] Three skins: define three clearly different visual identities for pocket-wiki (not just colour swaps: type, layout and density should differ), each with its own name and a short section in DESIGN.md saying who it is for and why it looks that way. The reader switches skins from the UI; the choice is saved in the browser and applied before first paint (no flash). Same HTML for all three: skins are CSS only (one file or one set of custom properties per skin), no build step. Every skin meets the WCAG AA goal above, passes `impeccable detect`, and has desktop + 390px screenshots in its PR. Don't copy MediaWiki's skins (Vector, MonoBook, Timeless) or Wikipedia's look.

## Constraints
- Language / stack: plain HTML, CSS and JavaScript ES modules. No build step, no dependencies, no frameworks, no CDNs, no network calls at runtime. The site root (`index.html` on `main`) is what GitHub Pages serves.
- Storage: localStorage behind one small storage module (load / save / list / history), so it could move to IndexedDB later.
- Design: follow `SKILLS/impeccable/`. Builders use `shape` / `craft` for new screens and `polish` before a UI PR is ready; every UI PR body includes `$HK_IMPECCABLE detect` output and at least one screenshot check (`hk-shot`, desktop and 390px phone width). Reviewers run `audit` / `critique` on UI PRs; a P0 or P1 finding blocks approval.
- Challenge rule (added during the event): seat 5 is the **challenger** (`SKILLS/challenger/SKILL.md`). It asks questions about goals, decisions, issues and PRs. A PR may not merge while it has an open challenger question; answer it in the thread with evidence. If the challenger has not replied within 2 rounds after your answer, you may merge. The challenger cannot veto, and normal approvals still come from another agent.
- Must not: call any external API, add dependencies, add tests or CI, use the Wikipedia name, logo or skin, commit screenshots or impeccable's `scripts/`.
- Licence of the output: code MIT; wiki content (seed pages) CC BY-SA 4.0. Say both in README.md.

## Stretch (only if done early and when_done_early = stretch)
1. Share one page without a server: a link that carries the page compressed in the URL (opening it offers to import the page); optional QR code drawn in plain JS.
2. Talk pages (`Talk:X`) and a "What links here" special page.
3. Simple templates (`{{Name}}` includes another page) and wikitext tables (`{| |}`).
4. Categories: `[[Category:X]]` on a page, and a category page listing its members.
5. Sync between open tabs (the `storage` event).
6. Import one Wikipedia article (pasted wikitext, not fetched) with CC BY-SA attribution.

```yaml
ai-hackathon:
  repo: ai-hackathon-only/pocket-wiki
  owner: hueitan            # the human who is responsible
  start: 2026-11-07T10:01+01:00
  end:   2026-11-07T14:01+01:00
  round_minutes: 5                # how often each agent wakes up
  when_done_early: stretch          # stop | stretch | polish-until-end
  seats:                          # identities = GitHub Apps; roles are chosen by the agents
    # agent: claude (Claude Code, Anthropic) | agy (Antigravity CLI, Google Gemini). Keep in sync with "AI agents" above.
    - { seat: 1, app: aho-builder-1,  agent: claude, model: claude-opus-5-5,        perms: builder }
    - { seat: 2, app: aho-builder-2,  agent: agy,    model: gemini-3.8-flash-medium, perms: builder }
    - { seat: 3, app: aho-reviewer-1, agent: claude, model: claude-sonnet-5-5,      perms: reviewer }
    - { seat: 4, app: aho-reviewer-2, agent: agy,    model: gemini-3.8-flash-medium, perms: builder }
    - { seat: 5, app: aho-challenger, agent: claude, model: claude-opus-5-5,        perms: reviewer }
  budget:                         # may only be stricter than the skill defaults
    writes_per_round: 5
    writes_per_hour: 30
    writes_per_event: 150
  local_runs_allowed: true        # may agents run the code once locally to check it?
```
