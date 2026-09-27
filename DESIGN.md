# DESIGN.md

The design standard for the public portfolio site. Read this before building or changing any UI under `src/app/(site)` or `src/app/_components`. Every rule here is already implemented; the class names and files are the source of truth, this document explains how to use them.

## Character

A quiet, monochrome, typographic personal site. It should read like a well-set document, not an app dashboard or a SaaS landing page.

- **One expressive motif: the handwritten signature** in the rail (tegaki, Nanum Pen Script) with its drawn underline. Nothing else on the site is hand-drawn, coloured, or decorative.
- **One bold element per section, everything else quiet.** Each section spends its boldness in exactly one place (the career ruler, the pinned article, the app icons, the hanging quote mark). Surrounding content stays small, muted, and disciplined.
- **Structure is information.** Dividers, grouping, dots, and ordering must encode something true about the content. Never add them for decoration.
- **Refine, don't replace.** New work extends the existing tokens and components. Introducing a new colour, font, radius family, or shadow needs an explicit reason and the owner's approval.

## Tokens

All colour comes from the `--pf-*` custom properties on `body` in `src/app/globals.css`. Never hard-code a colour in a component. Dark values apply under `prefers-color-scheme: dark` and `html[data-theme="dark"]`; every new token needs all three blocks updated.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--pf-bg` | `#ffffff` | `#121110` | Page background |
| `--pf-ink` | `#0a0a0a` | `#f4f4f5` | Titles, active states, primary text |
| `--pf-muted` | `#52525b` | `#a1a1aa` | Body copy, secondary text |
| `--pf-faint` | `#6f6f78` | `#8b8b95` | Meta: dates, hosts, counts, stacks |
| `--pf-rule` | `#e4e4e7` | `#2a2a2f` | Hairline dividers and borders |
| `--pf-hover` | `#f4f4f5` | `#17171b` | Row hover, image placeholders |
| `--pf-logo-bg` | `#ffffff` | `#ecebe8` | Tile behind third-party logos and icons |
| `--pf-edge` | `oklch(0 0 0 / 0.1)` | `oklch(1 0 0 / 0.1)` | 1px inset outline on images |

Derived tints use `color-mix(in srgb, var(--pf-ink) N%, transparent)`, for example a 7% ink wash for hover highlights that must show in dark mode, 20% for inactive bars, 30–40% for resting underlines. There is no accent colour. Third-party logos, photos, and thumbnails are the only colour on the page.

### Type

Inter only (`--font-inter`, with `cv05`, `cv08`, `ss03` enabled). Hierarchy comes from size, weight, and tracking, never from a second typeface, italics, or colour accents.

| Class | Size | Weight | Use |
| --- | --- | --- | --- |
| `pf-display` | `clamp(2.75rem, 7.5vw, 4.75rem)` | 640 | Home masthead name only |
| `pf-page-title` | `clamp(1.75rem, 3.6vw, 2.25rem)` | 600 | Section page `h1` (via `Panel`) |
| `pf-feature-title` | `clamp(1.1875rem, 2vw, 1.375rem)` | 600 | The one featured item in a section |
| `pf-section-title` | `1rem` | 580 | Group headings, footer heading |
| `pf-role-title` | `1rem` | 560 | Titles in entry rows and lists |
| `pf-title` | `0.9375rem` | 530 | Titles in dense tiles and grids |
| `pf-testimonial` | `clamp(1rem, 1.3vw, 1.0625rem)` | 400 | Quoted prose |
| `pf-standfirst` / `pf-page-standfirst` | fluid | 400, muted | Intro sentence under a title |
| `pf-body` | `0.875rem` | 400, muted | Descriptions and details |
| `pf-meta` | `0.8125rem` | 400, muted, tabular | Dates, hosts, counts, links in lists |

Rules:

- Sentence case everywhere. **No all-caps labels** (`pf-column` is legacy; do not use it in new work).
- No eyebrow labels above headings. A heading may carry a faint count beside it (`Development 6`).
- Numbers that line up use `pf-figure` (tabular, no tracking).
- Keep prose under about 68 characters per line (`max-w-[68ch]`, quotes `62ch`).
- Titles use `text-wrap: balance`, body uses `pretty`. Let names wrap in full rather than truncating a title; truncate only hosts and URLs.

### Shape and depth

- Hairline `1px` rules in `--pf-rule` between list items (`divide-y`, `border-t`). No cards, no box shadows, no gradient washes.
- Radii by role, not one radius for everything: rows `3px`, logo tiles `9px`, covers and thumbnails `10px`, app icons `22.5%` (`pf-app-icon`), pills and avatars fully round.
- Images sit on a `--pf-hover` placeholder with a `1px` `--pf-edge` inset outline (`pf-cover`, `pf-logo`, `pf-portrait`) so light images keep an edge on a light page.

## Layout

- Shell (`src/app/(site)/layout.tsx`): `max-w-6xl`, a `200px` rail and a fluid main column with `gap-x-16` on `lg`; below `lg` the rail becomes a sticky horizontal tab bar.
- Content is left-aligned. Nothing is centred except media controls such as the play button.
- Section pages render through `Panel` (`h1` + optional standfirst from content). The home page is `Masthead` + the About panel.
- Vertical rhythm: list rows `py-6` (dense lists `py-3`–`py-4`), groups `space-y-10`, featured block to list `mb-8`–`mt-10`.
- Breakpoints: design mobile-first; `sm` (640px) introduces side columns and right-aligned meta, `lg` (1024px) introduces the rail.

## Components and patterns

Reuse these before writing new markup.

