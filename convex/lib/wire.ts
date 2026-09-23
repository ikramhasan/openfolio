import { v } from "convex/values";
import {
  actionValidator,
  newsletterCopy,
  wireImage,
  wireSectionHeader,
  wireSocialLink,
} from "./validators";

/**
 * The shape the Next.js app and the admin editor speak: sections keyed by id, each
 * with heading copy and a list of items. The database is normalised into a table per
 * section; this is the projection of it, declared once and used as both `returns` and
 * `args`.
 *
 * Images are strings here — an absolute URL on the way out to the site, a
 * `storage:<id>` token on the way to and from the editor. See `lib/images.ts`.
 */

const nullableString = v.union(v.string(), v.null());

export const wireEducation = v.object({
  title: v.string(),
  institution: v.string(),
  location: v.string(),
  logo: wireImage,
  dateRange: v.string(),
  description: nullableString,
  url: nullableString,
});

export const wireExperience = v.object({
  order: v.number(),
  title: v.string(),
  company: v.string(),
  location: v.string(),
  logo: wireImage,
  dateRange: v.string(),
  details: v.array(v.string()),
  url: nullableString,
});

export const wireVideo = v.object({
  order: v.number(),
  title: v.string(),
  url: v.string(),
  thumbnail: wireImage,
});

export const wireArticle = v.object({
  title: v.string(),
  slug: v.string(),
  url: v.string(),
  coverImage: wireImage,
  publishedAt: v.string(),
  readTimeMinutes: v.number(),
  views: v.number(),
  pinned: v.optional(v.boolean()),
  excerpt: nullableString,
});

export const wireProject = v.object({
  order: v.number(),
  title: v.string(),
  description: v.string(),
  link: v.string(),
  logo: wireImage,
  tags: v.array(v.string()),
});

export const wireTool = v.object({
  order: v.number(),
  title: v.string(),
  /** The heading the site groups this tool under. */
  category: v.string(),
  url: v.string(),
  icon: wireImage,
});

export const wireTrack = v.object({
  order: v.number(),
  /** What the player plays. Everything shown comes from it.  */
  url: v.string(),
  /** Not rendered: the editor's row label, and the frame's accessible name. */
  title: v.string(),
  artist: v.string(),
});

/**
 * One contribution. Everything but the URL is a snapshot of what GitHub answered
 * when it was last fetched — see `convex/github.ts` — so the site never reads from
 * GitHub to render, and a row typed by hand is still valid.
 */
export const wireContribution = v.object({
  title: v.string(),
  url: v.string(),
  /** `owner/name`. */
  repo: v.string(),
  /** `0` for a contribution with no number of its own. */
  number: v.number(),
  avatar: wireImage,
  state: v.string(),
  date: v.string(),
  /** `0` leaves the count off the row rather than claiming none. */
  stars: v.number(),
});

export const wireAward = v.object({
  order: v.number(),
  title: v.string(),
  organization: v.string(),
  logo: wireImage,
  date: v.string(),
  description: v.string(),
  url: nullableString,
});

export const wireRecommendation = v.object({
  title: v.string(),
  url: v.string(),
  body: v.string(),
  author: v.object({
    name: v.string(),
    bio: v.string(),
    image: wireImage,
  }),
});

export const wireSkill = v.object({
  order: v.number(),
  icon: v.string(),
  level: v.number(),
  title: v.string(),
  url: v.string(),
});

// ------------------------------------------------------------------ sections

// Every section is its heading copy plus whatever it carries, so each spreads
// `wireSectionHeader.fields`.
const header = wireSectionHeader.fields;

export const wireSite = v.object({
  title: v.string(),
  description: v.string(),
});

export const wireIntro = v.object({
  ...header,
  bio: v.string(),
  profileImage: wireImage,
  headingImages: v.array(v.object({ url: wireImage, alt: v.string() })),
  socialLinks: v.array(wireSocialLink),
  actions: v.array(actionValidator),
});

export const wireAbout = v.object({ ...header });

export const wireEducationSection = v.object({
  ...header,
  items: v.array(wireEducation),
});

export const wireExperienceSection = v.object({
  ...header,
  items: v.array(wireExperience),
});

export const wireVideosSection = v.object({
  ...header,
  items: v.array(wireVideo),
});

export const wireArticlesSection = v.object({
  ...header,
  items: v.array(wireArticle),
  viewAll: v.object({ label: v.string(), url: v.string() }),
});

export const wireProjectsSection = v.object({
  ...header,
  items: v.array(wireProject),
});

export const wireToolsSection = v.object({
  ...header,
  items: v.array(wireTool),
});

export const wireMusicSection = v.object({
  ...header,
  items: v.array(wireTrack),
});

export const wireOpenSourceSection = v.object({
  ...header,
  items: v.array(wireContribution),
});

export const wireAwardsSection = v.object({
  ...header,
  items: v.array(wireAward),
});

export const wireRecommendationsSection = v.object({
  ...header,
  items: v.array(wireRecommendation),
});

export const wireSkillsSection = v.object({
  ...header,
  items: v.array(wireSkill),
});

export const wireConnectSection = v.object({
  ...header,
  newsletter: newsletterCopy,
});

export const wireFooter = v.object({
  signature: v.object({
    type: v.string(),
    owner: v.string(),
    image: wireImage,
  }),
  socialLinks: v.array(wireSocialLink),
  actions: v.array(actionValidator),
  copyright: v.string(),
});

export const wirePortfolio = v.object({
  site: wireSite,
  sectionOrder: v.array(v.string()),
  sections: v.object({
    intro: wireIntro,
    about: wireAbout,
    skills: wireSkillsSection,
    education: wireEducationSection,
    experience: wireExperienceSection,
    youtubeVideos: wireVideosSection,
    articles: wireArticlesSection,
    projects: wireProjectsSection,
    tools: wireToolsSection,
    music: wireMusicSection,
    openSource: wireOpenSourceSection,
    awards: wireAwardsSection,
    recommendations: wireRecommendationsSection,
    connect: wireConnectSection,
  }),
  footer: wireFooter,
});

/** The section keys the site renders, in the order the wire payload nests them. */
export const SECTION_KEYS = [
  "intro",
  "about",
  "skills",
  "education",
  "experience",
  "youtubeVideos",
  "articles",
  "projects",
  "tools",
  "music",
  "openSource",
  "awards",
  "recommendations",
  "connect",
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

/**
 * Everything the site caches separately, so a save only invalidates what it
 * touched. `site` and `footer` are not sections but are cached the same way.
 */
export const CACHE_KEYS = [...SECTION_KEYS, "site", "footer", "nav"] as const;

export type CacheKey = (typeof CACHE_KEYS)[number];
