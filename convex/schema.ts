import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
  imageRef,
  newsletterCopy,
  sectionHeaderFields,
  socialLinkFields,
} from "./lib/validators";

export default defineSchema({
  ...authTables,

  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    isAdmin: v.optional(v.boolean()),
  }).index("email", ["email"]),

  site: defineTable({
    title: v.string(),
    description: v.string(),
  }),

  sectionHeaders: defineTable(sectionHeaderFields).index("key", ["key"]),

  sectionOrder: defineTable({ keys: v.array(v.string()) }),

  intro: defineTable({
    bio: v.string(),
    profileImage: v.optional(imageRef),
    resume: v.optional(imageRef),
  }),

  aboutBio: defineTable({
    value: v.string(),
    updatedAt: v.number(),
  }),

  socialLinks: defineTable({
    ...socialLinkFields,
    placement: v.union(v.literal("intro"), v.literal("footer")),
  }).index("placement_order", ["placement", "order"]),

  connect: defineTable({
    newsletter: newsletterCopy,
  }),

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
    hidden: v.optional(v.boolean()),
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
    hidden: v.optional(v.boolean()),
  }).index("order", ["order"]),

  youtubeVideos: defineTable({
    order: v.number(),
    title: v.string(),
    url: v.string(),
    thumbnail: v.optional(imageRef),
    hidden: v.optional(v.boolean()),
  }).index("order", ["order"]),

  articles: defineTable({
    order: v.number(),
    title: v.string(),
    slug: v.string(),
    url: v.string(),
    coverImage: v.optional(imageRef),
    publishedAt: v.string(),
    readTimeMinutes: v.number(),
    views: v.number(),
    pinned: v.optional(v.boolean()),
    excerpt: v.union(v.string(), v.null()),
    hidden: v.optional(v.boolean()),
  })
    .index("order", ["order"])
    .index("slug", ["slug"])
    .index("publishedAt", ["publishedAt"]),

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
    hidden: v.optional(v.boolean()),
  }).index("order", ["order"]),

  photos: defineTable({
    order: v.number(),
    image: imageRef,
    alt: v.string(),
    title: v.optional(v.string()),
    width: v.number(),
    height: v.number(),
    hidden: v.optional(v.boolean()),
  }).index("order", ["order"]),

  tools: defineTable({
    order: v.number(),
    title: v.string(),
    category: v.string(),
    url: v.string(),
    icon: v.optional(imageRef),
    hidden: v.optional(v.boolean()),
  }).index("order", ["order"]),

  music: defineTable({
    order: v.number(),
    url: v.string(),
    title: v.optional(v.string()),
    artist: v.optional(v.string()),
    hidden: v.optional(v.boolean()),
  }).index("order", ["order"]),

  openSource: defineTable({
    order: v.number(),
    title: v.string(),
    url: v.string(),
    repo: v.optional(v.string()),
    number: v.optional(v.number()),
    avatar: v.optional(imageRef),
    state: v.optional(v.string()),
    date: v.string(),
    stars: v.optional(v.number()),
    hidden: v.optional(v.boolean()),
  }).index("order", ["order"]),

  awards: defineTable({
    order: v.number(),
    title: v.string(),
    organization: v.string(),
    logo: v.optional(imageRef),
    date: v.string(),
    description: v.string(),
    url: v.union(v.string(), v.null()),
    hidden: v.optional(v.boolean()),
  }).index("order", ["order"]),

  recommendations: defineTable({
    order: v.number(),
    title: v.string(),
    url: v.string(),
    body: v.string(),
    author: v.object({
      name: v.string(),
      bio: v.string(),
      image: v.optional(imageRef),
    }),
    hidden: v.optional(v.boolean()),
  }).index("order", ["order"]),

  subscribers: defineTable({
    email: v.string(),
    createdAt: v.number(),
  }).index("email", ["email"]),
});
