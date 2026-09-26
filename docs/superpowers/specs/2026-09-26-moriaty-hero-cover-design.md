# Moriaty Hero Cover Design

**Date:** 2026-09-26  
**Status:** User approved the direction; awaiting spec review before implementation.  
**Scope:** Add a cinematic landing cover to the existing offline Moriaty Library website.

## Goal

Give Moriaty Library a personal, editorial entrance that feels like a private cognitive archive. The first screen introduces Moriaty and leads directly into the existing bookshelf library. The existing static site remains locally openable without a build step.

## Integration approach

- Keep the current HTML, CSS, and JavaScript architecture and existing bookshelf, article reader, search, index, and thought-tree behavior.
- Add a standalone `#hero` section before the existing `#library` section. Keep the current library as the next destination instead of rewriting it as a new application.
- Keep the stage local and static. The later GPT Sites upload is a separate follow-up after the local design is complete.
- Add the user-provided Moriaty illustration as a local image asset and use it as a supporting identity element on desktop. Preserve its artwork without extra decorative graphics or a portrait card.

## Hero composition

- Use the supplied CloudFront MP4 as a full-bleed, muted, looping background video with `playsinline`, `object-fit: cover`, and a deep-navy fallback color. Keep any readability overlay very subtle. If the remote video is unavailable, the local page still renders over the fallback background.
- Place a restrained navigation strip over the video. Show the Moriaty® wordmark, `Archive`, `Thoughts`, `Library`, and `About`; preserve working Search and Index access for the existing library.
- Set the editorial copy on the left and the illustration on the right on desktop. Use Instrument Serif for the display copy and Inter for supporting text, with charcoal, deep navy, warm ivory, and muted brass.
- Use the approved copy: “MORIATY / PERSONAL COGNITIVE ARCHIVE”; “Every thought / leaves a trace.”; “A living archive of writing, models, questions and unfinished ideas — an attempt to preserve not only conclusions, but the paths that produced them.”; and the single primary CTA “Enter the Archive”.
- Add a quiet scroll cue. Do not add blobs, floating cards, random particles, halos, typewriter effects, bright gradients, or extra gold ornaments.

## Navigation and behavior

- `Archive` and `Enter the Archive` smoothly scroll to `#library`.
- `Thoughts` scrolls to the existing `#thoughtTree` section.
- `Library` activates the current Index control so it opens the actual catalog.
- `About` targets the existing site footer, identified as the site's about destination.
- Keep the current Search and Index actions available from the hero navigation without replacing the current library controls.
- Use a 450–650 ms exit treatment for hero text and portrait when entering the archive, then perform a smooth scroll. The scroll remains usable if reduced motion is enabled.

## Responsive and accessibility behavior

- On mobile, hide or substantially soften the character image, hide the desktop link row, retain the wordmark and a compact Enter action, center the copy, and prevent horizontal overflow.
- Respect `prefers-reduced-motion`: disable entrance, idle, and parallax animation and avoid animated smooth scrolling when the preference is active.
- Provide accessible names for navigation and actions, meaningful image alternative text (or empty alt if treated as decorative), visible keyboard focus, and sufficient text contrast.
- Video stays muted and inline. The fallback color supports environments where autoplay or network video is unavailable.

## Out of scope

- Migrating the application to React, Vite, TypeScript, Tailwind, or shadcn/ui.
- Replacing or rebuilding the current library, article catalog, search, index, reader, or thought tree.
- Building future portfolio, projects, or timeline sections.
- Uploading or publishing the site to GPT Sites in this local-design phase.

## Acceptance criteria

- The local `index.html` opens directly and presents the Hero before the existing library.
- The supplied illustration and video treatment support the typography without dominating it.
- The CTA and each navigation destination work with the existing page sections and controls.
- Existing bookshelf and article-reading functionality remain reachable.
- Mobile layout, keyboard focus, contrast, fallback behavior, and reduced-motion behavior are addressed.
- No public upload occurs in this phase.
