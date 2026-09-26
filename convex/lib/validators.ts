import { v } from "convex/values";

export const imageRef = v.union(
  v.object({ kind: v.literal("file"), storageId: v.id("_storage") }),
  v.object({ kind: v.literal("external"), url: v.string() }),
);

export const wireImage = v.string();

export const socialLinkFields = {
  order: v.number(),
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

export const sectionHeaderFields = {
  key: v.string(),
  title: v.string(),
  note: v.optional(v.string()),
  navLabel: v.optional(v.string()),
  hidden: v.optional(v.boolean()),
};

export const wireSectionHeader = v.object({
  title: v.string(),
  note: v.optional(v.string()),
  navLabel: v.optional(v.string()),
  hidden: v.boolean(),
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
