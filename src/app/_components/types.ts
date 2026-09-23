import type { api } from "@convex/_generated/api";
import type { wirePortfolio } from "@convex/lib/wire";
import type { FunctionReturnType } from "convex/server";

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
export type ToolsSection = Returns<"tools">;
export type MusicSection = Returns<"music">;
export type OpenSourceSection = Returns<"openSource">;
export type AwardsSection = Returns<"awards">;
export type RecommendationsSection = Returns<"recommendations">;
export type ConnectSection = Returns<"connect">;
export type Footer = Returns<"footer">;

export type Role = ExperienceSection["items"][number];
export type Tool = ToolsSection["items"][number];
export type Track = MusicSection["items"][number];
export type Contribution = OpenSourceSection["items"][number];
export type SocialLink = Footer["socialLinks"][number];
export type Action = Footer["actions"][number];
export type NewsletterCopy = ConnectSection["newsletter"];

export type Portfolio = typeof wirePortfolio.type;
