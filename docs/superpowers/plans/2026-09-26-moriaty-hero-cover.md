# Moriaty Hero Cover Implementation Plan

> **For agentic workers:** Execute this plan task-by-task in the current session. Preserve unrelated working-tree changes.

**Goal:** Add a cinematic, responsive Hero before Moriaty Library while retaining its local static operation and current library features.

**Architecture:** Extend the existing HTML/CSS/JavaScript site with a standalone Hero section before `.site-stage`. Store the supplied character art locally; use the specified remote video as an optional environmental layer with a deep navy fallback. Wire hero actions to existing sections and controls instead of duplicating library functionality.

**Tech Stack:** Static HTML, CSS, and vanilla JavaScript; no build step or new dependencies.

---

## File map

- `index.html`: Add the Hero, its video, identity image, navigation, CTA, and a footer anchor for About. Leave the bookshelf, reader, search, index, and thought-tree markup intact.
- `styles.css`: Add scoped Hero layout, typography, glass treatment, responsive rules, entrance/idle animations, reduced-motion overrides, and focus styles. Avoid changing existing library styles except for targeted conflicts.
- `app.js`: Connect Hero Search/Index buttons and section navigation to existing controls; implement motion-aware archive entry.
- `assets/moriaty-character.png`: Local copy of the user's attached illustration.
- `README.md`: Clarify that the page is locally static while its optional background video requires network access; do not claim GPT Sites hosting in this phase.

### Task 1: Add the local Moriaty artwork

**Files:**
- Create: `assets/moriaty-character.png`

- [x] Copy `C:\Users\15061\AppData\Local\Temp\codex-clipboard-04ed0fcb-ca2c-4e27-a120-539929330515.png` to `assets/moriaty-character.png` without editing or recompressing the artwork.
- [x] Confirm the destination exists and has a nonzero file size before using it in markup.

### Task 2: Add the Hero structure and working destinations

**Files:**
- Modify: `index.html`
- Modify: `app.js`

- [x] Insert `<section id="hero" class="hero" aria-labelledby="heroTitle">` directly before `.site-stage`, inside `#mainContent`.
- [x] Add a muted, autoplay, looping, inline video using the supplied CloudFront URL. Set its accessible role to decorative, and provide the deep navy fallback on the Hero container.
- [x] Add a navigation region with Moriaty®; `Archive` linking to `#library`; `Thoughts` linking to `#thoughtTree`; `Library` wired to the existing `#indexOpen` button; `About` linking to `#about`; and explicit Search/Index buttons with unique Hero IDs.
- [x] Add the approved eyebrow, two-line headline, description, one `Enter the Archive` button, scroll cue, and local character image. Use a concise descriptive alt text for the character artwork.
- [x] Add `id="about"` to the existing `.site-footer`; do not create a new About page or section.
- [x] In `app.js`, wire Hero Search and Index buttons to click the current `#searchOpen` and `#indexOpen` controls. Wire the Hero Library action to the current `#indexOpen` control.
- [x] Wire the archive CTA to add the Hero exit class, then scroll to `#library` after a 500 ms transition. When reduced motion is requested, skip the delay and use nonanimated scrolling.
- [x] Use null-safe lookups for new optional Hero controls so the existing library initialization remains valid if the Hero is ever removed.

### Task 3: Style the editorial cinematic cover

**Files:**
- Modify: `styles.css`
- Modify: `index.html`

- [x] Load Instrument Serif and Inter through the Google Fonts stylesheet link in `index.html`; retain system serif/sans-serif fallbacks for network failure.
- [x] Add scoped `.hero` styles: `position: relative`, `min-height: 100svh`, overflow clipped, deep navy fallback, ivory foreground, and isolated stacking context.
- [x] Position video absolutely at `inset: 0`, full width and height, `object-fit: cover`; add only a subtle darkening veil so the video remains the source of depth.
- [x] Center content in a `max-width: 7xl` container. Align copy left with a maximum width of 850 px; place the character image on the right at approximately 38vw, bottom aligned and cropped slightly outside the viewport. Keep typography visually primary.
- [x] Style the navigation and CTA with restrained transparent glass, 4 px backdrop blur, thin brass edge, and keyboard-visible focus. Do not introduce glow, blobs, cards, or extra ornaments.
- [x] Add fade-rise entrance timing for eyebrow, heading, description, CTA, and a slow character entrance/idle motion. Limit pointer parallax to the portrait and no more than 4 px; skip parallax on coarse pointers.
- [x] At widths below 768 px, hide desktop nav links and the portrait (or use a very low-opacity crop only if the content remains clear); keep wordmark and compact Enter action, center the copy, reduce heading size, and prevent horizontal overflow.
- [x] Under `@media (prefers-reduced-motion: reduce)`, disable Hero entrance, idle, parallax, and exit animations and remove smooth scrolling behavior.
- [x] Keep existing site styles and motion behavior unchanged outside the Hero except the footer anchor.

### Task 4: Document local and network behavior

**Files:**
- Modify: `README.md`

- [x] State that `index.html` remains directly openable as a local static site with no package installation or server.
- [x] State that the Hero background video is remotely hosted and needs a network connection; when unavailable, the Hero uses its local CSS fallback color.
- [x] Keep GPT Sites upload explicitly out of the current phase.

### Task 5: Review implementation against the approved specification

**Files:**
- Review: `index.html`
- Review: `styles.css`
- Review: `app.js`
- Review: `README.md`

- [x] Confirm by source review that the Hero precedes the existing bookshelf and its CTA points to `#library`.
- [x] Confirm by source review that Thoughts, Library, Search, Index, and About resolve to existing sections or controls.
- [x] Confirm the character is a local asset, the video remains muted/inline, and the video element has the navy fallback.
- [x] Review mobile and reduced-motion rules in the source for overflow, focus visibility, and animation coverage.
- [x] Do not upload or publish the site during this phase.

## Scope guard

Do not migrate to React/Vite, alter article sources/catalog rules, rewrite the bookshelf, install dependencies, create a public deployment, or stage/commit unrelated user changes.
