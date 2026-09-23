# Portfolio

A single-page portfolio built with Next.js on a Convex backend. A sticky index rail
on the left, one section at a time on the right, switched as tabs. The content lives
in Convex and is edited at `/admin`; the public pages are prerendered and refreshed
one section at a time when a section is saved.

## Getting started

```bash
pnpm install
pnpm dev
```

One command: `convex dev --start 'next dev'` pushes `convex/` to the dev deployment,
then starts Next.js beside it and keeps watching both. Ctrl-C stops the pair. Run
them apart with `pnpm dev:backend` and `pnpm dev:web` when you want separate logs.

Open [http://localhost:3000](http://localhost:3000). The first run needs a database
with something in it and an account to edit it with:

```bash
pnpm seed          # imports data/portfolio.json into the section tables
```

Then open `/signin` and claim the account. The address has to match `ADMIN_EMAIL`
on the deployment, and after that first sign-up there is no second one.

## Scripts

| Command                | What it does                                     |
| ---------------------- | ------------------------------------------------ |
| `pnpm dev`             | Convex dev deployment plus the Next.js server    |
| `pnpm dev:web`         | Next.js alone                                    |
| `pnpm dev:backend`     | Convex alone, watching `convex/`                 |
| `pnpm build`           | Production build                                 |
| `pnpm start`           | Serve the production build                       |
| `pnpm lint`            | Biome check (lint + format + imports)            |
| `pnpm format`          | Rewrite files to Biome's formatting              |
| `pnpm seed`            | Import `data/portfolio.json`, overwriting        |
| `pnpm release-account` | Delete the account, re-opening sign-up           |

## Layout

```
convex/
  schema.ts             One table per section, plus the auth tables.
  content.ts            Public reads: one query per cached section.
  bodies.ts             One record's body: the public read and the editor's write.
  admin.ts              The editor's read, and the save that diffs it.
  auth.ts               Password sign-in, and the single-user lockout.
  files.ts              Upload URLs, and the sweep for orphaned files.
  newsletter.ts         The one write a visitor can make.
  users.ts              Viewer, sign-up availability, account release.
  seed.ts               The one-off import of data/portfolio.json.
  lib/
    validators.ts       Shared field validators.
    wire.ts             The payload shape the app and the editor speak.
    project.ts          Rows to that shape.
    write.ts            That shape back to rows.
    images.ts           Storage references, and what they become.
    body.ts             The same, for the images inside a written body.
    writable.ts         Which sections can be written here, and what addresses one.
    authz.ts            requireAdmin.

data/portfolio.json     The content as it was before the database. Seed only.
public/signature.svg    The footer signature, used as a CSS mask.
src/proxy.ts            Proxies /api/auth; turns /admin and /api/ai away when signed out.
src/app/layout.tsx      Document shell, font, metadata, the pre-paint theme script.
src/app/globals.css     The site's stylesheet. Classes are prefixed `pf-`.
src/app/prose.css       The reading column: what a stored body looks like.
src/app/sitemap.ts      One entry per section route, plus one per written record.
src/app/robots.ts       Keeps /admin, /signin and /api out of the index.
src/app/api/revalidate/ Publishes content changed outside the editor.
src/app/api/ai/         The editor's AI routes. Behind the session.
src/app/signin/         Claim the account, or sign in.
src/app/(site)/
  layout.tsx            The portfolio's chrome: rail, masthead, footer.
  [[...section]]/       One route per section; `/` is the lead one.
  articles/[slug]/      One record written here, rendered without the editor.
  projects/[slug]/      The same, for a project.
  experience/[slug]/    The same, for a role.
  awards/[slug]/        The same, for an award.
src/app/admin/          The editor. See "Admin" below.
src/app/_actions/       Server functions the client calls.
src/app/_components/
  content.ts            The cached reads. One loader and one tag per section.
  types.ts              The content's shapes, read off the Convex queries.
  data.ts               Sorting and formatting. No content of its own.
  writing.ts            Where a written record is read, and where it is written.
  sections.tsx          The section registry — order, routes, bodies, tags.
  rail.tsx              Client: the section index, drag-to-scroll, edge fades.
  theme-toggle.tsx      Client: Auto / Light / Dark, at the foot of the rail.
  panel.tsx             The frame around one section.
  written.tsx           The frame around one written record.
  table.tsx             Shared row/grid primitives every section is built from.
  masthead.tsx          Portrait, name, bio. Persists across tabs.
  tools.tsx             The tools, grouped under their category.
  about.tsx             Current role, links, photo strip, skills.
  prose-body.tsx        A stored body as markup, with no client JavaScript.
  <section>.tsx         One file per section.
src/components/         Generated: the Plate editor, from `shadcn add @plate/editor-ai`.
src/hooks/              Generated, except `use-upload-file.ts` — see "Writing".
src/lib/                Generated helpers the editor imports.
```

Everything under `src/components`, `src/hooks` and `src/lib` came out of the shadcn
registry rather than being written here, so Biome skips it (`biome.json`); the four
places it was edited are commented as such.

## Content

Every section is its own table, and every section has its own public query in
`convex/content.ts`. Nothing is bundled into the build: `data/portfolio.json` is
only the seed, and `pnpm seed` overwrites whatever is there with it.

The queries return the shape the JSON had — sections keyed by id, each with its
heading copy and a list of items — because that is also the shape the editor's draft
store edits by dotted path. `convex/lib/wire.ts` declares it once and both
directions use it.

Images are references, not URLs. A record points either at a file in Convex storage
or at a URL on a CDN we do not own — or, for a tool, at Google's favicon service,
which the editor can fill in from the tool's own URL; on the way out to the site both resolve to an
absolute URL, minted on read. On the way to the editor a stored file stays a
`storage:<id>` token, so saving a record whose photograph was not touched cannot
freeze a resolved URL into the database. `next.config.ts` allows the Sanity and
Hashnode CDNs, the favicon service, and whichever Convex deployment the build points
at; a new host needs adding there.

Component furniture — column headers, `min read`, the date formats — stays in the
components, as does the About panel's prose, which is written around the Experience
records rather than stored.

## Caching

`cacheComponents` is on. Each loader in `_components/content.ts` is a `use cache`
scope with the `max` lifetime and one tag, `portfolio:<section>`; each route segment
is cached too and tags itself with every section it reads. A section's entry in
`_components/sections.tsx` declares that in `reads`.

Saving in the editor calls `api.admin.save`, which compares the payload against what
is stored and returns only the keys that differ. The server function then calls
`updateTag` for exactly those, so editing Experience refreshes `/experience` and the
About panel that quotes it, and leaves the other eight routes byte-identical.

Content changed some other way — a row edited in the Convex dashboard, a seed run —
is published by posting the keys to `/api/revalidate` with `REVALIDATE_SECRET`:

```bash
curl -X POST http://localhost:3000/api/revalidate \
  -H "Authorization: Bearer $REVALIDATE_SECRET" \
  -H 'Content-Type: application/json' \
  -d '{"keys":["awards"]}'      # omit "keys" for all of them
```

## Adding a section

1. Add its table to `convex/schema.ts`, its validators to `convex/lib/wire.ts`, its
   projection to `convex/lib/project.ts` and its writer to `convex/lib/write.ts`.
2. Add a query to `convex/content.ts` and a loader to `_components/content.ts`.
3. Write the component, then add one entry to `REGISTRY` in
   `_components/sections.tsx`, listing in `reads` every section it reaches. A section
   that is not a stop in the rail also belongs in `excludes` on the order block.
4. To make it editable, add a group to `ADMIN_GROUPS` in `admin/_lib/schema.ts`.
5. If it has an image column, add it to `referencedStorageIds` in `convex/files.ts`,
   or the sweep will delete its files.
6. To let its records be written here rather than only linked out to: add a body
   table to the schema, name it in `WRITABLE_SECTIONS` and `BODY_TABLES`
   (`convex/lib/writable.ts`), add its route to `READ_BASE` in
   `_components/writing.ts`, give its records block a `page: writeRoute(<key>)`, and
   add a `[slug]` page under `(site)/<section>/`.

The rail, the numbering and the panel follow automatically. The route does not
change. In development, a section in the stored order but missing from the registry
logs a warning.

## Admin

`/admin` edits everything the portfolio reads, in the portfolio's own furniture —
the same rail, panel and ink. One group per rail item: profile, one per section,
contact, the footer, and the section order. Lists reorder by dragging a handle or by
lifting a row with the space bar and moving it with the arrows. Image fields take
either a URL or a file, which goes straight from the browser to Convex; one that
names a sibling URL field (`from`, in the schema) also offers **Use site icon**,
which fills it with that site's favicon. A field with `suggest` offers what the other
records in the same list hold in it, which is how the tools' categories stay one
spelling.

The section order group lists what the stored order holds, then anything the payload
carries that it does not. A section is appended to the rail either way; **Place**
gives it a position of its own.

```
admin/layout.tsx          Guards the route. Nothing visual: the two kinds of page
                          under it do not share their furniture.
admin/(content)/          The groups: the rail, the header, the draft, the dock.
  [[...group]]/           One route per group, resolved from the schema.
admin/write/              One record's body, filling the window. See "Writing".
  [section]/[slug]/       The same page for all four writable sections.
admin/admin.css           The editor's own classes, also `pf-` prefixed.
admin/_lib/
  schema.ts               What is editable, as data: groups, blocks, fields.
  repository.ts           The read, as the signed-in admin.
  actions.ts              The save and the upload URL, plus the revalidation.
  draft.tsx               Client: the working copy, dirty state, save and discard.
  paths.ts                Immutable reads/writes by dotted path.
admin/_components/        Field inputs, the sortable list, the record list, the dock.
```

## Writing

A record can be a link out or a page here. **Write** on a row in Experience,
Projects, Articles or Awards opens `/admin/write/<section>/<slug>`, which is Plate —
the editor from `shadcn add @plate/editor-ai` — given the whole window. It sits
outside the `(content)` group, so it carries none of the groups' furniture and does
not load a draft of the portfolio to write one page: a header with where you came
from, what you are writing and the save, then the column. The site's list then links
to `/<section>/<slug>` for the records that have a body, out to the record's own URL
for the rest, and nowhere at all for a record with neither — so the imported rows
keep working and nothing had to be migrated.

Nothing has to be filled in first: the record addresses its own page. Articles keep a
slug of their own, because theirs were published elsewhere before this site existed
and those links have to keep matching; every other section derives one from the title
(`slugOf`, in `convex/lib/writable.ts`), which is what the lists already key their
rows by. Two records in a section with the same title would therefore address one
page, and a record with no title yet has no address — the record list says so rather
than linking nowhere.

The body is a table of its own per section — `experienceBodies`, `projectBodies`,
`articleBodies`, `awardBodies`, named together in `convex/lib/writable.ts` — keyed by
slug and holding the Plate value as JSON text. Not a column on the record: a section
save rewrites every row of that table from the wire payload, which does not carry a
body and would drop it. It also keeps `admin.save` the size it was — the whole
document goes over the wire on every save of every section, and a body does not
belong in that. One table per section rather than one keyed by both, because that is
how the rest of the portfolio is stored, and because generalising `articleBodies` by
renaming it would have orphaned every post already written.

Saving calls `api.bodies.save` and revalidates `portfolio:<section>`, the tag the
list, the section route and the record's own page all carry. The public page renders
the stored value with `BaseEditorKit` on the server (`_components/prose-body.tsx`),
so a reader downloads markup rather than an editor — bar one island, the copy button
on a code block, which needs a clipboard the server has not got. It costs 3 KB.

What sits around the prose is `_components/written.tsx`: the title, then whatever the
record already says about itself — an excerpt, a date and a read time for a post, a
company and its bullets for a role, tags and a link for a project — then the body.
Those fields come from the section's existing query rather than a read of their own,
so a written record costs one more cache entry, not two.

What that body looks like is `app/prose.css`, and every static node component was
rewritten against it: the registry ships a generic editor theme — blue links, yellow
highlights, a gridded table, a `font-bold` override on every `strong` — and none of
that is this site. The reading column is the same ledger as the rest: one ink ramp,
hairline rules, emphasis by weight, 17px over a 68ch measure. Blocks carry
`pf-prose-block`, which is what the vertical rhythm keys off, so a block type added
later inherits it by adding one class. Code is the exception that carries hue, in
`--pf-code-*`: a keyword and a string differ in kind, and weight alone cannot say so
across forty lines. Those values are the editor's own, so a block reads the same
while it is being written and after it is published.

The column is `.pf-prose` rather than anything named for articles, because all four
sections render through the same `_components/prose-body.tsx`, and a fifth given a
body later would too.

Two things in there are load-bearing and easy to "fix" into bugs. `BlockListStatic`
wraps ordered and todo lists only: for those, Plate leaves the block without a marker
and the `<ol>` supplies the numbering, while a `disc` block is given
`display: list-item` and draws its own — wrapping that one too puts two markers on
every bullet. And the inline equation must be rendered with `displayMode: false`; the
registry passes `true`, which is a block and breaks the line it sits in.

Images in a body follow the same rule as every other image here — a stored file is a
`storage:<id>` reference, resolved on read — with one wrinkle: `ctx.storage.getUrl`
mints a path that does not contain the id, so a URL cannot be read backwards. The
uploader writes the id onto the node beside the URL and `convex/lib/body.ts` makes
the token from that, but only while the node's URL still resolves to that exact file,
so replacing an uploaded image with one from a CDN is not undone by the next save.
`files.ts` reads every section's bodies before it sweeps, so an image in one is not
garbage.

The editor wears the same column. `admin/write/<section>/<slug>` puts `pf-prose` on
the editable itself, and every node component — the editor's and its static pair — reads
from `app/prose.css`, so a heading, a quote or a code block is one decision rendered
twice rather than two that drift. The chrome could not come from there: the toolbars,
the menus and the shadcn primitives under them get the site's ink through the tokens
in `globals.css`, and three things a token cannot carry are set once at the foot of
`admin/admin.css` — the 2px focus outline in place of shadcn's soft ring, the
hairline-and-lift shadow for the things that genuinely float, and selection in ink
rather than in the registry's blue.

Six files under the generated trees were edited for behaviour rather than for looks,
each commented where it was: `hooks/use-upload-file.ts` uploads to Convex storage
rather than to uploadthing, `ui/media-placeholder-node.tsx` records the storage id,
`editor/use-chat.ts`, `ui/ai-menu.tsx` and `plugins/copilot-kit.tsx` drop the
registry's mock AI responses, and `ui/date-node.tsx` takes a prop react-day-picker
renamed.

The AI features — ⌘J, the slash menu's AI entries, the copilot ghost text — post to
`/api/ai/command` and `/api/ai/copilot`, which are Next.js routes rather than Convex
functions, so `proxy.ts` is their only gate and it refuses anyone without a session.
They talk to Gemini directly through the AI SDK's `@ai-sdk/google` provider —
`gemini-3.8-flash`, named in the routes rather than chosen by the browser, because
the key being spent is the deployment's. Set `GOOGLE_GENERATIVE_AI_API_KEY`; without
it those features answer 401 and the rest of the editor is unaffected. The registry's
settings dialog, which existed to hold a gateway key and pick from a list of gateway
models, is gone with it.

Two sharp edges. Renaming a record moves its page, because the address follows the
title — or the slug field, for a post: the editor opens empty at the new address and
the body stays under the old one, orphaned. Rename before writing, not after. And an
untitled record has nothing to address yet, which the record list says rather than
linking nowhere.

## Security

There is one account and no way to make a second. `convex/auth.ts` refuses a
sign-up whose address is not `ADMIN_EMAIL`, refuses every sign-up while
`ADMIN_EMAIL` is unset, and refuses every sign-up once a user exists; because Convex
mutations are serializable, two simultaneous attempts cannot both pass. A deployment
that is reachable before it is configured is therefore closed, not open to whoever
finds `/signin` first.

There is deliberately no password reset: a reset link is a second door into the only
privileged account. If the password is lost, `pnpm release-account` deletes the
account so it can be claimed again. It touches no content.

The gate that matters is in Convex, not in Next.js. `requireAdmin` in
`convex/lib/authz.ts` takes the identity from the request's token — never from an
argument — re-reads the admin flag from the database, and runs first in
`admin.load`, `admin.save`, `bodies.load`, `bodies.save` and
`files.generateUploadUrl`. `src/proxy.ts` and the redirect in `admin/layout.tsx` only
save a round trip; deleting them would cost a redirect, not the authorisation. The
exception is `/api/ai`, which is a Next.js route holding the Gemini key rather
than a Convex function: there the proxy is the whole gate. Session cookies are set by
`/api/auth`, httpOnly and SameSite=Lax, so no token is readable from JavaScript.

`newsletter.subscribe` is the only thing a visitor can write. It validates the
address, is rate limited per address and globally, stores nothing else, and answers
the same way whether or not the address was already on the list. `/api/revalidate`
is a shared secret rather than a session, because its caller is a script; the worst a
leaked one buys is a wasted cache refresh, but it is still a secret and must not be
given a `NEXT_PUBLIC_` name.

Image references are parsed, not trusted: anything that is not a storage token, an
`http(s)` URL or a root-relative path is dropped, which keeps `javascript:` and
`data:` values out of an `src` and out of the signature's `url()`.

## Deploying

The public pages are prerendered at build time, so the build needs to reach a
deployment with content in it. On the host, set:

| Variable                  | What it is                                        |
| ------------------------- | ------------------------------------------------- |
| `NEXT_PUBLIC_CONVEX_URL`  | The deployment's URL                              |
| `NEXT_PUBLIC_SITE_URL`    | The site's own origin, for canonicals and the feed |
| `REVALIDATE_SECRET`       | 32 random bytes or so                             |
| `CONVEX_DEPLOY_KEY`       | So `convex deploy` runs as part of the build      |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Optional. The editor's AI features — see "Writing" |

and on the Convex deployment itself: `JWT_PRIVATE_KEY`, `JWKS`, `SITE_URL` (the
site's origin, not the deployment's) and `ADMIN_EMAIL`. The keys are generated with
`jose`, not by the interactive wizard:

```bash
node -e 'import("jose").then(async({generateKeyPair,exportPKCS8,exportJWK})=>{
  const k=await generateKeyPair("RS256",{extractable:true});
  const priv=await exportPKCS8(k.privateKey), pub=await exportJWK(k.publicKey);
  console.log(JSON.stringify({JWT_PRIVATE_KEY:priv.trimEnd().replace(/\n/g," "),
    JWKS:JSON.stringify({keys:[{use:"sig",...pub}]})}))})'
```

Set them with `npx convex env set "NAME=VALUE"` — the `NAME VALUE` form breaks on
the private key, whose value starts with a dash. A different deployment needs its
own keys and its own seed.

## Notes

- Dark mode: the `Auto / Light / Dark` control at the foot of the rail writes
  `<html data-theme>` and mirrors it to `localStorage`. `Auto` removes the
  attribute, which hands the decision back to `prefers-color-scheme`, so the system
  default still works with JavaScript off. An inline script in `layout.tsx` restores
  the choice before the first paint; it hardcodes the storage key that
  `theme-toggle.tsx` exports, so the two have to change together. The dark ramp is
  spelled twice in `globals.css` — once under the media query, once under
  `[data-theme="dark"]` — because a declaration block cannot be shared across a
  media query boundary.
- Newsletter sign-ups land in the `subscribers` table and nothing reads them; there
  is no list view in the editor yet.
- The About panel's prose names the first four Experience roles, so adding or
  removing one of them means editing `_components/about.tsx`. Each clause is guarded,
  so a shorter list renders a shorter summary rather than failing.
- The years-of-experience figure in that prose is computed from the current year
  inside a `max`-lived cache entry, so on the 1st of January it keeps the old figure
  until the entry's next revalidation — within thirty days, or immediately if
  Experience is edited.
- `pnpm release-account` deletes a bounded number of auth rows per run and answers
  `done: false` when there is more. Run it again until it answers `done: true`.
