import { v } from "convex/values";
import { query } from "./_generated/server";
import * as project from "./lib/project";
import {
  wireAbout,
  wireArticlesSection,
  wireAwardsSection,
  wireConnectSection,
  wireEducationSection,
  wireExperienceSection,
  wireFooter,
  wireIntro,
  wireProjectsSection,
  wireRecommendationsSection,
  wireSite,
  wireSkillsSection,
  wireVideosSection,
} from "./lib/wire";

/**
 * Everything the public site reads. No arguments, no identity, nothing here that
 * is not already on the page — these are the queries a prerender runs.
 *
 * One query per cache key rather than one for the whole document, so that saving
 * a single section invalidates only the components that read it. The Next.js side
 * tags each of these with `portfolio:<key>`; `admin.save` reports which keys it
 * changed and only those are revalidated.
 *
 * Image fields come back as absolute URLs: Convex storage URLs are minted on read
 * (see `lib/images.ts`), never stored.
 */

export const site = query({
  args: {},
  returns: wireSite,
  handler: (ctx) => project.site(ctx),
});

/** The rail: which sections exist, in what order, under what wording. */
export const nav = query({
  args: {},
  returns: v.object({
    order: v.array(v.string()),
    byKey: v.record(
      v.string(),
      v.object({
        title: v.string(),
        note: v.optional(v.string()),
        navLabel: v.optional(v.string()),
      }),
    ),
  }),
  handler: (ctx) => project.headers(ctx),
});

export const intro = query({
  args: {},
  returns: wireIntro,
  handler: (ctx) => project.intro(ctx, project.renderForSite(ctx)),
});

export const about = query({
  args: {},
  returns: wireAbout,
  handler: (ctx) => project.header(ctx, "about"),
});

export const education = query({
  args: {},
  returns: wireEducationSection,
  handler: async (ctx) => ({
    ...(await project.header(ctx, "education")),
    items: await project.education(ctx, project.renderForSite(ctx)),
  }),
});

export const experience = query({
  args: {},
  returns: wireExperienceSection,
  handler: async (ctx) => ({
    ...(await project.header(ctx, "experience")),
    items: await project.experience(ctx, project.renderForSite(ctx)),
  }),
});

export const youtubeVideos = query({
  args: {},
  returns: wireVideosSection,
  handler: async (ctx) => ({
    ...(await project.header(ctx, "youtubeVideos")),
    items: await project.youtubeVideos(ctx, project.renderForSite(ctx)),
  }),
});

export const articles = query({
  args: {},
  returns: wireArticlesSection,
  handler: (ctx) => project.articlesSection(ctx, project.renderForSite(ctx)),
});

export const projects = query({
  args: {},
  returns: wireProjectsSection,
  handler: async (ctx) => ({
    ...(await project.header(ctx, "projects")),
    items: await project.projects(ctx, project.renderForSite(ctx)),
  }),
});

export const awards = query({
  args: {},
  returns: wireAwardsSection,
  handler: async (ctx) => ({
    ...(await project.header(ctx, "awards")),
    items: await project.awards(ctx, project.renderForSite(ctx)),
  }),
});

export const recommendations = query({
  args: {},
  returns: wireRecommendationsSection,
  handler: async (ctx) => ({
    ...(await project.header(ctx, "recommendations")),
    items: await project.recommendations(ctx, project.renderForSite(ctx)),
  }),
});

export const skills = query({
  args: {},
  returns: wireSkillsSection,
  handler: async (ctx) => ({
    ...(await project.header(ctx, "skills")),
    items: await project.skills(ctx),
  }),
});

export const connect = query({
  args: {},
  returns: wireConnectSection,
  handler: (ctx) => project.connect(ctx),
});

export const footer = query({
  args: {},
  returns: wireFooter,
  handler: (ctx) => project.footer(ctx, project.renderForSite(ctx)),
});
