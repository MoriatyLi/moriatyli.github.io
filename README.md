# Moriaty Library

Moriaty Library is planned as a six-shelf digital library for reviewed public writing. The design direction and privacy/content workflow are documented in [Moriaty_Library_完整设计规划_v1.1.md](Moriaty_Library_完整设计规划_v1.1.md). The current homepage design spec is in [docs/superpowers/specs/2026-09-26-moriaty-library-home-design.md](docs/superpowers/specs/2026-09-26-moriaty-library-home-design.md).

## Source articles

`Ariticle_written/` contains the source files selected by the project owner for this private repository. Keep source names and contents intact as provenance. A file's presence here does not by itself mean that the article is approved for public website publication; use the privacy review and human approval process in the design plan before publishing.

## Names used by the website

When articles are imported into the website, derive a canonical display title and URL slug separately from the source filename. Prefer an explicit title in the article, normalize Unicode, whitespace and punctuation, and remove export suffixes or trailing database identifiers that are not part of the title. Repair encoding only when the intended text can be recovered reliably. Send mojibake or ambiguous names to human review instead of displaying guessed text. Preserve the original filename as source metadata, and review canonical titles, spine titles and slugs before publication.

## Current contents

- Product and interaction plan
- Homepage design specification
- Owner-selected source article files

This repository currently contains project documentation and selected source material; the website application has not been scaffolded yet.
