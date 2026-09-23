import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
  actionValidator,
  imageRef,
  newsletterCopy,
  sectionHeaderFields,
  signatureValidator,
  socialLinkFields,
} from "./lib/validators";

/**
 * One table per section of the portfolio.
 *
 * Tables named for a single thing — `site`, `intro`, `articlesMeta`, `connect`,
 * `footer` — hold exactly one document. Nothing in the schema can enforce that,
 * so the writes in `admin.ts` go through `putSingleton`, which is the only thing
 * that inserts into them.
 *
 * Every list table carries its own `order`, rewritten on each save, because the
 * editor reorders by dragging and the site renders in that order.
 */
export default defineSchema({
  ...authTables,

  /**
   * Overrides the auth component's `users` table to add the admin flag. Only the
   * first sign-up is allowed (see `auth.ts`), so at most one row exists.
   */
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    /** Set on the first and only user. Every write checks it. */
    isAdmin: v.optional(v.boolean()),
  }).index("email", ["email"]),

  // ---------------------------------------------------------------- chrome

  site: defineTable({
    title: v.string(),
    description: v.string(),
  }),

  /** Heading, subtitle and rail label for every section. */
  sectionHeaders: defineTable(sectionHeaderFields).index("key", ["key"]),

  /**
   * The rail's order, as section keys. Only the sections that get a route are
   * listed: the masthead, the About heading and the footer's copy are sections in
   * the payload but not stops in the rail.
   */
  sectionOrder: defineTable({ keys: v.array(v.string()) }),

  intro: defineTable({
    bio: v.string(),
    profileImage: v.optional(imageRef),
    actions: v.array(actionValidator),
  }),

  /** The masthead photo strip. First is the lead frame. */
  headingImages: defineTable({
    order: v.number(),
    image: imageRef,
    alt: v.string(),
  }).index("order", ["order"]),

  /**
   * `placement` separates the masthead's links from the footer's; they are edited
   * as two lists and rendered in two places.
   */
  socialLinks: defineTable({
    ...socialLinkFields,
    placement: v.union(v.literal("intro"), v.literal("footer")),
  }).index("placement_order", ["placement", "order"]),

  footer: defineTable({
    signature: signatureValidator,
    copyright: v.string(),
    actions: v.array(actionValidator),
  }),

  connect: defineTable({
    newsletter: newsletterCopy,
  }),

  // --------------------------------------------------------------- sections

  skills: defineTable({
    order: v.number(),
    icon: v.string(),
    level: v.number(),
    title: v.string(),
    url: v.string(),
  }).index("order", ["order"]),

  education: defineTable({
    order: v.number(),
    title: v.string(),
    institution: v.string(),
    location: v.string(),
    logo: v.optional(imageRef),
    dateRange: v.string(),
    description: v.union(v.string(), v.null()),
    url: v.union(v.string(), v.null()),
  }).index("order", ["order"]),

  experience: defineTable({
    order: v.number(),
    title: v.string(),
    company: v.string(),
    location: v.string(),
    logo: v.optional(imageRef),
    dateRange: v.string(),
    details: v.array(v.string()),
    url: v.union(v.string(), v.null()),
  }).index("order", ["order"]),

  youtubeVideos: defineTable({
    order: v.number(),
    title: v.string(),
    url: v.string(),
    thumbnail: v.optional(imageRef),
  }).index("order", ["order"]),

  articles: defineTable({
    order: v.number(),
    title: v.string(),
    /** Addresses the post's own page in the admin. */
    slug: v.string(),
    url: v.string(),
    coverImage: v.optional(imageRef),
    /** ISO 8601. The site sorts on this, newest first. */
    publishedAt: v.string(),
    readTimeMinutes: v.number(),
    views: v.number(),
    pinned: v.optional(v.boolean()),
    excerpt: v.union(v.string(), v.null()),
  })
    .index("order", ["order"])
    .index("slug", ["slug"])
    .index("publishedAt", ["publishedAt"]),

  /** The Articles panel's "view all" link, which belongs to no single post. */
  articlesMeta: defineTable({
    viewAll: v.object({ label: v.string(), url: v.string() }),
  }),

  /**
   * A record's body, written in the editor at `/admin/write/<section>/<slug>`.
   *
   * One table per section, as everything else here is, and its own table rather
   * than a column on the record: a section save rewrites every row of that table
   * from the wire payload and would drop a field the payload does not carry. Keyed
   * by slug, which is what addresses the page.
   *
   * `value` is the Plate value as JSON text: it nests deeper than Convex objects
   * allow and nothing queries inside it. Images in it are `storage:<id>` tokens,
   * resolved on read — see `lib/body.ts`. `lib/writable.ts` names the four.
   */
  articleBodies: defineTable({
    slug: v.string(),
    value: v.string(),
    updatedAt: v.number(),
  }).index("slug", ["slug"]),

  experienceBodies: defineTable({
    slug: v.string(),
    value: v.string(),
    updatedAt: v.number(),
  }).index("slug", ["slug"]),

  projectBodies: defineTable({
    slug: v.string(),
    value: v.string(),
    updatedAt: v.number(),
  }).index("slug", ["slug"]),

  awardBodies: defineTable({
    slug: v.string(),
    value: v.string(),
    updatedAt: v.number(),
  }).index("slug", ["slug"]),

  projects: defineTable({
    order: v.number(),
    title: v.string(),
    description: v.string(),
    link: v.string(),
    logo: v.optional(imageRef),
    tags: v.array(v.string()),
  }).index("order", ["order"]),

  /**
   * The tools the author uses. `category` is the grouping the site renders under;
   * it is free text because the set is the author's own and changes with the work.
   */
  tools: defineTable({
    order: v.number(),
    title: v.string(),
    category: v.string(),
    url: v.string(),
    icon: v.optional(imageRef),
  }).index("order", ["order"]),

  /**
   * Records the author listens to. The Spotify link is the whole record: the site
   * renders Spotify's own player from it, which supplies the title and artist.
   *
   * `title` and `artist` are not rendered — the player shows them — but they are how
   * a row is told apart in the editor, and they name the frame for a screen reader.
   * Optional, so a row stored without them is still valid; the projection fills a
   * blank.
   */
  music: defineTable({
    order: v.number(),
    url: v.string(),
    title: v.optional(v.string()),
    artist: v.optional(v.string()),
  }).index("order", ["order"]),

  awards: defineTable({
    order: v.number(),
    title: v.string(),
    organization: v.string(),
    logo: v.optional(imageRef),
    /** ISO 8601. */
    date: v.string(),
    description: v.string(),
    url: v.union(v.string(), v.null()),
  }).index("order", ["order"]),

  recommendations: defineTable({
    order: v.number(),
    /** Admin-only label; the site shows the quote and its author. */
    title: v.string(),
    url: v.string(),
    body: v.string(),
    author: v.object({
      name: v.string(),
      bio: v.string(),
      image: v.optional(imageRef),
    }),
  }).index("order", ["order"]),

  // ------------------------------------------------------------- newsletter

  /**
   * Newsletter sign-ups. The only table a visitor can write to, which is why
   * `newsletter.subscribe` is rate limited and stores nothing but the address.
   */
  subscribers: defineTable({
    email: v.string(),
    createdAt: v.number(),
  }).index("email", ["email"]),
});
