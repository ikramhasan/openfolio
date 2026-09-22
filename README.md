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
src/app/page.tsx        Assembles the panels and hands them to <Tabs>.
src/app/layout.tsx      Document shell, font, metadata.
src/app/globals.css     The whole stylesheet. Classes are prefixed `pf-`.
src/app/_components/
  data.ts               Typed view over portfolio.json, plus sorting/formatting.
  sections.tsx          The section registry — order, labels, notes.
  tabs.tsx              The only client component: tab state, keyboard, URL hash.
  panel.tsx             The frame around one section.
  table.tsx             Shared row/grid primitives every section is built from.
  masthead.tsx          Portrait, name, bio. Persists across tabs.
  about.tsx             Current role, links, photo strip, skills.
  <section>.tsx         One file per section.
```

## Content

All copy and data comes from `data/portfolio.json`; no strings are hardcoded in
components. Images are remote — `next.config.ts` allows the Sanity and Hashnode
CDNs, so new hosts need adding there.

## Adding a section

1. Add it to `data/portfolio.json` under `sections`, and its id to `sectionOrder`.
2. Declare its shape in `Portfolio["sections"]` in `_components/data.ts`.
3. Write the component, then add one entry to `REGISTRY` in
   `_components/sections.tsx`.

The rail, the numbering and the panel follow automatically. `page.tsx` does not
change. In development, a section present in the JSON but missing from the
registry logs a warning.

## Notes

- The newsletter form in `_components/connect.tsx` has no backend; `subscribe()`
  resolves locally. Point it at a real endpoint when one exists — the error path
  and its copy are already wired.
- Dark mode follows `prefers-color-scheme`; there is no manual toggle.
