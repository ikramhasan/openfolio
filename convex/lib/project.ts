import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { bodyToUrls, EMPTY_BODY } from "./body";
import type { ImageRef } from "./images";
import { imageToken, imageUrl } from "./images";
import type { SectionKey } from "./wire";

export type RenderImage = (ref: ImageRef | undefined) => Promise<string>;

export const renderForSite =
  (ctx: QueryCtx): RenderImage =>
  (ref) =>
    imageUrl(ctx, ref);

export const renderForEditor: RenderImage = async (ref) => imageToken(ref);

export type Header = {
  title: string;
  note?: string;
  navLabel?: string;
  hidden: boolean;
};

function strip(doc: Doc<"sectionHeaders"> | null, key: string): Header {
  if (!doc) return { title: key, hidden: false };
  return {
    title: doc.title,
    ...(doc.note ? { note: doc.note } : {}),
    ...(doc.navLabel ? { navLabel: doc.navLabel } : {}),
    hidden: doc.hidden ?? false,
  };
}

export async function header(ctx: QueryCtx, key: SectionKey): Promise<Header> {
  const doc = await ctx.db
    .query("sectionHeaders")
    .withIndex("key", (q) => q.eq("key", key))
    .unique();

  return strip(doc, key);
}

export async function headers(ctx: QueryCtx): Promise<{
  order: string[];
  byKey: Record<string, Header>;
}> {
  const docs = await ctx.db.query("sectionHeaders").collect();
  const order = await ctx.db.query("sectionOrder").first();

  return {
    order: order?.keys ?? [],
    byKey: Object.fromEntries(
      docs.map((doc) => [doc.key, strip(doc, doc.key)]),
    ),
  };
}

export async function singleton<T extends "site" | "intro" | "connect">(
  ctx: QueryCtx,
  table: T,
): Promise<Doc<T> | null> {
  return (await ctx.db.query(table).first()) as Doc<T> | null;
}

export async function socialLinks(
  ctx: QueryCtx,
  placement: "intro" | "footer",
) {
  const rows = await ctx.db
    .query("socialLinks")
    .withIndex("placement_order", (q) => q.eq("placement", placement))
    .collect();

  return rows.map((row) => ({
    order: row.order,
    site: row.site,
    title: row.title,
    url: row.url,
  }));
}

export async function photos(ctx: QueryCtx, image: RenderImage) {
  const rows = await ctx.db.query("photos").withIndex("order").collect();

  return Promise.all(
    rows.map(async (row) => ({
      order: row.order,
      url: await image(row.image),
      alt: row.alt,
      ...(row.title ? { title: row.title } : {}),
      width: row.width,
      height: row.height,
      hidden: row.hidden ?? false,
    })),
  );
}

export async function education(ctx: QueryCtx, image: RenderImage) {
  const rows = await ctx.db.query("education").withIndex("order").collect();

  return Promise.all(
    rows.map(async (row) => ({
      title: row.title,
      institution: row.institution,
      location: row.location,
      logo: await image(row.logo),
      dateRange: row.dateRange,
      description: row.description,
      url: row.url,
      hidden: row.hidden ?? false,
    })),
  );
}

export async function experience(ctx: QueryCtx, image: RenderImage) {
  const rows = await ctx.db.query("experience").withIndex("order").collect();

  return Promise.all(
    rows.map(async (row) => ({
      order: row.order,
      title: row.title,
      company: row.company,
      location: row.location,
      logo: await image(row.logo),
      dateRange: row.dateRange,
      details: row.details,
      url: row.url,
      hidden: row.hidden ?? false,
    })),
  );
}

export async function youtubeVideos(ctx: QueryCtx, image: RenderImage) {
  const rows = await ctx.db.query("youtubeVideos").withIndex("order").collect();

  return Promise.all(
    rows.map(async (row) => ({
      order: row.order,
      title: row.title,
      url: row.url,
      thumbnail: await image(row.thumbnail),
      hidden: row.hidden ?? false,
    })),
  );
}

export async function articles(ctx: QueryCtx, image: RenderImage) {
  const rows = await ctx.db.query("articles").withIndex("order").collect();

  return Promise.all(
    rows.map(async (row) => ({
      title: row.title,
      slug: row.slug,
      url: row.url,
      coverImage: await image(row.coverImage),
      publishedAt: row.publishedAt,
      readTimeMinutes: row.readTimeMinutes,
      views: row.views,
      ...(row.pinned === undefined ? {} : { pinned: row.pinned }),
      excerpt: row.excerpt,
      hidden: row.hidden ?? false,
    })),
  );
}

export async function projects(ctx: QueryCtx, image: RenderImage) {
  const rows = await ctx.db.query("projects").withIndex("order").collect();

  return Promise.all(
    rows.map(async (row) => ({
      order: row.order,
      title: row.title,
      description: row.description,
      link: row.link,
      logo: await image(row.logo),
      tags: row.tags,
      hidden: row.hidden ?? false,
    })),
  );
}

export async function tools(ctx: QueryCtx, image: RenderImage) {
  const rows = await ctx.db.query("tools").withIndex("order").collect();

  return Promise.all(
    rows.map(async (row) => ({
      order: row.order,
      title: row.title,
      category: row.category,
      url: row.url,
      icon: await image(row.icon),
      hidden: row.hidden ?? false,
    })),
  );
}

