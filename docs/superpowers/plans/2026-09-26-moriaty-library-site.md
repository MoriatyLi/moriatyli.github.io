# Moriaty Library Local Site Implementation Plan

> **For agentic workers:** Execute inline in the current local repository. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an offline-capable local website that presents the owner-approved remaining articles as a searchable, navigable six-shelf library with clean article names.

**Architecture:** Use dependency-free HTML, CSS and JavaScript that opens from `index.html`. A PowerShell catalog generator reads the selected Markdown files and emits a JavaScript data bundle; the browser renders escaped Markdown, six CSS 3D shelves, search/index overlays and a reader view without making network requests.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, PowerShell 7, JSON.

---

## File map

- `scripts/generate-catalog.ps1` — derive canonical titles, stable IDs, shelf candidates, tags, reading time and safe serialized article bodies from `Ariticle_written/*.md`.
- `data/articles.js` — generated static catalog consumed by the page. Preserve article source files unchanged.
- `index.html` — semantic page landmarks, library controls, overlays and reader shell.
- `styles.css` — celestial background, walnut hexagonal shelves, book spines, responsive layout, motion preferences and focus states.
- `app.js` — shelf rotation, book rendering, keyboard/touch/drag controls, search/index filters, reader navigation and safe Markdown rendering.
- `README.md`, homepage design spec — describe the local static site, approved source scope and canonical naming rules.

## Task 1: Build the catalog generator

**Files:** Create `scripts/generate-catalog.ps1`; generate `data/articles.js`.

- [ ] Read all `.md` files in `Ariticle_written/` with UTF-8, preserving each original filename separately as provenance.
- [ ] Canonicalize display titles with Unicode NFC, strip Markdown and export suffixes, duplicate-export suffixes such as `(1)`, trailing 32-character Notion IDs, leading `#`, and file-order numeric prefixes of one or two digits only when immediately followed by CJK text. Prefer a clear leading H1 title in the article body when present.
- [ ] If the candidate title contains U+FFFD, known replacement-glyph text, or obvious mojibake that cannot be reversed reliably, exclude that entry from the display catalog and add its filename/title candidate to a generated review list; never guess replacement text.
- [ ] Derive a deterministic ID from SHA-256 of the normalized source-relative path. Derive a shelf using the six-category keyword rules in the generator; send unmatched articles to VI / ARCHIVE & NOTES. Derive concise tags from the same controlled keyword map.
- [ ] Preserve distinct source variants. Collapse only byte-identical copies with the same canonical title; retain all source filenames for the resulting entry. Distinct versions with a title collision get a short stable disambiguator rather than silently overwriting content.
- [ ] Compute word count and reading time from the Markdown body. Serialize source, title, ID, shelf, tags, word count, reading time and Markdown text as JSON assigned to `window.MORIATY_ARTICLES`; escape `<` as `\u003c` so article text cannot terminate a script element.

## Task 2: Implement the library page and reader

**Files:** Create `index.html`, `styles.css`, `app.js`.

- [ ] Build the semantic shell with `MORIATY LIBRARY`, `Archive of Thought`, SEARCH and INDEX controls, six-shelf indicator, previous/next shelf buttons, library scene, search/index dialog and article reader panel.
- [ ] Render six walnut shelf faces on a CSS 3D ring. Size the shelf radius from face width and the regular-hexagon apothem; rotate in 60-degree increments. Place stable-palette book spines into four rows on their assigned shelf, sized from logarithmic word count and labeled with canonical titles.
- [ ] Implement mouse drag, horizontal wheel/trackpad, touch swipe, previous/next buttons, arrow-key shelf movement, Tab focus, Enter/Space activation and Escape to close overlays. Snap to the nearest shelf after interaction. Respect `prefers-reduced-motion` by switching without inertia or pull-book transitions.
- [ ] Make SEARCH match canonical title, tags and full text. Make INDEX list all volumes with shelf, year and type filters. Keep each item keyboard accessible and show explicit empty states.
- [ ] Open a focused reader panel for each book with shelf, title, tags, reading time, original source filename, previous/next book and return-to-current-shelf controls.
- [ ] Render headings, paragraphs, emphasis, lists, blockquotes, tables, code spans, fenced code, links and images from a deliberately limited Markdown subset. Escape all raw text; permit only `https:` and `http:` links, keep links on the same page where possible, and never inject raw HTML from article content.

## Task 3: Update project documentation and generate current data

**Files:** Modify `README.md` and `docs/superpowers/specs/2026-09-26-moriaty-library-home-design.md`; run `scripts/generate-catalog.ps1`.

- [ ] Record that the owner approved all files still present in `Ariticle_written/` for this local website; removed files remain absent. Distinguish local approval from later public deployment approval.
- [ ] Document the one-command catalog regeneration path and the title/slug policy: source filenames remain unchanged, display titles are canonicalized, IDs are stable, and ambiguous mojibake requires review.
- [ ] Generate `data/articles.js` from the current 91 Markdown files. Confirm its entry count and review-list count in script output.

## Task 4: Commit locally

**Files:** Stage only the site source, generated catalog, plan, and documentation updates.

- [ ] Check the changed-path inventory and commit as `Build local Moriaty Library website` on the existing `main` branch. Do not configure a remote or push.