| Need | Use | File |
| --- | --- | --- |
| Logo + title + org + dates row | `Entry`, `EntryList`, `Logo` | `_components/entry.tsx` |
| Timeline of dated items | `Ruler` inside `Experience` | `_components/experience.tsx` |
| Pinned or top item | Featured block pattern (cover, `pf-feature-title`, meta) | `articles.tsx`, `videos.tsx` |
| Grouped list | Hanging group label (year, category, repository) + rows | `articles.tsx`, `tools.tsx`, `open-source.tsx` |
| Icon shelf | Equal-shaped tiles in a 2/3/4-column grid | `tools.tsx` |
| Status | `pf-status-chip` + `pf-status-dot` (solid = done, ring = open, faint = closed) | `open-source.tsx` |
| Quote | `figure` > `blockquote.pf-testimonial` with `pf-testimonial-mark` hanging in the margin | `recommendations.tsx` |
| Inline website mention | `pf-prose-chip-website` (favicon tile + underlined name) | `prose.css` |
| Email capture | `pf-field` wrapper with input and `pf-button` inside | `newsletter.tsx` |
| Theme switch | Icon segmented control with sliding `pf-theme-thumb` | `theme-toggle.tsx` |
| Primary action | `pf-cta` (ink pill), at most one per view | `masthead.tsx` |

Pattern rules:

- **Lists are rows, not cards.** Whole-row links use `pf-row` for the hover wash, with `-mx-3 px-3` so the wash extends past the text edge.
- **Grids only for equal-shaped items** (icons, 16:9 thumbnails with two-line clamped titles). Items with variable-length text go in a single column so one long item never leaves a gap beside a short one. Never use masonry for ordered content.
- **Order is the owner's.** Respect `order` from the CMS. Group or feature only on data that exists (`pinned`, year, category, repository), and keep order inside groups.
- **Meta sits in a flex row with `gap-x-2.5`, never joined with `·` or `—`.** Right-align dates, counts, and numbers on `sm` and up; on mobile they drop onto the meta line.
- **Dates are unambiguous:** `Oct 2022`, `Mar 10`, `May 15, 2026`, never `Oct 22`. Durations read `1 yr 7 mos`.
- **Show what data means.** Pull statuses out of tag lists (`Unmaintained`), show where a link goes (`inboxswipe.com`, `GitHub`), show real logos and icons at a legible size (32px entry logos, 40–44px app icons), and fall back to the site favicon (`faviconUrl`) instead of an empty tile.
- **De-emphasise inactive items as a whole** (half opacity, greyscale icon), restoring on hover and focus.
- **No arrows on links.** No `↗` for external links and no `→` appended to link text. The only arrow is the hover `→` on rows that open a page on this site.

## Motion

- No ambient or entrance animation beyond the existing `pf-panel-enter` fade and the signature drawing.
- Motion answers a user action and shows what changed: the rail's active dot scaling in, the theme thumb sliding, the play button appearing on hover, a field border darkening on focus.
- Durations 150–220ms. Colour and opacity use `ease`; movement uses `cubic-bezier(0.3, 0.7, 0.2, 1)`.
- Every transition or animation is added to the `prefers-reduced-motion: reduce` block at the end of `globals.css`.
- Hover effects live inside `@media (hover: hover) and (pointer: fine)`. Anything revealed on hover must be visible by default on touch (`(hover: none), (pointer: coarse)`) and on `:focus-visible`.

## Accessibility

- Visible focus on every interactive element: `2px solid var(--pf-ink)` with `2px` offset (or on the image for media links).
- Semantic structure: one `h1` per page, group headings as `h2`, lists as `ol`/`ul`, quotes as `figure`/`blockquote`/`figcaption`, navigation landmarks labelled (`Career timeline`, `Elsewhere`).
- Decorative images and glyphs get `alt=""` or `aria-hidden`. Icon-only controls carry an accessible name.
- Colour is never the only signal. Status uses shape (solid, ring) and text.
- High contrast: the signature and its underline use `CanvasText` under `forced-colors`.

## Writing

- Plain, specific, sentence case. Name things by what readers understand.
- No filler labels, no "All rights reserved", no instruction-style copy where a heading will do.
- Section headings, notes, and form copy come from the CMS. Suggest copy changes to the owner instead of hard-coding replacements.

## Anti-patterns

Do not introduce:

- All-caps table headers, eyebrow labels, or `01 / 02 / 03` numbering on content that is not a sequence
- Spreadsheet layouts with a narrow date column (the old `table.tsx` pattern)
- Cards with borders and shadows, gradient backgrounds, or glassmorphism beyond the play button's blur
- Accent colours, a second typeface, or italic emphasis inside headlines
- Icons on every navigation item or grey pill highlights in the desktop rail
- Middle-dot meta strings, `↗` arrows, or monospace data labels
- Tiny 12px logos next to text
- Hover-only information with no touch or keyboard equivalent

## Working process

1. Diagnose what currently reads as generic before changing anything, and state the one bold element for the section.
2. Build with the tokens and components above. Add new CSS to `globals.css` as `pf-*` classes next to related rules, and register any motion in the reduced-motion block.
3. When the content is thin, seed realistic test data in the Convex **dev** deployment (append with `npx convex import --table <t> --append`, or a temporary internal action for files), then revalidate via `POST /api/revalidate` and request the page twice.
4. Verify with screenshots at desktop (1360px) and mobile (390px), in light and dark, plus hover, focus, and error states. Run `pnpm exec biome check` and `pnpm exec tsc --noEmit`.
5. Do not add code comments (see `AGENTS.md`).
