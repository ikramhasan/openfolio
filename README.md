# Portfolio

A single-page portfolio built with Next.js. A sticky index rail on the left, one
section at a time on the right, switched as tabs.

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command       | What it does                          |
| ------------- | ------------------------------------- |
| `pnpm dev`    | Development server                    |
| `pnpm build`  | Production build                      |
| `pnpm start`  | Serve the production build            |
| `pnpm lint`   | Biome check (lint + format + imports) |
| `pnpm format` | Rewrite files to Biome's formatting   |

## Layout

```
data/portfolio.json     All content. The only file to edit for copy changes.
public/signature.svg    The footer signature, used as a CSS mask.
src/app/layout.tsx      Document shell, font, metadata, the pre-paint theme script.
src/app/globals.css     The site's stylesheet. Classes are prefixed `pf-`.
src/app/(site)/
  layout.tsx            The portfolio's chrome: rail, masthead, footer.
  [[...section]]/       One route per section; `/` is the lead one.
src/app/admin/          The editor. See "Admin" below.
src/app/_components/
  data.ts               Typed view over portfolio.json, plus sorting/formatting.
  sections.tsx          The section registry — order, routes, bodies.
  rail.tsx              Client: the section index, drag-to-scroll, edge fades.
  theme-toggle.tsx      Client: Auto / Light / Dark, lives at the foot of the rail.
  panel.tsx             The frame around one section.
  table.tsx             Shared row/grid primitives every section is built from.
  masthead.tsx          Portrait, name, bio. Persists across tabs.
  about.tsx             Current role, links, photo strip, skills.
  <section>.tsx         One file per section.
```

## Content

All copy and data comes from `data/portfolio.json`; components hold no editorial
strings. That includes every section's heading, its subtitle (`note`) and its rail
wording (`navLabel`), which the registry only routes to. What stays in the
components is furniture — column headers, `min read`, the date formats — and the
About panel's prose, which is written around the Experience records rather than
stored. Images are remote: `next.config.ts` allows the Sanity and Hashnode CDNs,
so new hosts need adding there.

## Adding a section

1. Add it to `data/portfolio.json` under `sections`, and its id to `sectionOrder`.
2. Declare its shape in `Portfolio["sections"]` in `_components/data.ts`.
3. Write the component, then add one entry to `REGISTRY` in
   `_components/sections.tsx`.
4. To make it editable, add a group to `ADMIN_GROUPS` in `admin/_lib/schema.ts`.

The rail, the numbering and the panel follow automatically. The route does not
change. In development, a section present in the JSON but missing from the
registry logs a warning.

## Admin

`/admin` edits everything the portfolio reads, in the portfolio's own furniture —
the same rail, panel and ink. One group per rail item: profile, one per section,
the footer, and the section order. Lists reorder by dragging a handle or by
lifting a row with the space bar and moving it with the arrows.

```
admin/layout.tsx          Loads the content, provides the draft, holds the save dock.
admin/[[...group]]/       One route per group, resolved from the schema.
admin/admin.css           The editor's own classes, also `pf-` prefixed.
admin/_lib/
  schema.ts               What is editable, as data: groups, blocks, fields.
  repository.ts           The storage seam: `load` and `save`.
  draft.tsx               Client: the working copy, dirty state, save and discard.
  paths.ts                Immutable reads/writes by dotted path.
admin/_components/        Field inputs, the sortable list, the record list, the dock.
```

Two things to know before wiring a backend:

- **`_lib/repository.ts` is the whole seam.** `load` hands back the bundled JSON
  and `save` resolves without writing, so edits live until the tab closes. `load`
  is already awaited on the server; `save` is called from the client, so a real
  one needs a server action or a route handler. Nothing above that file knows
  where content comes from — every edit is a path (`sections.awards.items.2.date`)
  and a value, which is also what a patch endpoint wants.
- **There is no authentication.** The route is a plain page, so anything that
  reaches the deployment reaches the editor. Today it can only change one
  visitor's own copy of the data; the moment `save` writes, it needs a check in
  front of it — middleware on `/admin` and authorisation inside the write itself,
  not only in the UI.

Adding a field to an existing group is one entry in `ADMIN_GROUPS`; the inputs,
the reordering and the save dock are generic. The groups only carry what the site
actually renders, so source fields it ignores — `intro.socialLinks`, `skills`,
article cover images — have no controls. The one coupling to keep in mind is that
the About panel's prose names the first four Experience roles, so adding or
removing one means editing `_components/about.tsx` as well.

## Notes

- The newsletter form in `_components/newsletter.tsx` has no backend; `subscribe()`
  resolves locally. Point it at a real endpoint when one exists — the error path
  and its copy are already wired.
- Dark mode: the `Auto / Light / Dark` control at the foot of the rail writes
  `<html data-theme>` and mirrors it to `localStorage`. `Auto` removes the
  attribute, which hands the decision back to `prefers-color-scheme`, so the
  system default still works with JavaScript off. An inline script in
  `layout.tsx` restores the choice before the first paint; it hardcodes the
  storage key that `theme-toggle.tsx` exports, so the two have to change
  together. The dark ramp is spelled twice in `globals.css` — once under the
  media query, once under `[data-theme="dark"]` — because a declaration block
  cannot be shared across a media query boundary.