export async function music(ctx: QueryCtx) {
  const rows = await ctx.db.query("music").withIndex("order").collect();

  return rows.map((row) => ({
    order: row.order,
    url: row.url,
    title: row.title ?? "",
    artist: row.artist ?? "",
    hidden: row.hidden ?? false,
  }));
}

export async function openSource(ctx: QueryCtx, image: RenderImage) {
  const rows = await ctx.db.query("openSource").withIndex("order").collect();

  return Promise.all(
    rows.map(async (row) => ({
      title: row.title,
      url: row.url,
      repo: row.repo ?? "",
      number: row.number ?? 0,
      avatar: await image(row.avatar),
      state: row.state ?? "",
      date: row.date,
      stars: row.stars ?? 0,
      hidden: row.hidden ?? false,
    })),
  );
}

export async function awards(ctx: QueryCtx, image: RenderImage) {
  const rows = await ctx.db.query("awards").withIndex("order").collect();

  return Promise.all(
    rows.map(async (row) => ({
      order: row.order,
      title: row.title,
      organization: row.organization,
      logo: await image(row.logo),
      date: row.date,
      description: row.description,
      url: row.url,
      hidden: row.hidden ?? false,
    })),
  );
}

export async function recommendations(ctx: QueryCtx, image: RenderImage) {
  const rows = await ctx.db
    .query("recommendations")
    .withIndex("order")
    .collect();

  return Promise.all(
    rows.map(async (row) => ({
      title: row.title,
      url: row.url,
      body: row.body,
      author: {
        name: row.author.name,
        bio: row.author.bio,
        image: await image(row.author.image),
      },
      hidden: row.hidden ?? false,
    })),
  );
}

export async function skills(ctx: QueryCtx) {
  const rows = await ctx.db.query("skills").withIndex("order").collect();

  return rows.map((row) => ({
    order: row.order,
    icon: row.icon,
    level: row.level,
    title: row.title,
    url: row.url,
  }));
}

const EMPTY_NEWSLETTER = {
  inputLabel: "",
  placeholder: "",
  submitLabel: "",
  loadingLabel: "",
  messages: { invalidEmail: "", success: "", error: "" },
};

export async function intro(ctx: QueryCtx, image: RenderImage) {
  const row = await singleton(ctx, "intro");

  return {
    ...(await header(ctx, "intro")),
    bio: row?.bio ?? "",
    profileImage: await image(row?.profileImage),
    resume: await image(row?.resume),
    socialLinks: await socialLinks(ctx, "intro"),
  };
}

export async function connect(ctx: QueryCtx) {
  const row = await singleton(ctx, "connect");

  return {
    ...(await header(ctx, "connect")),
    newsletter: row?.newsletter ?? EMPTY_NEWSLETTER,
  };
}

export async function articlesSection(ctx: QueryCtx, image: RenderImage) {
  return {
    ...(await header(ctx, "articles")),
    items: await articles(ctx, image),
  };
}

export async function footer(ctx: QueryCtx) {
  return {
    socialLinks: await socialLinks(ctx, "footer"),
  };
}

export async function site(ctx: QueryCtx) {
  const row = await singleton(ctx, "site");
  return { title: row?.title ?? "", description: row?.description ?? "" };
}

export async function aboutBio(ctx: QueryCtx): Promise<string> {
  const row = await ctx.db.query("aboutBio").first();
  return row ? await bodyToUrls(ctx, row.value) : EMPTY_BODY;
}

export async function portfolio(ctx: QueryCtx, image: RenderImage) {
  const { order } = await headers(ctx);

  const sectionWith = async (key: SectionKey) => header(ctx, key);

  return {
    site: await site(ctx),
    sectionOrder: order,
    sections: {
      intro: await intro(ctx, image),
      about: await sectionWith("about"),
      skills: { ...(await sectionWith("skills")), items: await skills(ctx) },
      education: {
        ...(await sectionWith("education")),
        items: await education(ctx, image),
      },
      experience: {
        ...(await sectionWith("experience")),
        items: await experience(ctx, image),
      },
      youtubeVideos: {
        ...(await sectionWith("youtubeVideos")),
        items: await youtubeVideos(ctx, image),
      },
      articles: await articlesSection(ctx, image),
      projects: {
        ...(await sectionWith("projects")),
        items: await projects(ctx, image),
      },
      photos: {
        ...(await sectionWith("photos")),
        items: await photos(ctx, image),
      },
      tools: {
        ...(await sectionWith("tools")),
        items: await tools(ctx, image),
      },
      music: {
        ...(await sectionWith("music")),
        items: await music(ctx),
      },
      openSource: {
        ...(await sectionWith("openSource")),
        items: await openSource(ctx, image),
      },
      awards: {
        ...(await sectionWith("awards")),
        items: await awards(ctx, image),
      },
      recommendations: {
        ...(await sectionWith("recommendations")),
        items: await recommendations(ctx, image),
      },
      connect: await connect(ctx),
    },
    footer: await footer(ctx),
  };
}
