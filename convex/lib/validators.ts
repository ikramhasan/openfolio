import { v } from "convex/values";

/**
 * The validators every section table and every wire payload is built from.
 *
 * Two shapes exist for the same value: the stored one, and the "wire" one the
 * Next.js app and the admin editor exchange. They differ only for images — see
 * `imageRef` — so everything else is declared once and used on both sides.
 */

/**
 * A stored image. `file` points at Convex storage; `external` at a CDN we do not
 * own. Storage URLs are deliberately not stored: they are minted on read, which
 * is why this is a reference rather than a string.
 */
export const imageRef = v.union(
  v.object({ kind: v.literal("file"), storageId: v.id("_storage") }),
  v.object({ kind: v.literal("external"), url: v.string() }),
);

/**
 * An image on the wire: an absolute URL for the site, or `storage:<id>` for the
 * admin, which has to round-trip the reference rather than the resolved URL.
 * Empty means "no image".
 */
export const wireImage = v.string();

export const socialLinkFields = {
  order: v.number(),
  /** Identifies the network: `github`, `linkedin`, … */
  site: v.string(),
  title: v.string(),
  url: v.string(),
};

export const wireSocialLink = v.object({
  order: v.number(),
  site: v.string(),
  title: v.string(),
  url: v.string(),
});

/**
 * A call to action. `calendar` addresses Cal.com by user and event instead of by
 * URL, which is why both are optional.
 */
export const actionValidator = v.object({
  label: v.string(),
  type: v.optional(v.string()),
  url: v.union(v.string(), v.null()),
  calendar: v.optional(
    v.object({ namespace: v.string(), username: v.string() }),
  ),
});

/** Heading copy. Every section has one, including those with no list of items. */
export const sectionHeaderFields = {
  /** Matches the key under `sections` in the wire payload. */
  key: v.string(),
  title: v.string(),
  note: v.optional(v.string()),
  navLabel: v.optional(v.string()),
};

export const wireSectionHeader = v.object({
  title: v.string(),
  note: v.optional(v.string()),
  navLabel: v.optional(v.string()),
});

export const newsletterCopy = v.object({
  inputLabel: v.string(),
  placeholder: v.string(),
  submitLabel: v.string(),
  loadingLabel: v.string(),
  messages: v.object({
    invalidEmail: v.string(),
    success: v.string(),
    error: v.string(),
  }),
});

export const signatureValidator = v.object({
  type: v.string(),
  owner: v.string(),
  image: v.optional(imageRef),
});
