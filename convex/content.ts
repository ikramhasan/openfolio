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
  wireMusicSection,
  wireOpenSourceSection,
  wirePhotosSection,
  wireProjectsSection,
  wireRecommendationsSection,
  wireSite,
  wireSkillsSection,
  wireToolsSection,
  wireVideosSection,
} from "./lib/wire";

function visible<T extends { hidden?: boolean }>(items: T[]): T[] {
  return items.filter((item) => !item.hidden);
}

export const site = query({
  args: {},
  returns: wireSite,
  handler: (ctx) => project.site(ctx),
});

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
        hidden: v.boolean(),
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
  returns: v.object({ ...wireAbout.fields, bio: v.string() }),
  handler: async (ctx) => {
    const header = await project.header(ctx, "about");
    const bio = await project.aboutBio(ctx);
    return { ...header, bio };
  },
});

export const education = query({
  args: {},
  returns: wireEducationSection,
  handler: async (ctx) => ({
    ...(await project.header(ctx, "education")),
    items: visible(await project.education(ctx, project.renderForSite(ctx))),
  }),
});

export const experience = query({
  args: {},
  returns: wireExperienceSection,
  handler: async (ctx) => ({
    ...(await project.header(ctx, "experience")),
    items: visible(await project.experience(ctx, project.renderForSite(ctx))),
  }),
});

export const youtubeVideos = query({
  args: {},
  returns: wireVideosSection,
  handler: async (ctx) => ({
    ...(await project.header(ctx, "youtubeVideos")),
    items: visible(
      await project.youtubeVideos(ctx, project.renderForSite(ctx)),
    ),
  }),
});

export const articles = query({
  args: {},
  returns: wireArticlesSection,
  handler: async (ctx) => {
    const section = await project.articlesSection(
      ctx,
      project.renderForSite(ctx),
    );
    return { ...section, items: visible(section.items) };
  },
});

export const projects = query({
  args: {},
  returns: wireProjectsSection,
  handler: async (ctx) => ({
    ...(await project.header(ctx, "projects")),
    items: visible(await project.projects(ctx, project.renderForSite(ctx))),
  }),
});

export const photos = query({
  args: {},
  returns: wirePhotosSection,
  handler: async (ctx) => ({
    ...(await project.header(ctx, "photos")),
    items: visible(await project.photos(ctx, project.renderForSite(ctx))),
  }),
});

export const tools = query({
  args: {},
  returns: wireToolsSection,
  handler: async (ctx) => ({
    ...(await project.header(ctx, "tools")),
    items: visible(await project.tools(ctx, project.renderForSite(ctx))),
  }),
});

export const music = query({
  args: {},
  returns: wireMusicSection,
  handler: async (ctx) => ({
    ...(await project.header(ctx, "music")),
    items: visible(await project.music(ctx)),
  }),
});

export const openSource = query({
  args: {},
  returns: wireOpenSourceSection,
  handler: async (ctx) => ({
    ...(await project.header(ctx, "openSource")),
    items: visible(await project.openSource(ctx, project.renderForSite(ctx))),
  }),
});

export const awards = query({
  args: {},
  returns: wireAwardsSection,
  handler: async (ctx) => ({
    ...(await project.header(ctx, "awards")),
    items: visible(await project.awards(ctx, project.renderForSite(ctx))),
  }),
});

export const recommendations = query({
  args: {},
  returns: wireRecommendationsSection,
  handler: async (ctx) => ({
    ...(await project.header(ctx, "recommendations")),
    items: visible(
      await project.recommendations(ctx, project.renderForSite(ctx)),
    ),
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
  handler: (ctx) => project.footer(ctx),
});
