import type { api } from "@convex/_generated/api";
import type { wirePortfolio } from "@convex/lib/wire";
import type { FunctionReturnType } from "convex/server";

/**
 * The shapes the site renders, read off the Convex queries that produce them, so
 * a change to a section's schema surfaces here as a type error rather than as a
 * blank panel.
 */

type Returns<Name extends keyof typeof api.content> = FunctionReturnType<
  (typeof api.content)[Name]
>;

export type Site = Returns<"site">;
export type Nav = Returns<"nav">;
export type SectionHeader = Nav["byKey"][string];

export type Intro = Returns<"intro">;
export type EducationSection = Returns<"education">;
export type ExperienceSection = Returns<"experience">;
export type VideosSection = Returns<"youtubeVideos">;
export type ArticlesSection = Returns<"articles">;
export type ProjectsSection = Returns<"projects">;
export type AwardsSection = Returns<"awards">;
export type RecommendationsSection = Returns<"recommendations">;
export type ConnectSection = Returns<"connect">;
export type Footer = Returns<"footer">;

export type Role = ExperienceSection["items"][number];
export type SocialLink = Footer["socialLinks"][number];
export type Action = Footer["actions"][number];
export type NewsletterCopy = ConnectSection["newsletter"];

/** The whole document, which only the editor handles. */
export type Portfolio = typeof wirePortfolio.type;
